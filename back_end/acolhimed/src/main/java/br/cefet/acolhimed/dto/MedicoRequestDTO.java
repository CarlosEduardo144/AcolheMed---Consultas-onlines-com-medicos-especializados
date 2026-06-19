package br.cefet.acolhimed.dto;

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

    private EspecialidadeResponseDTO especialidade;

    private boolean horariosConfigurados;
    private String sobreMim;
    private String formacaoAcademica;
}