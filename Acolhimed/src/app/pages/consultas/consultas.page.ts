import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

export enum StatusConsulta {
  AGENDADA = 'AGENDADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  REALIZADA = 'REALIZADA',
  CANCELADA = 'CANCELADA',
}

interface ConsultaListItem {
  id: number;
  medicoNome: string;
  medicoIniciais: string;
  medicoFoto?: string;
  especialidade: string;
  dataHora: Date;
  status: StatusConsulta;
  motivoCancelamento?: string;
}

interface GrupoDia {
  label: string;
  consultas: ConsultaListItem[];
}

const JANELA_CANCELAMENTO_HORAS = 24;
const JANELA_CHAMADA_MINUTOS = 15; // botão de ligar ativa X min antes/depois do horário

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent],
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
})
export class ConsultasPage implements OnInit {

  StatusConsulta = StatusConsulta; // exposto pro template

  abaAtiva: 'proximas' | 'historico' = 'proximas';
  textoBusca = '';

  // Placeholder — trocar depois pela chamada real ao serviço de consultas
  todasConsultas: ConsultaListItem[] = [];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.gerarPlaceholders();
  }

  private gerarPlaceholders() {
    const agora = new Date();
    const criarData = (diasOffset: number, hora: number, minuto: number) => {
      const d = new Date(agora);
      d.setDate(d.getDate() + diasOffset);
      d.setHours(hora, minuto, 0, 0);
      return d;
    };

    this.todasConsultas = [
      // ---- Próximas ----
      {
        id: 1,
        medicoNome: 'Victor H. Madeira',
        medicoIniciais: 'VH',
        especialidade: 'Oftalmologista',
        dataHora: criarData(0, agora.getHours(), agora.getMinutes()), // agora mesmo → em andamento
        status: StatusConsulta.EM_ANDAMENTO,
      },
      {
        id: 2,
        medicoNome: 'Victor H. Bahdur',
        medicoIniciais: 'VH',
        especialidade: 'Sexologista',
        dataHora: criarData(1, 2, 50),
        status: StatusConsulta.AGENDADA,
      },
      {
        id: 3,
        medicoNome: 'Dr. Pedro Piu',
        medicoIniciais: 'DP',
        especialidade: 'Cardiologista',
        dataHora: criarData(3, 11, 50),
        status: StatusConsulta.AGENDADA,
      },
      {
        id: 4,
        medicoNome: 'Dra. Camila Souza',
        medicoIniciais: 'DC',
        especialidade: 'Dermatologista',
        dataHora: criarData(5, 14, 0),
        status: StatusConsulta.AGENDADA,
      },

      // ---- Histórico ----
      {
        id: 5,
        medicoNome: 'Dra. Camila Souza',
        medicoIniciais: 'DC',
        especialidade: 'Dermatologista',
        dataHora: criarData(-1, 23, 50),
        status: StatusConsulta.REALIZADA,
      },
      {
        id: 6,
        medicoNome: 'Dr. Ricardo Lima',
        medicoIniciais: 'DR',
        especialidade: 'Ortopedista',
        dataHora: criarData(-2, 23, 50),
        status: StatusConsulta.CANCELADA,
        motivoCancelamento: 'Cancelado pelo paciente',
      },
      {
        id: 7,
        medicoNome: 'Dra. Julia Nunes',
        medicoIniciais: 'DJ',
        especialidade: 'Endocrinologista',
        dataHora: criarData(-8, 23, 50),
        status: StatusConsulta.REALIZADA,
      },
    ];
  }

  // ---- Filtragem por aba + busca ----
  get consultasFiltradas(): ConsultaListItem[] {
    const statusProximas = [StatusConsulta.AGENDADA, StatusConsulta.EM_ANDAMENTO];
    const statusHistorico = [StatusConsulta.REALIZADA, StatusConsulta.CANCELADA];

    const statusPermitidos = this.abaAtiva === 'proximas' ? statusProximas : statusHistorico;
    const termo = this.textoBusca.trim().toLowerCase();

    return this.todasConsultas
      .filter(c => statusPermitidos.includes(c.status))
      .filter(c => !termo || c.medicoNome.toLowerCase().includes(termo))
      .sort((a, b) =>
        this.abaAtiva === 'proximas'
          ? a.dataHora.getTime() - b.dataHora.getTime()
          : b.dataHora.getTime() - a.dataHora.getTime()
      );
  }

  // ---- Agrupamento por dia (estilo extrato) ----
  get gruposPorDia(): GrupoDia[] {
    const grupos = new Map<string, ConsultaListItem[]>();

    for (const consulta of this.consultasFiltradas) {
      const chave = consulta.dataHora.toDateString();
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave)!.push(consulta);
    }

    return Array.from(grupos.entries()).map(([chave, consultas]) => ({
      label: this.formatarLabelDia(consultas[0].dataHora),
      consultas,
    }));
  }

  private formatarLabelDia(data: Date): string {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const dataZerada = new Date(data);
    dataZerada.setHours(0, 0, 0, 0);

    const diaMes = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

    if (dataZerada.getTime() === hoje.getTime()) return `Hoje, ${diaMes}`;
    if (dataZerada.getTime() === ontem.getTime()) return `Ontem, ${diaMes}`;
    if (dataZerada.getTime() === amanha.getTime()) return `Amanhã, ${diaMes}`;
    return diaMes.charAt(0).toUpperCase() + diaMes.slice(1);
  }

  // ---- Regras de negócio ----
  podeCancelar(consulta: ConsultaListItem): boolean {
    if (consulta.status !== StatusConsulta.AGENDADA) return false;
    const horasAteConsulta = (consulta.dataHora.getTime() - Date.now()) / (1000 * 60 * 60);
    return horasAteConsulta >= JANELA_CANCELAMENTO_HORAS;
  }

  podeChamar(consulta: ConsultaListItem): boolean {
    if (consulta.status === StatusConsulta.EM_ANDAMENTO) return true;
    if (consulta.status !== StatusConsulta.AGENDADA) return false;
    const diffMinutos = Math.abs(consulta.dataHora.getTime() - Date.now()) / (1000 * 60);
    return diffMinutos <= JANELA_CHAMADA_MINUTOS;
  }

  horarioFormatado(consulta: ConsultaListItem): string {
    return consulta.dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // ---- Ações ----
  trocarAba(aba: 'proximas' | 'historico') {
    this.abaAtiva = aba;
  }

  abrirDetalhes(consulta: ConsultaListItem) {
    this.navCtrl.navigateForward(['/consulta', consulta.id]);
  }

  abrirChat(consulta: ConsultaListItem, event: Event) {
    event.stopPropagation();
    this.navCtrl.navigateForward(['/chat', consulta.id]);
  }

  iniciarChamada(consulta: ConsultaListItem, event: Event) {
    event.stopPropagation();
    // navegação/ação de chamada de vídeo
  }

  cancelarConsulta(consulta: ConsultaListItem, event: Event) {
    event.stopPropagation();
    // abrir modal/alert de confirmação de cancelamento já existente
  }

  avaliarConsulta(consulta: ConsultaListItem, event: Event) {
    event.stopPropagation();
    this.navCtrl.navigateForward(['/avaliar-consulta', consulta.id]);
  }

  abrirNotificacoes() {
    this.navCtrl.navigateForward('/notificacoes');
  }

  abrirFiltros() {
    this.navCtrl.navigateForward('/filtros-consultas');
  }
}
