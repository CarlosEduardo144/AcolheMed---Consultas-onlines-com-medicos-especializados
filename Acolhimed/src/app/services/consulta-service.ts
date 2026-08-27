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
    return this.http.post<ConsultaResponseModel>(`${this.API_URL}/consultas`, this.montarPayload(consulta));
  }

  getConsultas(usuarioId: string): Observable<ConsultaResponseModel[]> {
    return this.http.get<ConsultaResponseModel[]>(`${this.API_URL}/consultas/usuario/${usuarioId}`);
  }

  buscarPorId(consultaID: string): Observable<ConsultaResponseModel> {
    return this.http.get<ConsultaResponseModel>(`${this.API_URL}/consultas/${consultaID}`);
  }

  remarcar(consulta: ConsultaModel): Observable<ConsultaResponseModel> {
    return this.http.put<ConsultaResponseModel>(`${this.API_URL}/consultas/remarcar/${consulta.id}`, this.montarPayload(consulta));
  }

  cancelar(consulta: ConsultaResponseModel): Observable<ConsultaResponseModel> {
    return this.http.patch<ConsultaResponseModel>(`${this.API_URL}/consultas/cancelar/${consulta.id}`, consulta);
  }

  private montarPayload(consulta: ConsultaModel) {
    return {
      ...consulta,
      dataHora: this.formatarDataHoraLocal(consulta.dataHora),
    };
  }

  private formatarDataHoraLocal(dataHora: Date): string {
    const ano = dataHora.getFullYear();
    const mes = this.formatarNumero(dataHora.getMonth() + 1);
    const dia = this.formatarNumero(dataHora.getDate());
    const hora = this.formatarNumero(dataHora.getHours());
    const minuto = this.formatarNumero(dataHora.getMinutes());
    const segundo = this.formatarNumero(dataHora.getSeconds());

    return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}`;
  }

  private formatarNumero(valor: number): string {
    return valor.toString().padStart(2, '0');
  }
}
