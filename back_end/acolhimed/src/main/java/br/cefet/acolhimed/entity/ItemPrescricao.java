package br.cefet.acolhimed.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "tb_itens_prescricao")
@NoArgsConstructor
@AllArgsConstructor
public class ItemPrescricao {

    @Id
    private String id;

    @PrePersist
    public void gerarId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    @Column(nullable = false, length = 120)
    private String medicamento;

    @Column(nullable = false, length = 80)
    private String dosagem;

    @Column(nullable = false, length = 80)
    private String frequencia;

    @Column(nullable = false, length = 80)
    private String duracao;

    @Column(nullable = true, length = 80)
    private String via;

    @Column(nullable = true, length = 500)
    private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescricao_id", nullable = false)
    private Prescricao prescricao;
}
