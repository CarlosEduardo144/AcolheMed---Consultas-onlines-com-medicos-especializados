import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonBadge, AlertController, ToastController, IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, searchOutline, filterOutline,
  chatbubbleOutline, callOutline, closeCircleOutline,
  chevronForwardOutline, calendarOutline, timeOutline
} from 'ionicons/icons';
import { ConsultaModel } from 'src/app/model/consulta.model';
import { ConsultaService } from 'src/app/services/consulta.service';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioModel } from 'src/app/model/usuario.model';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonBadge, IonButtons
  ]
})
export class ConsultasPage implements OnInit {

  usuario: UsuarioModel | null = null;
  abaAtiva: 'proximas' | 'historico' = 'proximas';
  textoBusca = '';

  consultasHoje: ConsultaModel[] = [];
  consultasProximas: ConsultaModel[] = [];
  consultasHistorico: ConsultaModel[] = [];

  constructor(
    private consultaService: ConsultaService,
    private loginService: LoginService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      notificationsOutline, searchOutline, filterOutline,
      chatbubbleOutline, callOutline, closeCircleOutline,
      chevronForwardOutline, calendarOutline, timeOutline
    });
  }

  ngOnInit() {
    this.usuario = this.loginService.getUsuario();
    this.carregarConsultas();
  }

  ionViewWillEnter() {
    this.carregarConsultas();
  }

  carregarConsultas() {
    if (!this.usuario) return;
    const tipo = this.usuario.tipoUsuario as 'paciente' | 'medico';
    const id = this.usuario.id;

    this.consultasHoje = this.consultaService.hoje(id, tipo);
    this.consultasProximas = this.consultaService.proximas(id, tipo);
    this.consultasHistorico = this.consultaService.historico(id, tipo);
  }

  setAba(aba: 'proximas' | 'historico') {
    this.abaAtiva = aba;
    this.textoBusca = '';
  }

  get listaBusca(): ConsultaModel[] {
    const base = this.abaAtiva === 'proximas'
      ? [...this.consultasHoje, ...this.consultasProximas]
      : this.consultasHistorico;

    if (!this.textoBusca.trim()) return base;

    const q = this.textoBusca.toLowerCase();
    return base.filter(c =>
      c.medico.nome.toLowerCase().includes(q) ||
      c.paciente.nome.toLowerCase().includes(q) ||
      c.especialidade.toLowerCase().includes(q)
    );
  }

  isHoje(data: string): boolean {
    return data === new Date().toISOString().split('T')[0];
  }

  formatarData(data: string): string {
    if (!data) return '';
    const [y, m, d] = data.split('-');
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${d} de ${meses[parseInt(m) - 1]}`;
  }

  nomeExibido(c: ConsultaModel): string {
    return this.usuario?.tipoUsuario === 'medico' ? c.paciente.nome : c.medico.nome;
  }

  subExibido(c: ConsultaModel): string {
    const hora = c.horario + ' h';
    const esp = c.especialidade || c.medico.especialidade?.nome || '';
    return this.usuario?.tipoUsuario === 'medico'
      ? hora
      : `${hora} • ${esp}`;
  }

  async cancelar(consulta: ConsultaModel) {
    const alert = await this.alertController.create({
      header: 'Cancelar consulta',
      message: `Deseja cancelar a consulta com ${this.nomeExibido(consulta)} em ${this.formatarData(consulta.data)}?`,
      buttons: [
        { text: 'Não', role: 'cancel' },
        {
          text: 'Sim, cancelar',
          role: 'destructive',
          handler: () => {
            this.consultaService.cancelar(consulta.id);
            this.carregarConsultas();
            this.mostrarToast('Consulta cancelada.');
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastController.create({ message: msg, duration: 1800 });
    toast.present();
  }
}