package br.cefet.acolhimed.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.sql.Date;
import java.util.UUID;

import jakarta.persistence.Column;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_usuarios")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class Usuario {
    @Id
    private String id;

    @PrePersist
    public void gerarId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    @Column(nullable = false, length = 100, unique = false)
    private String nome;

    @Column(nullable = false, length = 50, unique = true)
    private String email;

    @Column(nullable = false, length = 20, unique = false)
    private String senha;

    @Column(nullable = false, length = 11, unique = false)
    private String telefone;

    @Column(nullable = false, length = 11, unique = true)
    private String cpf;

    @Column(nullable = true, length = 200, unique = false)
    private String foto;

    @Column(nullable = false, length = 20, unique = false)
    private String tipoUsuario;

    @Column(nullable = false, unique = false)
    private Date dataNascimento;

}