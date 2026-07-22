export class HorarioModel {
    id: string;
    dia: string;
    manha: boolean;
    tarde: boolean;
    noite: boolean;
    expandido: boolean;

    constructor(){
        this.id = "";
        this.dia = "";
        this.manha = false;
        this.tarde = false;
        this.noite = false;
        this.expandido = false;
    }
}
