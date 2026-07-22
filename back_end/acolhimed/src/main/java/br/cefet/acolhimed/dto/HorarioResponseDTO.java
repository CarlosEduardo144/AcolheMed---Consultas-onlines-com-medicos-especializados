package br.cefet.acolhimed.dto;

import br.cefet.acolhimed.entity.Horario;
import br.cefet.acolhimed.enums.DiaSemana;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class HorarioResponseDTO {
    private String id;
    private DiaSemana dia;
    private boolean manha;
    private boolean tarde;
    private boolean noite;

    public HorarioResponseDTO(Horario horario){
        this.id = horario.getId();
        this.dia = horario.getDia();
        this.manha = horario.isManha();
        this.tarde = horario.isTarde();
        this.noite = horario.isNoite();
    }
}
