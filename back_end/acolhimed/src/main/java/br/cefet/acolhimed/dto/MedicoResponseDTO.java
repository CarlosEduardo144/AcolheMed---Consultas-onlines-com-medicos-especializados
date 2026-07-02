package br.cefet.acolhimed.dto;

import br.cefet.acolhimed.entity.Especialidade;
import br.cefet.acolhimed.entity.Medico;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MedicoResponseDTO {
    private String id;
    private UsuarioResponseDTO usuario;
    private String sobreMim;
    private String crm;
    private String formacaoAcademica;
    private boolean horariosConfigurados;
    private String ufEmissao;
    private Especialidade[] especialidades;

    public MedicoResponseDTO(Medico medico) {
        this.id = medico.getId();
        this.usuario = new UsuarioResponseDTO(medico.getUsuario());
        this.especialidades = medico.getEspecialidade();
        this.sobreMim = medico.getSobreMim();
        this.crm = medico.getCrm();
        this.formacaoAcademica = medico.getFormacaoAcademica();
        this.horariosConfigurados = Boolean.TRUE.equals(medico.getHorariosConfigurados());
        this.ufEmissao = medico.getUfEmissao();
    }
}
