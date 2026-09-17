package br.cefet.acolhimed.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefet.acolhimed.dto.NotificacaoResponseDTO;
import br.cefet.acolhimed.service.NotificacaoService;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/notificacoes")
@Tag(name = "Notificação")
public class NotificacaoController {

    @Autowired
    private NotificacaoService notificacaoService;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<NotificacaoResponseDTO>> listarPorUsuario(
            @PathVariable String usuarioId) {

        List<NotificacaoResponseDTO> notificacoes = notificacaoService.listarPorUsuario(usuarioId);

        return ResponseEntity.ok(notificacoes);
    }

    @PatchMapping("/usuario/{usuarioId}/lidas")
    public ResponseEntity<Void> marcarTodasComoLidas(
            @PathVariable String usuarioId) {

        notificacaoService.marcarTodasComoLidas(usuarioId);

        return ResponseEntity.noContent().build();
    }
}