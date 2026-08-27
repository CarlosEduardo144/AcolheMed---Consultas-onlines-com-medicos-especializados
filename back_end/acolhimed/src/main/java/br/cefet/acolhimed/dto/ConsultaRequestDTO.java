package br.cefet.acolhimed.dto;

import java.time.LocalDateTime;

import br.cefet.acolhimed.entity.Especialidade;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.entity.Paciente;
import br.cefet.acolhimed.enums.StatusConsulta;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ConsultaRequestDTO {
    private String id;

    @NotNull(message = "O campo paciente e obrigatorio")
    private Paciente paciente;

    @NotNull(message = "O campo medico e obrigatorio")
    private Medico medico;

    @NotNull(message = "O campo especialidade e obrigatorio")
    private Especialidade especialidade;

    private StatusConsulta status;

    @NotNull(message = "O campo dataHora nao pode ser vazio")
    private LocalDateTime dataHora;

    private String motivoCancelamento;

    private String observacoes;
}
