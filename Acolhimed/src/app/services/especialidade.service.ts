import { Injectable } from '@angular/core';
import { EspecialidadeModel } from '../model/especialidade.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadeService {

  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  buscarPorId(id: string): Observable<EspecialidadeModel> {
    return this.http.get<EspecialidadeModel>(`${this.API_URL}/especialidades/${id}`);
  }

  listar(): Observable<EspecialidadeModel[]> {
    return this.http.get<EspecialidadeModel[]>(`${this.API_URL}/especialidades`);
  }

  //Salvar especialidades do medico
  salvar(credenciais:{idsSelecionados: string[], medicoId: string}) {
    return this.http.put<EspecialidadeModel[]>(`${this.API_URL}/minhas-especialidades`, credenciais);
  }

  //Get especialidades do medico
  getMedicoEspecialidades(medicoId: string) {
    return this.http.get<EspecialidadeModel[]>(`${this.API_URL}/minhas-especialidades/${medicoId}`);
  }

}
