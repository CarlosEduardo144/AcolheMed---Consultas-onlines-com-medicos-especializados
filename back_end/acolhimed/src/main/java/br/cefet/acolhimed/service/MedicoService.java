package br.cefet.acolhimed.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.MedicoRequestDTO;
import br.cefet.acolhimed.dto.MedicoResponseDTO;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.enums.TipoUsuario;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.AvaliacaoRepository;
import br.cefet.acolhimed.repository.MedicoRepository;
import br.cefet.acolhimed.repository.UsuarioRepository;
import java.util.Optional;

@Service
public class MedicoService {

    @Autowired
    private MedicoRepository MedicoRepository;

    @Autowired
    private UsuarioRepository UsuarioRepository;

    @Autowired 
    private AvaliacaoRepository avaliacaoRepository;

    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> listar() {
        List<Medico> Medicos = MedicoRepository.findAll();
        return Medicos.stream().map(MedicoResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> listarMedicosBemAvaliados() {

        List<Medico> medicos = MedicoRepository.findAll();

        return medicos.stream()
                .map(medico -> {
                    Double media = avaliacaoRepository.calcularMediaAvaliacao(medico.getId());
                    return new MedicoResponseDTO(medico, media);
                })
                .sorted(Comparator.comparing(
                        MedicoResponseDTO::getMediaAvaliacao,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(20)
                .toList();
    }

    @Transactional
    public MedicoResponseDTO inserir(MedicoRequestDTO dto) {

        if (MedicoRepository.existsByCrm(dto.getCrm())) {
            throw new BusinessException("Ja existe uma Medico com esse CRM.");
        }

        if (UsuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Ja existe um usuario com esse email.");
        }

        if (!"medico".equalsIgnoreCase(dto.getTipoUsuario())) {
            throw new BusinessException("Apenas médicos podem ser cadastrados neste endpoint.");
        }

        Medico medico = new Medico();
        medico.setNome(dto.getNome());
        medico.setEmail(dto.getEmail());
        medico.setSenha(dto.getSenha());
        medico.setTipoUsuario(TipoUsuario.medico);
        medico.setUfEmissao(dto.getUfEmissao());
        medico.setCrm(dto.getCrm());

        return new MedicoResponseDTO(MedicoRepository.save(medico));
    }

    @Transactional
    public MedicoResponseDTO atualizar(String id, MedicoRequestDTO dto) {

        Medico medico = MedicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico nao encontrado. Id: " + id));

        // Busca se ALGUÉM usa o novo e-mail
        Optional<Medico> usuarioComMesmoEmail = MedicoRepository.findByEmail(dto.getEmail());

        // Se o e-mail já existe E não pertence ao próprio usuário que está logado, aí
        // barra
        if (usuarioComMesmoEmail.isPresent() && !usuarioComMesmoEmail.get().getId().equals(id)) {
            throw new BusinessException("Já existe um usuário com esse e-mail.");
        }

        medico.setNome(dto.getNome());
        medico.setEmail(dto.getEmail());
        medico.setDataNascimento(dto.getDataNascimento());

        medico.setCpf(dto.getCpf());

        // senha - atualizar apenas se providenciado
        String senha = dto.getSenha();
        if (senha != null && !senha.trim().isEmpty()) {
            medico.setSenha(senha);
        }
        medico.setSobreMim(dto.getSobreMim());
        medico.setFormacaoAcademica(dto.getFormacaoAcademica());

        return new MedicoResponseDTO(MedicoRepository.save(medico));
    }
}
