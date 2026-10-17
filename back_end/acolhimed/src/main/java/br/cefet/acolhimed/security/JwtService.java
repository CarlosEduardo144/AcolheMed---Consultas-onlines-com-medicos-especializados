package br.cefet.acolhimed.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import br.cefet.acolhimed.entity.Usuario;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getChave() {
        String chave = normalizarSecret();
        return Keys.hmacShaKeyFor(chave.getBytes(StandardCharsets.UTF_8));
    }

    public String gerarToken(Usuario usuario) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expiration);

        return Jwts.builder()
                .subject(usuario.getId())
                .claim("tipoUsuario", usuario.getTipoUsuario().name())
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(getChave())
                .compact();
    }

    public String getUsuarioId(String token) {
        return getClaims(token).getSubject();
    }

    public String getPerfil(String token) {
        return getClaims(token).get("perfil", String.class);
    }

    public boolean validarToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validarToken(String token, UserDetails usuario) {
        try {
            String usuarioId = getUsuarioId(token);
            return usuarioId.equals(usuario.getUsername()) && !tokenExpirado(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean tokenExpirado(String token) {
        Date expiracao = getClaims(token).getExpiration();
        return expiracao.before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getChave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String normalizarSecret() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("A propriedade jwt.secret deve ser configurada.");
        }

        String chave = secret.trim();
        if (chave.length() >= 2 && chave.startsWith("\"") && chave.endsWith("\"")) {
            chave = chave.substring(1, chave.length() - 1);
        }

        if (chave.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("A propriedade jwt.secret deve possuir pelo menos 32 bytes.");
        }

        return chave;
    }
}
