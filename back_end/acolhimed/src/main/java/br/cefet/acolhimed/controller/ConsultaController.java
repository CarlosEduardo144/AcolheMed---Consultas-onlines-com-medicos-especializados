package br.cefet.acolhimed.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefet.acolhimed.dto.ConsultaRequestDTO;
import br.cefet.acolhimed.dto.ConsultaResponseDTO;
import br.cefet.acolhimed.service.ConsultaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/consultas")
@Tag(name = "Consulta")
public class ConsultaController {

    @Autowired
    private ConsultaService consultaService;

    @GetMapping
    @Operation(summary = "Listar Consultas")
    public ResponseEntity<List<ConsultaResponseDTO>> listar() {
        List<ConsultaResponseDTO> consultas = consultaService.listar();
        return ResponseEntity.ok(consultas);
    }

    @GetMapping("/usuario/{usuarioId}")
    @Operation(summary = "Listar Consultas do Usuario")
    public ResponseEntity<List<ConsultaResponseDTO>> listarPorUsuario(@PathVariable String usuarioId) {
        List<ConsultaResponseDTO> consultas = consultaService.listarConsultasDoUsuario(usuarioId);
        return ResponseEntity.ok(consultas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar consulta por ID")
    public ResponseEntity<ConsultaResponseDTO> buscarPorId(@PathVariable String id) {
        ConsultaResponseDTO consultaResponseDTO = consultaService.buscarPorId(id);
        return ResponseEntity.ok(consultaResponseDTO);
    }

    @PostMapping
    @Operation(summary = "Cadastrar Consulta")
    public ResponseEntity<ConsultaResponseDTO> inserir(@Valid @RequestBody ConsultaRequestDTO consultaRequestDTO) {
        ConsultaResponseDTO consultaResponseDTO = consultaService.inserir(consultaRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(consultaResponseDTO);
    }

    @PutMapping("/remarcar/{id}")
    @Operation(summary = "Remarcar Consulta")
    public ResponseEntity<ConsultaResponseDTO> remarcar(
            @PathVariable String id,
            @RequestBody ConsultaRequestDTO consultaRequestDTO) {
        ConsultaResponseDTO consultaResponseDTO = consultaService.remarcarConsulta(id, consultaRequestDTO);
        return ResponseEntity.ok(consultaResponseDTO);
    }

    @PatchMapping("/cancelar/{id}")
    @Operation(summary = "Cancelar Consulta")
    public ResponseEntity<ConsultaResponseDTO> cancelar(
            @PathVariable String id,
            @RequestBody String motivoCancelamento) {
        ConsultaResponseDTO consultaResponseDTO = consultaService.cancelarConsulta(id, motivoCancelamento);
        return ResponseEntity.ok(consultaResponseDTO);
    }
}
