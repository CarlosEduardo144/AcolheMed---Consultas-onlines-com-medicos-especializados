package br.cefet.acolhimed.dto;

import java.sql.Date;

import br.cefet.acolhimed.entity.Usuario;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UsuarioResponseDTO {
	
	private String id;
    private String nome;
    private String email;
    private String senha;
    private Date dataNascimento;
    private String tipoUsuario;
    private String foto;
    private String cpf;
    private String telefone;

    
    public UsuarioResponseDTO(Usuario usuario) {
    	this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.senha = usuario.getEmail();
        this.dataNascimento = usuario.getDataNascimento();
        this.foto = usuario.getFoto();
        this.cpf = usuario.getCpf();
        this.telefone = usuario.getTelefone();
        this.tipoUsuario = usuario.getTipoUsuario();
    }  	

}
