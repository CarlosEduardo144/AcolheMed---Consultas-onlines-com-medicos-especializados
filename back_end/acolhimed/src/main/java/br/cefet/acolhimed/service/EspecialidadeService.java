package br.cefet.acolhimed.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.EspecialidadeResponseDTO;
import br.cefet.acolhimed.repository.EspecialidadeRepository;
import br.cefet.acolhimed.entity.Especialidade;
import br.cefet.acolhimed.exception.ResourceNotFoundException;

@Service
public class EspecialidadeService {
    @Autowired
    private EspecialidadeRepository especialidadeRepository;

    @Transactional(readOnly = true)
    public List<EspecialidadeResponseDTO> listar() {
        List<Especialidade> especialidades = especialidadeRepository.findAll();
        return especialidades.stream().map(EspecialidadeResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public EspecialidadeResponseDTO buscarPorId(String id) {
        Especialidade especialidade = especialidadeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Especialidade não encontrada. Id: " + id));

        return new EspecialidadeResponseDTO(especialidade);
    }

}
