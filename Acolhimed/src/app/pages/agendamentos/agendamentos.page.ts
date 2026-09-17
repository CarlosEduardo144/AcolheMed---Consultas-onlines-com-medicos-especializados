import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ConsultaModel } from 'src/app/model/consulta.model';
import { ConsultaService } from 'src/app/services/consulta-service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LoginService } from 'src/app/services/login.service';
import { ToastController } from '@ionic/angular';
import { ConsultaResponseModel } from 'src/app/model/consulta-response';

export enum StatusConsulta {
  agendada = 'agendada',
  em_andamento = 'em_andamento',
  finalizada = 'finalizada',
  cancelada = 'cancelada',
}

interface GrupoDia {
  label: string;
  consultas: ConsultaResponseModel[];
}

const JANELA_CHAMADA_MINUTOS = 15; // botão de ligar ativa X min antes/depois do horário

type FiltroOrdenacaoAgendamento = 'recentes' | 'antigas';
type FiltroStatusAgendamento = 'todas' | StatusConsulta;

@Component({
  selector: 'app-agendamentos',
  templateUrl: './agendamentos.page.html',
  styleUrls: ['./agendamentos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule]
})
export class AgendamentosPage implements OnInit {

  StatusConsulta = StatusConsulta; // exposto pro template
  consultas: ConsultaResponseModel[];
  consultasCarregadas = false;
  usuario: any;

  painelFiltroAberto = false;
  filtroOrdenacao: FiltroOrdenacaoAgendamento = 'recentes';
  filtroStatus: FiltroStatusAgendamento = 'todas';

  consultaSelecionada: ConsultaResponseModel | null = null;
  modoPopup: 'detalhes' | 'cancelar' = 'detalhes';
  motivoCancelamento = '';
  cancelando = false;

  abaAtiva: 'hoje' | 'todas' = 'hoje';
  textoBusca = '';

  constructor(
    private navCtrl: NavController,
    private consultaService: ConsultaService,
    private usuarioService: UsuarioService,
    private loginService: LoginService,
    private toastController: ToastController
  ) {
    this.consultas = [];
  }

  ngOnInit() {
    this.carregarUsuario();
  }

  carregarConsultas() {
    this.consultasCarregadas = false;

    this.consultaService.getConsultas(this.usuario?.id).subscribe({
      next: (consultas) => {
        // dataHora vem como string (ISO) da API — converte pra Date de verdade
        this.consultas = consultas.map(c => ({
          ...c,
          dataHora: new Date(c.dataHora),
        }));
        this.consultasCarregadas = true;
      },
      error: (erro) => {
        console.error('Erro ao carregar médico', erro)
        this.consultasCarregadas = true;
        this.exibirMensagem("Erro ao carregar consultas: " + erro.error.message);
      }
    });
  }

  carregarUsuario() {
    this.usuarioService.buscarPorId(this.loginService.getUsuario()).subscribe({
      next: (usuario) => {
        this.usuario = usuario;

        if (!this.usuario) {
          this.navCtrl.navigateBack('/login');
        }

        this.carregarConsultas();

      },
      error: (erro) => {
        console.error(erro);
        this.consultasCarregadas = true;
        this.exibirMensagem("Erro ao carregar usuário" + erro.error.message);
      }
    });
  }

  // ---- Filtragem por aba + busca ----
  get consultasFiltradas(): ConsultaResponseModel[] {
    const termo = this.textoBusca.trim().toLowerCase();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let lista = this.consultas.filter(c => {
      const dataConsulta = new Date(c.dataHora);
      dataConsulta.setHours(0, 0, 0, 0);
      const ehHoje = dataConsulta.getTime() === hoje.getTime();

      return this.abaAtiva === 'hoje' ? ehHoje : !ehHoje;
    });

    if (termo) {
      lista = lista.filter(c => c.pacienteNome?.toLowerCase().includes(termo));
    }

    // filtros de status/ordenação só valem no histórico
    if (this.abaAtiva === 'todas') {
      if (this.filtroStatus !== 'todas') {
        lista = lista.filter(c => c.status === this.filtroStatus);
      }

      lista.sort((a, b) =>
        this.filtroOrdenacao === 'recentes'
          ? b.dataHora.getTime() - a.dataHora.getTime()
          : a.dataHora.getTime() - b.dataHora.getTime()
      );
    } else {
      lista.sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());
    }

    return lista;
  }

  // ---- Agrupamento por dia (estilo extrato) ----
  get gruposPorDia(): GrupoDia[] {
    const grupos = new Map<string, ConsultaResponseModel[]>();

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

  podeChamar(consulta: ConsultaResponseModel): boolean {
    if (consulta.status === StatusConsulta.em_andamento) return true;
    if (!consulta.linkConsulta) return false;
    if (consulta.status !== StatusConsulta.agendada) return false;
    const diffMinutos = Math.abs(consulta.dataHora.getTime() - Date.now()) / (1000 * 60);
    return diffMinutos <= JANELA_CHAMADA_MINUTOS;
  }

  horarioFormatado(consulta: ConsultaResponseModel): string {
    return consulta.dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  iniciais(nome?: string): string {
    if (!nome) return '';
    return nome.trim().slice(0, 2).toUpperCase();
  }

  // ---- Ações ----
  trocarAba(aba: 'hoje' | 'todas') {
    this.abaAtiva = aba;
  }

  abrirDetalhes(consulta: ConsultaResponseModel) {

  }

  iniciarChamada(consulta: ConsultaResponseModel, event: Event) {
    this.consultaService.definirConsultaEmAndamento(consulta.id);
    event.stopPropagation();
    window.open(consulta.linkConsulta, '_system');
  }

  abrirDetalhesPopup(consulta: ConsultaResponseModel) {
    this.consultaSelecionada = consulta;
    this.modoPopup = 'detalhes';
  }

  fecharPopup() {
    this.consultaSelecionada = null;
    this.modoPopup = 'detalhes';
    this.motivoCancelamento = '';
  }

  irParaCancelamento() {
    this.modoPopup = 'cancelar';
  }

  voltarParaDetalhes() {
    this.modoPopup = 'detalhes';
    this.motivoCancelamento = '';
  }

  abrirChatPopup() {
    const consulta = this.consultaSelecionada!;
    this.fecharPopup();
    //Chat
  }

  remarcarConsulta() {
    const consulta = this.consultaSelecionada!;
    this.fecharPopup();
    //Agendar
  }

  confirmarCancelamento() {
    if (!this.motivoCancelamento.trim()) {
      this.exibirMensagem('Descreva o motivo do cancelamento.');
      return;
    }

    this.cancelando = true;
    if (this.consultaSelecionada != null) {
      this.consultaService.cancelar(this.consultaSelecionada.id, this.motivoCancelamento).subscribe({
        next: () => {
          this.cancelando = false;
          this.exibirMensagem('Consulta cancelada.');
          this.fecharPopup();
          this.carregarConsultas();
        },
        error: (erro) => {
          this.cancelando = false;
          console.log(erro)
          this.exibirMensagem(erro?.message ?? 'Erro ao cancelar consulta.');
        }
      });
    }
  }

  avaliarConsulta(consulta: ConsultaResponseModel, event: Event) {
    event.stopPropagation();
    this.navCtrl.navigateForward(['/avaliar-consulta', consulta.id]);
  }

  abrirNotificacoes() {
    this.navCtrl.navigateForward('/notificacoes');
  }

  abrirFiltros() {
    this.painelFiltroAberto = !this.painelFiltroAberto;
  }

  selecionarFiltroStatus(status: FiltroStatusAgendamento) {
    this.filtroStatus = status;
  }

  selecionarOrdenacao(ordenacao: FiltroOrdenacaoAgendamento) {
    this.filtroOrdenacao = ordenacao;
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }
}
