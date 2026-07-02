import { EspecialidadeModel } from "./especialidade.model";
import { HorarioDisponivelModel } from "./horario-disponivel.model";
import { UsuarioModel } from "./usuario.model";

export class MedicoModel {

  usuario: UsuarioModel;
  especialidades: EspecialidadeModel[];
  formacaoAcademica: string;
  sobreMim: string;
  crm: string;
  ufEmissao: string;
  horario: HorarioDisponivelModel[];
  horariosConfigurados: boolean;

  constructor(){

    this.usuario = new UsuarioModel();
    this.usuario.tipoUsuario = "medico";
    this.especialidades = [];
    this.formacaoAcademica = "";
    this.crm = "";
    this.ufEmissao = "";
    this.sobreMim = "";
    this.horario = [];
    this.horariosConfigurados = false;
  }
}   
