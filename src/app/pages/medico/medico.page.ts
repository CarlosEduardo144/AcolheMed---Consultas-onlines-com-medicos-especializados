import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  NavController, ToastController,
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonButtons, IonBackButton, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  star, starOutline, locationOutline, schoolOutline,
  timeOutline, calendarOutline, chatbubbleOutline,
  callOutline, chevronBackOutline, personOutline
} from 'ionicons/icons';
import { MedicoModel } from 'src/app/model/medico.model';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-medico',
  templateUrl: './medico.page.html',
  styleUrls: ['./medico.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonButtons, IonBackButton, IonIcon
  ]
})
export class MedicoPage implements OnInit {
  medico: MedicoModel | null = null;

  diasSemana = [
    { id: 'seg', label: 'Seg' },
    { id: 'ter', label: 'Ter' },
    { id: 'qua', label: 'Qua' },
    { id: 'qui', label: 'Qui' },
    { id: 'sex', label: 'Sex' },
    { id: 'sab', label: 'Sáb' },
  ];

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private toastController: ToastController
  ) {
    addIcons({
      star, starOutline, locationOutline, schoolOutline,
      timeOutline, calendarOutline, chatbubbleOutline,
      callOutline, chevronBackOutline, personOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.medico = this.usuarioService.getMedicos().find(m => m.id === id) ?? null;
    }
  }

  temHorario(diaId: string): boolean {
    return this.medico?.horario?.some(h => h.diaSemana === diaId) ?? false;
  }

  agendar() {
    if (!this.medico) return;
    this.navCtrl.navigateForward('/agendar-consulta', {
      state: { medico: this.medico }
    });
  }

  goBack() {
    this.navCtrl.back();
  }
}