import { EspecialidadeModel } from "./especialidade.model";
import { MedicoModel } from "./medico.model";
import { UsuarioModel } from "./usuario.model";

export type StatusConsulta = 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada';

export class ConsultaResponseModel {
    id: string;
    paciente: UsuarioModel;
    medico: MedicoModel;
    dataHora: Date;
    especialidadeId: string;
    especialidadeNome: string;
    status: StatusConsulta;
    observacoes: string;
    motivoCancelamento: string;
    pacienteNome: string;
    medicoNome: string
    linkConsulta: string;

    constructor() {
        this.id = '';
        this.paciente = new UsuarioModel();
        this.medico = new MedicoModel();
        this.dataHora = new Date();
        this.especialidadeId = ""
        this.especialidadeNome = "";
        this.status = 'agendada';
        this.observacoes = '';
        this.motivoCancelamento = "";
        this.medicoNome = "";
        this.pacienteNome = "";
        this.linkConsulta = "";
    }
}