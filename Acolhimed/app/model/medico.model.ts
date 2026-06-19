import { EspecialidadeModel } from "./especialidade.model";
import { HorarioDisponivelModel } from "./horario-disponivel.model";
import { UsuarioModel } from "./usuario.model";

export class MedicoModel extends UsuarioModel {
  especialidade: EspecialidadeModel;
  formacaoAcademica: string;
  sobreMim: string;
  crm: number;
  ufEmissao: string;
  horario: HorarioDisponivelModel[];
  horariosConfigurados: boolean;

  constructor(){
    super();
    this.especialidade = new EspecialidadeModel();  
    this.formacaoAcademica = "";
    this.crm = 0;
    this.ufEmissao = "";
    this.sobreMim = "";
    this.horario = [];
    this.horariosConfigurados = false;
  }
}   