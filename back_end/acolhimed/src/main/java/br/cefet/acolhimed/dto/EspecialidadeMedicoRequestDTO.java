package br.cefet.acolhimed.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EspecialidadeMedicoRequestDTO {
    @NotBlank(message = "O id do médico é obrigatório.")
    private String medicoId;

    @NotEmpty(message = "Ao menos uma especialidade é obrigatória.")
    private List<String> idsSelecionados;
}
