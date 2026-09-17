import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { AvaliacaoModel } from 'src/app/model/avaliacao-model';
import { AvaliacaoService } from 'src/app/services/avaliacao-service';
import { ActivatedRoute } from '@angular/router';
import { MedicoModel } from 'src/app/model/medico.model';
import { UsuarioService } from 'src/app/services/usuario.service';

type FiltroNota = 'todas' | 5 | 4 | 3 | 2 | 1;
type FiltroOrdenacao = 'recentes' | 'antigas';

@Component({
  selector: 'app-avaliacoes',
  templateUrl: './avaliacoes.page.html',
  styleUrls: ['./avaliacoes.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})


export class AvaliacoesPage implements OnInit {

  avaliacoes: AvaliacaoModel[] = [];
  carregando = true;
  medico: any;

  painelFiltroAberto = false;
  filtroNota: FiltroNota = 'todas';
  filtrosNota: FiltroNota[] = [5, 4, 3, 2, 1];
  filtroOrdenacao: FiltroOrdenacao = 'recentes';

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private avaliacaoService: AvaliacaoService,
    private usuarioService: UsuarioService
  ) {
  }

  ngOnInit() {
    const medicoId = this.route.snapshot.paramMap.get('id');
    if (medicoId) {
      this.carregarMedico(medicoId);
    }
  }

  private carregarMedico(medicoId: string) {
    this.carregando = true;
    this.usuarioService.buscarPorId(medicoId).subscribe({
      next: (medico) => {
        this.medico = medico;
        this.carregarAvaliacoes(medicoId);

      },
      error: (erro) => {
        console.error(erro);
      }
    });
  }

  private carregarAvaliacoes(medicoId: string) {
    this.avaliacaoService.getAvaliacoesMedico(medicoId).subscribe({
      next: (avaliacoes) => {
        this.avaliacoes = avaliacoes.map(a => ({
          ...a,
          data: new Date(a.data),
        }));
        this.carregando = false;
      },
      error: (erro) => {
        console.error(erro);
        this.carregando = false;
      }
    });
  }

  get totalAvaliacoes(): number {
    return this.avaliacoes.length;
  }

  get mediaGeral(): number {
    if (!this.totalAvaliacoes) return 0;
    const soma = this.avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    return soma / this.totalAvaliacoes;
  }

  get mediaGeralFormatada(): string {
    return this.mediaGeral.toFixed(1).replace('.', ',');
  }

  // ---- Filtro + ordenação aplicados na listagem ----
  get avaliacoesFiltradas(): AvaliacaoModel[] {
    let lista = [...this.avaliacoes];

    if (this.filtroNota !== 'todas') {
      lista = lista.filter(av => av.nota === this.filtroNota);
    }

    lista.sort((a, b) =>
      this.filtroOrdenacao === 'recentes'
        ? b.data.getTime() - a.data.getTime()
        : a.data.getTime() - b.data.getTime()
    );

    return lista;
  }

  get labelFiltroAtual(): string {
    const parteNota = this.filtroNota === 'todas' ? 'Todas as notas' : `${this.filtroNota} estrelas`;
    const parteOrdenacao = this.filtroOrdenacao === 'recentes' ? 'mais recentes' : 'mais antigas';
    return `${parteNota} · ${parteOrdenacao}`;
  }

  // ---- Ações ----
  toggleFiltro() {
    this.painelFiltroAberto = !this.painelFiltroAberto;
  }

  selecionarFiltroNota(nota: FiltroNota) {
    this.filtroNota = nota;
  }

  selecionarOrdenacao(ordenacao: FiltroOrdenacao) {
    this.filtroOrdenacao = ordenacao;
  }

  iniciais(nome?: string): string {
    if (!nome) return '';
    const partes = nome.trim().split(/\s+/);
    const primeira = partes[0]?.charAt(0) ?? '';
    const segunda = partes[1]?.charAt(0) ?? '';
    return (primeira + segunda).toUpperCase();
  }

  estrelasArray(nota: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(nota));
  }

  dataFormatada(data: Date): string {
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      .replace('.', '');
  }

  voltar() {
    this.navCtrl.back();
  }
}


