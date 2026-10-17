package br.cefet.acolhimed.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ConsultaRequestDTO {

    @NotBlank(message = "O campo paciente é obrigatório")
    private String pacienteId;

    @NotBlank(message = "O campo médico é obrigatório")
    private String medicoId;

    @NotBlank(message = "O campo especialidade é obrigatório")
    private String especialidadeId;

    @NotNull(message = "A data e o horário são obrigatórios")
    private LocalDateTime dataHora;

    private String observacoes;
}
