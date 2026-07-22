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

import br.cefet.acolhimed.dto.UsuarioRequestDTO;
import br.cefet.acolhimed.dto.UsuarioResponseDTO;
import br.cefet.acolhimed.service.PacienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/pacientes")
@Tag(name = "Paciente")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    @GetMapping
    @Operation(summary = "Listar Pacientes")
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        List<UsuarioResponseDTO> Pacientes = pacienteService.listar();
        return ResponseEntity.ok(Pacientes);
    }

    @PostMapping
    @Operation(summary = "Cadastrar Paciente")
    public ResponseEntity<UsuarioResponseDTO> inserir(@Valid @RequestBody UsuarioRequestDTO PacienteRequestDTO) {
    	UsuarioResponseDTO UsuarioResponseDTO = pacienteService.inserir(PacienteRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioResponseDTO);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar Paciente")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable String id, @Valid @RequestBody UsuarioRequestDTO PacienteRequestDTO) {

    	UsuarioResponseDTO UsuarioResponseDTO = pacienteService.atualizar(id, PacienteRequestDTO);

        return ResponseEntity.ok(UsuarioResponseDTO);
    }    

}