package br.cefet.acolhimed.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.MedicoRequestDTO;
import br.cefet.acolhimed.dto.MedicoResponseDTO;
import br.cefet.acolhimed.dto.UsuarioRequestDTO;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.entity.Usuario;
import br.cefet.acolhimed.exception.BusinessException;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.MedicoRepository;
import br.cefet.acolhimed.repository.UsuarioRepository;

@Service
public class MedicoService {

    @Autowired
    private MedicoRepository MedicoRepository;

    @Autowired
    private UsuarioRepository UsuarioRepository;

    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> listar() {
        List<Medico> Medicos = MedicoRepository.findAll();
        return Medicos.stream().map(MedicoResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public MedicoResponseDTO buscarPorId(String id) {
        Medico Medico = MedicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medico nao encontrado. Id: " + id));

        return new MedicoResponseDTO(Medico);
    }

    @Transactional
    public MedicoResponseDTO inserir(MedicoRequestDTO dto) {

        if (MedicoRepository.existsByCrm(dto.getCrm())) {
            throw new BusinessException("Ja existe uma Medico com esse CRM.");
        }

        String email = dto.getUsuario().getEmail();

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getUsuario().getNome());
        usuario.setEmail(email);
        usuario.setSenha(dto.getUsuario().getSenha());
        usuario.setTipoUsuario(dto.getUsuario().getTipoUsuario());

        if (!email.equals(usuario.getEmail()) && UsuarioRepository.existsByEmail(email)) {
            throw new BusinessException("Ja existe um usuario com esse email.");
        }

        Medico medico = new Medico();
        medico.setUsuario(usuario);
        medico.setUfEmissao(dto.getUfEmissao());
        medico.setCrm(dto.getCrm());

        return new MedicoResponseDTO(MedicoRepository.save(medico));
    }

    @Transactional
    public MedicoResponseDTO atualizar(String id, MedicoRequestDTO dto) {

        Medico medico = MedicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medico nao encontrado. Id: " + id));

        Usuario usuario = medico.getUsuario();
        String email = dto.getUsuario().getEmail();
       
        if (!email.equals(usuario.getEmail()) && UsuarioRepository.existsByEmail(email)) {
            throw new BusinessException("Ja existe um usuario com esse email.");
        }

        medico.setUsuario(usuario);
        medico.setSobreMim(dto.getSobreMim());
        medico.setFormacaoAcademica(dto.getFormacaoAcademica());
        medico.setHorariosConfigurados(dto.isHorariosConfigurados());
        medico.setUfEmissao(dto.getUfEmissao());
        medico.setCrm(dto.getCrm());

        return new MedicoResponseDTO(MedicoRepository.save(medico));
    }
}
