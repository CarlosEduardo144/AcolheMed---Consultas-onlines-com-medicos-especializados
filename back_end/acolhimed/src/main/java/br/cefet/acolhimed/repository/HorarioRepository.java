package br.cefet.acolhimed.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Horario;
import br.cefet.acolhimed.entity.Medico;

public interface HorarioRepository extends JpaRepository<Horario, String>{
    List<Horario> findByMedico(Medico medico);

     void deleteByMedico(Medico medico);
}