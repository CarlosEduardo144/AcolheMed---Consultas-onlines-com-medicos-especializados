package br.cefet.acolhimed.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PrescricaoRequestDTO {

    @NotBlank(message = "A consulta é obrigatória")
    private String consultaId;

    @Valid
    @NotEmpty(message = "A prescrição deve possuir pelo menos um item")
    private List<ItemPrescricaoRequestDTO> itens;
}
