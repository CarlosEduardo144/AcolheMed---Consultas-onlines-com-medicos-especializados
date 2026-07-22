import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, ToastController } from '@ionic/angular/standalone';
import { HorarioModel } from 'src/app/model/horario.model';
import { HorarioService } from 'src/app/services/horario.service';
import { LoginService } from 'src/app/services/login.service';

export type Periodo = 'manha' | 'tarde' | 'noite';

@Component({
  selector: 'app-add-horario',
  templateUrl: './add-horario.page.html',
  styleUrls: ['./add-horario.page.scss'],
  standalone: true,
  imports: [RouterModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})

export class AddHorarioPage implements OnInit {

  infoExpandido = false;

  constructor(private horarioService: HorarioService,
    private loginService: LoginService,
    private toastController: ToastController) {
  }

  diasSemana: HorarioModel[] = [
    { id: '1', dia: 'segunda', manha: false, tarde: false, noite: false, expandido: false },
    { id: '2', dia: 'terca', manha: false, tarde: false, noite: false, expandido: false },
    { id: '3', dia: 'quarta', manha: false, tarde: false, noite: false, expandido: false },
    { id: '4', dia: 'quinta', manha: false, tarde: false, noite: false, expandido: false },
    { id: '5', dia: 'sexta', manha: false, tarde: false, noite: false, expandido: false },
    { id: '6', dia: 'sabado', manha: false, tarde: false, noite: false, expandido: false },
    { id: '7', dia: 'domingo', manha: false, tarde: false, noite: false, expandido: false }
  ];

  ngOnInit() {
    this.carregarHorarios();
  }

  carregarHorarios() {
    this.horarioService.buscarPorMedico(this.loginService.getUsuario()).subscribe({
      next: (horarios) => {
        horarios.forEach(horario => {
          const dia = this.diasSemana.find(d => d.dia === horario.dia);
          if (dia) {
            dia.manha = horario.manha;
            dia.tarde = horario.tarde;
            dia.noite = horario.noite;
          }
        });
      },
      error: (erro) => {
        console.error(erro);
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  limparDia(dia: HorarioModel, event: Event) {
    event.stopPropagation();
    dia.manha = false;
    dia.tarde = false;
    dia.noite = false;
  }

  copiarParaTodos(diaOrigem: HorarioModel, event: Event) {
    event.stopPropagation();
    this.diasSemana.forEach(dia => {
      if (dia.id && diaOrigem.dia && dia.id !== diaOrigem.id) {
        dia.manha = diaOrigem.manha;
        dia.tarde = diaOrigem.tarde;
        dia.noite = diaOrigem.noite;
      }
    });
  }

  toggleExpandido(dia: HorarioModel) {
    dia.expandido = !dia.expandido;
  }

  toggleInfoExpandido() {
    this.infoExpandido = !this.infoExpandido;
  }

  togglePeriodo(dia: HorarioModel, periodo: Periodo, event: Event) {
    event.stopPropagation();
    dia[periodo] = !dia[periodo];
  }

  resumoDia(dia: HorarioModel): string {
    const partes: string[] = [];
    if (dia.manha) partes.push('Manhã');
    if (dia.tarde) partes.push('Tarde');
    if (dia.noite) partes.push('Noite');
    return partes.length > 0 ? partes.join(' · ') : 'Nenhum período selecionado';
  }

  diaConfigurado(dia: HorarioModel): boolean {
    return dia.manha || dia.tarde || dia.noite;
  }

  get totalDiasConfigurados(): number {
    return this.diasSemana.filter(d => this.diaConfigurado(d)).length;
  }

  get labelDiasConfigurados(): string {
    const total = this.totalDiasConfigurados;
    return total === 1 ? '1 dia configurado' : `${total} dias configurados`;
  }

  salvarHorario() {
    const horario = {
      medicoId: this.loginService.getUsuario(),
      horarios: this.diasSemana
    };

    this.horarioService.salvar(horario).subscribe({
      next: () => {
        this.exibirMensagem("Horários salvos com sucesso!")
      },
      error: (erro) => {
        console.error(erro);
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500,
    });
    toast.present();
  }
}
