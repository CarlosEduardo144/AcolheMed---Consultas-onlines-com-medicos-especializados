package br.cefet.acolhimed.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "tb_medicos")
@PrimaryKeyJoinColumn(name = "usuario_id")
@NoArgsConstructor
@AllArgsConstructor
public class Medico extends Usuario {

    @Column(nullable = true, length = 500)
    private String formacaoAcademica;

    @Column(nullable = true, length = 500)
    private String sobreMim;

    @Column(nullable = false, length = 10)
    private String crm;

    @Column(nullable = false, length = 20)
    private String ufEmissao;

    @OneToMany(mappedBy = "medico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EspecialidadeMedico> especialidades = new ArrayList<>();

}
