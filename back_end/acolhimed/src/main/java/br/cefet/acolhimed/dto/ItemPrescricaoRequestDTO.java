package br.cefet.acolhimed.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ItemPrescricaoRequestDTO {
    private String id;

    @NotBlank(message = "O campo medicamento e obrigatorio")
    private String medicamento;

    @NotBlank(message = "O campo dosagem e obrigatorio")
    private String dosagem;

    @NotBlank(message = "O campo frequencia e obrigatorio")
    private String frequencia;

    @NotBlank(message = "O campo duracao e obrigatorio")
    private String duracao;

    private String via;
    private String observacoes;
}
