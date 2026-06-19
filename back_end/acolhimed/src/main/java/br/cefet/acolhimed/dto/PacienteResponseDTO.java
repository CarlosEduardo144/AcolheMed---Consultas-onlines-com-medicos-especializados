package br.cefet.acolhimed.dto;

import br.cefet.acolhimed.entity.Paciente;

public class PacienteResponseDTO extends UsuarioResponseDTO{

    public PacienteResponseDTO(Paciente paciente){
        super(paciente);
    }
}
