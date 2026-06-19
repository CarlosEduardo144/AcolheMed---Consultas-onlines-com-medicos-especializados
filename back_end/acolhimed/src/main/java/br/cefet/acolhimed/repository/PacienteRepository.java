package br.cefet.acolhimed.repository;

import br.cefet.acolhimed.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<Paciente, String> {

    boolean existsByEmail(String email);
}
