package br.cefet.acolhimed.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import br.cefet.acolhimed.enums.StatusConsulta;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "tb_consultas")
@NoArgsConstructor
@AllArgsConstructor
public class Consulta {

    @Id
    private String id;

    @PrePersist
    public void gerarId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = true, length = 200)
    private String motivoCancelamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusConsulta status;

    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @ManyToOne
    @JoinColumn(name = "especialidade_id", nullable = false)
    private Especialidade especialidade;
}
