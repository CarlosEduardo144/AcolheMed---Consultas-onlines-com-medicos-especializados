package br.cefet.acolhimed.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Avaliacao;
import br.cefet.acolhimed.entity.Medico;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, String>{
    List<Avaliacao> findByConsultaMedico(Medico medico);
}
