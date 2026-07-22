import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonTextarea, IonButton,IonCardHeader, IonCardTitle, IonItem, IonSpinner, IonCardSubtitle, IonButtons, IonCard, IonCardContent, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { EspecialidadeModel } from 'src/app/model/especialidade.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { MedicoModel } from 'src/app/model/medico.model';
import { ToastController } from '@ionic/angular';
import { arrowForwardOutline, hardwareChipOutline, medkitOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-explorar',
  templateUrl: './explorar.page.html',
  styleUrls: ['./explorar.page.scss'],
  standalone: true,
  imports: [IonContent, RouterModule, IonHeader, IonTitle, IonToolbar, IonTextarea, CommonModule, FormsModule, IonCardTitle, IonItem, IonSpinner, IonCardSubtitle, IonCardHeader, IonButton, IonButtons, IonCard, IonCardContent, IonIcon, IonLabel]
})
export class ExplorarPage {

  medicos: MedicoModel[];
  especialidades: EspecialidadeModel[];
  textoBusca: string = '';
  especialidadesFiltradas: EspecialidadeModel[] = [];
  sintomasDigitados: string = '';
  carregandoTriagem: boolean = false;
  resultadoTriagem: any = null;

  dicasSaude = [
  {
    icone: 'alimentacao',
    imagemUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200',
    titulo: 'Alimentação balanceada',
    descricao: 'Inclua frutas, legumes e água na rotina para mais energia.'
  },
  {
    icone: 'sono',
    imagemUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200',
    titulo: 'Durma bem',
    descricao: '7 a 8 horas de sono fortalecem a imunidade e a mente.'
  },
  {
    icone: 'coracao',
    imagemUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200',
    titulo: 'Cuide do coração',
    descricao: 'Exercícios leves diários reduzem riscos cardiovasculares.'
  }
];


  constructor(private toastController: ToastController, private navCtrl: NavController, private usuarioService: UsuarioService, private especialidadeService: EspecialidadeService) {
    this.medicos = [];
    this.especialidades = [];
    addIcons({ hardwareChipOutline, medkitOutline, arrowForwardOutline });

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

  enviarTriagem() {
    this.carregandoTriagem = true;
    this.resultadoTriagem = null;

    // Simula uma chamada de rede para dar o efeito visual na apresentação (Ex: 1.5 segundos)
    setTimeout(() => {
      // Aqui você trocará pelo método real do seu HTTP service:
      // this.triagemService.analisar(this.sintomasDigitados).subscribe(...)

      // MOCKUP DE RETORNO APENAS PARA DEMONSTRAR O CÓDIGO FUNCIONANDO
      this.resultadoTriagem = {
        especialidadeSugerida: 'Dermatologia',
        justificativa: 'Alterações na pele, manchas acompanhadas de coceiras ou reações cutâneas repentinas necessitam de avaliação especializada de um Dermatologista.'
      };

      this.carregandoTriagem = false;
    }, 1500);
  }

   filtrarMedicos(especialidade: string) {}

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }
}
