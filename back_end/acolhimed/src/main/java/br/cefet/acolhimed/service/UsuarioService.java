package br.cefet.acolhimed.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.UsuarioResponseDTO;
import br.cefet.acolhimed.entity.Usuario;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository UsuarioRepository;

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listar() {
        List<Usuario> Usuarios = UsuarioRepository.findAll();
        return Usuarios.stream().map(UsuarioResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(String id) {
    	Usuario Usuario = UsuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario não encontrado. Id: " + id));

        return new UsuarioResponseDTO(Usuario);
    }

    @Transactional
    public void excluir(String id) {
        if (!UsuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario não encontrado com ID: " + id);
        }

        UsuarioRepository.deleteById(id);
    }
}