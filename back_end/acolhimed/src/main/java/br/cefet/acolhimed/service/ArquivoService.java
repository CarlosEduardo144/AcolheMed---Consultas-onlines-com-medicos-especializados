package br.cefet.acolhimed.service;

import java.io.IOException;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;

import br.cefet.acolhimed.entity.Foto;
import br.cefet.acolhimed.entity.Usuario;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.FotoRepository;
import br.cefet.acolhimed.repository.UsuarioRepository;

@Service
public class ArquivoService {

    @Value("${spring.servlet.multipart.max-file-size:10MB}")
    private String maxFileSizeConfig;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FotoRepository fotoRepository;

    @Transactional
    public Foto salvar(MultipartFile arquivo, String idUsuario) throws IOException {

        validarTamanhoArquivo(arquivo);

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado. Id: " + idUsuario));
        List<Foto> fotosAntigas = fotoRepository.findByIdUsuario(idUsuario);

        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                arquivo.getBytes(),
                Map.of(
                        "folder", "fotos_minha_API"));

        String urlCloudinary = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        usuario.setFoto(urlCloudinary);
        usuarioRepository.save(usuario);

        for (Foto fotoAntiga : fotosAntigas) {
            excluir(fotoAntiga.getPublicId());
        }
        fotoRepository.deleteAllByIdUsuario(idUsuario);

        return fotoRepository.save(new Foto(urlCloudinary, publicId, idUsuario));
    }

    private void validarTamanhoArquivo(MultipartFile arquivo) {

        long limiteEmBytes = converterParaBytes(maxFileSizeConfig);

        if (arquivo.getSize() > limiteEmBytes) {
            throw new IllegalArgumentException("O arquivo excede o limite máximo permitido.");
        }
    }

    private long converterParaBytes(String tamanhoConfig) {

        String texto = tamanhoConfig.toUpperCase().trim();

        if (texto.endsWith("MB")) {
            return Long.parseLong(
                    texto.replace("MB", "").trim()) * 1024 * 1024;
        }

        if (texto.endsWith("KB")) {
            return Long.parseLong(
                    texto.replace("KB", "").trim()) * 1024;
        }
        return Long.parseLong(texto);
    }

    public void excluir(String publicId) {
        try {
            if (publicId != null && !publicId.isBlank()) {
                cloudinary.uploader().destroy(publicId, Map.of());
            }
        } catch (IOException e) {
            throw new RuntimeException(
                    "Não foi possível excluir a imagem do Cloudinary.", e);
        }
    }
}
