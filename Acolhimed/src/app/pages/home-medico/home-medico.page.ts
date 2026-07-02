import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonButtons, IonAvatar, NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, personOutline, chatbubbleOutline,
  callOutline, calendarOutline, timeOutline, chevronForwardOutline
} from 'ionicons/icons';
import { MedicoModel } from 'src/app/model/medico.model';
import { ConsultaModel } from 'src/app/model/consulta.model';
import { HorarioDisponivelModel } from 'src/app/model/horario-disponivel.model';
import { ConsultaService } from 'src/app/services/consulta.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-home-medico',
  templateUrl: './home-medico.page.html',
  styleUrls: ['./home-medico.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonButtons, IonAvatar
  ]
})
export class HomeMedicoPage implements OnInit {

  usuario: MedicoModel;
  consultasHoje: ConsultaModel[] = [];
  consultasProximas: ConsultaModel[] = [];
  totalAgendadas = 0;
  totalRealizadas = 0;

  constructor(
    private loginService: LoginService,
    private consultaService: ConsultaService,
    private navCtrl: NavController
  ) {
    addIcons({
      notificationsOutline, personOutline, chatbubbleOutline,
      callOutline, calendarOutline, timeOutline, chevronForwardOutline
    });
    this.usuario = (this.loginService.getUsuario() as MedicoModel) ?? new MedicoModel();
  }

  ngOnInit() {
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    const id = this.loginService.getUsuarioId(this.usuario);

    this.consultasHoje = this.consultaService.hoje(id, 'medico');
    this.consultasProximas = this.consultaService.proximas(id, 'medico');

    const todas = this.consultaService.listarPorMedico(id);
    this.totalAgendadas = todas.filter(c => c.status === 'agendada').length;
    this.totalRealizadas = todas.filter(c => c.status === 'realizada').length;
  }

  get nomeExibido(): string {
    const nome = this.loginService.getNomeUsuario(this.usuario);
    const partes = nome.trim().split(' ');
    return partes[0] ?? nome;
  }

  get horariosDisponiveis(): HorarioDisponivelModel[] {
    return this.usuario?.horario ?? [];
  }

  formatarData(data: string): string {
    if (!data) return '';
    const [, m, d] = data.split('-');
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${d} de ${meses[parseInt(m) - 1]}`;
  }

  verPaciente(consulta: ConsultaModel) {
    this.navCtrl.navigateForward('/pacientes-medico', {
      state: { pacienteId: consulta.paciente.id }
    });
  }
}
