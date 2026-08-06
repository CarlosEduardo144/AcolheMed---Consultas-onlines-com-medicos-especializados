import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonButton, ToastController, IonText } from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { MedicoModel } from 'src/app/model/medico.model';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { PacienteModel } from 'src/app/model/paciente.model';

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
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonText, ReactiveFormsModule, NgxMaskDirective],
  providers: [provideNgxMask()]
})

export class AlterarDadosPage implements OnInit {

  usuario!: UsuarioModel | MedicoModel;
  alterarForm: FormGroup;
  showSenha = false;

  constructor(private navController: NavController, private toastController: ToastController, private usuarioService: UsuarioService, private loginService: LoginService, private fb: FormBuilder) {
    this.usuarioService.buscarPorId(this.loginService.getUsuario()).subscribe({
      next: (usuario) => {
        this.usuario = usuario;

        if (!this.usuario) {
          this.navController.navigateBack('/login');
        }

        this.alterarForm.patchValue({
          nome: this.usuario.nome,
          email: this.usuario.email,
          dataNascimento: this.usuario.dataNascimento,
          cpf: this.usuario.cpf
        });
      },
      error: (erro) => {
        console.error(erro);
            this.exibirMensagem(erro?.error?.message || 'Erro ao buscar usuário');
      }
    });

    this.alterarForm = this.fb.group(
      {
        nome: [this.usuario?.nome ?? '', [Validators.required]],
        email: [this.usuario?.email ?? '', [Validators.required, Validators.email]],
        dataNascimento: [this.usuario?.dataNascimento ?? '', [Validators.required]],
        cpf: [this.usuario?.cpf ?? '', [Validators.required, cpfValidator]],
        senha: [''],
      }
    );
  }

  ngOnInit() {
    this.usuarioService.buscarPorId(this.loginService.getUsuario()).subscribe({
      next: (usuario) => {
        this.usuario = usuario;

        if (!this.usuario) {
          this.navController.navigateBack('/login');
        }
      },
      error: (erro) => {
        console.error(erro);
            this.exibirMensagem(erro?.error?.message || 'Erro ao buscar usuário');
      }
    });
  }

  salvar() {
    let usuarioAtualizado;

    if (this.loginService.getTipoUsuario() == "medico") {
      usuarioAtualizado = new MedicoModel();
    } else {
      usuarioAtualizado = new PacienteModel();
    }

    usuarioAtualizado = this.usuario;

    usuarioAtualizado.nome = this.alterarForm.value.nome;
    usuarioAtualizado.email = this.alterarForm.value.email;
    usuarioAtualizado.senha = this.alterarForm.value.senha;
    usuarioAtualizado.dataNascimento = this.alterarForm.value.dataNascimento;
    if (usuarioAtualizado.dataNascimento.includes('T')) {
      usuarioAtualizado.dataNascimento = usuarioAtualizado.dataNascimento.split('T')[0];
    }
    usuarioAtualizado.cpf = this.alterarForm.value.cpf;

    this.usuarioService.salvar(usuarioAtualizado).subscribe({
      next: () => {
        this.exibirMensagem('Usuário atualizado com sucesso!!!');
      },
      error: (erro) => {
            this.exibirMensagem(erro?.error?.message || 'Erro ao atualizar informações do usuário');
      }
    });

  }

  iniciais(nome?: string): string {
    if (!nome) return '';
    return nome.trim().slice(0, 2).toUpperCase();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  get email() {
    return this.alterarForm.get('email');
  }

  get cpf() {
    return this.alterarForm.get('cpf');
  }

  get dataNascimento() {
    return this.alterarForm.get('dataNascimento');
  }

}
