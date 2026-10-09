package br.cefet.acolhimed.dto;

import java.time.LocalDateTime;

import br.cefet.acolhimed.entity.Consulta;
import br.cefet.acolhimed.enums.StatusConsulta;
import lombok.Getter;

@Getter
public class ConsultaResponseDTO {
    private String id;
    private String motivoCancelamento;
    private PacienteResponseDTO paciente;
    private MedicoResponseDTO medico;
    private LocalDateTime dataHora;
    private String pacienteNome;
    private String medicoNome;
    private String especialidadeId;
    private String especialidadeNome;
    private StatusConsulta status;
    private String linkConsulta;
    private String observacoes;
    private Boolean possuiAvaliacao;
    private Boolean possuiPrescricao;

    
    public ConsultaResponseDTO(Consulta consulta, MedicoResponseDTO medicoDTO) {
        this(consulta, medicoDTO, false, false);
    }

    public ConsultaResponseDTO(Consulta consulta, MedicoResponseDTO medicoDTO, Boolean possuiAvaliacao, Boolean possuiPrescricao) {
    this.id = consulta.getId();
    this.motivoCancelamento = consulta.getMotivoCancelamento();
    this.paciente = new PacienteResponseDTO(consulta.getPaciente());
    this.medico = medicoDTO;
    this.dataHora = consulta.getDataHora();
    this.pacienteNome = consulta.getPaciente().getNome();
    this.medicoNome = consulta.getMedico().getNome();
    this.especialidadeId = consulta.getEspecialidade().getId();
    this.especialidadeNome = consulta.getEspecialidade().getNome();
    this.status = consulta.getStatus();
    this.linkConsulta = consulta.getLinkConsulta();
    this.observacoes = consulta.getObservacoes();
    this.possuiAvaliacao = possuiAvaliacao;
    this.possuiPrescricao = possuiPrescricao;
}
}
