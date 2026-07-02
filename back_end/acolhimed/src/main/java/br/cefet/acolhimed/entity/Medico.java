package br.cefet.acolhimed.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Entity
@Data
@Table(name = "tb_medicos")
@NoArgsConstructor
@AllArgsConstructor
public class Medico {
    @Id
    private String id;

    @OneToOne(cascade = CascadeType.ALL)
    @MapsId
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = true, length = 500)
    private String formacaoAcademica;

    @Column(nullable = true, length = 500)
    private String sobreMim;

    @Column(nullable = false, length = 10)
    private String crm;

    @Column(nullable = false, length = 20)
    private String ufEmissao;

    @ManyToOne
    @JoinColumn(name = "especialidade_id", nullable = true)
    private Especialidade[] especialidade;

    @Column(nullable = true)
    private Boolean horariosConfigurados;

}
