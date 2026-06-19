import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonButtons, NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, searchOutline, optionsOutline,
  personOutline, chatbubble, callOutline, calendarOutline,
  timeOutline, checkmarkCircleOutline, documentOutline,
  eyeOutline, addOutline, closeCircleOutline, timeSharp
} from 'ionicons/icons';
import { ConsultaModel, StatusConsulta } from 'src/app/model/consulta.model';
import { ConsultaService } from 'src/app/services/consulta.service';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioModel } from 'src/app/model/usuario.model';

type AbaAtiva = 'hoje' | 'historico';

@Component({
  selector: 'app-agendamentos-medico',
  templateUrl: './agendamentos-medico.page.html',
  styleUrls: ['./agendamentos-medico.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonButtons
  ]
})
export class AgendamentosMedicoPage implements OnInit {

  usuario: UsuarioModel | null = null;
  abaAtiva: AbaAtiva = 'hoje';
  textoBusca = '';

  consultasHoje: ConsultaModel[] = [];
  consultasAmanha: ConsultaModel[] = [];
  private todoHistorico: ConsultaModel[] = [];
  listaHistorico: ConsultaModel[] = [];

  constructor(
    private loginService: LoginService,
    private consultaService: ConsultaService,
    private navCtrl: NavController
  ) {
    addIcons({
      notificationsOutline, searchOutline, optionsOutline,
      personOutline, chatbubble, callOutline, calendarOutline,
      timeOutline, checkmarkCircleOutline, documentOutline,
      eyeOutline, addOutline, closeCircleOutline, timeSharp
    });
  }

  ngOnInit() {
    this.usuario = this.loginService.getUsuario();
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    if (!this.usuario) return;
    const id = this.usuario.id;
    const hoje = new Date().toISOString().split('T')[0];

    // Amanhã
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const amanhaStr = amanha.toISOString().split('T')[0];

    const todas = this.consultaService.listarPorMedico(id);

    this.consultasHoje = todas
      .filter(c => c.data === hoje && c.status !== 'cancelada')
      .sort((a, b) => a.horario.localeCompare(b.horario));

    this.consultasAmanha = todas
      .filter(c => c.data === amanhaStr && c.status === 'agendada')
      .sort((a, b) => a.horario.localeCompare(b.horario));

    this.todoHistorico = todas
      .filter(c => c.data < hoje || c.status === 'cancelada' || c.status === 'realizada')
      .sort((a, b) => b.data.localeCompare(a.data)); // mais recente primeiro

    this.listaHistorico = [...this.todoHistorico];
  }

  setAba(aba: AbaAtiva) {
    this.abaAtiva = aba;
    this.textoBusca = '';
    this.listaHistorico = [...this.todoHistorico];
  }

  filtrar() {
    const q = this.textoBusca.toLowerCase().trim();
    if (!q) {
      this.listaHistorico = [...this.todoHistorico];
      return;
    }
    this.listaHistorico = this.todoHistorico.filter(c =>
      c.paciente.nome.toLowerCase().includes(q)
    );
  }

  statusIcon(status: StatusConsulta): string {
    const map: Record<StatusConsulta, string> = {
      agendada:     'checkmark-circle-outline',
      em_andamento: 'time-sharp',
      realizada:    'checkmark-circle-outline',
      cancelada:    'close-circle-outline'
    };
    return map[status] ?? 'calendar-outline';
  }

  get dataHojeFormatada(): string {
    return this.formatarDataLonga(new Date().toISOString().split('T')[0]);
  }

  get dataAmanhaFormatada(): string {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    return this.formatarDataLonga(amanha.toISOString().split('T')[0]).toUpperCase();
  }

  formatarDataLonga(data: string): string {
    if (!data) return '';
    const [y, m, d] = data.split('-');
    const meses = [
      'janeiro','fevereiro','março','abril','maio','junho',
      'julho','agosto','setembro','outubro','novembro','dezembro'
    ];
    return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
  }

  verAmanha() {
    // Futuramente pode abrir uma view filtrada por amanhã
    // Por ora apenas muda para a aba de hoje mostrando os de amanhã
  }
}