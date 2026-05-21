import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonIcon, IonToolbar, IonList, IonItemSliding, IonItem, IonThumbnail, IonLabel, IonItemOptions, IonItemOption, ToastController, AlertController, NavController } from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LoginService } from 'src/app/services/login.service';
import { MedicoModel } from 'src/app/model/medico.model';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItemSliding,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonItemOptions,
    IonItemOption,
    CommonModule,
    FormsModule,
    IonIcon
  ]
})
export class InicioPage implements OnInit {

  usuarios: UsuarioModel[];
  usuario: UsuarioModel | null = null;

  constructor(private usuarioService: UsuarioService, private navController: NavController, private loginService: LoginService, private alertController: AlertController, private router: Router, private toastController: ToastController) {
    this.usuarios = [];
    this.usuario = new UsuarioModel();
    this.usuario = loginService.getUsuario();
    this.usuarios = this.usuarioService.listar();
  }

  ngOnInit() {
  }

  async excluir(usuario: UsuarioModel) {
    const alert = await this.alertController.create({
      header: 'Confirma a exclusão?',
      message: `Deseja remover: ${usuario.nome}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          cssClass: 'danger',
          handler: () => {
            if (!usuario.id) {
              this.exibirMensagem('Usuário inválido');
              return;
            }

            const excluido = this.usuarioService.excluir(usuario.id);

            if (!excluido) {
              this.exibirMensagem('Erro ao excluir usuário');
              return;
            }

            const usuarioLogadoExcluido =
              this.usuario && usuario.id === this.usuario.id;

            if (usuarioLogadoExcluido) {
              this.loginService.logout();
              this.exibirMensagem('O usuário logado foi excluído');
              this.navController.navigateBack('/login');
            } else {
              this.exibirMensagem('Usuário excluído com sucesso');
            }

            this.ionViewWillEnter();
          }
        }
      ]
    });

    await alert.present();
  }

  async exibirMensagem(texto: string) {

    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });

    toast.present();

  }

  isMedico(usuario: UsuarioModel): MedicoModel {
    return usuario as MedicoModel;
  }

  ionViewWillEnter() {
    this.usuarios = this.usuarioService.listar();
  }
}
