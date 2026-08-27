package br.cefet.acolhimed.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefet.acolhimed.dto.AvaliacaoRequestDTO;
import br.cefet.acolhimed.dto.AvaliacaoResponseDTO;
import br.cefet.acolhimed.service.AvaliacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/avaliacoes")
@Tag(name = "Avaliacao")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoService avaliacaoService;

    @GetMapping("/{medicoId}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> getAvaliacoesDoMedico(@PathVariable String medicoId) {
        return ResponseEntity.ok(avaliacaoService.buscarPorMedico(medicoId));
    }

    @PostMapping
    @Operation(summary = "Cadastrar avaliação")
    public ResponseEntity<AvaliacaoResponseDTO> inserir(@Valid @RequestBody AvaliacaoRequestDTO avaliacaoRequestDTO) {
        AvaliacaoResponseDTO avaliacaoResponseDTO = avaliacaoService.inserir(avaliacaoRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(avaliacaoResponseDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir avaliação")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        avaliacaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
