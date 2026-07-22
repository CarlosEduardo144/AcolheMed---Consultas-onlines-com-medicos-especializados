import { EspecialidadeModel } from "./especialidade.model";
import { HorarioModel } from "./horario.model";
import { UsuarioModel } from "./usuario.model";

export class MedicoModel extends UsuarioModel{
  especialidades: EspecialidadeModel[];
  formacaoAcademica: string;
  sobreMim: string;
  crm: string;
  ufEmissao: string;
  horariosConfigurados: boolean;

  constructor() {
    super();
    this.especialidades = [];
    this.formacaoAcademica = "";
    this.crm = "";
    this.ufEmissao = "";
    this.sobreMim = "";
    this.horariosConfigurados = false;
  }
}   
