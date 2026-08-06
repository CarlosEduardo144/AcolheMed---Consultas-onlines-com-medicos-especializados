package br.cefet.acolhimed.service;

import java.util.List;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.UsuarioRequestDTO;
import br.cefet.acolhimed.dto.UsuarioResponseDTO;
import br.cefet.acolhimed.entity.Paciente;
import br.cefet.acolhimed.enums.TipoUsuario;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.PacienteRepository;

@Service
public class PacienteService {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listar() {
        List<Paciente> pacientes = pacienteRepository.findAll();
        return pacientes.stream().map(UsuarioResponseDTO::new).toList();
    }

    @Transactional
    public UsuarioResponseDTO inserir(UsuarioRequestDTO dto) {

        if (pacienteRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Ja existe um usuario com esse email.");
        }

        if(!"paciente".equalsIgnoreCase(dto.getTipoUsuario())){
            throw new BusinessException("Apenas pacientes podem ser cadastrados neste endpoint.");
        }

        Paciente paciente = new Paciente();
        paciente.setNome(dto.getNome());
        paciente.setEmail(dto.getEmail());
        paciente.setSenha(dto.getSenha());
        paciente.setTipoUsuario(TipoUsuario.paciente);

        return new UsuarioResponseDTO(pacienteRepository.save(paciente));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(String id, UsuarioRequestDTO dto) {

        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente nao encontrado. Id: " + id));

        // Busca se ALGUÉM usa o novo e-mail
        Optional<Paciente> usuarioComMesmoEmail = pacienteRepository.findByEmail(dto.getEmail());

        // Se o e-mail já existe E não pertence ao próprio usuário que está logado, aí
        // barra
        if (usuarioComMesmoEmail.isPresent() && !usuarioComMesmoEmail.get().getId().equals(id)) {
            throw new BusinessException("Já existe um usuário com esse e-mail.");
        }

        paciente.setNome(dto.getNome());
        paciente.setEmail(dto.getEmail());
        paciente.setFoto(dto.getFoto());
        paciente.setDataNascimento(dto.getDataNascimento());
        paciente.setCpf(dto.getCpf());

        // senha - atualizar apenas se providenciado
        String senha = dto.getSenha();
        if (senha != null && !senha.trim().isEmpty()) {
            paciente.setSenha(senha);
        }

        return new UsuarioResponseDTO(pacienteRepository.save(paciente));
    }
}