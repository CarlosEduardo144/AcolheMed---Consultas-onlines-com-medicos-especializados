package br.cefet.acolhimed.dto;

import br.cefet.acolhimed.entity.ItemPrescricao;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ItemPrescricaoResponseDTO {
    private String id;
    private String medicamento;
    private String dosagem;
    private String frequencia;
    private String duracao;
    private String via;
    private String observacoes;

    public ItemPrescricaoResponseDTO(ItemPrescricao item) {
        this.id = item.getId();
        this.medicamento = item.getMedicamento();
        this.dosagem = item.getDosagem();
        this.frequencia = item.getFrequencia();
        this.duracao = item.getDuracao();
        this.via = item.getVia();
        this.observacoes = item.getObservacoes();
    }
}
