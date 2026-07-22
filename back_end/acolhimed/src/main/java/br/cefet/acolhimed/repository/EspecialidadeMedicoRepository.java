package br.cefet.acolhimed.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.EspecialidadeMedico;
import br.cefet.acolhimed.entity.Medico;

public interface EspecialidadeMedicoRepository extends JpaRepository<EspecialidadeMedico, String>{
    
    void deleteByMedico(Medico medico);
    List<EspecialidadeMedico> findByMedicoId(String medicoId);
}
