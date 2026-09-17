package br.cefet.acolhimed.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.ConsultaRequestDTO;
import br.cefet.acolhimed.dto.ConsultaResponseDTO;

import br.cefet.acolhimed.entity.Consulta;
import br.cefet.acolhimed.entity.Especialidade;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.entity.Paciente;
import br.cefet.acolhimed.enums.StatusConsulta;
import br.cefet.acolhimed.enums.TipoNotificacao;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.ConsultaRepository;
import br.cefet.acolhimed.repository.EspecialidadeRepository;
import br.cefet.acolhimed.repository.MedicoRepository;
import br.cefet.acolhimed.repository.PacienteRepository;
import java.time.LocalDate;
import java.time.LocalTime;

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

    @Autowired
    private NotificacaoService notificacaoService;

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listar() {
        return consultaRepository.findAll().stream().map(ConsultaResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listarConsultasDoUsuario(String usuarioId) {
        Medico medico = medicoRepository.findById(usuarioId).orElse(null);
        Paciente paciente = pacienteRepository.findById(usuarioId).orElse(null);

        if (medico == null && paciente == null) {
            throw new ResourceNotFoundException("Usuario não encontrado. Id: " + usuarioId);
        }

        return consultaRepository.findByMedicoOrPaciente(medico, paciente)
                .stream()
                .map(ConsultaResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listarAgendaDoDia(String medicoId) {
        Medico medico = medicoRepository.findById(medicoId).orElse(null);

        if (medico == null) {
            throw new ResourceNotFoundException("Médico não encontrado. Id: " + medicoId);
        }

        LocalDate hoje = LocalDate.now();

        LocalDateTime inicioDoDia = hoje.atStartOfDay();
        LocalDateTime fimDoDia = hoje.atTime(LocalTime.MAX);

        return consultaRepository
                .findByMedicoAndDataHoraBetweenOrderByDataHoraAsc(
                        medico,
                        inicioDoDia,
                        fimDoDia)
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

    @Transactional(readOnly = true)
    public ConsultaResponseDTO buscarConsultaEmAndamento(String usuarioId) {

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusMinutes(15);

        Consulta consulta = consultaRepository
                .findFirstByPacienteIdAndDataHoraBetweenAndStatus(
                        usuarioId,
                        agora,
                        limite,
                        StatusConsulta.agendada)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nenhuma consulta nos próximos 15 minutos."));

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

        String link = null;

        try {
            link = googleMeetService.criarReuniao();
        } catch (Exception e) {
            System.out.println("Não foi possível criar o link do Google Meet.");
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
        if (!motivoCancelamento.isBlank() && motivoCancelamento != null) {
            consulta.setMotivoCancelamento(motivoCancelamento);
        } else {
            throw new BusinessException("O motivo do cancelamento não existe ou está nulo");
        }

        // criar notificacoes
        notificacaoService.criarNotificacao(
                consulta.getPaciente(),
                TipoNotificacao.cancelada,
                "Consulta cancelada",
                "Sua consulta com o Dr." + consulta.getMedico().getNome() + " foi cancelada.");

        notificacaoService.criarNotificacao(
                consulta.getMedico(),
                TipoNotificacao.cancelada,
                "Consulta cancelada",
                "Sua consulta com o paciente." + consulta.getPaciente().getNome() + " foi cancelada.");

        return new ConsultaResponseDTO(consultaRepository.save(consulta));
    }

    @Transactional
    public ConsultaResponseDTO definirConsultaEmAndamento(String id) {
        Consulta consulta = buscarConsulta(id);

        if (consulta.getStatus() == StatusConsulta.cancelada || consulta.getStatus() == StatusConsulta.finalizada) {
            throw new BusinessException("Consulta cancelada ou finalizada não pode ser cancelada.");
        }

        if (!LocalDateTime.now().plusMinutes(15).isBefore(consulta.getDataHora())) {
            throw new BusinessException(
                    "A consulta so pode estar em andamento com mais de 15 minutos de antecedencia.");
        }

        consulta.setStatus(StatusConsulta.em_andamento);

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
