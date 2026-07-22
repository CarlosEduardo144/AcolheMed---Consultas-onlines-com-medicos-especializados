import { Injectable } from '@angular/core';
import { MedicoModel } from '../model/medico.model';
import { PacienteModel } from '../model/paciente.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private usuario!: string;
  private tipoUsuario!: string;

  constructor() {
    const dadosSalvos = localStorage.getItem('usuario_sessao');
    if (dadosSalvos) {
      const sessao = JSON.parse(dadosSalvos);
      this.usuario = sessao.id;
      this.tipoUsuario = sessao.tipo;
    }
  }

  setUsuario(usuarioId: string, tipoUsuario: string) {
    this.usuario = usuarioId;
    this.tipoUsuario = tipoUsuario;

    const dadosSessao = { id: usuarioId, tipo: tipoUsuario };
    localStorage.setItem('usuario_sessao', JSON.stringify(dadosSessao));
  }

  isLogado(): boolean {
    return !!this.usuario && !!this.tipoUsuario;
  }

  getUsuario() {
    return this.usuario;
  }

  getTipoUsuario() {
    return this.tipoUsuario;
  }

  logout() {
    localStorage.removeItem('usuario_sessao');
    this.usuario = '';
    this.tipoUsuario = '';
  }
}

