import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { IonIcon, IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonTitle, IonToolbar, IonLabel, IonButtons, IonAvatar } from '@ionic/angular/standalone';
import { MedicoModel } from 'src/app/model/medico.model';
import { PacienteModel } from 'src/app/model/paciente.model';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonIcon, RouterModule, IonHeader, IonHeader, IonTabBar, IonTabButton, IonToolbar, IonButtons, IonContent, IonAvatar, IonLabel, IonTitle, IonButton
  ],
})
export class InicioPage implements OnInit {

  medicosDisponiveis: number;
  especialidadesDisponiveis: number;
  usuario!: PacienteModel | MedicoModel;

  constructor(
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private especialidadeService: EspecialidadeService,
    private loginService: LoginService,
    private toastController: ToastController
  ) {
    this.carregarUsuario();
    this.medicosDisponiveis = 0;
    this.especialidadesDisponiveis = 0;
  }

  ngOnInit() {
    this.usuarioService.getMedicos().subscribe({
      next: (medicos) => {
        this.medicosDisponiveis = medicos.length;
      },
      error: (erro) => {
        this.exibirMensagem(erro.error.message);
      }
    });

    this.especialidadeService.listar().subscribe({
      next: (especialidades) => {
        this.especialidadesDisponiveis = especialidades.length;
      },
      error: (erro) => {
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  ionViewWillEnter(){
    this.carregarUsuario();
  }

  carregarUsuario(){
    this.usuarioService.buscarPorId(this.loginService.getUsuario()).subscribe({
      next: (usuario) => {

        if (!usuario) {
          this.navCtrl.navigateBack('/login');
        }

        this.usuario = usuario;
      },
      error: (erro) => {
        console.error(erro);
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  navigate(path: string) {
    this.navCtrl.navigateForward(path);
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
