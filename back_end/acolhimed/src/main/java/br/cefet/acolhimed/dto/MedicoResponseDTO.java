package br.cefet.acolhimed.dto;

import br.cefet.acolhimed.entity.Medico;
import br.cefet.acolhimed.enums.TipoUsuario;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MedicoResponseDTO extends UsuarioResponseDTO {
    private String sobreMim;
    private String crm;
    private String formacaoAcademica;
    private String ufEmissao;
    private EspecialidadeResponseDTO[] especialidades;

    public MedicoResponseDTO(Medico medico) {
        this.setId(medico.getId());
        this.setNome(medico.getNome());
        this.setEmail(medico.getEmail());
        this.setDataNascimento(medico.getDataNascimento());
        this.setCpf(medico.getCpf());
        this.setFoto(medico.getFoto());
        this.setTipoUsuario(TipoUsuario.medico);
        this.sobreMim = medico.getSobreMim();
        this.crm = medico.getCrm();
        this.formacaoAcademica = medico.getFormacaoAcademica();
        this.ufEmissao = medico.getUfEmissao();
        this.especialidades = medico.getEspecialidades().stream()
                .map(medicoEspec -> new EspecialidadeResponseDTO(medicoEspec.getEspecialidade()))
                .toArray(EspecialidadeResponseDTO[]::new);
    }
}
