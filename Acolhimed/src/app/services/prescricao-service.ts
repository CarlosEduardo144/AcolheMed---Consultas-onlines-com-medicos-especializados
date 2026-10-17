import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PrescricaoModel } from '../model/prescricao-model';
import { Observable } from 'rxjs';
import { TokenService } from './token-service';

@Injectable({
  providedIn: 'root',
})
export class PrescricaoService {
  [x: string]: any;
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  salvar(prescricao: PrescricaoModel): Observable<PrescricaoModel> {
    return this.http.post<PrescricaoModel>(`${this.API_URL}/prescricao`, prescricao, {headers: this.tokenService.gerarCabecalhoAutenticacao()});
  }

  validarPrescricao(tokenValidacao: string): Observable<PrescricaoModel> {
    return this.http.get<PrescricaoModel>(
      `${this.API_URL}/prescricao/validar/${tokenValidacao}`);
  }

  buscarPrescricaoPorConsulta(consultaId: string): Observable<PrescricaoModel> {
    return this.http.get<PrescricaoModel>(`${this.API_URL}/prescricao/${consultaId}`, {headers: this.tokenService.gerarCabecalhoAutenticacao()});
  }

  buscarPrescricaoPorUsuario(usuarioId: string): Observable<PrescricaoModel> {
    return this.http.get<PrescricaoModel>(`${this.API_URL}/prescricao/usuario`, {headers: this.tokenService.gerarCabecalhoAutenticacao()});
  }

  imprimirPrescricao(prescricaoId: string): Observable<Blob> { 
  return this.http.get(`${this.API_URL}/prescricao/${prescricaoId}/pdf`, {
    responseType: 'blob', headers: this.tokenService.gerarCabecalhoAutenticacao()});
   }
}
