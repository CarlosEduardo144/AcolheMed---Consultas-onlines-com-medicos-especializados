import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonButton, ToastController } from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { PacienteModel } from 'src/app/model/paciente.model';

@Component({
  selector: 'app-alterar-dados',
  templateUrl: './alterar-dados.page.html',
  styleUrls: ['./alterar-dados.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, ReactiveFormsModule]
})
export class AlterarDadosPage implements OnInit {

  usuario: UsuarioModel;
  alterarForm: FormGroup;

  constructor(private navController: NavController, private toastController: ToastController, private usuarioService: UsuarioService, private loginService: LoginService, private fb: FormBuilder) {
    this.usuario = new UsuarioModel();
    this.usuario = loginService.getUsuario();
    if (!this.usuario) {
      this.navController.navigateBack('/login');
    }
    this.alterarForm = this.fb.group(
      {
        nome: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        telefone: ['', [Validators.required]],
        dataNascimento: ['', [Validators.required]],
        senha: ['', [Validators.required, Validators.minLength(4)]],
      },

      // { validators: passwordMatchValidator }
    );
    this.alterarForm.get('nome')?.setValue(this.usuario.nome);
    this.alterarForm.get('email')?.setValue(this.usuario.email);
    this.alterarForm.get('dataNascimento')?.setValue(this.usuario.dataNascimento);
    this.alterarForm.get('telefone')?.setValue(this.usuario.telefone);
    this.alterarForm.get('senha')?.setValue(this.usuario.senha);
  }

  ngOnInit() {
  }

  salvar() {
    let aux = new PacienteModel();

    aux.nome = this.alterarForm.value.nome;
    aux.email = this.alterarForm.value.email;
    aux.telefone = this.alterarForm.value.telefone;
    aux.dataNascimento = this.alterarForm.value.dataNascimento;
    aux.senha = this.alterarForm.value.senha;
    aux.id = this.usuario.id;
    aux.tipoUsuario = this.usuario.tipoUsuario;

    if (this.usuarioService.salvar(aux)) {
      this.loginService.setUsuario(aux);
      this.exibirMensagem('Usuário alterado com sucesso!!!');

    }


  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

}
