package br.cefet.acolhimed.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.ConsultaRequestDTO;
import br.cefet.acolhimed.dto.ConsultaResponseDTO;
import br.cefet.acolhimed.dto.MedicoResponseDTO;
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
import br.cefet.acolhimed.repository.AvaliacaoRepository;
import br.cefet.acolhimed.repository.PrescricaoRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

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

    @Autowired
    private MedicoService medicoService;

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @Autowired
    private PrescricaoRepository prescricaoRepository;

    private ConsultaResponseDTO montarDTO(Consulta consulta) {
        MedicoResponseDTO medicoDTO = medicoService.montarDTO(consulta.getMedico());
        Boolean possuiAvaliacao = avaliacaoRepository.existsByConsultaId(consulta.getId());
        Boolean possuiPrescricao = prescricaoRepository.existsByConsultaId(consulta.getId());
        return new ConsultaResponseDTO(consulta, medicoDTO, possuiAvaliacao, possuiPrescricao);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listar() {
        return consultaRepository.findAll().stream().map(this::montarDTO).toList();
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
                .map(this::montarDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listarAgendaDoDia(String medicoId) {

        Medico medico = medicoRepository.findById(medicoId).orElse(null);

        if (medico == null) {
            throw new ResourceNotFoundException(
                    "Médico não encontrado. Id: " + medicoId);
        }

        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));

        LocalDateTime inicioDoDia = hoje.atStartOfDay();
        LocalDateTime fimDoDia = hoje.atTime(LocalTime.MAX);

        return consultaRepository
                .findByMedicoAndDataHoraBetweenOrderByDataHoraAsc(
                        medico,
                        inicioDoDia,
                        fimDoDia)
                .stream()
                .map(this::montarDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConsultaResponseDTO buscarPorId(String id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta não encontrada. Id: " + id));

        return montarDTO(consulta);
    }

    @Transactional(readOnly = true)
    public ConsultaResponseDTO buscarConsultaEmAndamento(String usuarioId) {

        LocalDateTime agora = LocalDateTime.now(
                ZoneId.of("America/Sao_Paulo"));

        LocalDateTime inicio = agora.minusMinutes(30);
        LocalDateTime fim = agora.plusMinutes(15);

        Consulta consulta = consultaRepository
                .findFirstByPacienteIdAndDataHoraBetweenAndStatus(
                        usuarioId,
                        inicio,
                        fim,
                        StatusConsulta.agendada)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nenhuma consulta em andamento."));

        return montarDTO(consulta);
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

        DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

        String dataFormatada = consulta.getDataHora().format(formato);

        notificacaoService.criarNotificacao(
                consulta.getMedico(),
                TipoNotificacao.lembrete,
                "Consulta agendada",
                "Uma consulta com o paciente " + consulta.getPaciente().getNome() + " foi agendada para "
                        + dataFormatada);

        Consulta consultaSalva = consultaRepository.save(consulta);
        return montarDTO(consultaSalva);
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
                "Sua consulta com o Dr. " + consulta.getMedico().getNome() + " foi cancelada.");

        notificacaoService.criarNotificacao(
                consulta.getMedico(),
                TipoNotificacao.cancelada,
                "Consulta cancelada",
                "Sua consulta com o paciente " + consulta.getPaciente().getNome() + " foi cancelada.");

        Consulta consultaCancelada = consultaRepository.save(consulta);
        return montarDTO(consultaCancelada);
    }

    @Transactional
    public ConsultaResponseDTO definirConsultaEmAndamento(String id) {
        Consulta consulta = buscarConsulta(id);

        if (consulta.getStatus() == StatusConsulta.cancelada || consulta.getStatus() == StatusConsulta.finalizada) {
            throw new BusinessException("Consulta cancelada ou finalizada não pode ser cancelada.");
        }

        LocalDateTime agora = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));
        LocalDateTime inicio = consulta.getDataHora().minusMinutes(15);
        LocalDateTime fim = consulta.getDataHora().plusMinutes(30);

        if (agora.isBefore(inicio) || agora.isAfter(fim)) {
            throw new BusinessException(
                    "A consulta só pode ser colocada em andamento entre 15 minutos antes e 30 minutos após o horário agendado.");
        }

        consulta.setStatus(StatusConsulta.em_andamento);

        Consulta consultaEmAndamento = consultaRepository.save(consulta);
        return montarDTO(consultaEmAndamento);
    }

    /*
     * @Transactional
     * public ConsultaResponseDTO remarcarConsulta(String id, ConsultaRequestDTO
     * dto) {
     * Consulta consulta = buscarConsulta(id);
     * LocalDateTime novaDataHora = validarNovaDataHora(dto);
     * 
     * if (consulta.getStatus() == StatusConsulta.cancelada || consulta.getStatus()
     * == StatusConsulta.finalizada) {
     * throw new
     * BusinessException("Consulta cancelada ou finalizada não pode ser remarcada."
     * );
     * }
     * 
     * if (!LocalDateTime.now().plusDays(2).isBefore(consulta.getDataHora())) {
     * throw new
     * BusinessException("A consulta so pode ser remarcada com mais de 2 dias de antecedencia."
     * );
     * }
     * 
     * if (novaDataHora.isBefore(LocalDateTime.now())) {
     * throw new
     * BusinessException("Não e permitido remarcar consulta para um horario que ja passou."
     * );
     * }
     * 
     * validarHorarioDisponivelParaRemarcacao(consulta, novaDataHora);
     * 
     * consulta.setDataHora(novaDataHora);
     * 
     * return new ConsultaResponseDTO(consultaRepository.save(consulta));
     * }
     */

    private Consulta buscarConsulta(String id) {
        return consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta nao encontrada. Id: " + id));
    }

    // private LocalDateTime validarNovaDataHora(ConsultaRequestDTO dto) {
    // if (dto == null || dto.getDataHora() == null) {
    // throw new BusinessException("O campo dataHora é obrigatorio para remarcar a
    // consulta.");
    // }

    // return dto.getDataHora();
    // }

    private void validarHorarioDisponivel(Medico medico, LocalDateTime dataHora) {
        if (consultaRepository.existsByMedicoAndDataHoraAndStatusNot(medico, dataHora, StatusConsulta.cancelada)) {
            throw new BusinessException("Ja existe uma consulta para este medico neste horario.");
        }
    }

    // private void validarHorarioDisponivelParaRemarcacao(Consulta consulta,
    // LocalDateTime novaDataHora) {
    // if (consultaRepository.existsByMedicoAndDataHoraAndStatusNotAndIdNot(
    // consulta.getMedico(),
    // novaDataHora,
    // StatusConsulta.cancelada,
    // consulta.getId())) {
    // throw new BusinessException("Ja existe uma consulta para este medico neste
    // horario.");
    // }
    // }

}
