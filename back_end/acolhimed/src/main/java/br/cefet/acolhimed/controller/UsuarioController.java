package br.cefet.acolhimed.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import br.cefet.acolhimed.service.UsuarioService;
import br.cefet.acolhimed.dto.LoginRequestDTO;
import br.cefet.acolhimed.dto.UsuarioResponseDTO;


@RestController
@RequestMapping("/usuarios")
@Tag(name = "Usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService UsuarioService;

    @GetMapping
    @Operation(summary = "Listar Usuarios")
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        List<UsuarioResponseDTO> usuarios = UsuarioService.listar();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Usuario por ID")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable String id) {
        UsuarioResponseDTO usuarioResponseDTO = UsuarioService.buscarPorId(id);
        return ResponseEntity.ok(usuarioResponseDTO);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir Usuario")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        UsuarioService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar Usuario")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginRequestDTO credenciais) {

        Object usuarioResponseDTO = this.UsuarioService.autenticar(credenciais);
        return ResponseEntity.ok(usuarioResponseDTO);

    }

}
