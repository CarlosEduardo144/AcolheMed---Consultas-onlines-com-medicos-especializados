import { Injectable } from '@angular/core';
import { UsuarioModel } from '../model/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  salvar(usuario: UsuarioModel): UsuarioModel {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    if (usuario.id == "") {
      usuario.id = crypto.randomUUID();
      usuarios.push(usuario);
    } else {
      const posicao = usuarios.findIndex((temp: UsuarioModel) => temp.id === usuario.id);
      if (posicao !== -1) usuarios[posicao] = usuario;
    }

    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    return usuario;
  }

  listar(): UsuarioModel[] {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    return usuarios;
  }

  login(email: string, senha: string) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    return usuarios.find((temp: UsuarioModel) => temp.email == email && temp.senha == senha);

  }

  excluir(id: string): boolean {
  let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
  let indexUsuario = usuarios.findIndex((u: UsuarioModel) => u.id === id);

  if (indexUsuario === -1) {
    return false;
  }

  usuarios.splice(indexUsuario, 1);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  
  return true;
}

}
