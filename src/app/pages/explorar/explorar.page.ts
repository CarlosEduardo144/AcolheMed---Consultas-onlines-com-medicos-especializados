import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonButton, IonButtons } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { EspecialidadeModel } from 'src/app/model/especialidade.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { MedicoModel } from 'src/app/model/medico.model';

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

  ngOnit() { }



  constructor(private navCtrl: NavController, private usuarioService: UsuarioService, private especialidadeService: EspecialidadeService) {
    this.especialidades = especialidadeService.listar();
    this.medicos = usuarioService.getMedicos();
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

  verMedico(medico: any) {
    this.navCtrl.navigateForward(`/medicos/${medico.id}`);
  }

  verEspecialidade(esp: any) {
    this.navCtrl.navigateForward(`/especialidades/${esp.nome.toLowerCase()}`);
  }
}