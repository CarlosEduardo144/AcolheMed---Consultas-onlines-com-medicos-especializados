package br.cefet.acolhimed.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ItemPrescricaoRequestDTO {
    private String id;

    @NotBlank(message = "O campo medicamento é obrigatório")
    private String medicamento;

    @NotBlank(message = "O campo dosagem é obrigatório")
    private String dosagem;

    @NotBlank(message = "O campo frequência é obrigatório")
    private String frequencia;

    @NotBlank(message = "O campo duracao é obrigatório")
    private String duracao;

    private String via;
    private String observacoes;
}
