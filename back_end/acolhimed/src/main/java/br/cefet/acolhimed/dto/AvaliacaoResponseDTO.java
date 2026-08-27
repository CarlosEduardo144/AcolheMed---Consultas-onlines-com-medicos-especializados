package br.cefet.acolhimed.dto;

import com.google.type.Date;

import br.cefet.acolhimed.entity.Avaliacao;
import lombok.Getter;

@Getter
public class AvaliacaoResponseDTO {
    private String id;
    private String comentario;
    private Double nota;
    private Date data;
    private String medicoNome;
    private String pacienteNome; 
    private String consultaId;

    public AvaliacaoResponseDTO(Avaliacao avaliacao){
        this.id = avaliacao.getId();
        this.nota = avaliacao.getNota();
        this.comentario = avaliacao.getComentario();
        this.medicoNome = avaliacao.getConsulta().getMedico().getNome();
        this.pacienteNome = avaliacao.getConsulta().getPaciente().getNome();
        this.data = avaliacao.getData();
        this.consultaId = avaliacao.getConsulta().getId();
    }
}
