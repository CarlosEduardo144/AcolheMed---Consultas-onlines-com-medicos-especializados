import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HorarioModel } from '../model/horario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private readonly API_URL = "http://localhost:8080";

  constructor(private http: HttpClient) { }

  buscarPorMedico(medicoId: string): Observable<HorarioModel[]> {
    return this.http.get<HorarioModel[]>(`${this.API_URL}/horarios/${medicoId}`);
  }

  salvar(horarios: {medicoId: string, horarios: HorarioModel[]}): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/horarios`, horarios);
  }
}
