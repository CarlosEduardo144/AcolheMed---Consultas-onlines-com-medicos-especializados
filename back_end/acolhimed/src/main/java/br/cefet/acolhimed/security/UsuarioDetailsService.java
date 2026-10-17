package br.cefet.acolhimed.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import br.cefet.acolhimed.repository.UsuarioRepository;
import br.cefet.acolhimed.entity.Usuario;


@Service
public class UsuarioDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String identificador) throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByEmail(identificador)
                .or(() -> usuarioRepository.findById(identificador))
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + identificador));

        return User.builder()
            .username(usuario.getId())
            .password(usuario.getSenha())
            .authorities(usuario.getTipoUsuario().name())
            .build();
    }
}
