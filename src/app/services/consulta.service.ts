import { Injectable } from '@angular/core';
import { ConsultaModel, StatusConsulta } from '../model/consulta.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {

  private KEY = 'consultas';

  listar(): ConsultaModel[] {
    return JSON.parse(localStorage.getItem(this.KEY) || '[]');
  }

  listarPorPaciente(pacienteId: string): ConsultaModel[] {
    return this.listar().filter(c => c.paciente.id === pacienteId);
  }

  listarPorMedico(medicoId: string): ConsultaModel[] {
    return this.listar().filter(c => c.medico.id === medicoId);
  }

  agendar(consulta: ConsultaModel): ConsultaModel {
    const lista = this.listar();
    consulta.id = crypto.randomUUID();
    consulta.status = 'agendada';
    lista.push(consulta);
    localStorage.setItem(this.KEY, JSON.stringify(lista));
    return consulta;
  }

  cancelar(id: string): boolean {
    const lista = this.listar();
    const idx = lista.findIndex(c => c.id === id);
    if (idx === -1) return false;
    lista[idx].status = 'cancelada';
    localStorage.setItem(this.KEY, JSON.stringify(lista));
    return true;
  }

  atualizarStatus(id: string, status: StatusConsulta): boolean {
    const lista = this.listar();
    const idx = lista.findIndex(c => c.id === id);
    if (idx === -1) return false;
    lista[idx].status = status;
    localStorage.setItem(this.KEY, JSON.stringify(lista));
    return true;
  }

  excluir(id: string): boolean {
    let lista = this.listar();
    const antes = lista.length;
    lista = lista.filter(c => c.id !== id);
    localStorage.setItem(this.KEY, JSON.stringify(lista));
    return lista.length < antes;
  }

  // Retorna consultas de hoje
  hoje(usuarioId: string, tipo: 'paciente' | 'medico'): ConsultaModel[] {
    const hoje = new Date().toISOString().split('T')[0];
    const lista = tipo === 'paciente'
      ? this.listarPorPaciente(usuarioId)
      : this.listarPorMedico(usuarioId);
    return lista.filter(c => c.data === hoje && c.status !== 'cancelada');
  }

  // Retorna próximas (futuras)
  proximas(usuarioId: string, tipo: 'paciente' | 'medico'): ConsultaModel[] {
    const hoje = new Date().toISOString().split('T')[0];
    const lista = tipo === 'paciente'
      ? this.listarPorPaciente(usuarioId)
      : this.listarPorMedico(usuarioId);
    return lista.filter(c => c.data > hoje && c.status === 'agendada');
  }

  // Retorna histórico (passadas ou canceladas)
  historico(usuarioId: string, tipo: 'paciente' | 'medico'): ConsultaModel[] {
    const hoje = new Date().toISOString().split('T')[0];
    const lista = tipo === 'paciente'
      ? this.listarPorPaciente(usuarioId)
      : this.listarPorMedico(usuarioId);
    return lista.filter(c => c.data < hoje || c.status === 'cancelada' || c.status === 'realizada');
  }
}