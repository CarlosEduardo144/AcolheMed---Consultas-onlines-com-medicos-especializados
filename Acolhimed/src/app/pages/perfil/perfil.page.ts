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
import { MedicoModel } from 'src/app/model/medico.model';
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

  usuario: UsuarioModel | MedicoModel | null = null;
  usuarioBase: UsuarioModel | null = null;
  tipoUsuario = '';

  constructor(private navController: NavController, private loginService: LoginService) {
    this.usuario = new UsuarioModel();
    this.usuario = loginService.getUsuario();
    this.usuarioBase = loginService.getUsuarioBase(this.usuario);
    this.tipoUsuario = loginService.getTipoUsuario(this.usuario);
    if(!this.usuario){
      this.navController.navigateBack('/login');
    }
  }


  logout() {
    this.loginService.logout();
    this.navController.navigateForward('/login');
  }


  toggleNotificacoes(event: any) {
    this.notificacoesAtivas = event.detail.checked;
  }
}
