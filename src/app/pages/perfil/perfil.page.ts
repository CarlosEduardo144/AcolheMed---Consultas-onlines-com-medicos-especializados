import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonContent,
  IonText,
  IonToggle,
} from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { LoginService } from 'src/app/services/login.service';

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
  ],
})
export class PerfilPage {
  notificacoesAtivas = false;

  usuario: UsuarioModel | null = null;

  constructor(private navController: NavController, private loginService: LoginService) {
    this.usuario = new UsuarioModel();
    this.usuario = loginService.getUsuario();
    if(!this.usuario){
      this.navController.navigateBack('/login');
    }
  }

  irParaMeusDados() {
    this.navController.navigateForward('/alterar-dados');
  }

  logout() {
    this.loginService.logout();
    this.navController.navigateForward('/login');
  }

  irParaAvaliacoes() {
    this.navController.navigateForward('/avaliacoes');
  }

  toggleNotificacoes(event: any) {
    this.notificacoesAtivas = event.detail.checked;
  }
}
