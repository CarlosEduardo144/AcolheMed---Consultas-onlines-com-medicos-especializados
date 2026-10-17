import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { IonIcon, IonButton, IonContent, IonHeader, IonTabBar, IonTabButton, IonTitle, IonToolbar, IonLabel, IonButtons, IonAvatar } from '@ionic/angular/standalone';
import { MedicoModel } from 'src/app/model/medico.model';
import { PacienteModel } from 'src/app/model/paciente.model';
import { EspecialidadeService } from 'src/app/services/especialidade.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CommonModule } from '@angular/common'; // 1. Importe o módulo
import { forkJoin } from 'rxjs';
import { ConsultaService } from 'src/app/services/consulta-service';
import { ConsultaResponseModel } from 'src/app/model/consulta-response';
import { TokenService } from 'src/app/services/token-service';
import { TokenModel } from 'src/app/model/token-model';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonIcon, RouterModule, CommonModule, IonHeader, IonHeader, IonTabBar, IonTabButton, IonToolbar, IonButtons, IonContent, IonAvatar, IonLabel, IonTitle, IonButton
  ],
})
export class InicioPage implements OnInit {

  medicosDisponiveis: number;
  especialidadesDisponiveis: number;
  usuario!: PacienteModel | MedicoModel;
  consultaEmAndamento: ConsultaResponseModel;
  carregandoInicial = true;
  qtdConsultas: number;
  qtdPacientesAtendidos: number;
  token: TokenModel;

  constructor(
    private navCtrl: NavController,
    private usuarioService: UsuarioService,
    private especialidadeService: EspecialidadeService,
    private toastController: ToastController,
    private consultaService: ConsultaService,
    private tokenService: TokenService
  ) {
    this.medicosDisponiveis = 0;
    this.qtdConsultas = 0;
    this.qtdPacientesAtendidos = 0;
    this.especialidadesDisponiveis = 0;
    this.consultaEmAndamento = new ConsultaResponseModel();
    this.token = new TokenModel();
  }

  ngOnInit() {
    this.carregarDadosIniciais();
  }

  ionViewWillEnter() {
    if (!this.carregandoInicial && this.token.id) {
      this.carregarUsuario(false);
    }
  }

  carregarDadosIniciais() {
    this.carregandoInicial = true;
    this.token = this.tokenService.extrair();
    if (!this.token.id) {
      this.exibirMensagem('Erro ao identificar usuário.');
      return;
    }

    forkJoin({
      usuario: this.usuarioService.buscarPorId(this.token.id),
      medicos: this.usuarioService.getMedicos(),
      especialidades: this.especialidadeService.listar(),
    }).subscribe({
      next: ({ usuario, medicos, especialidades }) => {
        if (!usuario) {
          this.navCtrl.navigateBack('/login');
          return;
        }

        this.usuario = usuario;
        this.medicosDisponiveis = medicos.length;
        this.especialidadesDisponiveis = especialidades.length;
        this.carregarConsultasEmAndamento();
        this.carregarQtdPacientesAtendidos();
        if (usuario.tipoUsuario == "medico") {
          this.carregarAgenda();
        }
        this.carregandoInicial = false;
      },
      error: (erro) => {
        this.carregandoInicial = false;
        this.exibirMensagem(erro.error?.message || 'Erro ao carregar informações iniciais.');
      }
    });
  }


  carregarQtdPacientesAtendidos() {
    this.consultaService.getConsultas(this.token.id).subscribe({
      next: (resultado) => {
        this.qtdPacientesAtendidos = resultado.filter(
          consulta => consulta.status === 'finalizada'
        ).length;
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao carregar consultas do médico');
      }
    });
  }

  carregarAgenda() {
    this.consultaService.getAgendaDoMedico(this.token.id).subscribe({
      next: (resultado) => {
        this.qtdConsultas = resultado.length;
      },
      error: (erro) => {
        this.exibirMensagem("Erro ao carrgar informações da agenda do médico");
      }
    });
  }

  carregarConsultasEmAndamento() {
    this.consultaService.buscarConsultasEmAndamento(this.token.id).subscribe({
      next: (resultado) => {
        this.consultaEmAndamento = resultado;
      },
      error: () => {
      }
    });
  }

  carregarUsuario(exibirCarregamento = true) {
    if (exibirCarregamento) {
      this.carregandoInicial = true;
    }
    this.usuarioService.buscarPorId(this.token.id).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        if (exibirCarregamento) {
          this.carregandoInicial = false;
        }
      },
      error: (erro) => {
        console.error(erro);
        if (exibirCarregamento) {
          this.carregandoInicial = false;
        }
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  navigate(path: string) {
    this.navCtrl.navigateForward(path);
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

  abrirNotificacoes() {
    this.navCtrl.navigateForward("/notificacoes");
  }

  abrirChat() {
    // navegação para o chat da consulta em andamento
  }

  iniciarChamada(consulta: ConsultaResponseModel) {
    this.consultaService.definirConsultaEmAndamento(consulta.id).subscribe({
      next: () => {
      },
      error: (erro) => {
        console.log(erro);
      }
    });
    window.open(consulta.linkConsulta, '_system');
  }
}
