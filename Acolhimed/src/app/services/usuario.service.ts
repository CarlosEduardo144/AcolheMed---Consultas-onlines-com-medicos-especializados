import { Injectable } from '@angular/core';
import { UsuarioModel } from '../model/usuario.model';
import { MedicoModel } from '../model/medico.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PacienteModel } from '../model/paciente.model';
import { TokenService } from './token-service';


@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  salvar(usuario: PacienteModel | MedicoModel): Observable<PacienteModel | MedicoModel> {
    if (usuario.id) {
      if (usuario.tipoUsuario == "medico") {
        return this.http.put<MedicoModel>(`${this.API_URL}/medicos`, usuario, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
      } else {
        return this.http.put<PacienteModel>(`${this.API_URL}/pacientes`, usuario, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
      }
    } else {
      if (usuario.tipoUsuario == "medico") {
        return this.http.post<MedicoModel>(`${this.API_URL}/medicos`, usuario, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
      }
      return this.http.post<PacienteModel>(`${this.API_URL}/pacientes`, usuario, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
    }


  }

  getMedicos() {
    return this.http.get<MedicoModel[]>(`${this.API_URL}/medicos`, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  getMedicosPorEspecialidade(especialidadeId: string): Observable<MedicoModel[]> {
    return this.getMedicos().pipe(
      map(medicos => medicos.filter(medico =>
        medico.especialidades?.some(especialidade => especialidade.id === especialidadeId)
      ))
    );
  }

  getMedicosMaisBemAvaliados() {
    return this.http.get<MedicoModel[]>(`${this.API_URL}/medicos/destaques`, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  buscarPorId(id: string): Observable<PacienteModel | MedicoModel> {
    return this.http.get<PacienteModel | MedicoModel>(`${this.API_URL}/usuarios/${id}`, { headers: this.tokenService.gerarCabecalhoAutenticacao() });
  }

  uploadFoto(idUsuario: string, arquivo: File): Observable<{ imagemUrl: string; publicId: string; idUsuario: string }> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    return this.http.post<{ imagemUrl: string; publicId: string; idUsuario: string }>(
      `${this.API_URL}/fotos`, formData, { headers: this.tokenService.gerarCabecalhoAutenticacao() }
    );
  }

  login(credenciais: { email: string; senha: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.API_URL}/usuarios/login`, credenciais);
  }

}
