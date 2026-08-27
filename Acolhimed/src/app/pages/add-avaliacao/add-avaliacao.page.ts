import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, ToastController } from '@ionic/angular/standalone';
import { ConsultaResponseModel } from 'src/app/model/consulta-response';
import { ActivatedRoute } from '@angular/router';
import { ConsultaService } from 'src/app/services/consulta-service';
import { AvaliacaoModel } from 'src/app/model/avaliacao-model';
import { AvaliacaoService } from 'src/app/services/avaliacao-service';
import { ConsultaModel } from 'src/app/model/consulta.model';

const LIMITE_COMENTARIO = 400;

@Component({
  selector: 'app-add-avaliacao',
  templateUrl: './add-avaliacao.page.html',
  styleUrls: ['./add-avaliacao.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AddAvaliacaoPage implements OnInit {

  consulta: ConsultaResponseModel | null = null;
  carregando = true;

  nota = 0;
  notaHover = 0;
  comentario = '';
  limiteComentario = LIMITE_COMENTARIO;

  enviando = false;
  avaliacaoEnviada = false;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private consultaService: ConsultaService,
    private avaliacaoService: AvaliacaoService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    const consultaId = this.route.snapshot.paramMap.get('id');
    if (consultaId) {
      this.carregarConsulta(consultaId);
    }
  }

  private carregarConsulta(id: string) {
    this.carregando = true;
    this.consultaService.buscarPorId(id).subscribe({
      next: (consulta) => {
        this.consulta = consulta;
        this.carregando = false;
      },
      error: (erro) => {
        this.carregando = false;
        this.exibirMensagem(erro?.error?.message ?? 'Erro ao carregar consulta.');
      }
    });
  }

  iniciais(nome?: string): string {
    if (!nome) return '';
    return nome.trim().slice(0, 2).toUpperCase();
  }

  arrayEstrelas(): number[] {
    return [1, 2, 3, 4, 5];
  }

  selecionarNota(valor: number) {
    this.nota = valor;
  }

  definirHover(valor: number) {
    this.notaHover = valor;
  }

  limparHover() {
    this.notaHover = 0;
  }

  estrelaPreenchida(posicao: number): boolean {
    const referencia = this.notaHover || this.nota;
    return posicao <= referencia;
  }

  get podeEnviar(): boolean {
    return this.nota > 0 && !this.enviando && this.comentario != "";
  }

  enviarAvaliacao() {
    debugger
    if (!this.podeEnviar || !this.consulta) return;

    this.enviando = true;

    let avaliacao = new AvaliacaoModel();
    avaliacao.comentario = this.comentario;
    if(this.nota < 1 || this.nota > 5){
      this.exibirMensagem("A nota deve ser entre 1 e 5");
      return;
    }
    avaliacao.nota = this.nota;
    avaliacao.consultaId = this.consulta.id;

    this.avaliacaoService.salvar(avaliacao).subscribe({
      next: (avaliacao) => {
        this.carregando = false;
        this.exibirMensagem("Avaliação salva com sucesso!");
      },
      error: (erro) => {
        console.error(erro);
        this.carregando = false;
        this.exibirMensagem(erro?.error?.message ?? 'Erro ao salvar avaliação');
      }
    });
  }

  voltar() {
    this.navCtrl.navigateBack('/consultas');
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }

}
