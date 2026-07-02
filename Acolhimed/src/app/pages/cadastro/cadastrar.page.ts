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
import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { MedicoModel } from 'src/app/model/medico.model';
import { LoginService } from 'src/app/services/login.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

/*function cpfValidator(control: AbstractControl): ValidationErrors | null {
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
}*/

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
  usuario: UserType = 'paciente';
  cadastrarForm: FormGroup;
  userType: any;

  constructor(private fb: FormBuilder, private loginService: LoginService, private navController: NavController, private usuarioService: UsuarioService, private toastController: ToastController) {
    this.cadastrarForm = this.fb.group(
      {
        nome: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        crm: ['', [Validators.required]],
        uf: ['', [Validators.required]],
        senha: ['', [Validators.required, Validators.minLength(4)]],
        confirmarSenha: ['', [Validators.required]],
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
      debugger
      const values = this.cadastrarForm.value;
      console.log('Cadastro:', { userType: this.userType, ...values });

      let usuario = new UsuarioModel();

      usuario.tipoUsuario = this.userType;
      usuario.nome = this.cadastrarForm.value.nome;
      usuario.email = this.cadastrarForm.value.email;
      usuario.senha = this.cadastrarForm.value.senha;

      if (this.userType === 'medico') {

        let medico = new MedicoModel();
        medico.crm = this.cadastrarForm.value.crm;
        medico.ufEmissao = this.cadastrarForm.value.uf;
        medico.usuario = usuario;

        this.usuarioService.salvar(medico).subscribe({
        next: (usuarioSalvo) => {
          this.exibirMensagem('Usuário cadastrado com sucesso!!!');
          this.navController.navigateBack('/login');
        },
        error: (erro) => {
          this.exibirMensagem(erro.error.message);
        }
      });
      return
      }

      this.usuarioService.salvar(usuario).subscribe({
        next: (usuarioSalvo) => {
          this.exibirMensagem('Usuário cadastrado com sucesso!!!');
          this.navController.navigateBack('/login');
        },
        error: (erro) => {
          this.exibirMensagem(erro.error.message);
        }
      });

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
