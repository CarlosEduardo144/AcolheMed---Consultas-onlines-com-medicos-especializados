package br.cefet.acolhimed.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.ConsultaRequestDTO;
import br.cefet.acolhimed.dto.ConsultaResponseDTO;
import br.cefet.acolhimed.dto.MedicoResponseDTO;
import br.cefet.acolhimed.dto.UsuarioResponseDTO;
import br.cefet.acolhimed.entity.Consulta;
import br.cefet.acolhimed.entity.Especialidade;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.entity.Paciente;
import br.cefet.acolhimed.entity.Usuario;
import br.cefet.acolhimed.enums.StatusConsulta;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.exception.ValidationError;
import br.cefet.acolhimed.repository.ConsultaRepository;
import br.cefet.acolhimed.repository.EspecialidadeRepository;
import br.cefet.acolhimed.repository.MedicoRepository;
import br.cefet.acolhimed.repository.PacienteRepository;

@Service
public class ConsultaService {

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private EspecialidadeRepository especialidadeRepository;

    @Autowired
    private GoogleMeetService googleMeetService;

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listar() {
        return consultaRepository.findAll().stream().map(ConsultaResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listarConsultasDoUsuario(String usuarioId) {
        Medico medico = medicoRepository.findById(usuarioId).orElse(null);
        Paciente paciente = pacienteRepository.findById(usuarioId).orElse(null);

        if (medico == null && paciente == null) {
            throw new ResourceNotFoundException("Usuario nao encontrado. Id: " + usuarioId);
        }

        return consultaRepository.findByMedicoOrPaciente(medico, paciente)
                .stream()
                .map(ConsultaResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConsultaResponseDTO buscarPorId(String id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta não encontrada. Id: " + id));
    

        return new ConsultaResponseDTO(consulta);
    }

    @Transactional
    public ConsultaResponseDTO inserir(ConsultaRequestDTO dto) {
        Medico medico = medicoRepository.findById(dto.getMedico().getId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Medico nao encontrado. Id: " + dto.getMedico().getId()));

        Paciente paciente = pacienteRepository.findById(dto.getPaciente().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Paciente nao encontrado. Id: " + dto.getPaciente().getId()));

        Especialidade especialidade = especialidadeRepository.findById(dto.getEspecialidade().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Especialidade nao encontrada. Id: " + dto.getEspecialidade().getId()));

        validarHorarioDisponivel(medico, dto.getDataHora());

        Consulta consulta = new Consulta();
        consulta.setMedico(medico);
        consulta.setPaciente(paciente);
        consulta.setEspecialidade(especialidade);
        consulta.setObservacoes(dto.getObservacoes());
        consulta.setMotivoCancelamento("");
        consulta.setDataHora(dto.getDataHora());

        String link;
        try {
            link = googleMeetService.criarReuniao();
        } catch (Exception e) {
            throw new RuntimeException("Não foi possível criar a reunião do Google Meet.", e);
        }

        consulta.setLinkConsulta(link);
        consulta.setStatus(StatusConsulta.agendada);

        return new ConsultaResponseDTO(consultaRepository.save(consulta));
    }

    @Transactional
    public ConsultaResponseDTO cancelarConsulta(String id, String motivoCancelamento) {
        Consulta consulta = buscarConsulta(id);

        if (consulta.getStatus() == StatusConsulta.cancelada || consulta.getStatus() == StatusConsulta.finalizada) {
            throw new BusinessException("Consulta cancelada ou finalizada não pode ser cancelada.");
        }

        if (!LocalDateTime.now().plusDays(1).isBefore(consulta.getDataHora())) {
            throw new BusinessException("A consulta so pode ser cancelada com mais de 1 dia de antecedencia.");
        }

        consulta.setStatus(StatusConsulta.cancelada);
        if(!motivoCancelamento.isBlank() && motivoCancelamento != null){
            consulta.setMotivoCancelamento(motivoCancelamento);
        }else{
            throw new BusinessException("O motivo do cancelamento não existe ou está nulo");
        }

        return new ConsultaResponseDTO(consultaRepository.save(consulta));
    }

    @Transactional
    public ConsultaResponseDTO remarcarConsulta(String id, ConsultaRequestDTO dto) {
        Consulta consulta = buscarConsulta(id);
        LocalDateTime novaDataHora = validarNovaDataHora(dto);

        if (consulta.getStatus() == StatusConsulta.cancelada || consulta.getStatus() == StatusConsulta.finalizada) {
            throw new BusinessException("Consulta cancelada ou finalizada não pode ser remarcada.");
        }

        if (!LocalDateTime.now().plusDays(2).isBefore(consulta.getDataHora())) {
            throw new BusinessException("A consulta so pode ser remarcada com mais de 2 dias de antecedencia.");
        }

        if (novaDataHora.isBefore(LocalDateTime.now())) {
            throw new BusinessException("Não e permitido remarcar consulta para um horario que ja passou.");
        }

        validarHorarioDisponivelParaRemarcacao(consulta, novaDataHora);

        consulta.setDataHora(novaDataHora);

        return new ConsultaResponseDTO(consultaRepository.save(consulta));
    }

    private Consulta buscarConsulta(String id) {
        return consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta nao encontrada. Id: " + id));
    }

    private LocalDateTime validarNovaDataHora(ConsultaRequestDTO dto) {
        if (dto == null || dto.getDataHora() == null) {
            throw new BusinessException("O campo dataHora é obrigatorio para remarcar a consulta.");
        }

        return dto.getDataHora();
    }

    private void validarHorarioDisponivel(Medico medico, LocalDateTime dataHora) {
        if (consultaRepository.existsByMedicoAndDataHoraAndStatusNot(medico, dataHora, StatusConsulta.cancelada)) {
            throw new BusinessException("Ja existe uma consulta para este medico neste horario.");
        }
    }

    private void validarHorarioDisponivelParaRemarcacao(Consulta consulta, LocalDateTime novaDataHora) {
        if (consultaRepository.existsByMedicoAndDataHoraAndStatusNotAndIdNot(
                consulta.getMedico(),
                novaDataHora,
                StatusConsulta.cancelada,
                consulta.getId())) {
            throw new BusinessException("Ja existe uma consulta para este medico neste horario.");
        }
    }

}
