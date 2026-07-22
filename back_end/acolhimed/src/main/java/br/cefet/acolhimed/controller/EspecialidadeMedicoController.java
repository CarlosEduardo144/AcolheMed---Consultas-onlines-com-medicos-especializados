package br.cefet.acolhimed.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefet.acolhimed.dto.EspecialidadeMedicoRequestDTO;
import br.cefet.acolhimed.dto.EspecialidadeResponseDTO;
import br.cefet.acolhimed.service.EspecialidadeMedicoService;
import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/minhas-especialidades")
@Tag(name = "Especialidades do medico")
public class EspecialidadeMedicoController {

    @Autowired
    private EspecialidadeMedicoService especialidadeMedicoService;

    @GetMapping("/{medicoId}")
    public ResponseEntity<List<EspecialidadeResponseDTO>> getEspecialidadesDoMedico(
            @PathVariable String medicoId) {

        return ResponseEntity.ok(especialidadeMedicoService.getEspecialidadesDoMedico(medicoId)
        );
    }

    @PutMapping
    public ResponseEntity<Void> salvar(@RequestBody EspecialidadeMedicoRequestDTO dto) {

        especialidadeMedicoService.salvar(dto);

        return ResponseEntity.ok().build();
    }
}
