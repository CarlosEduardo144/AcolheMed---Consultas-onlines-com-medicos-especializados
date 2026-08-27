import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { IonIcon, IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonTitle, IonToolbar, IonLabel, IonButtons, IonAvatar } from '@ionic/angular/standalone';
import { MedicoModel } from 'src/app/model/medico.model';
import { PacienteModel } from 'src/app/model/paciente.model';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CommonModule } from '@angular/common'; // 1. Importe o módulo
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonIcon, RouterModule, CommonModule, IonHeader, IonHeader, IonTabBar, IonTabButton, IonToolbar, IonButtons, IonContent, IonAvatar, IonLabel, IonTitle, IonButton
  ],
})
export class InicioPage implements OnInit {

  medicosDisponiveis: number;
  especialidadesDisponiveis: number;
  usuario!: PacienteModel | MedicoModel;
  carregandoInicial = true;

  constructor(
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private especialidadeService: EspecialidadeService,
    private loginService: LoginService,
    private toastController: ToastController
  ) {
    this.medicosDisponiveis = 0;
    this.especialidadesDisponiveis = 0;
  }

  ngOnInit() {
    this.carregarDadosIniciais();
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
    }).subscribe({
      next: ({ usuario, medicos, especialidades }) => {
        if (!usuario) {
          this.navCtrl.navigateBack('/login');
          return;
        }

        this.usuario = usuario;
        this.medicosDisponiveis = medicos.length;
        this.especialidadesDisponiveis = especialidades.length;
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
    // navegação para o chat da consulta em andamento
  }

  iniciarChamada() {
    // navegação/ação para iniciar a chamada de vídeo
  }
}
