export class UsuarioModel {
    id: string;
    nome: string;
    email: string;
    senha: string;
    telefone: number;
    dataNascimento: Date;
    cpf: string;
    tipoUsuario: string;
    foto: string;

    constructor(){
        this.id = "";
        this.cpf = "";
        this.dataNascimento = new Date();
        this.email = "";
        this.senha = "";
        this.nome = "";
        this.tipoUsuario = "";
        this.telefone = 0;
        this.foto = "";
    }
}
