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
  notificationsOutline, searchOutline, filterOutline,
  personOutline, chatbubbleOutline, chevronForwardOutline, peopleOutline
} from 'ionicons/icons';
import { ConsultaModel, StatusConsulta } from 'src/app/model/consulta.model';
import { ConsultaService } from 'src/app/services/consulta.service';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioModel } from 'src/app/model/usuario.model';

type AbaAtiva = 'todos' | 'hoje' | 'proximos';

@Component({
  selector: 'app-pacientes-medico',
  templateUrl: './pacientes-medico.page.html',
  styleUrls: ['./pacientes-medico.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonButtons
  ]
})
export class PacientesMedicoPage implements OnInit {

  usuario: UsuarioModel | null = null;
  abaAtiva: AbaAtiva = 'todos';
  textoBusca = '';

  private todasConsultas: ConsultaModel[] = [];
  listaFiltrada: ConsultaModel[] = [];

  constructor(
    private loginService: LoginService,
    private consultaService: ConsultaService,
    private navCtrl: NavController
  ) {
    addIcons({
      notificationsOutline, searchOutline, filterOutline,
      personOutline, chatbubbleOutline, chevronForwardOutline, peopleOutline
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
    this.todasConsultas = this.consultaService.listarPorMedico(this.usuario.id);
    this.aplicarFiltro();
  }

  setAba(aba: AbaAtiva) {
    this.abaAtiva = aba;
    this.textoBusca = '';
    this.aplicarFiltro();
  }

  filtrar() {
    this.aplicarFiltro();
  }

  private aplicarFiltro() {
    const hoje = new Date().toISOString().split('T')[0];
    let lista = this.todasConsultas;

    if (this.abaAtiva === 'hoje') {
      lista = lista.filter(c => c.data === hoje && c.status !== 'cancelada');
    } else if (this.abaAtiva === 'proximos') {
      lista = lista.filter(c => c.data > hoje && c.status === 'agendada');
    }

    if (this.textoBusca.trim()) {
      const q = this.textoBusca.toLowerCase();
      lista = lista.filter(c =>
        c.paciente.nome.toLowerCase().includes(q) ||
        c.especialidade.toLowerCase().includes(q)
      );
    }

    // Ordena por data e horário
    lista = lista.sort((a, b) => {
      const dataComp = a.data.localeCompare(b.data);
      return dataComp !== 0 ? dataComp : a.horario.localeCompare(b.horario);
    });

    this.listaFiltrada = lista;
  }

  formatarData(data: string): string {
    if (!data) return '';
    const [, m, d] = data.split('-');
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${d} de ${meses[parseInt(m) - 1]}`;
  }

  get dataHojeFormatada(): string {
    return this.formatarData(new Date().toISOString().split('T')[0]);
  }

  statusLabel(status: StatusConsulta): string {
    const map: Record<StatusConsulta, string> = {
      agendada:     'Agendada',
      em_andamento: 'Em andamento',
      realizada:    'Realizada',
      cancelada:    'Cancelada'
    };
    return map[status] ?? status;
  }

  verDetalhes(consulta: ConsultaModel) {
    this.navCtrl.navigateForward('/consultas', {
      state: { consultaId: consulta.id }
    });
  }
}