package br.cefet.acolhimed.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.LoginRequestDTO;
import br.cefet.acolhimed.dto.MedicoResponseDTO;
import br.cefet.acolhimed.dto.UsuarioResponseDTO;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.entity.Usuario;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listar() {
        List<Usuario> Usuarios = usuarioRepository.findAll();
        return Usuarios.stream().map(UsuarioResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(String id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado. Id: " + id));

        if (usuario instanceof Medico) {
            return new MedicoResponseDTO((Medico) usuario);
        }

        return new UsuarioResponseDTO(usuario);
    }

    @Transactional
    public void excluir(String id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario nao encontrado com ID: " + id);
        }

        usuarioRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Object autenticar(LoginRequestDTO credenciais) {
        Usuario usuario = usuarioRepository.findByEmail(credenciais.getEmail())
                .orElseThrow(() -> new RuntimeException("E-mail ou senha incorretos."));

        if (!usuario.getSenha().equals(credenciais.getSenha())) {
            throw new RuntimeException("E-mail ou senha incorretos.");
        }

        if (usuario instanceof Medico) {
            return new MedicoResponseDTO((Medico) usuario);
        }

        return new UsuarioResponseDTO(usuario);
    }

}
