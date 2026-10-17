import { Injectable } from '@angular/core';
import { EspecialidadeModel } from '../model/especialidade.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenService } from './token-service';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadeService {

  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  buscarPorId(id: string): Observable<EspecialidadeModel> {
    return this.http.get<EspecialidadeModel>(`${this.API_URL}/especialidades/${id}`, {headers: this.tokenService.gerarCabecalhoAutenticacao()});
  }

  listar(): Observable<EspecialidadeModel[]> {
    return this.http.get<EspecialidadeModel[]>(`${this.API_URL}/especialidades`, {headers: this.tokenService.gerarCabecalhoAutenticacao()});
  }

  salvar(credenciais:{idsSelecionados: string[], medicoId: string}) {
    return this.http.put<EspecialidadeModel[]>(`${this.API_URL}/minhas-especialidades`, credenciais, {headers: this.tokenService.gerarCabecalhoAutenticacao()});
  }

  getMedicoEspecialidades(medicoId: string) {
    return this.http.get<EspecialidadeModel[]>(`${this.API_URL}/minhas-especialidades`, {headers: this.tokenService.gerarCabecalhoAutenticacao()});
  }

}
