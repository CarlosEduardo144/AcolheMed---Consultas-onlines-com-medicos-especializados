export class ItemPrescricao {
    id: string;
    medicamento: string;
    dosagem: string;
    frequencia: string;
    duracao: string;
    via: string;
    observacoes: string;

    constructor() {
        this.id = '';
        this.medicamento = '';
        this.dosagem = '';
        this.frequencia = '';
        this.duracao = '';
        this.via = '';
        this.observacoes = '';
    }
}
