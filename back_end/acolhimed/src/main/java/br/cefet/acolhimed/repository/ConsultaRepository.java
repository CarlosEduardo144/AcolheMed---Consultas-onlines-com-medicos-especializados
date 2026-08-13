package br.cefet.acolhimed.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Consulta;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.entity.Paciente;
import br.cefet.acolhimed.enums.StatusConsulta;

public interface ConsultaRepository extends JpaRepository<Consulta, String> {
    Optional<Consulta> findByPaciente(Paciente paciente);

    Optional<Consulta> findByMedico(Medico medico);

    List<Consulta> findByMedicoOrPaciente(Medico medico, Paciente paciente);

    boolean existsByMedicoAndDataHoraAndStatusNot(Medico medico, LocalDateTime dataHora, StatusConsulta status);

    boolean existsByMedicoAndDataHoraAndStatusNotAndIdNot(
            Medico medico,
            LocalDateTime dataHora,
            StatusConsulta status,
            String id);
}
