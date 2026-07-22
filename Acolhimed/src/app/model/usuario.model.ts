export class UsuarioModel {
    id: string;
    nome: string;
    email: string;
    senha: string;
    dataNascimento: string;
    cpf: string;
    foto: string;
    tipoUsuario: string;

    constructor() {
        this.id = "";
        this.cpf = "";
        this.dataNascimento = "";
        this.email = "";
        this.senha = "";
        this.nome = "";
        this.foto = "";
        this.tipoUsuario = "";
    }
}
