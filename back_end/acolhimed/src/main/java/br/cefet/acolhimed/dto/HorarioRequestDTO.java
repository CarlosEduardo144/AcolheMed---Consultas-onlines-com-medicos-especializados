package br.cefet.acolhimed.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class HorarioRequestDTO {
    
    @NotEmpty(message = "O campo horarios é obrigatório")
    private List<HorarioResponseDTO> horarios;
}
