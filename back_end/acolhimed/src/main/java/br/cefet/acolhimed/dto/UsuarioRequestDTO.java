package br.cefet.acolhimed.dto;

import java.sql.Date;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UsuarioRequestDTO {
    private String id;

    @NotBlank(message = "O campo nome é obrigatório")
    private String nome;

    private String cpf;

    @NotBlank(message = "O campo email é obrigatório")
    private String email;

    private String senha;

    @NotBlank(message = "O campo tipoUsuario é obrigatório")
    private String tipoUsuario;

    private Date dataNascimento;

    private String foto;
}
