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
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastController } from '@ionic/angular';
import { TokenService } from 'src/app/services/token-service';

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
  showSenha = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private navController: NavController,
    private tokenService: TokenService
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

  ngOnInit(){
    this.tokenService.excluir();
  }

  login() {
    const credenciais = {
      email: this.loginForm.value.email,
      senha: this.loginForm.value.senha
    };

    this.usuarioService.login(credenciais).subscribe({
      next: (resposta) => {
        this.tokenService.salvar(resposta.token);
        this.navController.navigateRoot('/inicio');
      },
      error: (erro) => {
        this.exibirMensagem(erro?.error?.message || 'Erro ao tentar logar');
      }
    });
  }

  async exibirMensagem(texto: string) {

    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });

    toast.present();

  }

}
