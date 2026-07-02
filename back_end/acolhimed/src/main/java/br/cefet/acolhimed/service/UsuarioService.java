package br.cefet.acolhimed.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.LoginRequestDTO;
import br.cefet.acolhimed.dto.MedicoResponseDTO;
import br.cefet.acolhimed.dto.UsuarioRequestDTO;
import br.cefet.acolhimed.dto.UsuarioResponseDTO;
import br.cefet.acolhimed.entity.Usuario;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.MedicoRepository;
import br.cefet.acolhimed.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository UsuarioRepository;

    @Autowired
    private MedicoRepository MedicoRepository;

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listar() {
        List<Usuario> Usuarios = UsuarioRepository.findAll();
        return Usuarios.stream().map(UsuarioResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(String id) {
        Usuario Usuario = UsuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado. Id: " + id));

        return new UsuarioResponseDTO(Usuario);
    }

    @Transactional
    public void excluir(String id) {
        if (!UsuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario nao encontrado com ID: " + id);
        }

        MedicoRepository.findById(id).ifPresent(MedicoRepository::delete);
        UsuarioRepository.deleteById(id);
    }

    @Transactional
    public UsuarioResponseDTO inserir(UsuarioRequestDTO dto) {

        if (UsuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Ja existe um usuario com esse email.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());
        usuario.setTipoUsuario(dto.getTipoUsuario());
        usuario.setCpf(dto.getCpf());
        usuario.setFoto(dto.getFoto());
        usuario.setDataNascimento(dto.getDataNascimento());

        return new UsuarioResponseDTO(UsuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(String id, UsuarioRequestDTO dto) {

        Usuario usuario = UsuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("usuario nao encontrado. Id: " + id));

        if (!usuario.getEmail().equals(dto.getEmail()) && UsuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Ja existe um usuario com esse email.");
        }

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setDataNascimento(dto.getDataNascimento());
        usuario.setCpf(dto.getCpf());
        usuario.setTipoUsuario(dto.getTipoUsuario());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(dto.getSenha());
        }
        usuario.setFoto(dto.getFoto());

        return new UsuarioResponseDTO(UsuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public Object autenticar(LoginRequestDTO credenciais) {
        Usuario usuario = UsuarioRepository.findByEmail(credenciais.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "Usuario nao encontrado Email:" + credenciais.getEmail() + " Senha " + credenciais.getSenha()));

        if (!usuario.getSenha().equals(credenciais.getSenha())) {
            throw new RuntimeException("Senha invalida");
        }

        return MedicoRepository.findByUsuarioEmail(usuario.getEmail())
                .<Object>map(MedicoResponseDTO::new)
                .orElseGet(() -> new UsuarioResponseDTO(usuario));
    }
}
