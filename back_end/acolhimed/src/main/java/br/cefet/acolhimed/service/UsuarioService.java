package br.cefet.acolhimed.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.AutenticacaoResponseDTO;
import br.cefet.acolhimed.dto.LoginRequestDTO;
import br.cefet.acolhimed.dto.MedicoResponseDTO;
import br.cefet.acolhimed.dto.UsuarioResponseDTO;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.entity.Usuario;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.AvaliacaoRepository;
import br.cefet.acolhimed.repository.UsuarioRepository;
import br.cefet.acolhimed.security.JwtService;

@Service
public class UsuarioService {

    @Autowired  
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(String id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado. Id: " + id));

        if (usuario instanceof Medico medico) {
            Double media = avaliacaoRepository.calcularMediaAvaliacao(medico.getId());
            return new MedicoResponseDTO(medico, media);
        }

        return new UsuarioResponseDTO(usuario);
    }

    @Transactional(readOnly = true)
    public Object autenticar(LoginRequestDTO credenciais) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(credenciais.getEmail(), credenciais.getSenha()));
        } catch (BadCredentialsException ex) {
            throw new RuntimeException("E-mail ou senha incorretos.");
        }

        Usuario usuario = usuarioRepository.findByEmail(credenciais.getEmail())
                .orElseThrow(() -> new RuntimeException("E-mail ou senha incorretos."));

        String token = jwtService.gerarToken(usuario);

        return new AutenticacaoResponseDTO(token);
    }

}
