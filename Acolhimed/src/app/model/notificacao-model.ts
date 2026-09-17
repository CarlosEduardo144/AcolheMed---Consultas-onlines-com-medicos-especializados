export type TipoNotificacao = 'lembrete' | 'cancelada' | 'receita';

export class NotificacaoModel {
    id: string;
    tipo: TipoNotificacao;
    titulo: string;
    mensagem: string;
    dataHora: Date;
    lida: boolean;

    constructor(){
        this.id = "";
        this.tipo = "lembrete";
        this.titulo = "";
        this.mensagem = "";
        this.dataHora = new Date();
        this.lida = false;
    }
}
