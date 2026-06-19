package br.cefet.acolhimed.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "tb_especialidades")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Especialidade {
    @Id
    private String id;

    @PrePersist
    public void gerarId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    @Column(nullable = false, length = 50, unique = true)
    private String nome;

    @Column(nullable = false, length = 200, unique = false)
    private String descricao;

    @Column(nullable = false, length = 200, unique = false)
    private String imagemUrl;
}
