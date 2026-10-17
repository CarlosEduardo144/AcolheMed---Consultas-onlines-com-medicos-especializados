import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HorarioModel } from '../model/horario.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenService } from './token-service';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  buscarPorMedico(medicoId: string): Observable<HorarioModel[]> {
    return this.http.get<HorarioModel[]>(`${this.API_URL}/horarios/${medicoId}`, {headers: this.tokenService.gerarCabecalhoAutenticacao()});
  }

  salvar(horarios: {medicoId: string, horarios: HorarioModel[]}): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/horarios`, horarios, {headers: this.tokenService.gerarCabecalhoAutenticacao()});
  }
}

