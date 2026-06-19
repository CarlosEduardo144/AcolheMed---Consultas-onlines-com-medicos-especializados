package br.cefet.acolhimed.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Especialidade;

public interface EspecialidadeRepository extends JpaRepository<Especialidade, String>{
    boolean existsByNome(String nome);
}
