package br.cefet.acolhimed.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, String>{

}