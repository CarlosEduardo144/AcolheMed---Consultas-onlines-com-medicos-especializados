import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AvaliacaoModel } from '../model/avaliacao-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  salvar(avaliacao: AvaliacaoModel): Observable<AvaliacaoModel> {
    return this.http.post<AvaliacaoModel>(`${this.API_URL}/avaliacoes`, avaliacao);
  }

  excluir(avaliacaoID: String): Observable<AvaliacaoModel> {
    return this.http.delete<AvaliacaoModel>(`${this.API_URL}/avaliacoes/${avaliacaoID}`);
  }

  getAvaliacoesMedicos(medicoId: String): Observable<AvaliacaoModel[]> {
    return this.http.get<AvaliacaoModel[]>(`${this.API_URL}/avaliacoes/${medicoId}`);
  }
}
