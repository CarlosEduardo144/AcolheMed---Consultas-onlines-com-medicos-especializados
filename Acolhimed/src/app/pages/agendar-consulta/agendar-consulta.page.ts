import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HorarioModel } from 'src/app/model/horario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { HorarioService } from 'src/app/services/horario.service';
import { ToastController } from '@ionic/angular';

interface DiaCalendario {
  data: Date;
  numero: number;
  desabilitado: boolean;      // fora do mês, no passado, ou sem disponibilidade
  temDisponibilidade: boolean;
  mesAtual: boolean;           // pertence ao mês exibido (vs. dias de padding)
}

const MAPA_DIA_SEMANA: Record<number, string> = {
  0: 'domingo',
  1: 'segunda',
  2: 'terca',
  3: 'quarta',
  4: 'quinta',
  5: 'sexta',
  6: 'sabado',
};

const PERIODOS = { //configuracao dos limites de cada turno
  manha: { inicio: 8, fim: 11 },
  tarde: { inicio: 13, fim: 17 },
  noite: { inicio: 18, fim: 20 },
};

const DURACAO_CONSULTA_MINUTOS = 30; //duração de cada consulta
const JANELA_MAXIMA_MESES = 1; // permite navegar até o próximo mês, além do atual


@Component({
  selector: 'app-agendar-cosulta',
  templateUrl: './agendar-consulta.page.html',
  styleUrls: ['./agendar-consulta.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})

export class AgendarCosultaPage implements OnInit {

  medico!: any;
  horariosSemana: HorarioModel[] = [];

  mesExibido!: Date;
  diasCalendario: DiaCalendario[] = [];
  diaSelecionado: DiaCalendario | null = null;
  horarioSelecionado: string | null = null;
  horariosDoDia: string[] = [];
  observacoes = '';

  private hoje = new Date();
  private limiteMinimo!: Date;
  private limiteMaximo!: Date;

  constructor(private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private horarioService: HorarioService,
    private toastController: ToastController
  ) {
  }

  ngOnInit() {
    this.carregarMedico();
    this.hoje.setHours(0, 0, 0, 0);
    this.limiteMinimo = new Date(this.hoje.getFullYear(), this.hoje.getMonth(), 1);
    this.limiteMaximo = new Date(this.hoje.getFullYear(), this.hoje.getMonth() + JANELA_MAXIMA_MESES, 1);
    this.mesExibido = new Date(this.hoje.getFullYear(), this.hoje.getMonth(), 1);
  }


  carregarMedico() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usuarioService.buscarPorId(id).subscribe({
        next: (medico) => {
          this.medico = medico;
          this.carregarHorarios(this.medico.id);
        },
        error: (err) => console.error('Erro ao carregar médico', err)
      });
    }
  }

  carregarHorarios(medicoId: string) {
    this.horarioService.buscarPorMedico(medicoId).subscribe({
      next: (horarios) => {
        this.horariosSemana = horarios;
        this.gerarCalendario();

      },
      error: (erro) => {
        console.error(erro);
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  get nomeMesAno(): string {
    return this.mesExibido.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  }

  get podeVoltarMes(): boolean {
    return this.mesExibido.getTime() > this.limiteMinimo.getTime();
  }

  get podeAvancarMes(): boolean {
    return this.mesExibido.getTime() < this.limiteMaximo.getTime();
  }

  mesAnterior() {
    if (!this.podeVoltarMes) return;
    this.mesExibido = new Date(this.mesExibido.getFullYear(), this.mesExibido.getMonth() - 1, 1);
    this.gerarCalendario();
  }

  proximoMes() {
    if (!this.podeAvancarMes) return;
    this.mesExibido = new Date(this.mesExibido.getFullYear(), this.mesExibido.getMonth() + 1, 1);
    this.gerarCalendario();
  }

  private gerarCalendario() {
    const ano = this.mesExibido.getFullYear();
    const mes = this.mesExibido.getMonth();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

    const dias: DiaCalendario[] = [];

    // padding do início (dias vazios antes do dia 1)
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push({ data: new Date(ano, mes, 1 - (primeiroDiaSemana - i)), numero: 0, desabilitado: true, temDisponibilidade: false, mesAtual: false });
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const data = new Date(ano, mes, dia);
      const noPassado = data.getTime() < this.hoje.getTime();
      const temDisp = !noPassado && this.diaTemDisponibilidade(data);

      dias.push({
        data,
        numero: dia,
        desabilitado: noPassado || !temDisp,
        temDisponibilidade: temDisp,
        mesAtual: true,
      });
    }

    this.diasCalendario = dias;
    this.diaSelecionado = null;
    this.horarioSelecionado = null;
    this.horariosDoDia = [];
  }

  private diaTemDisponibilidade(data: Date): boolean {
    const chaveDia = MAPA_DIA_SEMANA[data.getDay()];
    const config = this.horariosSemana.find(h => h.dia === chaveDia);
    if (!config) return false;
    return !!(config.manha || config.tarde || config.noite);
  }

  selecionarDia(dia: DiaCalendario) {
    if (dia.desabilitado || !dia.mesAtual) return;
    this.diaSelecionado = dia;
    this.horarioSelecionado = null;
    this.horariosDoDia = this.gerarHorariosDoDia(dia.data);
  }

  private gerarHorariosDoDia(data: Date): string[] {
    const chaveDia = MAPA_DIA_SEMANA[data.getDay()];
    const config = this.horariosSemana.find(h => h.dia === chaveDia);
    if (!config) return [];

    const horarios: string[] = [];
    const ehHoje = data.getTime() === this.hoje.getTime();
    const agora = new Date();

    (['manha', 'tarde', 'noite'] as const).forEach(periodo => {
      if (!config[periodo]) return;

      const { inicio, fim } = PERIODOS[periodo];
      let horaAtual = new Date(data);
      horaAtual.setHours(inicio, 0, 0, 0);
      const horaLimite = new Date(data);
      horaLimite.setHours(fim, 0, 0, 0);

      while (horaAtual < horaLimite) {
        if (!ehHoje || horaAtual > agora) {
          const hh = horaAtual.getHours().toString().padStart(2, '0');
          const mm = horaAtual.getMinutes().toString().padStart(2, '0');
          horarios.push(`${hh}:${mm}`);
        }
        horaAtual = new Date(horaAtual.getTime() + DURACAO_CONSULTA_MINUTOS * 60000);
      }
    });

    return horarios;
  }

  selecionarHorario(horario: string) {
    this.horarioSelecionado = horario;
  }

  get podeConfirmar(): boolean {
    return !!this.diaSelecionado && !!this.horarioSelecionado;
  }

  /*
  mediaAvaliacoes(): number {
    if (!this.medico?.avaliacoes?.length) return 0;
    const soma = this.medico.avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    return soma / this.medico.avaliacoes.length;
  }

  mediaFormatada(): string {
    return this.mediaAvaliacoes().toFixed(1).replace('.', ',');
  }

  totalAvaliacoes(): number {
    return this.medico?.avaliacoes?.length ?? 0;
  }*/

  confirmarAgendamento() {
    /*
    if (!this.podeConfirmar) return;

    const payload = {
      medicoId: this.medico.id,
      data: this.diaSelecionado!.data,
      horario: this.horarioSelecionado,
      observacoes: this.observacoes,
    };

    //envio pro serviço/API já existente
    */
  }

  iniciais(nome?: string): string {
    if (!nome) return '';
    return nome.trim().slice(0, 2).toUpperCase();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500,
    });
    toast.present();
  }
}
