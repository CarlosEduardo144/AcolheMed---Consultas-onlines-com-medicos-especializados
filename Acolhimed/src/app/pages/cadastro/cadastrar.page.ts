import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import {
  IonContent,
  IonButton,
  IonInput,
  IonText,
} from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/usuario.service';
import { MedicoModel } from 'src/app/model/medico.model';
import { LoginService } from 'src/app/services/login.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { PacienteModel } from 'src/app/model/paciente.model';

type UserType = 'paciente' | 'medico';

// Custom validator: confirmarSenha must match senha
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const senha = group.get('senha')?.value;
  const confirmar = group.get('confirmarSenha')?.value;
  return senha === confirmar ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-cadastrar',
  templateUrl: './cadastrar.page.html',
  styleUrls: ['./cadastrar.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IonContent,
    IonButton,
    IonInput,
    IonText,
    NgxMaskDirective
  ],
  providers: [provideNgxMask()],
})
export class CadastrarPage {
  cadastrarForm: FormGroup;
  showSenha = false;
  userType: any;

  constructor(private fb: FormBuilder, private loginService: LoginService, private navController: NavController, private usuarioService: UsuarioService, private toastController: ToastController) {
    this.cadastrarForm = this.fb.group(
      {
        nome: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        crm: ['', [Validators.required]],
        uf: ['', [Validators.required]],
        senha: ['', [Validators.required, Validators.minLength(4)]],
        confirmarSenha: ['', [Validators.required, Validators.minLength(4)] ],
      },
      { validators: passwordMatchValidator }
    );

    this.setUserType('paciente');
  }

  setUserType(type: UserType) {
    this.userType = type;

    const crmControl = this.cadastrarForm.get('crm');
    const ufControl = this.cadastrarForm.get('uf');
    const espControl = this.cadastrarForm.get('especialidade');

    if (type === 'medico') {
      crmControl?.setValidators([Validators.required]);
      ufControl?.setValidators([Validators.required]);
      espControl?.setValidators([Validators.required]);
    } else {
      crmControl?.clearValidators();
      ufControl?.clearValidators();
      espControl?.clearValidators();
      // limpa os valores também para não ficarem sujos
      crmControl?.setValue('');
      ufControl?.setValue('');
      espControl?.setValue('');
    }

    crmControl?.updateValueAndValidity();
    ufControl?.updateValueAndValidity();
    espControl?.updateValueAndValidity();
  }

  goBack() {
    this.navController.back();
  }

  salvar() {
    if (this.cadastrarForm.valid) {

      if (this.userType === 'medico') {

        let medico = new MedicoModel();
        medico.nome = this.cadastrarForm.value.nome;
        medico.email = this.cadastrarForm.value.email;
        medico.senha = this.cadastrarForm.value.senha;
        medico.crm = this.cadastrarForm.value.crm;
        medico.ufEmissao = this.cadastrarForm.value.uf;
        medico.tipoUsuario = "medico";

        this.usuarioService.salvar(medico).subscribe({
          next: (usuarioSalvo) => {
            this.loginService.setUsuario(medico.id, medico.tipoUsuario);
            this.exibirMensagem('Usuário cadastrado com sucesso!!!');
            this.navController.navigateBack('/login');
          },  
          error: (erro) => {
            this.exibirMensagem(erro.error.message);
          }
        });

      } else {
        let paciente = new PacienteModel();
        paciente.nome = this.cadastrarForm.value.nome;
        paciente.email = this.cadastrarForm.value.email;
        paciente.senha = this.cadastrarForm.value.senha;
        paciente.tipoUsuario = "paciente";

        this.usuarioService.salvar(paciente).subscribe({
          next: (usuarioSalvo) => {
            this.loginService.setUsuario(paciente.id, paciente.tipoUsuario);
            this.exibirMensagem('Usuário cadastrado com sucesso!!!');
            this.navController.navigateBack('/login');

          },
          error: (erro) => {
            this.exibirMensagem(erro.error.message);
          }
        });
      }

    } else {
      this.cadastrarForm.markAllAsTouched();
      this.exibirMensagem('erro ao cadastrar usuário');
    }

  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  get nome() {
    return this.cadastrarForm.get('nome');
  }

  get email() {
    return this.cadastrarForm.get('email');
  }

  get crm() {
    return this.cadastrarForm.get('crm');
  }

  get uf() {
    return this.cadastrarForm.get('uf');
  }

  get senha() {
    return this.cadastrarForm.get('senha');
  }

  get confirmarSenha() {
    return this.cadastrarForm.get('confirmarSenha');
  }

}
