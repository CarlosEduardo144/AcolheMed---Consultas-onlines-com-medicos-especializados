package br.cefet.acolhimed.dto;

import br.cefet.acolhimed.entity.Especialidade;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EspecialidadeResponseDTO {
    private String id;
    private String nome;
    private String descricao;
    private String imagemUrl;

    public EspecialidadeResponseDTO(Especialidade especialidade) {
        if (especialidade != null) {
            this.id = especialidade.getId();
            this.nome = especialidade.getNome();
            this.descricao = especialidade.getDescricao();
            this.imagemUrl = especialidade.getImagemUrl();
        }
    }
}