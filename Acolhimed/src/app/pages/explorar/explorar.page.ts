import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonButton, IonButtons } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { EspecialidadeModel } from 'src/app/model/especialidade.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { MedicoModel } from 'src/app/model/medico.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-explorar',
  templateUrl: './explorar.page.html',
  styleUrls: ['./explorar.page.scss'],
  standalone: true,
  imports: [IonContent, RouterModule, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonButtons]
})
export class ExplorarPage {

  medicos: MedicoModel[];
  especialidades: EspecialidadeModel[];
  textoBusca: string = '';
  especialidadesFiltradas: EspecialidadeModel[] = [];



  constructor(private toastController: ToastController, private navCtrl: NavController, private usuarioService: UsuarioService, private especialidadeService: EspecialidadeService) {
    this.medicos = [];
    this.especialidades = [];
    this.especialidadeService.listar().subscribe({
      next: (especialidades) => {
        this.especialidades = especialidades;
      },
      error: (erro) => {
        this.exibirMensagem(erro.error.message);
      }
    });
    this.usuarioService.getMedicos().subscribe({
      next: (medicos) => {
        this.medicos = medicos;
      },
      error: (erro) => {
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  ngOnInit() { }

  filtrarEspecialidades() {
    if (!this.textoBusca.trim()) {
      this.especialidadesFiltradas = this.especialidades;
      return;
    }
    this.especialidadesFiltradas =
      this.especialidades.filter(especialidade =>

        especialidade.nome
          .toLowerCase()
          .includes(this.textoBusca.toLowerCase())

      );
  }

  openFiltros() {
    this.navCtrl.navigateForward('/filtros');
  }

  verMedico(medico: MedicoModel) {
    this.navCtrl.navigateForward(`/medicos/${medico.usuario.id || medico.usuario.id}`);
  }

  verEspecialidade(esp: any) {
    this.navCtrl.navigateForward(`/especialidades/${esp.nome.toLowerCase()}`);
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }
}
