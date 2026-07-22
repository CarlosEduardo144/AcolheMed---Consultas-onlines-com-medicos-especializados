package br.cefet.acolhimed.entity;

import java.util.UUID;

import br.cefet.acolhimed.enums.DiaSemana;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_horarios", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "medico_id", "dia" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Horario {
    @Id
    private String id;

    @PrePersist
    public void gerarId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiaSemana dia;

    @Column(nullable = false)
    private boolean manha;

    @Column(nullable = false)
    private boolean tarde;

    @Column(nullable = false)
    private boolean noite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

}
