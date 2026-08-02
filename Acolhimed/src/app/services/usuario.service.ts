import { Injectable } from '@angular/core';
import { UsuarioModel } from '../model/usuario.model';
import { MedicoModel } from '../model/medico.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PacienteModel } from '../model/paciente.model';


@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private readonly API_URL = "http://localhost:8080";

  constructor(private http: HttpClient) { }

  salvar(usuario: PacienteModel | MedicoModel): Observable<PacienteModel | MedicoModel> {
    if (usuario.id) {
      if (usuario.tipoUsuario == "medico") {
        return this.http.put<MedicoModel>(`${this.API_URL}/medicos/${usuario.id}`, usuario);
      } else {
        return this.http.put<PacienteModel>(`${this.API_URL}/pacientes/${usuario.id}`, usuario);
      }
    } else {
      if (usuario.tipoUsuario == "medico") {
        return this.http.post<MedicoModel>(`${this.API_URL}/medicos`, usuario);
      }
      return this.http.post<PacienteModel>(`${this.API_URL}/pacientes`, usuario);
    }


  }

  getMedicos(){
    return this.http.get<MedicoModel[]>(`${this.API_URL}/medicos`);
  }

  getMedicosPorEspecialidade(especialidadeId: string): Observable<MedicoModel[]> {
    return this.getMedicos().pipe(
      map(medicos => medicos.filter(medico =>
        medico.especialidades?.some(especialidade => especialidade.id === especialidadeId)
      ))
    );
  }

  buscarPorId(id: string): Observable<PacienteModel | MedicoModel> {
    return this.http.get<PacienteModel | MedicoModel>(`${this.API_URL}/usuarios/${id}`);
  }

  login(credenciais: { email: string, senha: string }): Observable<PacienteModel | MedicoModel> {
    return this.http.post<PacienteModel | MedicoModel>(`${this.API_URL}/usuarios/login`, credenciais);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/usuarios/${id}`);
  }


}
