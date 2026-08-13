import { EspecialidadeModel } from "./especialidade.model";
import { MedicoModel } from "./medico.model";
import { UsuarioModel } from "./usuario.model";

export type StatusConsulta = 'agendada' | 'em_andamento' | 'realizada' | 'cancelada';

export class ConsultaModel {
  id: string;
  paciente: UsuarioModel;
  medico: MedicoModel;
  dataHora: Date;      
  especialidade: EspecialidadeModel;
  status: StatusConsulta;
  observacoes: string;
  motivoCancelamento: string;

  constructor() {
    this.id = '';
    this.paciente = new UsuarioModel();
    this.medico = new MedicoModel();
    this.dataHora = new Date();
    this.especialidade = new EspecialidadeModel();
    this.status = 'agendada';
    this.observacoes = '';
    this.motivoCancelamento = "";
  }
}
