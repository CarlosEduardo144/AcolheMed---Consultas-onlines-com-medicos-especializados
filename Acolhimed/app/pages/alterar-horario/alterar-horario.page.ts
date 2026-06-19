import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToggle,
  IonToolbar,
  NavController,
  PickerController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkOutline, chevronDownOutline } from 'ionicons/icons';
import { HorarioDisponivelModel } from 'src/app/model/horario-disponivel.model';
import { MedicoModel } from 'src/app/model/medico.model';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';

export interface TimeSlot {
  period: 'manhã' | 'tarde';
  enabled: boolean;
  startHour: number; // 0-23, minutos sempre :00
  endHour: number;
}

export interface DaySchedule {
  id: string;
  label: string;
  enabled: boolean;
  slots: TimeSlot[];
}

@Pipe({
  name: 'hourDisplay',
  standalone: true,
})
export class HourDisplayPipe implements PipeTransform {
  transform(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }
}

@Component({
  selector: 'app-alterar-horario',
  templateUrl: './alterar-horario.page.html',
  styleUrls: ['./alterar-horario.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonIcon,
    IonButton,
    IonButtons,
    IonBackButton,
    IonToggle,
    HourDisplayPipe,
  ],
})
export class AlterarHorarioPage implements OnInit {
  usuario: MedicoModel | null = null;

  days: DaySchedule[] = [
    { id: 'seg', label: 'Segunda-feira', enabled: true, slots: this.defaultSlots() },
    { id: 'ter', label: 'Terça-feira', enabled: true, slots: this.defaultSlots() },
    { id: 'qua', label: 'Quarta-feira', enabled: true, slots: this.defaultSlots() },
    { id: 'qui', label: 'Quinta-feira', enabled: true, slots: this.defaultSlots() },
    { id: 'sex', label: 'Sexta-feira', enabled: true, slots: this.defaultSlots() },
    { id: 'sab', label: 'Sábado', enabled: true, slots: this.defaultSlots() },
    { id: 'dom', label: 'Domingo', enabled: false, slots: this.defaultSlots() },
  ];

  constructor(
    private pickerCtrl: PickerController,
    private toastCtrl: ToastController,
    private loginService: LoginService,
    private usuarioService: UsuarioService,
    private navController: NavController,
  ) {
    addIcons({ calendarOutline, checkmarkOutline, chevronDownOutline });
  }

  ngOnInit() {
    const usuarioLogado = this.loginService.getUsuario();

    if (!usuarioLogado) {
      this.navController.navigateBack('/login');
      return;
    }

    if (usuarioLogado.tipoUsuario !== 'medico') {
      this.navController.navigateBack('/perfil');
      return;
    }

    const usuarioSalvo = this.usuarioService
      .listar()
      .find((usuario) => usuario.id === usuarioLogado.id) as MedicoModel | undefined;

    this.usuario = { ...(usuarioSalvo ?? {}), ...usuarioLogado } as MedicoModel;
    this.carregarHorarios();
  }

  private defaultSlots(): TimeSlot[] {
    return [
      { period: 'manhã', enabled: true, startHour: 9, endHour: 12 },
      { period: 'tarde', enabled: true, startHour: 13, endHour: 17 },
    ];
  }

  private carregarHorarios() {
    const horarios = this.usuario?.horario ?? [];
    const jaConfigurouHorarios = this.usuario?.horariosConfigurados || horarios.length > 0;

    if (!jaConfigurouHorarios) {
      return;
    }

    this.days = this.days.map((day) => {
      const slots = this.defaultSlots().map((slot) => {
        const horarioSalvo = horarios.find(
          (horario) => horario.diaSemana === day.id && horario.periodo === slot.period,
        );

        if (!horarioSalvo) {
          return { ...slot, enabled: false };
        }

        return {
          ...slot,
          enabled: true,
          startHour: this.getHour(horarioSalvo.horarioInicio),
          endHour: this.getHour(horarioSalvo.horarioFim),
        };
      });

      return {
        ...day,
        enabled: slots.some((slot) => slot.enabled),
        slots,
      };
    });
  }

  private getHour(value: Date | string): number {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getHours();
  }

  private hourOptions() {
    return Array.from({ length: 24 }, (_, i) => ({
      text: `${String(i).padStart(2, '0')}:00`,
      value: i,
    }));
  }

  private criarHorario(day: DaySchedule, slot: TimeSlot): HorarioDisponivelModel {
    const horario = new HorarioDisponivelModel();
    const periodoId = slot.period === 'manhã' ? 'manha' : 'tarde';

    horario.id = `${day.id}-${periodoId}`;
    horario.diaSemana = day.id;
    horario.periodo = slot.period;
    horario.horarioInicio = this.dateWithHour(slot.startHour);
    horario.horarioFim = this.dateWithHour(slot.endHour);

    return horario;
  }

  private dateWithHour(hour: number): Date {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date;
  }

  toggleDay(day: DaySchedule, enabled: boolean) {
    day.enabled = enabled;

    if (enabled && !day.slots.some((slot) => slot.enabled)) {
      day.slots.forEach((slot) => {
        slot.enabled = true;
      });
    }
  }

  toggleSlot(day: DaySchedule, slot: TimeSlot, enabled: boolean) {
    slot.enabled = enabled;

    if (enabled) {
      day.enabled = true;
      return;
    }

    if (!day.slots.some((item) => item.enabled)) {
      day.enabled = false;
    }
  }

  async openHourPicker(slot: TimeSlot, field: 'start' | 'end') {
    const currentHour = field === 'start' ? slot.startHour : slot.endHour;

    const picker = await this.pickerCtrl.create({
      columns: [
        {
          name: 'hora',
          options: this.hourOptions(),
          selectedIndex: currentHour,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: (value) => {
            const selected: number = value.hora.value;

            if (field === 'start') {
              if (selected >= slot.endHour) {
                this.showToast('O início deve ser anterior ao término.', 'warning');
                return false;
              }

              slot.startHour = selected;
            } else {
              if (selected <= slot.startHour) {
                this.showToast('O término deve ser posterior ao início.', 'warning');
                return false;
              }

              slot.endHour = selected;
            }

            return true;
          },
        },
      ],
    });

    await picker.present();
  }

  async salvar() {
    if (!this.usuario) {
      await this.showToast('Faça login como médico para alterar horários.', 'warning');
      return;
    }

    const usuarioSalvo = this.usuarioService
      .listar()
      .find((usuario) => usuario.id === this.usuario?.id) as MedicoModel | undefined;

    if (!usuarioSalvo || usuarioSalvo.tipoUsuario !== 'medico') {
      await this.showToast('Não foi possível encontrar seu cadastro médico.', 'danger');
      return;
    }

    const horarios = this.days.reduce<HorarioDisponivelModel[]>((acc, day) => {
      if (!day.enabled) {
        return acc;
      }

      day.slots
        .filter((slot) => slot.enabled)
        .forEach((slot) => acc.push(this.criarHorario(day, slot)));

      return acc;
    }, []);

    const medicoAtualizado = {
      ...usuarioSalvo,
      ...this.usuario,
      horario: horarios,
      horariosConfigurados: true,
    } as MedicoModel;

    this.usuarioService.salvar(medicoAtualizado);
    this.loginService.setUsuario(medicoAtualizado);
    this.usuario = medicoAtualizado;

    await this.showToast('Horários salvos com sucesso!', 'success');
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2400,
      color,
      position: 'bottom',
      cssClass: 'custom-toast',
    });
    await toast.present();
  }
}
