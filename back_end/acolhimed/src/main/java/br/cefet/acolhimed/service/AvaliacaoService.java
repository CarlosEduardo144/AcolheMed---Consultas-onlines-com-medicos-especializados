package br.cefet.acolhimed.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.AvaliacaoRequestDTO;
import br.cefet.acolhimed.dto.AvaliacaoResponseDTO;
import br.cefet.acolhimed.dto.HorarioResponseDTO;
import br.cefet.acolhimed.entity.Avaliacao;
import br.cefet.acolhimed.entity.Consulta;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.AvaliacaoRepository;
import br.cefet.acolhimed.repository.ConsultaRepository;
import br.cefet.acolhimed.repository.MedicoRepository;
import br.cefet.acolhimed.repository.PacienteRepository;

@Service
public class AvaliacaoService {

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    @Transactional
    public AvaliacaoResponseDTO inserir(AvaliacaoRequestDTO dto) {

        if (dto.getNota() < 1.0 || dto.getNota() > 5.0) {
            throw new BusinessException("A nota deve ser entre 1 a 5");
        }

        Consulta consulta = consultaRepository.findById(dto.getConsultaId())
                .orElseThrow(() -> new ResourceNotFoundException("Consulta não encontrada. Id: " + dto.getConsultaId()));

        if (!medicoRepository.existsById(consulta.getMedico().getId())) {
            throw new BusinessException("Paciente não encontrado. Id: " + consulta.getMedico().getId());
        }

        if (!pacienteRepository.existsById(consulta.getPaciente().getId())) {
            throw new BusinessException("Paciente não encontrado. Id: " + consulta.getPaciente().getId());
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setComentario(dto.getComentario());
        avaliacao.setData(dto.getData());
        avaliacao.setNota(dto.getNota());
        avaliacao.setConsulta(consulta);

        return new AvaliacaoResponseDTO(avaliacaoRepository.save(avaliacao));
    }

    @Transactional
    public void excluir(String id) {
        if (!avaliacaoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Avaliação não encontrada com ID: " + id);
        }

        avaliacaoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> buscarPorMedico(String medicoId) {

        Medico medico = medicoRepository.findById(medicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Médico não encontrado. Id: " + medicoId));

        return avaliacaoRepository.findByConsultaMedico(medico)
                .stream()
                .map(AvaliacaoResponseDTO::new)
                .toList();
    }
}
