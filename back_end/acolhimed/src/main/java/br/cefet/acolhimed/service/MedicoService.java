package br.cefet.acolhimed.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.MedicoRequestDTO;
import br.cefet.acolhimed.dto.MedicoResponseDTO;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.MedicoRepository;

@Service
public class MedicoService {

    @Autowired
    private MedicoRepository MedicoRepository;

    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> listar() {
        List<Medico> Medicos = MedicoRepository.findAll();
        return Medicos.stream().map(MedicoResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public MedicoResponseDTO buscarPorId(String id) {
        Medico Medico = MedicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medico não encontrado. Id: " + id));

        return new MedicoResponseDTO(Medico);
    }

    @Transactional
    public MedicoResponseDTO inserir(MedicoRequestDTO dto) {

        if (MedicoRepository.existsByCrm(dto.getCrm())) {
            throw new BusinessException("Já existe uma Medico com esse CRM.");
        }

        Medico medico = new Medico();
        medico.setNome(dto.getNome());
        medico.setEmail(dto.getEmail());
        medico.setCpf(dto.getCpf());
        medico.setSenha(dto.getSenha());
        medico.setTelefone(dto.getTelefone());
        medico.setUfEmissao(dto.getUfEmissao());
        medico.setCrm(dto.getCrm());
        medico.setDataNascimento(dto.getDataNascimento());

        return new MedicoResponseDTO(MedicoRepository.save(medico));
    }

    @Transactional
    public MedicoResponseDTO atualizar(String id, MedicoRequestDTO dto) {

        Medico medico = MedicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medico não encontrado. Id: " + id));

        if (MedicoRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Já existe uma usuário com esse email.");
        }

        medico.setNome(dto.getNome());
        medico.setEmail(dto.getEmail());
        medico.setFoto(dto.getFoto());
        medico.setDataNascimento(dto.getDataNascimento());
        if (dto.getSenha() != null) {
            medico.setSenha(dto.getSenha());
        }
        medico.setTelefone(dto.getTelefone());
        medico.setSobreMim(dto.getSobreMim());
        medico.setFormacaoAcademica(dto.getFormacaoAcademica());
        medico.setHorariosConfigurados(dto.isHorariosConfigurados());
        

        return new MedicoResponseDTO(MedicoRepository.save(medico));
    }

}