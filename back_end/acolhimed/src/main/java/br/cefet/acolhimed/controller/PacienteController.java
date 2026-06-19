package br.cefet.acolhimed.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefet.acolhimed.dto.PacienteRequestDTO;
import br.cefet.acolhimed.dto.PacienteResponseDTO;
import br.cefet.acolhimed.service.PacienteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/pacientes")
@Tag(name = "Paciente")
public class PacienteController {

    @Autowired
    private PacienteService PacienteService;

    @GetMapping
    @Operation(summary = "Listar Pacientes")
    public ResponseEntity<List<PacienteResponseDTO>> listar() {
        List<PacienteResponseDTO> pacientes = PacienteService.listar();
        return ResponseEntity.ok(pacientes);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Paciente por ID")
    public ResponseEntity<PacienteResponseDTO> buscarPorId(@PathVariable String id) {
    	PacienteResponseDTO pacienteResponseDTO = PacienteService.buscarPorId(id);
        return ResponseEntity.ok(pacienteResponseDTO);
    }

    @PostMapping
    @Operation(summary = "Cadastrar Paciente")
    public ResponseEntity<PacienteResponseDTO> inserir(@Valid @RequestBody PacienteRequestDTO PacienteRequestDTO) {
    	PacienteResponseDTO pacienteResponseDTO = PacienteService.inserir(PacienteRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteResponseDTO);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar Paciente")
    public ResponseEntity<PacienteResponseDTO> atualizar(@PathVariable String id, @Valid @RequestBody PacienteRequestDTO PacienteRequestDTO) {

    	PacienteResponseDTO pacienteResponseDTO = PacienteService.atualizar(id, PacienteRequestDTO);

        return ResponseEntity.ok(pacienteResponseDTO);
    }    

}