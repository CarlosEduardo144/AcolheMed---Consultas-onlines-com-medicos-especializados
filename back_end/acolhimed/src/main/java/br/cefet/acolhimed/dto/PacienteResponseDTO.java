package br.cefet.acolhimed.dto;

import br.cefet.acolhimed.entity.Paciente;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PacienteResponseDTO extends UsuarioResponseDTO {

    public PacienteResponseDTO(Paciente paciente) {
        super(paciente);
    }
}
