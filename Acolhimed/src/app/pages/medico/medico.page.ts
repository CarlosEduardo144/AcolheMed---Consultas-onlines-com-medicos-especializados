import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AvaliacaoService } from 'src/app/services/avaliacao-service';
import { AvaliacaoModel } from 'src/app/model/avaliacao-model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-medico',
  templateUrl: './medico.page.html',
  styleUrls: ['./medico.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonFooter, IonButton, RouterLink]
})
export class MedicoPage implements OnInit {

  medico: any;
  avaliacoes: AvaliacaoModel[] = [];
  fotoAmpliada = false;
  carregandoInicial = true;

  constructor(private route: ActivatedRoute,
    private medicoService: UsuarioService,
    private avaliacaoService: AvaliacaoService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregandoInicial = true;
      this.medicoService.buscarPorId(id).subscribe({
        next: (medico) => {
          this.medico = medico;
          this.carregandoInicial = false;
          this.carregarAvaliacoes(id);
        },
        error: (err) => {
          this.carregandoInicial = false;
          console.error('Erro ao carregar médico', err);
        }
      });
    } else {
      this.carregandoInicial = false;
    }
  }

  private carregarAvaliacoes(medicoId: string) {
    this.avaliacaoService.getAvaliacoesMedicos(medicoId).subscribe({
      next: (avaliacoes) => this.avaliacoes = avaliacoes ?? [],
      error: (err) => console.error('Erro ao carregar avaliações', err)
    });
  }

  toggleFotoAmpliada() {
    this.fotoAmpliada = !this.fotoAmpliada;
  }

  iniciais(nome?: string): string {
    if (!nome) return '';
    return nome.trim().slice(0, 2).toUpperCase();
  }

  get totalAvaliacoes(): number {
    return this.avaliacoes.length;
  }

  get mediaAvaliacoes(): number {
    if (!this.totalAvaliacoes) return 0;
    const soma = this.avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    return soma / this.totalAvaliacoes;
  }

  get mediaFormatada(): string {
    return this.mediaAvaliacoes.toFixed(1).replace('.', ',');
  }

  get estrelasPreenchidas(): boolean[] {
    const arredondado = Math.round(this.mediaAvaliacoes);
    return [1, 2, 3, 4, 5].map(i => i <= arredondado);
  }

  quantidadePorNota(nota: number): number {
    return this.avaliacoes.filter(av => av.nota === nota).length;
  }

  percentualPorNota(nota: number): number {
    if (!this.totalAvaliacoes) return 0;
    return (this.quantidadePorNota(nota) / this.totalAvaliacoes) * 100;
  }
}