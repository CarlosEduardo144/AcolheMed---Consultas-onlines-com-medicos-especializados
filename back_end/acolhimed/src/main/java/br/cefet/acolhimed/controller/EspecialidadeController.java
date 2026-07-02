package br.cefet.acolhimed.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefet.acolhimed.dto.EspecialidadeResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import br.cefet.acolhimed.service.EspecialidadeService;

@RestController
@CrossOrigin(origins = "http://localhost:8100")
@RequestMapping("/especialidades")
@Tag(name = "Especialidade")
public class EspecialidadeController {

    @Autowired
    private EspecialidadeService especialidadeService;

    @GetMapping
    @Operation(summary = "Listar Especialidades")
    public ResponseEntity<List<EspecialidadeResponseDTO>> listar() {
        List<EspecialidadeResponseDTO> especialidades = especialidadeService.listar();
        return ResponseEntity.ok(especialidades);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Especialidade por ID")
    public ResponseEntity<EspecialidadeResponseDTO> buscarPorId(@PathVariable String id) {
    	EspecialidadeResponseDTO EspecialidadeResponseDTO = especialidadeService.buscarPorId(id);
        return ResponseEntity.ok(EspecialidadeResponseDTO);
    }  

}