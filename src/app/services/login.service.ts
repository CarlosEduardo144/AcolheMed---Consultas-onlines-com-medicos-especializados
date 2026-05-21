import { Injectable } from '@angular/core';
import { UsuarioModel } from '../model/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  usuarioLogado!: UsuarioModel;

  setUsuario(usuario: UsuarioModel) {
    this.usuarioLogado = usuario;
    localStorage.setItem('usuario', JSON.stringify(usuario));
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
    return this.usuarioLogado !== null;
  }

  logout(){
    this.usuarioLogado = null!;
    localStorage.removeItem('usuario');
  }
}
