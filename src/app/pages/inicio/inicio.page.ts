import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IonIcon,IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonTitle,IonToolbar, IonLabel, IonButtons, IonAvatar} from '@ionic/angular/standalone';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { UsuarioService } from 'src/app/services/usuario.service';
 
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonIcon, RouterModule, IonHeader, IonHeader, IonTabBar, IonTabButton, IonToolbar, IonButtons,IonContent, IonAvatar, IonLabel, IonTitle, IonButton
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
 
  constructor(private navCtrl: NavController, private usuarioService: UsuarioService, private especialidadeService: EspecialidadeService ) {
    this.usuario = new UsuarioModel();
    this.medicosDisponiveis = usuarioService.qtdMedicos();
    this.especialidadesDisponiveis = especialidadeService.qtdEspecialidades();
  }
 
  ngOnInit() {}
 
  navigate(path: string) {
    this.navCtrl.navigateForward(path);
  }
 
  
 
  startCall() {
    this.navCtrl.navigateForward('/chamada');
  }
}
 