import { ConsultaModel } from "./consulta.model";
import { MedicoModel } from "./medico.model";

export class AvaliacaoModel {
    id: string;
    nota: number;
    comentario: string;
    consultaId: String;
    data: Date;

    constructor(){
        this.id = "";
        this.nota = 0;
        this.comentario = "";
        this.consultaId = "";
        this.data = new Date;
    }
}
