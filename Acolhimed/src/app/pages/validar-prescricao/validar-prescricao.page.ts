import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { PrescricaoService } from 'src/app/services/prescricao-service';
import { ActivatedRoute } from '@angular/router';

type EstadoValidacao = 'carregando' | 'valida' | 'invalida' | 'erro';

@Component({
  selector: 'app-validar-prescricao',
  templateUrl: './validar-prescricao.page.html',
  styleUrls: ['./validar-prescricao.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ValidarPrescricaoPage implements OnInit {

 estado: EstadoValidacao = 'carregando';
  private token: string | null = null;
 
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private prescricaoService: PrescricaoService
  ) {}
 
  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.validar();
  }
 
  validar() {
    if (!this.token) {
      this.estado = 'invalida';
      return;
    }
 
    this.estado = 'carregando';
 
    this.prescricaoService.validarPrescricao(this.token).subscribe({
      next: () => {
        this.estado = 'valida';
      },
      error: (erro) => {
        this.estado = erro?.status === 404 ? 'invalida' : 'erro';
      }
    });
  }
 
  voltar() {
    // Quem chega pelo QR Code abre a página direto, sem histórico para voltar.
    if (window.history.length > 1) {
      this.navCtrl.back();
    } else {
      this.navCtrl.navigateRoot('/login');
    }
  }
}