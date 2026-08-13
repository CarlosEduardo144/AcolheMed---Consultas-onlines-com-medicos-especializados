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

    public ConsultaResponseDTO(Consulta consulta) {
        this.id = consulta.getId();
        this.motivoCancelamento = consulta.getMotivoCancelamento();
        this.paciente = new PacienteResponseDTO(consulta.getPaciente());
        this.medico = new MedicoResponseDTO(consulta.getMedico());
        this.dataHora = consulta.getDataHora();
        this.pacienteNome = consulta.getPaciente().getNome();
        this.medicoNome = consulta.getMedico().getNome();
        this.especialidadeId = consulta.getEspecialidade().getId();
        this.especialidadeNome = consulta.getEspecialidade().getNome();
        this.status = consulta.getStatus();
    }
}
