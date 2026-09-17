package br.cefet.acolhimed.dto;

import java.time.LocalDateTime;

import br.cefet.acolhimed.entity.Notificacao;
import br.cefet.acolhimed.enums.TipoNotificacao;
import lombok.Data;

@Data
public class NotificacaoResponseDTO {
    private String id;
    private TipoNotificacao tipo;
    private String titulo;
    private String mensagem;
    private boolean lida;
    private LocalDateTime dataHora;

    public NotificacaoResponseDTO(Notificacao notificacao) {
        this.id = notificacao.getId();
        this.tipo = notificacao.getTipo();
        this.titulo = notificacao.getTitulo();
        this.mensagem = notificacao.getMensagem();
        this.dataHora = notificacao.getDataHora();
        this.lida = notificacao.isLida();
    }
}
