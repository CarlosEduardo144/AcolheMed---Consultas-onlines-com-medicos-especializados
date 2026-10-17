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

    @GetMapping("/usuario")
    public ResponseEntity<List<NotificacaoResponseDTO>> listarPorUsuario() {

        List<NotificacaoResponseDTO> notificacoes = notificacaoService.listarPorUsuario();
        return ResponseEntity.ok(notificacoes);
    }

    @PatchMapping("/usuario/lidas")
    public ResponseEntity<Void> marcarTodasComoLidas() {

        notificacaoService.marcarTodasComoLidas();
        return ResponseEntity.noContent().build();
    }
}