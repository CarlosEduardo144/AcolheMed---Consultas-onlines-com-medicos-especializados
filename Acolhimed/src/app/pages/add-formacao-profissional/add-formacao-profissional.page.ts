import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonText, ToastController, IonButton, IonButtons, IonLabel, IonInput } from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { LoginService } from 'src/app/services/login.service';
import { MedicoModel } from 'src/app/model/medico.model';
import { PacienteModel } from 'src/app/model/paciente.model';

@Component({
  selector: 'app-add-formacao-profissional',
  templateUrl: './add-formacao-profissional.page.html',
  styleUrls: ['./add-formacao-profissional.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonText, FormsModule, ReactiveFormsModule, IonButton, IonButtons, IonLabel, IonInput]
})
export class AddFormacaoProfissionalPage implements OnInit {
  usuario!: any;
  alterarForm: FormGroup;
  carregandoInicial = true;

  constructor(private navController: NavController, private toastController: ToastController, private usuarioService: UsuarioService, private loginService: LoginService, private fb: FormBuilder) {
    this.usuario = new MedicoModel();
    this.alterarForm = this.fb.group({
      formacaoAcademica: [
        this.usuario?.formacaoAcademica ?? '',
        [Validators.required, Validators.maxLength(300)] 
      ],
      sobreMim: [
        this.usuario?.sobreMim ?? '',
        [Validators.required, Validators.maxLength(300)] 
      ],
    });
  }

  ngOnInit() {
    this.carregarUsuario();
  }

  carregarUsuario() {
    this.carregandoInicial = true;

    this.usuarioService.buscarPorId(this.loginService.getUsuario()).subscribe({
      next: (usuario) => {
        if (!this.usuario) {
          this.navController.navigateBack('/login');
        }

        this.usuario = usuario;

        this.alterarForm.patchValue({
          formacaoAcademica: this.usuario.formacaoAcademica,
          sobreMim: this.usuario.sobreMim,
        });
        this.carregandoInicial = false;
      },
      error: (erro) => {
        console.error(erro);
        this.carregandoInicial = false;
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  salvar() {
    if (this.usuario) {
      this.usuario.formacaoAcademica = this.alterarForm.value.formacaoAcademica;
      this.usuario.sobreMim = this.alterarForm.value.sobreMim;

      this.usuarioService.salvar(this.usuario).subscribe({
        next: () => {
          this.exibirMensagem('Alterado com sucesso!!!');
        },
        error: (erro) => {
          this.exibirMensagem(erro.error.message);
        }
      });
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
