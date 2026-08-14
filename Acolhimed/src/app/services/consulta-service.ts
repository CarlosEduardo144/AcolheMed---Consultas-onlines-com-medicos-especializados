import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConsultaModel } from '../model/consulta.model';
import { Observable } from 'rxjs';
import { ConsultaResponseModel } from '../model/consulta-response';

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  salvar(consulta: ConsultaModel): Observable<ConsultaResponseModel> {
    return this.http.post<ConsultaResponseModel>(`${this.API_URL}/consultas`, consulta);
  }

  getConsultas(usuarioId: string): Observable<ConsultaResponseModel[]> {
    return this.http.get<ConsultaResponseModel[]>(`${this.API_URL}/consultas/${usuarioId}`);
  }

  remarcar(consulta: ConsultaModel): Observable<ConsultaResponseModel> {
    return this.http.put<ConsultaResponseModel>(`${this.API_URL}/consultas/${consulta.id}/remarcar`, consulta);
  }

  cancelar(consulta: ConsultaResponseModel): Observable<ConsultaResponseModel> {
    return this.http.put<ConsultaResponseModel>(`${this.API_URL}/consultas/${consulta.id}/cancelar`, consulta);
  }
}
