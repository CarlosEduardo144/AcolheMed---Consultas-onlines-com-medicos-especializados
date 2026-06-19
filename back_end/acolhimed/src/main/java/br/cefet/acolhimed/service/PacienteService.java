package br.cefet.acolhimed.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import br.cefet.acolhimed.dto.PacienteRequestDTO;
import br.cefet.acolhimed.dto.PacienteResponseDTO;
import br.cefet.acolhimed.entity.Paciente;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.PacienteRepository;

@Service
public class PacienteService {
     @Autowired
    private PacienteRepository PacienteRepository;

    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> listar() {
        List<Paciente> pacientes = PacienteRepository.findAll();
        return pacientes.stream().map(PacienteResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public PacienteResponseDTO buscarPorId(String id) {
        Paciente Paciente = PacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado. Id: " + id));

        return new PacienteResponseDTO(Paciente);
    }

    @Transactional
    public PacienteResponseDTO inserir(PacienteRequestDTO dto) {

        if (PacienteRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Já existe uma Paciente com esse email.");
        }

        Paciente paciente = new Paciente();
        paciente.setNome(dto.getNome());
        paciente.setEmail(dto.getEmail());
        paciente.setCpf(dto.getCpf());
        paciente.setSenha(dto.getSenha());
        paciente.setTelefone(dto.getTelefone());
        paciente.setDataNascimento(dto.getDataNascimento());

        return new PacienteResponseDTO(PacienteRepository.save(paciente));
    }

    @Transactional
    public PacienteResponseDTO atualizar(String id, PacienteRequestDTO dto) {

        Paciente paciente = PacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado. Id: " + id));

        if (PacienteRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Já existe uma usuário com esse email.");
        }

        paciente.setNome(dto.getNome());
        paciente.setEmail(dto.getEmail());
        paciente.setDataNascimento(dto.getDataNascimento());
        paciente.setDataNascimento(dto.getDataNascimento());
        if (dto.getSenha() != null) {
            paciente.setSenha(dto.getSenha());
        }
        paciente.setTelefone(dto.getTelefone());
        paciente.setFoto(dto.getFoto());


        return new PacienteResponseDTO(PacienteRepository.save(paciente));
    }
}
