import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  NavController, ToastController,
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonButtons, IonBackButton, IonIcon, IonTextarea
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, timeOutline, personOutline,
  checkmarkCircleOutline, chevronBackOutline, sunnyOutline, moonOutline
} from 'ionicons/icons';
import { MedicoModel } from 'src/app/model/medico.model';
import { ConsultaModel } from 'src/app/model/consulta.model';
import { ConsultaService } from 'src/app/services/consulta.service';
import { LoginService } from 'src/app/services/login.service';
import { PacienteModel } from 'src/app/model/paciente.model';

interface DiaOpcao { data: Date; label: string; diaSemana: string; }
interface SlotOpcao { horario: string; periodo: 'manhã' | 'tarde'; }

const DIA_MAP: { [key: number]: string } = {
  0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sab'
};

@Component({
  selector: 'app-agendar-consulta',
  templateUrl: './agendar-consulta.page.html',
  styleUrls: ['./agendar-consulta.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonButtons, IonBackButton, IonIcon, IonTextarea
  ]
})
export class AgendarConsultaPage implements OnInit {

  medico: MedicoModel | null = null;
  dias: DiaOpcao[] = [];
  diaSelecionado: DiaOpcao | null = null;
  slots: SlotOpcao[] = [];
  slotSelecionado: SlotOpcao | null = null;
  observacoes = '';
  confirmando = false;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private toastController: ToastController,
    private consultaService: ConsultaService,
    private loginService: LoginService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.medico = nav?.extras?.state?.['medico'] ?? null;
    addIcons({
      calendarOutline, timeOutline, personOutline,
      checkmarkCircleOutline, chevronBackOutline, sunnyOutline, moonOutline
    });
  }

  ngOnInit() {
    this.gerarDias();
  }

  gerarDias() {
    const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 14; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const diaSemana = DIA_MAP[data.getDay()];
      this.dias.push({
        data,
        label: `${nomes[data.getDay()]}, ${data.getDate()} ${meses[data.getMonth()]}`,
        diaSemana
      });
    }
  }

  selecionarDia(dia: DiaOpcao) {
    this.diaSelecionado = dia;
    this.slotSelecionado = null;
    this.gerarSlots(dia.diaSemana);
  }

  gerarSlots(diaSemana: string) {
    this.slots = [];
    const horarios = this.medico?.horario?.filter(h => h.diaSemana === diaSemana) ?? [];

    if (horarios.length === 0) {
      // padrão se o médico não configurou
      this.slots = this.slotsDoIntervalo(9, 12, 'manhã')
        .concat(this.slotsDoIntervalo(13, 17, 'tarde'));
      return;
    }

    for (const h of horarios) {
      const inicio = new Date(h.horarioInicio).getHours();
      const fim = new Date(h.horarioFim).getHours();
      const periodo = h.periodo as 'manhã' | 'tarde';
      this.slots.push(...this.slotsDoIntervalo(inicio, fim, periodo));
    }
  }

  slotsDoIntervalo(inicio: number, fim: number, periodo: 'manhã' | 'tarde'): SlotOpcao[] {
    const result: SlotOpcao[] = [];
    for (let h = inicio; h < fim; h++) {
      result.push({ horario: `${String(h).padStart(2, '0')}:00`, periodo });
    }
    return result;
  }

  get slotsManha(): SlotOpcao[] {
    return this.slots.filter(s => s.periodo === 'manhã');
  }

  get slotsTarde(): SlotOpcao[] {
    return this.slots.filter(s => s.periodo === 'tarde');
  }

  selecionarSlot(slot: SlotOpcao) {
    this.slotSelecionado = slot;
  }

  podeConcluir(): boolean {
    return !!this.diaSelecionado && !!this.slotSelecionado;
  }

  async confirmar() {
    if (!this.podeConcluir() || !this.medico) return;
    this.confirmando = true;

    const usuario = this.loginService.getUsuario();
    const consulta = new ConsultaModel();
    consulta.medico = this.medico;
    consulta.paciente = usuario as PacienteModel;
    consulta.data = this.diaSelecionado!.data.toISOString().split('T')[0];
    consulta.horario = this.slotSelecionado!.horario;
    consulta.especialidade = this.medico.especialidade?.nome ?? '';
    consulta.observacoes = this.observacoes;

    this.consultaService.agendar(consulta);

    const toast = await this.toastController.create({
      message: '✅ Consulta agendada com sucesso!',
      duration: 2200,
      color: 'success',
      position: 'bottom'
    });
    toast.present();

    this.confirmando = false;
    this.navCtrl.navigateRoot('/consultas');
  }
}