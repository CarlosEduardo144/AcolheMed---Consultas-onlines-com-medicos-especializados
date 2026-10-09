package br.cefet.acolhimed.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Prescricao;

public interface PrescricaoRepository extends JpaRepository<Prescricao, String> {
    Optional<Prescricao> findByConsultaId(String consultaId);

    Optional<Prescricao> findByTokenValidacao(String tokenValidacao);

    Optional<Prescricao> findFirstByConsultaPacienteIdOrConsultaMedicoIdOrderByDataDesc(
            String pacienteId,
            String medicoId);

    boolean existsByConsultaId(String consultaId);
}
