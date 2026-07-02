import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { IonIcon, IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonTitle, IonToolbar, IonLabel, IonButtons, IonAvatar } from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonIcon, RouterModule, IonHeader, IonHeader, IonTabBar, IonTabButton, IonToolbar, IonButtons, IonContent, IonAvatar, IonLabel, IonTitle, IonButton
  ],
})
export class InicioPage implements OnInit {

  patientName = 'Sofia';
  usuario: UsuarioModel;
  medicosDisponiveis: number;
  especialidadesDisponiveis: number;

  consultasEmAndamento = [
    {
      id: 1,
      doctor: "Dr. Pi'u piu",
      time: '10:00 h',
      avatar: null, // emoji/icon fallback
    }
  ];

  constructor(
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private especialidadeService: EspecialidadeService,
    private loginService: LoginService,
    private toastController: ToastController
  ) {
    this.usuario = this.loginService.getUsuarioBase() ?? new UsuarioModel();
    this.medicosDisponiveis = 0;
    this.especialidadesDisponiveis = 0;
    this.usuarioService.getMedicos().subscribe({
      next: (medicos) => {
        this.medicosDisponiveis = medicos.length;
      },
      error: () => {
        this.exibirMensagem('Erro ao exibir a quantidade de médicos');
      }
    });

    this.especialidadeService.listar().subscribe({
      next: (especialidades) => {
        this.especialidadesDisponiveis = especialidades.length;
      },
      error: (erro) => {
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  ngOnInit() { }

  navigate(path: string) {
    this.navCtrl.navigateForward(path);
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

  startCall() {
    this.navCtrl.navigateForward('/chamada');
  }
}
