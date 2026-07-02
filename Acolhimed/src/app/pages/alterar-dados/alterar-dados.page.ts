import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonButton, ToastController } from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { MedicoModel } from 'src/app/model/medico.model';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';
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

  usuario: UsuarioModel | MedicoModel | null;
  alterarForm: FormGroup;
  showSenha = false;

  constructor(private navController: NavController, private toastController: ToastController, private usuarioService: UsuarioService, private loginService: LoginService, private fb: FormBuilder) {
    this.usuario = loginService.getUsuario();
    const usuarioBase = loginService.getUsuarioBase(this.usuario);
    if (!this.usuario) {
      this.navController.navigateBack('/login');
    }
    this.alterarForm = this.fb.group(
      {
        nome: [usuarioBase?.nome ?? '', [Validators.required]],
        email: [usuarioBase?.email ?? '', [Validators.required, Validators.email]],
        dataNascimento: [usuarioBase?.dataNascimento ?? '', [Validators.required]],
        cpf: [usuarioBase?.cpf ?? '', [Validators.required]],
        senha: [''],
      },

      // { validators: passwordMatchValidator }
    );
  }

  ngOnInit() {
  }

  salvar() {
    if (!this.usuario) {
      return;
    }
    debugger
    const tipoUsuario = this.loginService.getTipoUsuario(this.usuario);
    let aux: UsuarioModel | MedicoModel;

    if (tipoUsuario === 'medico') {
      const medicoAtual = this.usuario as MedicoModel;
      aux = {
        ...medicoAtual,
        usuario: {
          ...(medicoAtual.usuario ?? new UsuarioModel()),
        },
      } as MedicoModel;
    } else {
      aux = { ...(this.usuario as UsuarioModel) } as UsuarioModel;
    }

    const usuarioBase = tipoUsuario === 'medico'
      ? (aux as MedicoModel).usuario
      : aux as UsuarioModel;

    usuarioBase.id = this.loginService.getUsuarioId(this.usuario);
    usuarioBase.nome = this.alterarForm.value.nome;
    usuarioBase.email = this.alterarForm.value.email;
    usuarioBase.dataNascimento = this.alterarForm.value.dataNascimento;
    usuarioBase.cpf = this.alterarForm.value.cpf;
    usuarioBase.tipoUsuario = tipoUsuario;

    if (this.alterarForm.value.senha) {
      usuarioBase.senha = this.alterarForm.value.senha;
    }

    this.usuarioService.salvar(aux).subscribe({
      next: (usuarioSalvo) => {
        this.loginService.setUsuario(usuarioSalvo);
        this.exibirMensagem('Usuário atualizado com sucesso!!!');
      },
      error: (erro) => {
        this.exibirMensagem(erro.error.message);
      }
    });

  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

}
