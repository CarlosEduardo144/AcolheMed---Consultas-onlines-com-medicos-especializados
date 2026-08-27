package br.cefet.acolhimed.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.cefet.acolhimed.entity.Foto;
import br.cefet.acolhimed.service.ArquivoService;

@RestController
@RequestMapping("/fotos")
public class ArquivoController {

    @Autowired
    private ArquivoService arquivoService;

    @PostMapping("{idUsuario}")
    public ResponseEntity<Foto> upload(@RequestParam("arquivo") MultipartFile arquivo, @PathVariable String idUsuario) throws IOException {
        Foto resultado = arquivoService.salvar(arquivo, idUsuario);

        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }
}