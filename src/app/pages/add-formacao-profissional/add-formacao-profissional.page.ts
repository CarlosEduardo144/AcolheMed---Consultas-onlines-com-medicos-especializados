import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, ToastController, IonButton, IonButtons, IonLabel, IonInput } from '@ionic/angular/standalone';
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
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonButtons, IonLabel, IonInput]
})
export class AddFormacaoProfissionalPage implements OnInit {

  
  usuario: UsuarioModel | null;
  alterarForm: FormGroup;

  constructor(private navController: NavController, private toastController: ToastController, private usuarioService: UsuarioService, private loginService: LoginService, private fb: FormBuilder) {
    this.usuario = new UsuarioModel();
    this.usuario = loginService.getUsuario();
    if (!this.usuario) {
      this.navController.navigateBack('/login');
    }
    this.alterarForm = this.fb.group(
      {
        formacaoAcademica: [this.usuario?.nome ?? '', [Validators.required]],
        
      },

      // { validators: passwordMatchValidator }
    );
  }

  ngOnInit() {
  }

  salvar() {


  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

}
