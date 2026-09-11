import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { IonIcon, IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonTitle, IonToolbar, IonLabel, IonButtons, IonAvatar } from '@ionic/angular/standalone';
import { MedicoModel } from 'src/app/model/medico.model';
import { PacienteModel } from 'src/app/model/paciente.model';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ConsultaService } from 'src/app/services/consulta-service';
import { ConsultaResponseModel } from 'src/app/model/consulta-response';
import { CommonModule } from '@angular/common'; // 1. Importe o módulo
import { forkJoin } from 'rxjs';

const MINUTOS_ANTECEDENCIA_LIBERACAO = 30;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonIcon, RouterModule, CommonModule, IonHeader, IonHeader, IonTabBar, IonTabButton, IonToolbar, IonButtons, IonContent, IonAvatar, IonLabel, IonTitle, IonButton
  ],
})
export class InicioPage implements OnInit, OnDestroy {

  medicosDisponiveis: number;
  especialidadesDisponiveis: number;
  usuario!: PacienteModel | MedicoModel;
  carregandoInicial = true;
  consultaAtual: ConsultaResponseModel | null = null;

  private timerLiberacao?: ReturnType<typeof setInterval>;

  constructor(
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private especialidadeService: EspecialidadeService,
    private loginService: LoginService,
    private consultaService: ConsultaService,
    private toastController: ToastController
  ) {
    this.medicosDisponiveis = 0;
    this.especialidadesDisponiveis = 0;
  }

  ngOnInit() {
    this.carregarDadosIniciais();

    // Reavalia a liberação da consulta periodicamente, sem precisar dar refresh na tela.
    this.timerLiberacao = setInterval(() => {}, 30000);
  }

  ngOnDestroy() {
    if (this.timerLiberacao) {
      clearInterval(this.timerLiberacao);
    }
  }

  ionViewWillEnter() {
    if (!this.carregandoInicial && this.loginService.getUsuario()) {
      this.carregarUsuario(false);
    }
  }

  carregarDadosIniciais() {
    this.carregandoInicial = true;

    forkJoin({
      usuario: this.usuarioService.buscarPorId(this.loginService.getUsuario()),
      medicos: this.usuarioService.getMedicos(),
      especialidades: this.especialidadeService.listar(),
      consultas: this.consultaService.getConsultas(this.loginService.getUsuario()),
    }).subscribe({
      next: ({ usuario, medicos, especialidades, consultas }) => {
        if (!usuario) {
          this.navCtrl.navigateBack('/login');
          return;
        }

        this.usuario = usuario;
        this.medicosDisponiveis = medicos.length;
        this.especialidadesDisponiveis = especialidades.length;
        this.consultaAtual = this.selecionarProximaConsulta(consultas);
        this.carregandoInicial = false;
      },
      error: (erro) => {
        this.carregandoInicial = false;
        this.exibirMensagem(erro.error?.message || 'Erro ao carregar informações iniciais.');
      }
    });
  }

  carregarUsuario(exibirCarregamento = true) {
    if (exibirCarregamento) {
      this.carregandoInicial = true;
    }

    this.usuarioService.buscarPorId(this.loginService.getUsuario()).subscribe({
      next: (usuario) => {

        if (!usuario) {
          this.navCtrl.navigateBack('/login');
        }

        this.usuario = usuario;
        if (exibirCarregamento) {
          this.carregandoInicial = false;
        }
      },
      error: (erro) => {
        console.error(erro);
        if (exibirCarregamento) {
          this.carregandoInicial = false;
        }
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  private selecionarProximaConsulta(consultas: ConsultaResponseModel[]): ConsultaResponseModel | null {
    const emAndamento = consultas.find(c => c.status === 'em_andamento');
    if (emAndamento) return emAndamento;

    const agora = new Date().getTime();
    const agendadasFuturas = consultas
      .filter(c => c.status === 'agendada' && new Date(c.dataHora).getTime() >= agora)
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());

    return agendadasFuturas[0] ?? null;
  }

  get consultaLiberada(): boolean {
    if (!this.consultaAtual) return false;
    if (this.consultaAtual.status === 'em_andamento') return true;

    const agora = new Date().getTime();
    const inicioConsulta = new Date(this.consultaAtual.dataHora).getTime();
    const liberaEm = inicioConsulta - MINUTOS_ANTECEDENCIA_LIBERACAO * 60 * 1000;

    return agora >= liberaEm;
  }

  get horarioLiberacaoFormatado(): Date | null {
    if (!this.consultaAtual) return null;
    const inicioConsulta = new Date(this.consultaAtual.dataHora).getTime();
    return new Date(inicioConsulta - MINUTOS_ANTECEDENCIA_LIBERACAO * 60 * 1000);
  }

  navigate(path: string) {
    this.navCtrl.navigateForward(path);
  }

  iniciais(nome?: string): string {
    if (!nome) return '';
    return nome.trim().slice(0, 2).toUpperCase();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  agendarConsulta() {
    // navegação para o fluxo de agendamento
  }

  abrirNotificacoes() {
    // navegação para a tela de notificações
  }

  abrirChat() {
    if (!this.consultaLiberada) return;
    // navegação para o chat da consulta em andamento
  }

  iniciarChamada() {
    if (!this.consultaLiberada) return;
    // navegação/ação para iniciar a chamada de vídeo
  }
}