package br.cefet.acolhimed.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Data;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Medico extends Usuario{

    @Column(nullable = true, length = 1000, unique = false)
    private String formacaoAcademica;

    @Column(nullable = true, length = 1000, unique = false)
    private String sobreMim;

    @Column(nullable = false, length = 10, unique = false)
    private String crm;

    @Column(nullable = false, length = 20, unique = false)
    private String ufEmissao;

    @ManyToOne
    @JoinColumn(name = "especialidade_id", nullable = false)
    private Especialidade especialidade;

    @Column(nullable = true, unique = false)
    private Boolean horariosConfigurados;

}