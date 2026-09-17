package br.cefet.acolhimed.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.cefet.acolhimed.entity.Avaliacao;
import br.cefet.acolhimed.entity.Medico;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, String>{
    List<Avaliacao> findByConsultaMedico(Medico medico);

    @Query("""
        SELECT AVG(a.nota)
        FROM Avaliacao a
        WHERE a.consulta.medico.id = :id
    """)
    Double calcularMediaAvaliacao(@Param("id") String id);
}
