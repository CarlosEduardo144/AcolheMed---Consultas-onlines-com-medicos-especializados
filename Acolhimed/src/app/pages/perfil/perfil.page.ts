import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import {
  IonContent,
  IonText,
  IonToggle,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { MedicoModel } from 'src/app/model/medico.model';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { HorarioService } from 'src/app/services/horario.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonText,
    IonToggle,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonList,
    IonItem,
    IonRadioGroup,
    IonRadio,
    IonLabel,
    IonSpinner,
  ],
})
export class PerfilPage {
  notificacoesAtivas = false;

  usuario!: UsuarioModel | MedicoModel;
  possuiHorarios = true;

  constructor(
    private navController: NavController,
    private loginService: LoginService,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private horarioService: HorarioService
  ) {
    this.usuarioService.buscarPorId(this.loginService.getUsuario()).subscribe({
      next: (usuario) => {
        this.usuario = usuario;

        if (!this.usuario) {
          this.navController.navigateBack('/login');
        }
      },
      error: (erro) => {
        console.error(erro);
        this.exibirMensagem(erro.error.message);
      }
    });

  }

  ngOnInit() {
  }

  ionViewWillEnter(){
    if (this.usuario?.tipoUsuario == "medico") {
      this.horarioService.buscarPorMedico(this.loginService.getUsuario()).subscribe({
        next: (horarios) => {
          if (horarios) {
            horarios.forEach(horario => {
              if (horario.manha == true || horario.tarde == true || horario.noite == true) {
                this.possuiHorarios = false;
              }
            });
          }
        }
      });
    }
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

    toast.present();

  }

  logout() {
    this.loginService.logout();
    this.navController.navigateForward('/login');
  }

  toggleNotificacoes(event: any) {
    this.notificacoesAtivas = event.detail.checked;
  }
}
