import { ConsultaResponseModel } from "./consulta-response";
import { ItemPrescricao } from "./item-prescricao";

export class PrescricaoModel {
    id: string;
    itens: ItemPrescricao[];
    data: Date;
    consultaId: string;
    tokenValidacao: string;
    valida: boolean;
    pacienteNome: string;
    medicoNome: string;
    medicoCrm: string;
    medicoUfEmissao: string;
    especialidadeNome: string;

    constructor(){
        this.id = "";
        this.itens = [];
        this.data = new Date();
        this.consultaId = "";
        this.tokenValidacao = "";
        this.valida = false;
        this.pacienteNome = "";
        this.medicoNome = "";
        this.medicoCrm = "";
        this.medicoUfEmissao = "";
        this.especialidadeNome = "";
    }
}
