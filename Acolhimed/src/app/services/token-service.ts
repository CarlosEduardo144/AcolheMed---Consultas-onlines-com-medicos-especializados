import { Injectable } from '@angular/core';
import { TokenModel } from '../model/token-model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly AUTORIZACAO_USUARIO = 'Authorization';

  salvar(token: string): void {
    localStorage.setItem(this.AUTORIZACAO_USUARIO, token);
  }

  excluir(): void {
    localStorage.removeItem(this.AUTORIZACAO_USUARIO);
  }

  gerarCabecalhoAutenticacao(): HttpHeaders {
    const token = localStorage.getItem(this.AUTORIZACAO_USUARIO);

    console.log('Token existe:', !!token);
    
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  extrair(): TokenModel {
  const tokenModel = new TokenModel();
  const token = localStorage.getItem(this.AUTORIZACAO_USUARIO);

  if (!token) {
    return tokenModel;
  }

  try {
    const tokenBase64 = token.split('.')[1];
    const tokenJson = atob(tokenBase64);
    const payload = JSON.parse(tokenJson);

    tokenModel.id = payload.sub;
    tokenModel.tipoUsuario = payload.tipoUsuario;
  } catch (error) {
    console.error('Erro ao extrair token JWT', error);
  }

  return tokenModel;
}
}
