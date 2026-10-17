import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ConsultaResponseModel } from '../model/consulta-response';
import { TokenService } from './token-service';

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  salvar(consulta: {
    dataHora: Date;
    medicoId: string;
    pacienteId: string;
    observacoes: string;
    especialidadeId: string;
  }): Observable<ConsultaResponseModel> {
    return this.http.post<ConsultaResponseModel>(`${this.API_URL}/consultas`, this.montarPayload(consulta), { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  getConsultas(usuarioId: string): Observable<ConsultaResponseModel[]> {
    return this.http.get<ConsultaResponseModel[]>(`${this.API_URL}/consultas/usuario`, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  getAgendaDoMedico(usuarioId: string): Observable<ConsultaResponseModel[]> {
    return this.http.get<ConsultaResponseModel[]>(`${this.API_URL}/consultas/medico/agenda`, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  buscarPorId(consultaID: string): Observable<ConsultaResponseModel> {
    return this.http.get<ConsultaResponseModel>(`${this.API_URL}/consultas/${consultaID}`, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  cancelar(consultaId: string, motivoCancelamento: string): Observable<ConsultaResponseModel> {
    return this.http.patch<ConsultaResponseModel>(`${this.API_URL}/consultas/cancelar/${consultaId}`, motivoCancelamento, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  definirConsultaEmAndamento(consultaId: string): Observable<ConsultaResponseModel> {
    return this.http.patch<ConsultaResponseModel>(`${this.API_URL}/consultas/em_andamento/${consultaId}`, {}, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  buscarConsultasEmAndamento(usuarioId: string): Observable<ConsultaResponseModel> {
    return this.http.get<ConsultaResponseModel>(`${this.API_URL}/consultas/em_andamento`, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  private montarPayload(consulta: {
  dataHora: Date;
  medicoId: string;
  pacienteId: string;
  observacoes: string;
  especialidadeId: string;
}) {
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
