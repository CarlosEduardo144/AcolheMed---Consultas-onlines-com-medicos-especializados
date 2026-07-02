import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  NavController, ToastController,
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonButtons, IonBackButton, IonIcon, IonTextarea, IonDatetime
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

interface DiaOpcao { data: Date; label: string; diaSemana: string; }
interface SlotOpcao { horario: string; periodo: 'manhã' | 'tarde'; }

const DIA_MAP: { [key: number]: string } = {
  0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sab'
};

const NOMES_DIA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const NOMES_MES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

@Component({
  selector: 'app-agendar-consulta',
  templateUrl: './agendar-consulta.page.html',
  styleUrls: ['./agendar-consulta.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonButtons, IonBackButton, IonIcon, IonTextarea, IonDatetime
  ]
})
export class AgendarConsultaPage implements OnInit {

  medico: MedicoModel | null = null;
  diaSelecionado: DiaOpcao | null = null;
  slots: SlotOpcao[] = [];
  slotSelecionado: SlotOpcao | null = null;
  observacoes = '';
  confirmando = false;

  // Limites do calendário: amanhã até 90 dias à frente
  readonly minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() );
    return d.toISOString().split('T')[0];
  })();

  readonly maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  })();

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

  ngOnInit() {}

  // Função passada ao ion-datetime para desabilitar dias que o médico não trabalha.
  // Precisa ser arrow function para manter o contexto de 'this'.
  isDiaDisponivel = (dateString: string): boolean => {
    const horarios = this.medico?.horario ?? [];
    const agendaConfigurada = this.medico?.horariosConfigurados || horarios.length > 0;

    // Se a agenda não foi configurada, todos os dias ficam habilitados
    if (!agendaConfigurada) return true;

    const diaSemana = DIA_MAP[new Date(dateString).getUTCDay()];
    const diasTrabalho = new Set(horarios.map(h => h.diaSemana));
    return diasTrabalho.has(diaSemana);
  };

  onDataChange(event: CustomEvent) {
    const dateString = event.detail.value as string;
    if (!dateString) return;

    // ion-datetime retorna ISO string; usamos UTC para evitar problemas de fuso
    const data = new Date(dateString);
    const diaSemana = DIA_MAP[data.getUTCDay()];

    this.diaSelecionado = {
      data,
      label: `${NOMES_DIA[data.getUTCDay()]}, ${data.getUTCDate()} ${NOMES_MES[data.getUTCMonth()]}`,
      diaSemana
    };
    this.slotSelecionado = null;
    this.gerarSlots(diaSemana);
  }

  gerarSlots(diaSemana: string) {
    this.slots = [];
    const horarios = this.medico?.horario?.filter(h => h.diaSemana === diaSemana) ?? [];
    const agendaConfigurada = this.medico?.horariosConfigurados || !!this.medico?.horario?.length;

    if (horarios.length === 0) {
      if (agendaConfigurada) return;
      // Padrão se o médico ainda não configurou
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
    if (!usuario) {
      this.confirmando = false;
      return;
    }
    const paciente = this.loginService.getUsuarioBase(usuario);
    if (!paciente) {
      this.confirmando = false;
      return;
    }
    consulta.paciente = paciente;
    consulta.data = this.diaSelecionado!.data.toISOString().split('T')[0];
    consulta.horario = this.slotSelecionado!.horario;
    //consulta.especialidade = this.medico.especialidade?.nome ?? '';
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
