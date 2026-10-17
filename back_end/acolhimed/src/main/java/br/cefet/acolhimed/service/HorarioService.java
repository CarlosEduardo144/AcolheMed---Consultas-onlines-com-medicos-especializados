package br.cefet.acolhimed.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefet.acolhimed.dto.HorarioRequestDTO;
import br.cefet.acolhimed.dto.HorarioResponseDTO;
import br.cefet.acolhimed.entity.Horario;
import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.exception.ResourceNotFoundException;
import br.cefet.acolhimed.repository.HorarioRepository;
import br.cefet.acolhimed.repository.MedicoRepository;

import org.springframework.security.core.Authentication;

@Service
public class HorarioService {
    @Autowired
    private HorarioRepository horarioRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Transactional
    public List<Horario> salvar(HorarioRequestDTO dto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetails usuario = (UserDetails) authentication.getPrincipal();

        String medicoId = usuario.getUsername();

        Medico medico = medicoRepository.findById(medicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Médico não encontrado. Id: " + medicoId));

        // Remove todos os horários antigos
        horarioRepository.deleteByMedico(medico);
        horarioRepository.flush();

        List<Horario> horarios = new ArrayList<>();

        for (HorarioResponseDTO item : dto.getHorarios()) {

            Horario horario = new Horario();

            horario.setMedico(medico);
            horario.setDia(item.getDia());
            horario.setManha(item.isManha());
            horario.setTarde(item.isTarde());
            horario.setNoite(item.isNoite());

            horarios.add(horario);
        }

        return horarioRepository.saveAll(horarios);
    }

    @Transactional(readOnly = true)
    public List<HorarioResponseDTO> buscarPorMedico(String id) {

        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico não encontrado. Id: " + id));

        return horarioRepository.findByMedico(medico)
                .stream()
                .map(HorarioResponseDTO::new)
                .toList();
    }
}
