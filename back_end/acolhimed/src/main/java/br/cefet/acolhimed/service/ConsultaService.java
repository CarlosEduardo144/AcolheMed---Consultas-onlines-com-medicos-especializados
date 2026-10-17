package br.cefet.acolhimed.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
    public List<ConsultaResponseDTO> listarConsultasDoUsuario() {

        String usuarioId = obterIdUsuarioAutenticado();

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
    public List<ConsultaResponseDTO> listarAgendaDoDia() {

        String medicoId =  obterIdUsuarioAutenticado();

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

        String usuarioId =  obterIdUsuarioAutenticado();

        if (!usuarioId.equals(consulta.getPaciente().getId()) && !usuarioId.equals(consulta.getMedico().getId())) {
            throw new BusinessException(
                    "Apenas o paciente ou o médico atrelado a esta consulta podem ter acesso a ela.");
        }

        return montarDTO(consulta);
    }

    @Transactional(readOnly = true)
    public ConsultaResponseDTO buscarConsultaEmAndamento() {

        String usuarioId =  obterIdUsuarioAutenticado();

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
        Medico medico = medicoRepository.findById(dto.getMedicoId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Médico não encontrado. Id: " + dto.getMedicoId()));

        String pacienteId =  obterIdUsuarioAutenticado();

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Paciente não encontrado. Id: " + pacienteId));

        Especialidade especialidade = especialidadeRepository.findById(dto.getEspecialidadeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Especialidade nao encontrada. Id: " + dto.getEspecialidadeId()));

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

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetails usuario = (UserDetails) authentication.getPrincipal();

        String usuarioId =  obterIdUsuarioAutenticado();

        String tipoUsuario = usuario.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        if (!usuarioId.equals(consulta.getPaciente().getId()) && !usuarioId.equals(consulta.getMedico().getId())) {
            throw new BusinessException("Apenas o paciente ou o médico atrelado a esta consulta podem cancelá-la.");
        }

        if (consulta.getStatus() == StatusConsulta.cancelada || consulta.getStatus() == StatusConsulta.finalizada) {
            throw new BusinessException("Consulta cancelada ou finalizada não pode ser cancelada.");
        }

        if (tipoUsuario.equals("paciente")) {
            if (!LocalDateTime.now().plusDays(1).isBefore(consulta.getDataHora())) {
                throw new BusinessException("A consulta so pode ser cancelada com mais de 1 dia de antecedência.");
            }
        } else {
            if (!LocalDateTime.now().plusMinutes(10).isBefore(consulta.getDataHora())) {
                throw new BusinessException("A consulta so pode ser cancelada com mais de 10 minutos de antecedência.");
            }
        }

        consulta.setStatus(StatusConsulta.cancelada);
        if (motivoCancelamento != null && !motivoCancelamento.isBlank()) {
            consulta.setMotivoCancelamento(motivoCancelamento);
        } else {
            throw new BusinessException("O motivo do cancelamento não pode ser vazio.");
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

        String usuarioId =  obterIdUsuarioAutenticado();

        if (!usuarioId.equals(consulta.getPaciente().getId()) && !usuarioId.equals(consulta.getMedico().getId())) {
            throw new BusinessException(
                    "Apenas o paciente ou o médico atrelado a esta consulta podem defini-la em andamento.");
        }

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

    private Consulta buscarConsulta(String id) {
        return consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta não encontrada. Id: " + id));

    }

    private void validarHorarioDisponivel(Medico medico, LocalDateTime dataHora) {
        if (consultaRepository.existsByMedicoAndDataHoraAndStatusNot(medico, dataHora, StatusConsulta.cancelada)) {
            throw new BusinessException("Já existe uma consulta para este médico neste horário.");
        }
    }

    private String obterIdUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetails usuario = (UserDetails) authentication.getPrincipal();

        return usuario.getUsername();
    }
}
