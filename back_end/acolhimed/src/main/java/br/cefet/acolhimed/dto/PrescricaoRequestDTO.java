package br.cefet.acolhimed.dto;

import java.time.LocalDateTime;
import java.util.List;

import br.cefet.acolhimed.entity.Consulta;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PrescricaoRequestDTO {
    private String id;
    private String consultaId;
    private Consulta consulta;
    private LocalDateTime data;
    private String tokenValidacao;

    @Valid
    @NotEmpty(message = "A prescricao deve possuir pelo menos um item")
    private List<ItemPrescricaoRequestDTO> itens;
}
