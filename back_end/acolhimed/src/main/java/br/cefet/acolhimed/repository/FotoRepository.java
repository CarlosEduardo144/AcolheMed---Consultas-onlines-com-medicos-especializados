package br.cefet.acolhimed.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefet.acolhimed.entity.Foto;

public interface FotoRepository extends JpaRepository<Foto, String>{

    List<Foto> findByIdUsuario(String idUsuario);

    void deleteAllByIdUsuario(String idUsuario);
}
