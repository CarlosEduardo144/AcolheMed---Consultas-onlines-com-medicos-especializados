package br.cefet.acolhimed.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefet.acolhimed.dto.HorarioRequestDTO;
import br.cefet.acolhimed.dto.HorarioResponseDTO;
import br.cefet.acolhimed.service.HorarioService;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/horarios")
@Tag(name = "Horários")
public class HorarioController {
    @Autowired
    private HorarioService horarioService;

    @GetMapping("/{medicoId}")
    public ResponseEntity<List<HorarioResponseDTO>> getEspecialidadesDoMedico(
            @PathVariable String medicoId) {

        return ResponseEntity.ok(horarioService.buscarPorMedico(medicoId));
    }

    @PutMapping
    public ResponseEntity<Void> salvar(@RequestBody HorarioRequestDTO dto) {
        horarioService.salvar(dto);
        return ResponseEntity.ok().build();
    }
}
