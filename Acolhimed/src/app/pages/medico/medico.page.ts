import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
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
  totalAvaliacoes: number;
  percentualPorNota: number;
  fotoAmpliada = false;

  constructor(private route: ActivatedRoute,
    private medicoService: UsuarioService) {
    this.totalAvaliacoes = 10;
    this.percentualPorNota = 4;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.medicoService.buscarPorId(id).subscribe({
        next: (medico) => this.medico = medico,
        error: (err) => console.error('Erro ao carregar médico', err)
      });
    }
  }

  toggleFotoAmpliada() {
    this.fotoAmpliada = !this.fotoAmpliada;
  }

  /*
  get totalAvaliacoes(): number {
    return this.medico?.avaliacoes?.length ?? 0;
  }

  get mediaAvaliacoes(): number {
    if (!this.totalAvaliacoes) return 0;
    const soma = this.medico.avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    return soma / this.totalAvaliacoes;
  }

  get mediaFormatada(): string {
    return this.mediaAvaliacoes.toFixed(1).replace('.', ',');
  }

  get qualidadeLabel(): string {
    const m = this.mediaAvaliacoes;
    if (m >= 4.5) return 'Excelente';
    if (m >= 3.5) return 'Muito bom';
    if (m >= 2.5) return 'Bom';
    if (m >= 1.5) return 'Regular';
    return 'Ruim';
  }

  // Percentual de preenchimento da estrela grande (média), usado no overlay
  get percentualEstrelaMedia(): number {
    return (this.mediaAvaliacoes / 5) * 100;
  }

  // Quantidade de avaliações para uma nota específica (5,4,3,2,1)
  quantidadePorNota(nota: number): number {
    return this.medico?.avaliacoes?.filter(av => av.nota === nota).length ?? 0;
  }

  // Percentual da barra de distribuição para uma nota específica
  percentualPorNota(nota: number): number {
    if (!this.totalAvaliacoes) return 0;
    return (this.quantidadePorNota(nota) / this.totalAvaliacoes) * 100;
  }

  // Array [1..5] usado no *ngFor para desenhar estrelas de cada avaliação individual
  estrelasArray(nota: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= nota);
  }
  */

}
