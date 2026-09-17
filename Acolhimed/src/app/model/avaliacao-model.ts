import { ConsultaModel } from "./consulta.model";
import { MedicoModel } from "./medico.model";

export class AvaliacaoModel {
    id: string;
    nota: number;
    comentario: string;
    consultaId: string;
    data: Date;
    pacienteNome;
    medicoNome;

    constructor(){
        this.id = "";
        this.nota = 0;
        this.comentario = "";
        this.consultaId = "";
        this.data = new Date();
        this.medicoNome = "";
        this.pacienteNome = "";
    }
}
