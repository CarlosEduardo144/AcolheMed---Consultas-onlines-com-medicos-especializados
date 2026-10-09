package br.cefet.acolhimed.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "tb_prescricoes")
@NoArgsConstructor
@AllArgsConstructor
public class Prescricao {

    @Id
    private String id;

    @PrePersist
    public void prepararCadastro() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (tokenValidacao == null || tokenValidacao.isBlank()) {
            tokenValidacao = UUID.randomUUID().toString();
        }
        if (data == null) {
            data = LocalDateTime.now();
        }
    }

    @Column(nullable = false)
    private LocalDateTime data;

    @Column(nullable = false, unique = true, length = 36)
    private String tokenValidacao;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_id", nullable = false, unique = true)
    private Consulta consulta;

    @OneToMany(mappedBy = "prescricao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPrescricao> itens = new ArrayList<>();
}
