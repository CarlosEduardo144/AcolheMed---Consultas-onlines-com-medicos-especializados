import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonLabel, IonBackButton, IonList, IonCheckbox, IonSpinner, IonIcon, IonButtons, IonAvatar, IonItem, IonFooter, ToastController } from '@ionic/angular/standalone';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { EspecialidadeModel } from 'src/app/model/especialidade.model';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-add-especialidade',
  templateUrl: './add-especialidade.page.html',
  styleUrls: ['./add-especialidade.page.scss'],
  standalone: true,
  imports: [RouterModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonLabel, IonButton, IonBackButton, IonList, IonSpinner, IonIcon, IonCheckbox, IonButtons, IonAvatar, IonItem, IonFooter]
})
export class AddEspecialidadePage implements OnInit {

  especialidades: EspecialidadeModel[];
  selecionadas = new Set<string>();
  carregando = true;

  constructor(
    private especialidadeService: EspecialidadeService,
    private toastController: ToastController,
    private loginService: LoginService
  ) {
    addIcons({ closeOutline });
    this.especialidades = [];
  }

  ngOnInit() {
    this.carregarEspecialidades();
    this.getMedicoEspecialidades(this.loginService.getUsuario());
  }

  carregarEspecialidades() {
    this.carregando = true;
    this.especialidadeService.listar().subscribe({
      next: (dados) => {
        this.especialidades = dados;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  getMedicoEspecialidades(medicoId: string) {
    this.carregando = true;
    this.especialidadeService.getMedicoEspecialidades(medicoId).subscribe({
      next: (dados) => {
        //como getMedicoEspecialidades() retorna EspecialidadeModel, faz a conversao para um vetor de IDs
        this.selecionadas = new Set(
          dados.map(e => e.id)
        );
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  toggleSelecao(id: string) {
    if (this.selecionadas.has(id)) {
      this.selecionadas.delete(id);
    } else {
      this.selecionadas.add(id);
    }
  }

  isSelecionada(id: string): boolean {
    return this.selecionadas.has(id);
  }

  salvar() {

    if (this.selecionadas.size === 0) {
      this.exibirMensagem("Selecione ao menos 1 especialidade");
      return;
    }

    const credenciais = {
      idsSelecionados: Array.from(this.selecionadas),
      medicoId: this.loginService.getUsuario()
    };

    this.especialidadeService.salvar(credenciais).subscribe({
      next: () => {
        this.exibirMensagem("Especialidades atualizadas com sucesso!");
      },
      error: (err) => {
        console.error('Erro ao salvar especialidades', err);
      }
    });

  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }
}
