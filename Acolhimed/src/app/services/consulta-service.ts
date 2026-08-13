import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConsultaModel } from '../model/consulta.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  salvar(consulta: ConsultaModel): Observable<ConsultaModel> {
    return this.http.post<ConsultaModel>(`${this.API_URL}/consultas`, consulta);
  }

  getConsultas(usuarioId: string): Observable<ConsultaModel[]> {
    return this.http.get<ConsultaModel[]>(`${this.API_URL}/consultas/${usuarioId}`);
  }
}
