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
  consultas: ConsultaResponseModel[];
  consultasCarregadas = false;
  usuario: any;

  abaAtiva: 'proximas' | 'historico' = 'proximas';
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
        this.exibirMensagem("Erro ao carregar consultas" + erro.error.message);
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
        this.exibirMensagem("Erro ao carregar usuário" + erro.error.message);
      }
    });
  }

  // ---- Filtragem por aba + busca ----
  get consultasFiltradas(): ConsultaResponseModel[] {
    const statusProximas = [StatusConsulta.agendada, StatusConsulta.em_andamento];
    const statusHistorico = [StatusConsulta.finalizada, StatusConsulta.cancelada];

    const statusPermitidos = this.abaAtiva === 'proximas' ? statusProximas : statusHistorico;
    const termo = this.textoBusca.trim().toLowerCase();

    return this.consultas
      .filter(c => statusPermitidos.includes(c.status as StatusConsulta))
      .filter(c => !termo || c.medicoNome.toLowerCase().includes(termo))
      .sort((a, b) =>
        this.abaAtiva === 'proximas'
          ? a.dataHora.getTime() - b.dataHora.getTime()
          : b.dataHora.getTime() - a.dataHora.getTime()
      );
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

  // ---- Regras de negócio ----
  podeCancelar(consulta: ConsultaResponseModel): boolean {
    if (consulta.status !== StatusConsulta.agendada) return false;
    const horasAteConsulta = (consulta.dataHora.getTime() - Date.now()) / (1000 * 60 * 60);
    return horasAteConsulta >= JANELA_CANCELAMENTO_HORAS;
  }

  podeChamar(consulta: ConsultaResponseModel): boolean {
    if (consulta.status === StatusConsulta.em_andamento) return true;
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
  trocarAba(aba: 'proximas' | 'historico') {
    this.abaAtiva = aba;
  }

  abrirDetalhes(consulta: ConsultaResponseModel) {
    this.navCtrl.navigateForward(['/consulta', consulta.id]);
  }

  abrirChat(consulta: ConsultaResponseModel, event: Event) {
    event.stopPropagation();
    this.navCtrl.navigateForward(['/chat', consulta.id]);
  }

  iniciarChamada(consulta: ConsultaResponseModel, event: Event) {
    event.stopPropagation();
    // navegação/ação de chamada de vídeo
  }

  cancelarConsulta(consulta: ConsultaResponseModel, event: Event) {
    event.stopPropagation();
    // abrir modal/alert de confirmação de cancelamento já existente
  }

  avaliarConsulta(consulta: ConsultaResponseModel, event: Event) {
    event.stopPropagation();
    this.navCtrl.navigateForward(['/avaliar-consulta', consulta.id]);
  }

  abrirNotificacoes() {
    this.navCtrl.navigateForward('/notificacoes');
  }

  abrirFiltros() {
    this.navCtrl.navigateForward('/filtros-consultas');
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }
}