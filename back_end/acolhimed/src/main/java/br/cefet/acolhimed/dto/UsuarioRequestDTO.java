package br.cefet.acolhimed.dto;

import java.sql.Date;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UsuarioRequestDTO {

    @NotNull(message = "O campo modalidadeId é obrigatório")
    private Long id;

    @NotBlank(message = "O campo nome é obrigatório")
    private String nome;

    @NotBlank(message = "O campo cpf é obrigatório")
    private String cpf;

    @NotBlank(message = "O campo telefone é obrigatório")
    private String telefone;

    @NotBlank(message = "O campo email é obrigatório")
    private String email;

    @NotBlank(message = "O campo senha é obrigatório")
    private String senha;

    @NotBlank(message = "O campo tipoUsuario é obrigatório")
    private String tipoUsuario;

    @NotBlank(message = "O campo data de Nascimento é obrigatório")
    private Date dataNascimento;

    private String foto;
}