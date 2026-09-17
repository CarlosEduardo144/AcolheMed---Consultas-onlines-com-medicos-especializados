package br.cefet.acolhimed.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.cefet.acolhimed.entity.Notificacao;

public interface NotificacaoRepository extends JpaRepository<Notificacao, String> {

    List<Notificacao> findByUsuarioId(String usuarioId);

    @Modifying
    @Query("""
                UPDATE Notificacao n
                SET n.lida = true
                WHERE n.usuario.id = :usuarioId
                  AND n.lida = false
            """)
    void marcarTodasComoLidas(@Param("usuarioId") String usuarioId);

}