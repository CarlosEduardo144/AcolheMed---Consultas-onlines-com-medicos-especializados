import { MedicoModel } from "./medico.model";
import { PacienteModel } from "./paciente.model";

export type StatusConsulta = 'agendada' | 'em_andamento' | 'realizada' | 'cancelada';

export class ConsultaModel {
  id: string;
  paciente: PacienteModel;
  medico: MedicoModel;
  data: string;        // ISO date string
  horario: string;     // HH:mm
  especialidade: string;
  status: StatusConsulta;
  observacoes: string;

  constructor() {
    this.id = '';
    this.paciente = new PacienteModel();
    this.medico = new MedicoModel();
    this.data = '';
    this.horario = '';
    this.especialidade = '';
    this.status = 'agendada';
    this.observacoes = '';
  }
}