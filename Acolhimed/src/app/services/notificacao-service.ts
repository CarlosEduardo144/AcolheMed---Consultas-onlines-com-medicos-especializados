import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { NotificacaoModel } from '../model/notificacao-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {

  private readonly API_URL_NOTIFICACOES = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // BACKEND

  listar(usuarioId: string): Observable<NotificacaoModel[]> {
    return this.http
      .get<NotificacaoModel[]>(
        `${this.API_URL_NOTIFICACOES}/notificacoes/usuario/${usuarioId}`
      )
      .pipe(
        map(notificacoes =>
          notificacoes.map(notificacao => ({
            ...notificacao,
            dataHora: new Date(notificacao.dataHora)
          }))
        )
      );
  }

  marcarComoLidas(usuarioId: string): Observable<void> {
    return this.http.patch<void>(
      `${this.API_URL_NOTIFICACOES}/notificacoes/usuario/${usuarioId}/lidas`,
      {}
    );
  }
  salvar(notificacao: NotificacaoModel): Observable<NotificacaoModel> {
    return this.http.post<NotificacaoModel>(
      `${this.API_URL_NOTIFICACOES}/notificacoes`,
      notificacao
    );
  }


  // CAPACITOR

  async pedirPermissao() {
    const permissao = await LocalNotifications.checkPermissions();

    if (permissao.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  async mostrarNotificacao(notificacao: NotificacaoModel) {
    await this.pedirPermissao();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.gerarId(notificacao.id),
          title: notificacao.titulo,
          body: notificacao.mensagem
        }
      ]
    });
  }

  private gerarId(id: string): number {
    let hash = 0;

    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }

    return Math.abs(hash);
  }
}