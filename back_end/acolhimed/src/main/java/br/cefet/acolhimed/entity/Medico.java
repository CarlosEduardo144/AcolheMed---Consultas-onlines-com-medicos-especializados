package br.cefet.acolhimed.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Entity
@Table(name = "tb_medicos")
@Data
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

    @Column(nullable = false, unique = false)
    private Especialidade especialidade;

    @Column(nullable = true, unique = false)
    private Boolean horariosConfigurados;

}