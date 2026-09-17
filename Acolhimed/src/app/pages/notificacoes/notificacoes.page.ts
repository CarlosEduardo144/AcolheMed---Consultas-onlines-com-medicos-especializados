import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { NotificacaoModel } from 'src/app/model/notificacao-model';
import { LoginService } from 'src/app/services/login.service';
import { NotificacaoService } from 'src/app/services/notificacao-service';
import { ToastController } from '@ionic/angular';


interface GrupoNotificacoesDia {
  label: string;
  notificacoes: NotificacaoModel[];
}

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.page.html',
  styleUrls: ['./notificacoes.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NotificacoesPage implements OnInit {

  // Vem do serviço/backend — populado em ngOnInit
  notificacoes: NotificacaoModel[] = [];
  carregando = true;

  constructor(private navCtrl: NavController, private toastController: ToastController, private loginService: LoginService, private notificacaoService: NotificacaoService) {}

  ngOnInit() {
    this.carregarNotificacoes();
    this.marcarComoLidas();
  }

  private carregarNotificacoes() {
    this.notificacaoService.listar(this.loginService.getUsuario()).subscribe({
      next: (notificacoes) => {
        this.notificacoes = notificacoes;
        this.carregando = false;
      },
      error: (erro) => {
        this.exibirMensagem(erro?.error?.message || 'Erro ao tentar carregar notificações');
      }
    });
  }

   private marcarComoLidas() {
    this.notificacaoService.marcarComoLidas(this.loginService.getUsuario()).subscribe({
      next: () => {
      },
      error: (erro) => {
        this.exibirMensagem(erro?.error?.message || 'Erro ao marcar como lidas');
      }
    });
  }

  get gruposPorDia(): GrupoNotificacoesDia[] {
    const grupos = new Map<string, NotificacaoModel[]>();

    const ordenadas = [...this.notificacoes].sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime());

    for (const notificacao of ordenadas) {
      const chave = notificacao.dataHora.toDateString();
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave)!.push(notificacao);
    }

    return Array.from(grupos.entries()).map(([chave, notificacoes]) => ({
      label: this.formatarLabelDia(notificacoes[0].dataHora),
      notificacoes,
    }));
  }

  private formatarLabelDia(data: Date): string {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    const dataZerada = new Date(data);
    dataZerada.setHours(0, 0, 0, 0);

    if (dataZerada.getTime() === hoje.getTime()) return 'Hoje';
    if (dataZerada.getTime() === ontem.getTime()) return 'Ontem';

    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  }

  horarioFormatado(notificacao: NotificacaoModel): string {
    const label = this.formatarLabelDia(notificacao.dataHora);
    const hora = notificacao.dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${label}, ${hora}`;
  }

  async exibirMensagem(texto: string) {

    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });

    toast.present();

  }

}
