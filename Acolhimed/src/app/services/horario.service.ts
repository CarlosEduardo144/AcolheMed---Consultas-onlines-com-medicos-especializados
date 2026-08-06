import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HorarioModel } from '../model/horario.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  buscarPorMedico(medicoId: string): Observable<HorarioModel[]> {
    return this.http.get<HorarioModel[]>(`${this.API_URL}/horarios/${medicoId}`);
  }

  salvar(horarios: {medicoId: string, horarios: HorarioModel[]}): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/horarios`, horarios);
  }
}
