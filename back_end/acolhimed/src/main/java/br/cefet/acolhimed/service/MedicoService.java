package br.cefet.acolhimed.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.EspecialidadeResponseDTO;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    public MedicoResponseDTO montarDTO(Medico medico) {
        Double media = avaliacaoRepository.calcularMediaAvaliacao(medico.getId());
        return new MedicoResponseDTO(medico, media);
    }

    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> listar() {
        return MedicoRepository.findAll()
                .stream()
                .map(this::montarDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> listarMedicosBemAvaliados() {

        List<Medico> medicos = MedicoRepository.findAll();

        return medicos.stream()
                .map(medico -> {
                    Double media = avaliacaoRepository
                            .calcularMediaAvaliacao(medico.getId());

                    return new MedicoResponseDTO(medico, media);
                })
                .filter(medico -> medico.getMediaAvaliacao() != null
                        && medico.getMediaAvaliacao() >= 4.0)
                .sorted(
                        Comparator.comparing(
                                MedicoResponseDTO::getMediaAvaliacao,
                                Comparator.reverseOrder()))
                .limit(20)
                .toList();
    }

    @Transactional
    public MedicoResponseDTO inserir(MedicoRequestDTO dto) {

        if (MedicoRepository.existsByCrm(dto.getCrm())) {
            throw new BusinessException("Ja existe uma médico com esse CRM.");
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
        medico.setSenha(passwordEncoder.encode(dto.getSenha()));
        medico.setTipoUsuario(TipoUsuario.medico);
        medico.setUfEmissao(dto.getUfEmissao());
        medico.setCrm(dto.getCrm());

        return montarDTO(MedicoRepository.save(medico));
    }

    @Transactional
    public MedicoResponseDTO atualizar(MedicoRequestDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetails usuario = (UserDetails) authentication.getPrincipal();

        String medicoId = usuario.getUsername();

        Medico medico = MedicoRepository.findById(medicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Médico não encontrado. Id: " + medicoId));

        // Busca se ALGUÉM usa o novo e-mail
        Optional<Medico> usuarioComMesmoEmail = MedicoRepository.findByEmail(dto.getEmail());

        // Se o e-mail já existe E não pertence ao próprio usuário que está logado, aí
        // barra
        if (usuarioComMesmoEmail.isPresent() && !usuarioComMesmoEmail.get().getId().equals(medicoId)) {
            throw new BusinessException("Já existe um usuário com esse e-mail.");
        }

        // Busca se alguem usa o cpf
        Optional<Medico> usuarioComMesmoCpf = MedicoRepository.findByCpf(dto.getCpf());

        // Se o cpf já existe E não pertence ao próprio usuário que está logado, aí
        // barra
        if (usuarioComMesmoCpf.isPresent() && !usuarioComMesmoCpf.get().getId().equals(medicoId)) {
            throw new BusinessException("Já existe um usuário com esse CPF.");
        }

        validarDataNascimento(dto);

        medico.setNome(dto.getNome());
        medico.setEmail(dto.getEmail());
        medico.setDataNascimento(dto.getDataNascimento());

        medico.setCpf(dto.getCpf());

        // senha - atualizar apenas se providenciado
        String senha = dto.getSenha();
        if (senha != null && !senha.trim().isEmpty()) {
            medico.setSenha(passwordEncoder.encode(senha));
        }
        medico.setSobreMim(dto.getSobreMim());
        medico.setFormacaoAcademica(dto.getFormacaoAcademica());

        return montarDTO(MedicoRepository.save(medico));
    }

    private boolean validarDataNascimento(MedicoRequestDTO dto){
         if (dto.getDataNascimento() == null) {
            throw new BusinessException("A data de nascimento é obrigatória.");
        }

        LocalDate nascimento = dto.getDataNascimento().toLocalDate();

        if (nascimento.isBefore(LocalDate.of(1900, 1, 1))) {
            throw new BusinessException(
                    "A data de nascimento não pode ser anterior a 01/01/1900.");
        }

        if (nascimento.isAfter(LocalDate.now())) {
            throw new BusinessException(
                    "A data de nascimento não pode ser futura.");
        }

        if (nascimento.plusYears(18).isAfter(LocalDate.now())) {
            throw new BusinessException(
                    "O médico deve ter pelo menos 18 anos.");
        }

        return true;
    }
}
