package br.cefet.acolhimed.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Medico;

public interface MedicoRepository extends JpaRepository<Medico, String>{
	
	boolean existsByCrm(String crm);

	boolean existsByEmail(String email);

	Optional<Medico> findByEmail(String email);
	
} 
