import { Injectable } from '@angular/core';
import { UsuarioModel } from '../model/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private usuarioLogado: UsuarioModel | null = null;

  setUsuario(usuario: UsuarioModel) {
    this.usuarioLogado = usuario;
    const { senha, ...usuarioSemSenha } = usuario as any;
    localStorage.setItem('usuario', JSON.stringify(usuarioSemSenha));
  }

  getUsuario() {
    if (!this.usuarioLogado) {
      const data = localStorage.getItem('usuario');
      if (data) {
        this.usuarioLogado = JSON.parse(data);
      }
    }
    return this.usuarioLogado;
  }

  isLogado(): boolean {
    return !!this.getUsuario();
  }

  logout(){
    this.usuarioLogado = null;
    localStorage.removeItem('usuario');
  }
}
