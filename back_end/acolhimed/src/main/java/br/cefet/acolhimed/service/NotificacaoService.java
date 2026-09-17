package br.cefet.acolhimed.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefet.acolhimed.dto.NotificacaoResponseDTO;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.entity.Notificacao;
import br.cefet.acolhimed.entity.Paciente;
import br.cefet.acolhimed.entity.Usuario;
import br.cefet.acolhimed.enums.TipoNotificacao;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.MedicoRepository;
import br.cefet.acolhimed.repository.NotificacaoRepository;
import br.cefet.acolhimed.repository.PacienteRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificacaoService {

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Transactional
    public void criarNotificacao(
            Usuario usuario,
            TipoNotificacao tipo,
            String titulo,
            String mensagem) {

        Notificacao notificacao = new Notificacao();

        notificacao.setUsuario(usuario);
        notificacao.setTipo(tipo);
        notificacao.setTitulo(titulo);
        notificacao.setMensagem(mensagem);
        notificacao.setDataHora(LocalDateTime.now());
        notificacao.setLida(false);

        notificacaoRepository.save(notificacao);
    }

    @Transactional
    public void marcarTodasComoLidas(String usuarioId) {
        notificacaoRepository.marcarTodasComoLidas(usuarioId);
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponseDTO> listarPorUsuario(String usuarioId) {
        Medico medico = medicoRepository.findById(usuarioId).orElse(null);
        Paciente paciente = pacienteRepository.findById(usuarioId).orElse(null);

        if (medico == null && paciente == null) {
            throw new ResourceNotFoundException("Usuario nao encontrado. Id: " + usuarioId);
        }

        return notificacaoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(NotificacaoResponseDTO::new)
                .toList();
    }
}