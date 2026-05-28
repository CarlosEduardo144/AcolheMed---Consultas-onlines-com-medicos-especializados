import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, PickerController, ToastController, IonFooter, IonButton, IonButtons, IonIcon, IonBackButton, IonToggle } from '@ionic/angular/standalone';

export interface TimeSlot {
  period: 'manhã' | 'tarde';
  startHour: number; // 0–23, minutos sempre :00
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
  standalone: true
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
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonIcon, IonFooter, IonButton, IonButtons, IonBackButton, IonToggle, HourDisplayPipe]
})
export class AlterarHorarioPage implements OnInit {

 days: DaySchedule[] = [
    { id: 'seg', label: 'Segunda-feira', enabled: true,  slots: this.defaultSlots() },
    { id: 'ter', label: 'Terça-feira',   enabled: true,  slots: this.defaultSlots() },
    { id: 'qua', label: 'Quarta-feira',  enabled: true,  slots: this.defaultSlots() },
    { id: 'qui', label: 'Quinta-feira',  enabled: true,  slots: this.defaultSlots() },
    { id: 'sex', label: 'Sexta-feira',   enabled: true,  slots: this.defaultSlots() },
    { id: 'sab', label: 'Sábado',        enabled: true,  slots: this.defaultSlots() },
    { id: 'dom', label: 'Domingo',       enabled: false, slots: this.defaultSlots() },
  ];
 
  ngOnInit() {
      
  }

  constructor(
    private pickerCtrl: PickerController,
    private toastCtrl: ToastController,
  ) {}
 
  // ── Helpers ─────────────────────────────────────────────────────────────────
 
  private defaultSlots(): TimeSlot[] {
    return [
      { period: 'manhã', startHour: 9,  endHour: 12 },
      { period: 'tarde', startHour: 13, endHour: 17 },
    ];
  }
 
  /** Gera as opções de hora (00h – 23h) para o Picker */
  private hourOptions() {
    return Array.from({ length: 24 }, (_, i) => ({
      text: `${String(i).padStart(2, '0')}:00`,
      value: i,
    }));
  }
 
  // ── Picker de hora ───────────────────────────────────────────────────────────
 
  async openHourPicker(
    day: DaySchedule,
    slot: TimeSlot,
    field: 'start' | 'end',
  ) {
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
              // Início não pode ser igual ou posterior ao fim
              if (selected >= slot.endHour) {
                this.showToast('O início deve ser anterior ao término.', 'warning');
                return false;
              }
              slot.startHour = selected;
            } else {
              // Fim não pode ser igual ou anterior ao início
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
 
  // ── Salvar ───────────────────────────────────────────────────────────────────
 
  async salvar() {
    // Aqui você pode chamar seu service para persistir os dados.
    // Ex.: await this.horariosService.save(this.days);
    console.log('Horários salvos:', this.days);
    await this.showToast('Horários salvos com sucesso!', 'success');
  }
 
  // ── Toast ────────────────────────────────────────────────────────────────────
 
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
 
