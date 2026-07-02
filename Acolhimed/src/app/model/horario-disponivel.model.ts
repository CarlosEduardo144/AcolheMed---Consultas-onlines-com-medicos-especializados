export class HorarioDisponivelModel {
    id: string;
    diaSemana: string;
    periodo: string;
    horarioInicio: Date;
    horarioFim: Date;

    constructor(){
        this.id = "";
        this.diaSemana = "";
        this.periodo = "";
        this.horarioInicio = new Date();
        this.horarioFim = new Date();
    }
}
