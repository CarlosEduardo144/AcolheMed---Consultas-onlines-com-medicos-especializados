package br.cefet.acolhimed.dto;


import br.cefet.acolhimed.entity.Especialidade;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MedicoRequestDTO extends UsuarioRequestDTO{
    @NotBlank(message = "O CRM é obrigatório.")
    private String crm;

    @NotBlank(message = "O estado de emissão é obrigatório.")
    private String ufEmissao;

    private Especialidade[] especialidades;

    private boolean horariosConfigurados;
    private String sobreMim;
    private String formacaoAcademica;
}
