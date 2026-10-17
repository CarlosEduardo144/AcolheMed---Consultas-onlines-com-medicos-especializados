package br.cefet.acolhimed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AvaliacaoRequestDTO {

    @NotNull(message = "O campo consulta é obrigatório")
    private String consultaId;

    @NotBlank(message = "O campo comentário é obrigatório")
    private String comentario;

    @NotNull(message = "O campo nota não pode ser vazio")
    private Double nota;
}
