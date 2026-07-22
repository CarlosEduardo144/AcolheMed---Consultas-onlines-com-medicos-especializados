package br.cefet.acolhimed.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Paciente;


public interface PacienteRepository extends JpaRepository<Paciente, String> {
    
	boolean existsByEmail(String email);

	Optional<Paciente> findByEmail(String email);
}

