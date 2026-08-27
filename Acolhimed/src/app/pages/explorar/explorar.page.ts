import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonTextarea, IonButton, IonCardHeader, IonCardTitle, IonItem, IonCardSubtitle, IonButtons, IonCard, IonCardContent, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { EspecialidadeModel } from 'src/app/model/especialidade.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { MedicoModel } from 'src/app/model/medico.model';
import { ToastController } from '@ionic/angular';
import { arrowForwardOutline, hardwareChipOutline, medkitOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { LoginService } from 'src/app/services/login.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-explorar',
  templateUrl: './explorar.page.html',
  styleUrls: ['./explorar.page.scss'],
  standalone: true,
  imports: [IonContent, RouterModule, IonHeader, IonTitle, IonToolbar, IonTextarea, CommonModule, FormsModule, IonCardTitle, IonItem, IonCardSubtitle, IonCardHeader, IonButton, IonButtons, IonCard, IonCardContent, IonIcon, IonLabel]
})
export class ExplorarPage {

  medicos: MedicoModel[];
  medicosFiltrados: MedicoModel[];
  especialidades: EspecialidadeModel[];
  textoBusca: string = '';
  especialidadesFiltradas: EspecialidadeModel[] = [];
  especialidadeSelecionada?: EspecialidadeModel;
  carregandoMedicos: boolean = false;
  carregandoInicial: boolean = true;
  usuario: any;

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


  constructor(private toastController: ToastController,
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private especialidadeService: EspecialidadeService,
    private loginService: LoginService,
    private router: Router) {
    this.medicos = [];
    this.medicosFiltrados = [];
    this.especialidades = [];
    addIcons({ hardwareChipOutline, medkitOutline, arrowForwardOutline });

    forkJoin({
      usuario: this.usuarioService.buscarPorId(this.loginService.getUsuario()),
      especialidades: this.especialidadeService.listar(),
      medicos: this.usuarioService.getMedicos(),
    }).subscribe({
      next: ({ usuario, especialidades, medicos }) => {
        this.usuario = usuario;
        this.especialidades = especialidades;
        this.especialidadesFiltradas = especialidades;
        this.medicos = medicos;
        this.carregandoInicial = false;
      },
      error: (erro) => {
        this.carregandoInicial = false;
        this.exibirMensagem(erro.error?.message || 'Erro ao carregar informações iniciais.');
      }
    });
  }

  ngOnInit() { }

  get medicosComEspecialidade() {
    return this.medicos.filter(medico => medico.especialidades.length > 0);
  }

  filtrarEspecialidades() {
    const termo = this.textoBusca.trim().toLowerCase();

    if (this.especialidadeSelecionada?.nome.toLowerCase() === termo) {
      this.especialidadesFiltradas = [];
      return;
    }

    if (this.especialidadeSelecionada) {
      this.especialidadeSelecionada = undefined;
      this.medicosFiltrados = [];
    }

    if (!termo) {
      this.especialidadesFiltradas = this.especialidades;
      return;
    }

    this.especialidadesFiltradas =
      this.especialidades.filter(especialidade =>
        especialidade.nome.toLowerCase().includes(termo)
      );
  }

  selecionarEspecialidade(especialidade: EspecialidadeModel) {
    this.especialidadeSelecionada = especialidade;
    this.textoBusca = especialidade.nome;
    this.especialidadesFiltradas = [];
    this.carregandoMedicos = true;

    this.usuarioService.getMedicosPorEspecialidade(especialidade.id).subscribe({
      next: (medicos) => {
        this.medicosFiltrados = medicos;
        this.carregandoMedicos = false;
      },
      error: (erro) => {
        this.carregandoMedicos = false;
        this.exibirMensagem(erro.error?.message || 'Erro ao buscar médicos.');
      }
    });
  }

  limparEspecialidadeSelecionada() {
    this.textoBusca = '';
    this.especialidadeSelecionada = undefined;
    this.medicosFiltrados = [];
    this.especialidadesFiltradas = this.especialidades;
  }

  openFiltros() {
  }


  filtrarMedicos(especialidade: string) {
    const especialidadeEncontrada = this.especialidades.find(item => item.nome === especialidade);

    if (especialidadeEncontrada) {
      this.selecionarEspecialidade(especialidadeEncontrada);
    }
  }

  iniciais(nome?: string): string {
    if (!nome) return '';
    return nome.trim().slice(0, 2).toUpperCase();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }
}
