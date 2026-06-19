package br.cefet.acolhimed.dto;

import br.cefet.acolhimed.entity.Medico;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MedicoResponseDTO extends UsuarioResponseDTO {
	
    private String sobreMim;
    private String crm;
    private String formacaoAcademica;
    private boolean horariosConfigurados;
    private String ufEmissao;
    private EspecialidadeResponseDTO especialidade;
    
    public MedicoResponseDTO(Medico medico) {
        super(medico);
        this.especialidade = new EspecialidadeResponseDTO(medico.getEspecialidade());
    	this.sobreMim = medico.getSobreMim();
        this.crm = medico.getCrm();
        this.formacaoAcademica = medico.getFormacaoAcademica();
        this.horariosConfigurados = false;
        this.ufEmissao = medico.getUfEmissao();
    }  	

}
