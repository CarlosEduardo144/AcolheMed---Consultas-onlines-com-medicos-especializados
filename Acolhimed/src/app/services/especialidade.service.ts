import { Injectable } from '@angular/core';
import { EspecialidadeModel } from '../model/especialidade.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadeService {

  private readonly API_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  buscarPorId(id: string): Observable<EspecialidadeModel> {
    return this.http.get<EspecialidadeModel>(`${this.API_URL}/especialidades/${id}`);
  }

  listar(): Observable<EspecialidadeModel[]> {
    return this.http.get<EspecialidadeModel[]>(`${this.API_URL}/especialidades`);
  }

}
