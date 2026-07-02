package br.cefet.acolhimed.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefet.acolhimed.dto.MedicoRequestDTO;
import br.cefet.acolhimed.dto.MedicoResponseDTO;
import br.cefet.acolhimed.service.MedicoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/medicos")
@CrossOrigin(origins = "http://localhost:8100")
@Tag(name = "Medico")
public class MedicoController {

    @Autowired
    private MedicoService MedicoService;

    @GetMapping
    @Operation(summary = "Listar Medicos")
    public ResponseEntity<List<MedicoResponseDTO>> listar() {
        List<MedicoResponseDTO> Medicos = MedicoService.listar();
        return ResponseEntity.ok(Medicos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Medico por ID")
    public ResponseEntity<MedicoResponseDTO> buscarPorId(@PathVariable String id) {
    	MedicoResponseDTO medicoResponseDTO = MedicoService.buscarPorId(id);
        return ResponseEntity.ok(medicoResponseDTO);
    }

    @PostMapping
    @Operation(summary = "Cadastrar Medico")
    public ResponseEntity<MedicoResponseDTO> inserir(@Valid @RequestBody MedicoRequestDTO MedicoRequestDTO) {
    	MedicoResponseDTO medicoResponseDTO = MedicoService.inserir(MedicoRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoResponseDTO);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Atualizar Medico")
    public ResponseEntity<MedicoResponseDTO> atualizar(@PathVariable String id, @Valid @RequestBody MedicoRequestDTO MedicoRequestDTO) {

    	MedicoResponseDTO medicoResponseDTO = MedicoService.atualizar(id, MedicoRequestDTO);

        return ResponseEntity.ok(medicoResponseDTO);
    }    

}