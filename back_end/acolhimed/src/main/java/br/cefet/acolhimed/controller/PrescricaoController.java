package br.cefet.acolhimed.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefet.acolhimed.dto.PrescricaoRequestDTO;
import br.cefet.acolhimed.dto.PrescricaoResponseDTO;
import br.cefet.acolhimed.service.PrescricaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/prescricao")
@Tag(name = "Prescricao")
public class PrescricaoController {

    @Autowired
    private PrescricaoService prescricaoService;

    @PostMapping
    @Operation(summary = "Cadastrar Prescricao")
    public ResponseEntity<PrescricaoResponseDTO> inserir(@Valid @RequestBody PrescricaoRequestDTO prescricaoRequestDTO) {
        PrescricaoResponseDTO prescricaoResponseDTO = prescricaoService.inserir(prescricaoRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(prescricaoResponseDTO);
    }

    @GetMapping("/validar/{tokenValidacao}")
    @Operation(summary = "Validar Prescricao")
    public ResponseEntity<PrescricaoResponseDTO> validar(@PathVariable String tokenValidacao) {
        PrescricaoResponseDTO prescricaoResponseDTO = prescricaoService.validar(tokenValidacao);
        return ResponseEntity.ok(prescricaoResponseDTO);
    }

    @GetMapping("/{consultaId}")
    @Operation(summary = "Buscar Prescricao por Consulta")
    public ResponseEntity<PrescricaoResponseDTO> buscarPrescricaoPorConsulta(@PathVariable String consultaId) {
        PrescricaoResponseDTO prescricaoResponseDTO = prescricaoService.buscarPorConsulta(consultaId);
        return ResponseEntity.ok(prescricaoResponseDTO);
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Buscar Prescricao por Usuario")
    public ResponseEntity<PrescricaoResponseDTO> buscarPrescricaoPorUsuario(@PathVariable String usuarioId) {
        PrescricaoResponseDTO prescricaoResponseDTO = prescricaoService.buscarPorUsuario(usuarioId);
        return ResponseEntity.ok(prescricaoResponseDTO);
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Gerar PDF da Prescricao")
    public ResponseEntity<byte[]> gerarPdf(@PathVariable String id) {
        byte[] pdf = prescricaoService.gerarPdf(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename("prescricao-" + id + ".pdf").build().toString())
                .body(pdf);
    }
}
