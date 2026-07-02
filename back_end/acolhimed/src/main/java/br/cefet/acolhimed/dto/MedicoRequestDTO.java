package br.cefet.acolhimed.dto;

import java.sql.Date;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MedicoRequestDTO {
    private String id;

    @Valid
    private UsuarioRequestDTO usuario;

    @NotBlank(message = "O CRM e obrigatorio.")
    private String crm;

    @NotBlank(message = "O estado de emissao e obrigatorio.")
    private String ufEmissao;

    private EspecialidadeResponseDTO[] especialidades;

    private boolean horariosConfigurados;
    private String sobreMim;
    private String formacaoAcademica;
}
