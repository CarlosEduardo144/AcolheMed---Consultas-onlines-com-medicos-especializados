package br.cefet.acolhimed.dto;

import java.time.LocalDateTime;
import java.util.List;

import br.cefet.acolhimed.entity.Consulta;
import br.cefet.acolhimed.entity.Prescricao;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PrescricaoResponseDTO {
    private String id;
    private String consultaId;
    private LocalDateTime data;
    private String tokenValidacao;
    private Boolean valida;
    private String pacienteNome;
    private String medicoNome;
    private String medicoCrm;
    private String medicoUfEmissao;
    private String especialidadeNome;
    private List<ItemPrescricaoResponseDTO> itens;

    public PrescricaoResponseDTO(Prescricao prescricao) {
        Consulta consulta = prescricao.getConsulta();

        this.id = prescricao.getId();
        this.consultaId = consulta.getId();
        this.data = prescricao.getData();
        this.tokenValidacao = prescricao.getTokenValidacao();
        this.valida = true;
        this.pacienteNome = consulta.getPaciente().getNome();
        this.medicoNome = consulta.getMedico().getNome();
        this.medicoCrm = consulta.getMedico().getCrm();
        this.medicoUfEmissao = consulta.getMedico().getUfEmissao();
        this.especialidadeNome = consulta.getEspecialidade().getNome();
        this.itens = prescricao.getItens().stream()
                .map(ItemPrescricaoResponseDTO::new)
                .toList();
    }
}
