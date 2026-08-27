package br.cefet.acolhimed.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_fotos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Foto {

    @Id
    private String id;

    @Column(nullable = false)
    private String imagemUrl;

    @Column(nullable = false)
    private String publicId;

    @Column(name = "usuario_id", nullable = false)
    private String idUsuario;

    @PrePersist
    public void gerarId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    public Foto(String imagemUrl, String publicId, String idUsuario) {
        this.imagemUrl = imagemUrl;
        this.publicId = publicId;
        this.idUsuario = idUsuario;
    }
}
