package br.cefet.acolhimed.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, String>{
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
}