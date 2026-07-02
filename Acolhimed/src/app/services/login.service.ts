import { Injectable } from '@angular/core';
import { UsuarioModel } from '../model/usuario.model';
import { MedicoModel } from '../model/medico.model';

type MedicoLegado = MedicoModel & Partial<UsuarioModel> & { id?: string };

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private usuarioLogado!: UsuarioModel | MedicoModel;

  setUsuario(usuario: UsuarioModel | MedicoModel) {
    this.usuarioLogado = this.normalizarUsuario(usuario);
    const usuarioSemSenha = this.removerSenha(this.usuarioLogado);
    localStorage.setItem('usuario', JSON.stringify(usuarioSemSenha));
  }

  getUsuario(): UsuarioModel | MedicoModel | null {
    if (!this.usuarioLogado) {
      const data = localStorage.getItem('usuario');
      if (data) {
        this.usuarioLogado = this.normalizarUsuario(JSON.parse(data));
      }
    }
    if (this.getTipoUsuario(this.usuarioLogado) === "medico") {
      return this.usuarioLogado as MedicoModel;
    }
    return this.usuarioLogado;
  }

  getMedico(): MedicoModel | null {
    const usuario = this.getUsuario();

    if (!usuario || this.getTipoUsuario(usuario) !== 'medico') {
      return null;
    }

    return usuario as MedicoModel;
  }

  getUsuarioBase(usuario: UsuarioModel | MedicoModel | null = this.getUsuario()): UsuarioModel | null {
    if (!usuario) {
      return null;
    }

    return this.getTipoUsuario(usuario) === 'medico'
      ? ((usuario as MedicoModel).usuario ?? usuario as UsuarioModel)
      : usuario as UsuarioModel;
  }

  getTipoUsuario(usuario: UsuarioModel | MedicoModel | null = this.getUsuario()): string {
    if (!usuario) {
      return '';
    }

    return ('tipoUsuario' in usuario ? usuario.tipoUsuario : '') || (usuario as MedicoModel).usuario?.tipoUsuario || '';
  }

  getUsuarioId(usuario: UsuarioModel | MedicoModel | null = this.getUsuario()): string {
    if (!usuario) {
      return '';
    }

    return ('id' in usuario ? usuario.id : '') || (usuario as MedicoModel).usuario?.id || '';
  }

  getNomeUsuario(usuario: UsuarioModel | MedicoModel | null = this.getUsuario()): string {
    return this.getUsuarioBase(usuario)?.nome ?? '';
  }

  isLogado(): boolean {
    return !!this.getUsuario();
  }

  logout() {
    localStorage.removeItem('usuario');
    this.usuarioLogado = undefined as any;
  }

  private normalizarUsuario(usuario: UsuarioModel | MedicoModel): UsuarioModel | MedicoModel {
    const medico = usuario as MedicoModel;
    const usuarioBase = medico.usuario;

    const tipoUsuario = ('tipoUsuario' in usuario ? usuario.tipoUsuario : '') || usuarioBase?.tipoUsuario;
    if (tipoUsuario !== 'medico') {
      return usuario;
    }

    const legado = usuario as MedicoLegado;
    const usuarioNormalizado = { ...(usuarioBase ?? new UsuarioModel()) } as UsuarioModel;
    const id = medico.id || legado.id || usuarioNormalizado.id || '';
    usuarioNormalizado.id = usuarioNormalizado.id || id;
    usuarioNormalizado.nome = usuarioNormalizado.nome || legado.nome || '';
    usuarioNormalizado.email = usuarioNormalizado.email || legado.email || '';
    usuarioNormalizado.senha = usuarioNormalizado.senha || legado.senha || '';
    usuarioNormalizado.dataNascimento = usuarioNormalizado.dataNascimento || legado.dataNascimento || new Date();
    usuarioNormalizado.cpf = usuarioNormalizado.cpf || legado.cpf || '';
    usuarioNormalizado.tipoUsuario = usuarioNormalizado.tipoUsuario || legado.tipoUsuario || 'medico';
    usuarioNormalizado.foto = usuarioNormalizado.foto || legado.foto || '';

    return {
      ...medico,
      id,
      usuario: usuarioNormalizado,
      especialidades: medico.especialidades ?? [],
      horario: medico.horario ?? [],
      horariosConfigurados: medico.horariosConfigurados ?? false,
    } as MedicoModel;
  }

  private removerSenha(usuario: UsuarioModel | MedicoModel): UsuarioModel | MedicoModel {
    const usuarioSemSenha = { ...(usuario as any) };
    delete usuarioSemSenha.senha;

    if (usuarioSemSenha.usuario) {
      usuarioSemSenha.usuario = { ...usuarioSemSenha.usuario };
      delete usuarioSemSenha.usuario.senha;
    }

    return usuarioSemSenha;
  }
}
