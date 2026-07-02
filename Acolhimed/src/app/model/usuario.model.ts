export class UsuarioModel {
    id: string;
    nome: string;
    email: string;
    senha: string;
    dataNascimento: string;
    cpf: string;
    tipoUsuario: string;
    foto: string;

    constructor(){
        this.id = "";
        this.cpf = "";
        this.dataNascimento = "";
        this.email = "";
        this.senha = "";
        this.nome = "";
        this.tipoUsuario = "";
        this.foto = "";
    }
}
