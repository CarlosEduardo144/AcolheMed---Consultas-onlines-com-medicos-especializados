package br.cefet.acolhimed.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.InheritanceType;

import java.sql.Date;
import java.util.UUID;

import br.cefet.acolhimed.enums.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    private String id;

    @PrePersist
    public void gerarId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 50, unique = true)
    private String email;

    @Column(nullable = false, length = 255)
    private String senha;

    @Column(nullable = true, length = 11, unique = true)
    private String cpf;

    @Column(nullable = true, length = 200)
    private String foto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoUsuario tipoUsuario;

    @Column(nullable = true)
    private Date dataNascimento;

}
