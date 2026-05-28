import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonButton, ToastController } from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { MedicoModel } from 'src/app/model/medico.model';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { PacienteModel } from 'src/app/model/paciente.model';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const cpf = (control.value ?? '').replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return { cpfInvalido: true };

  const calcDigit = (slice: string) => {
    const sum = slice.split('').reduce((acc, d, i) => acc + +d * (slice.length + 1 - i), 0);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };

  const d1 = calcDigit(cpf.slice(0, 9));
  const d2 = calcDigit(cpf.slice(0, 10));
  return d1 === +cpf[9] && d2 === +cpf[10] ? null : { cpfInvalido: true };
}

@Component({
  selector: 'app-alterar-dados',
  templateUrl: './alterar-dados.page.html',
  styleUrls: ['./alterar-dados.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, ReactiveFormsModule, NgxMaskDirective],
  providers: [provideNgxMask()]
})

export class AlterarDadosPage implements OnInit {

  usuario: UsuarioModel | null;
  alterarForm: FormGroup;
  showSenha = false;

  constructor(private navController: NavController, private toastController: ToastController, private usuarioService: UsuarioService, private loginService: LoginService, private fb: FormBuilder) {
    this.usuario = new UsuarioModel();
    this.usuario = loginService.getUsuario();
    if (!this.usuario) {
      this.navController.navigateBack('/login');
    }
    this.alterarForm = this.fb.group(
      {
        nome: [this.usuario?.nome ?? '', [Validators.required]],
        email: [this.usuario?.email ?? '', [Validators.required, Validators.email]],
        telefone: [this.usuario?.telefone ?? '', [Validators.required]],
        dataNascimento: [this.usuario?.dataNascimento ?? '', [Validators.required]],
        cpf: [{ value: this.usuario?.cpf ?? '', disabled: true }, [Validators.required, cpfValidator]],
        senha: ['', [Validators.required]],
      },

      // { validators: passwordMatchValidator }
    );
  }

  ngOnInit() {
  }

  salvar() {
    let aux: UsuarioModel;
    if (this.usuario?.tipoUsuario === 'medico') {
      const medico = new MedicoModel();
      aux = medico;
    } else {
      aux = new PacienteModel();
    }

    aux.nome = this.alterarForm.value.nome;
    aux.email = this.alterarForm.value.email;
    aux.telefone = this.alterarForm.value.telefone;
    aux.dataNascimento = this.alterarForm.value.dataNascimento;
    aux.senha = this.alterarForm.value.senha || this.usuario!.senha;
    aux.cpf = this.usuario!.cpf;
    aux.id = this.usuario!.id;
    aux.tipoUsuario = this.usuario!.tipoUsuario;

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
