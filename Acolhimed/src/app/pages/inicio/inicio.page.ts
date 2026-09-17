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
import { ConsultaService } from 'src/app/services/consulta-service';
import { ConsultaResponseModel } from 'src/app/model/consulta-response';


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
  consultaEmAndamento: ConsultaResponseModel;
  carregandoInicial = true;
  qtdConsultas: number;

  constructor(
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private especialidadeService: EspecialidadeService,
    private loginService: LoginService,
    private toastController: ToastController,
    private consultaService: ConsultaService
  ) {
    this.medicosDisponiveis = 0;
    this.qtdConsultas = 0;
    this.especialidadesDisponiveis = 0;
    this.consultaEmAndamento = new ConsultaResponseModel();
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
        this.carregarConsultasEmAndamento();
        if (usuario.tipoUsuario == "medico") {
          this.carregarAgenda();
        }
        this.carregandoInicial = false;
      },
      error: (erro) => {
        this.carregandoInicial = false;
        this.exibirMensagem(erro.error?.message || 'Erro ao carregar informações iniciais.');
      }
    });
  }

  carregarAgenda() {
    this.consultaService.getAgendaDoMedico(this.loginService.getUsuario()).subscribe({
      next: (resultado) => {
        this.qtdConsultas = resultado.length;
      },
      error: (erro) => {
        this.exibirMensagem("Erro ao carrgar informações da agenda do médico");
      }
    });
  }

  carregarConsultasEmAndamento() {
    this.consultaService.buscarConsultasEmAndamento(this.loginService.getUsuario()).subscribe({
      next: (resultado) => {
        this.consultaEmAndamento = resultado;
      },
      error: () => {
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

  abrirNotificacoes() {
    this.navCtrl.navigateForward("/notificacoes");
  }

  abrirChat() {
    // navegação para o chat da consulta em andamento
  }

  iniciarChamada(linkConsulta: string) {
    this.consultaService.definirConsultaEmAndamento(this.consultaEmAndamento.id);
    window.open(linkConsulta, '_system');
  }
}
