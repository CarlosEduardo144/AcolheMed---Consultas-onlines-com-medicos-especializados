import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
  IonIcon,
  NavController,
} from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonText,
    IonIcon,
  ],
})
export class LoginPage {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private loginService: LoginService,
    private toastController: ToastController,
    private navController: NavController
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(4)]],
    });

  }

  get email() {
    return this.loginForm.get('email');
  }

  get senha() {
    return this.loginForm.get('senha');
  }

  login() {

    if (this.loginForm.valid) {

      const email = this.loginForm.value.email;
      const senha = this.loginForm.value.senha;

      let aux = this.usuarioService.login(email, senha);

      if (aux) {

        this.loginService.setUsuario(aux);

        this.exibirMensagem('Usuário logado com sucesso!!!');

        this.navController.navigateBack('/perfil');

      } else {

        this.exibirMensagem('Usuário não encontrado!!!');

      }

    } else {

      this.loginForm.markAllAsTouched();

    }

  }

  async exibirMensagem(texto: string) {

    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });

    toast.present();

  }

}
