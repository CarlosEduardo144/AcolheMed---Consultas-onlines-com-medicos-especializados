package br.cefet.acolhimed.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.EspecialidadeMedicoRequestDTO;
import br.cefet.acolhimed.dto.EspecialidadeResponseDTO;
import br.cefet.acolhimed.entity.Especialidade;
import br.cefet.acolhimed.entity.EspecialidadeMedico;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.EspecialidadeMedicoRepository;
import br.cefet.acolhimed.repository.EspecialidadeRepository;
import br.cefet.acolhimed.repository.MedicoRepository;

@Service
public class EspecialidadeMedicoService {

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private EspecialidadeMedicoRepository especialidadeMedicoRepository;

    @Autowired
    private EspecialidadeRepository especialidadeRepository;

    @Transactional
    public List<EspecialidadeMedico> salvar(EspecialidadeMedicoRequestDTO dto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetails usuario = (UserDetails) authentication.getPrincipal();

        String medicoId = usuario.getUsername();

        Medico medico = medicoRepository.findById(medicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Médico não encontrado. Id: " + medicoId));

        //exclui todas antigas
        especialidadeMedicoRepository.deleteByMedico(medico);

        //empacota tudo numa lista e depois salva
        List<EspecialidadeMedico> lista = new ArrayList<>();
        for (String id : dto.getIdsSelecionados()) {

            Especialidade esp = especialidadeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Alguma especialidade não foi encontrada. Id: " + id));

            EspecialidadeMedico me = new EspecialidadeMedico();

            me.setMedico(medico);
            me.setEspecialidade(esp);

            lista.add(me);
        }

        return especialidadeMedicoRepository.saveAll(lista);
    }

    @Transactional
    public List<EspecialidadeResponseDTO> getEspecialidadesDoMedico() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetails usuario = (UserDetails) authentication.getPrincipal();

        String medicoId = usuario.getUsername();

        return especialidadeMedicoRepository.findByMedicoId(medicoId)
                .stream()
                .map(me -> new EspecialidadeResponseDTO(me.getEspecialidade()))
                .toList();

    }
}
