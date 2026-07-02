import { Injectable } from '@angular/core';
import { UsuarioModel } from '../model/usuario.model';
import { MedicoModel } from '../model/medico.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

type MedicoLegado = MedicoModel & Partial<UsuarioModel> & { id?: string };
type MedicoPayload = Pick<MedicoModel,
  'usuario' | 'crm' | 'ufEmissao' | 'especialidades' |
  'horariosConfigurados' | 'sobreMim' | 'formacaoAcademica'
>;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private readonly API_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getMedicos(): Observable<MedicoModel[]> {
    return this.http.get<MedicoModel[]>(`${this.API_URL}/medicos`).pipe(
      map((medicos) => medicos.map((medico) => this.normalizarMedico(medico)))
    );
  }

  buscarMedicoPorId(id: string): Observable<MedicoModel> {
    return this.http.get<MedicoModel>(`${this.API_URL}/medicos/${id}`).pipe(
      map((medico) => this.normalizarMedico(medico))
    );
  }

  salvar(usuario: UsuarioModel | MedicoModel): Observable<UsuarioModel | MedicoModel> {
    const usuarioNormalizado = this.normalizarUsuarioLogado(usuario);
    const usuarioBase = this.getUsuarioBase(usuarioNormalizado);

    if (usuarioBase.id) {
      if (this.isMedico(usuarioNormalizado)) {
        return this.http.put<MedicoModel>(`${this.API_URL}/medicos/${usuarioBase.id}`, this.toMedicoPayload(usuarioNormalizado as MedicoModel)).pipe(
          map((medico) => this.normalizarMedico(medico))
        );
      }
      return this.http.put<UsuarioModel>(`${this.API_URL}/usuarios/${usuarioBase.id}`, usuarioBase);
    } else {
      if (this.isMedico(usuarioNormalizado)) {
        return this.http.post<MedicoModel>(`${this.API_URL}/medicos`, this.toMedicoPayload(usuarioNormalizado as MedicoModel)).pipe(
          map((medico) => this.normalizarMedico(medico))
        );
      }
      return this.http.post<UsuarioModel>(`${this.API_URL}/usuarios`, usuarioNormalizado);
    }

  }

  listar(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(`${this.API_URL}/usuarios`);
  }

  buscarPorId(id: string): Observable<UsuarioModel> {
    return this.http.get<UsuarioModel>(`${this.API_URL}/usuarios/${id}`);
  }

  login(credenciais: { email: string, senha: string }): Observable<UsuarioModel | MedicoModel> {
    return this.http.post<UsuarioModel | MedicoModel>(`${this.API_URL}/usuarios/login`, credenciais).pipe(
      map((usuario) => this.normalizarUsuarioLogado(usuario))
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/usuarios/${id}`);
  }

  normalizarUsuarioLogado(usuario: UsuarioModel | MedicoModel): UsuarioModel | MedicoModel {
    return this.isMedico(usuario) ? this.normalizarMedico(usuario as MedicoModel) : usuario;
  }

  normalizarMedico(medico: MedicoModel): MedicoModel {
    const legado = medico as MedicoLegado;
    const usuario = { ...(medico.usuario ?? new UsuarioModel()) } as UsuarioModel;
    const id = medico.usuario.id || legado.id || usuario.id || '';
    usuario.id = usuario.id || id;
    usuario.nome = usuario.nome || legado.nome || '';
    usuario.email = usuario.email || legado.email || '';
    usuario.senha = usuario.senha || legado.senha || '';
    usuario.dataNascimento = usuario.dataNascimento || legado.dataNascimento || "";
    usuario.cpf = usuario.cpf || legado.cpf || '';
    usuario.tipoUsuario = usuario.tipoUsuario || legado.tipoUsuario || 'medico';
    usuario.foto = usuario.foto || legado.foto || '';

    return {
      ...medico,
      id,
      usuario,
      especialidades: medico.especialidades ?? [],
      horario: medico.horario ?? [],
      horariosConfigurados: medico.horariosConfigurados ?? false,
    } as MedicoModel;
  }

  getUsuarioBase(usuario: UsuarioModel | MedicoModel): UsuarioModel {
    return this.isMedico(usuario) ? (usuario as MedicoModel).usuario : usuario as UsuarioModel;
  }

  isMedico(usuario: UsuarioModel | MedicoModel): boolean {
    const medico = usuario as MedicoModel;
    return ('tipoUsuario' in usuario && usuario.tipoUsuario === 'medico') || medico.usuario?.tipoUsuario === 'medico';
  }

  private toMedicoPayload(medico: MedicoModel): MedicoPayload {
    const medicoNormalizado = this.normalizarMedico(medico);
    const usuario = medicoNormalizado.usuario ?? new UsuarioModel();

    return {
      id: medicoNormalizado.usuario.id || usuario.id,
      usuario: {
        ...usuario,
        id: usuario.id || medicoNormalizado.usuario.id,
        tipoUsuario: usuario.tipoUsuario || 'medico',
      },
      crm: medicoNormalizado.crm,
      ufEmissao: medicoNormalizado.ufEmissao,
      especialidades: medicoNormalizado.especialidades ?? [],
      horariosConfigurados: medicoNormalizado.horariosConfigurados ?? false,
      sobreMim: medicoNormalizado.sobreMim,
      formacaoAcademica: medicoNormalizado.formacaoAcademica,
    };
  }

}
