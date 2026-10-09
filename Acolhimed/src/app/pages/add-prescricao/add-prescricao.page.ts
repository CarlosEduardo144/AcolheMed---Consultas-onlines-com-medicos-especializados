import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, ToastController, IonSelectOption } from '@ionic/angular/standalone';
import { ConsultaResponseModel } from 'src/app/model/consulta-response';
import { ActivatedRoute } from '@angular/router';
import { ConsultaService } from 'src/app/services/consulta-service';
import { PrescricaoService } from 'src/app/services/prescricao-service';
import { ItemPrescricao } from 'src/app/model/item-prescricao';
import { PrescricaoModel } from 'src/app/model/prescricao-model';

const MAX_ITENS = 10;


interface ItemPrescricaoUI extends ItemPrescricao {
  expandido: boolean;
}

const OPCOES_FREQUENCIA = [
  '1x ao dia',
  '2x ao dia (12/12h)',
  '3x ao dia (8/8h)',
  '4x ao dia (6/6h)',
  'A cada 4 horas',
  'Uso contínuo',
  'Se necessário',
];

const OPCOES_VIA = [
  'Oral',
  'Tópica',
  'Injetável',
  'Sublingual',
  'Inalatória',
  'Oftálmica',
  'Nasal',
];

@Component({
  selector: 'app-add-prescricao',
  templateUrl: './add-prescricao.page.html',
  styleUrls: ['./add-prescricao.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSelectOption]
})
export class AddPrescricaoPage implements OnInit {

  maxItens = MAX_ITENS;
  opcoesFrequencia = OPCOES_FREQUENCIA;
  opcoesVia = OPCOES_VIA;
  prescricao: PrescricaoModel;

  consulta: ConsultaResponseModel | null = null;
  carregando = true;
  salvando = false;

  itens: ItemPrescricaoUI[] = [];

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private consultaService: ConsultaService,
    private prescricaoService: PrescricaoService,
    private toastController: ToastController
  ) {
    this.prescricao = new PrescricaoModel()
  }

  ngOnInit() {
    const consultaId = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('consultaId');
    if (consultaId) {
      this.carregarConsulta(consultaId);
    } else {
      this.carregando = false;
    }

    this.adicionarItem(); // já começa com 1 item pronto pra preencher
  }

  private carregarConsulta(id: string) {
    this.carregando = true;
    this.consultaService.buscarPorId(id).subscribe({
      next: (consulta) => {
        this.consulta = { ...consulta, dataHora: new Date(consulta.dataHora) };
        this.carregando = false;
      },
      error: (erro) => {
        console.error(erro);
        this.carregando = false;
        this.exibirMensagem(erro?.error?.message ?? 'Erro ao carregar consulta.');
      }
    });
  }

  dataFormatada(): string {
    if (!this.consulta) return '';
    return this.consulta.dataHora.toLocaleDateString('pt-BR');
  }

  // ---- Itens ----
  adicionarItem() {
    if (this.itens.length >= this.maxItens) {
      this.exibirMensagem(`Limite de ${this.maxItens} medicamentos por prescrição.`);
      return;
    }

    // fecha os outros itens ao adicionar um novo, deixando só o novo aberto
    this.itens.forEach(i => i.expandido = false);

    const novoItem: ItemPrescricaoUI = { ...new ItemPrescricao(), expandido: true };
    this.itens.push(novoItem);
  }

  removerItem(index: number) {
    if (this.itens.length <= 1) {
      this.exibirMensagem('A prescrição deve ter pelo menos um medicamento.');
      return;
    }
    this.itens.splice(index, 1);
  }

  toggleItem(item: ItemPrescricaoUI) {
    item.expandido = !item.expandido;
  }

  resumoItem(item: ItemPrescricaoUI): string {
    return item.medicamento?.trim() ? item.medicamento : 'Toque para preencher os dados';
  }

  itemPreenchido(item: ItemPrescricaoUI): boolean {
    return !!(item.medicamento?.trim() && item.dosagem?.trim() && item.frequencia?.trim() && item.duracao?.trim());
  }

  get totalItensValidos(): number {
    return this.itens.filter(i => this.itemPreenchido(i)).length;
  }

  get podeSalvar(): boolean {
    return this.itens.length > 0
      && this.itens.every(i => this.itemPreenchido(i))
      && !this.salvando;
  }

  get labelContador(): string {
    const total = this.itens.length;
    return total === 1 ? '1 medicamento na receita' : `${total} medicamentos na receita`;
  }

  // ---- Salvar ----
  salvarPrescricao() {
    if (!this.podeSalvar || !this.consulta) return;

    this.salvando = true;

    this.prescricao.itens = this.itens;
    this.prescricao.consultaId = this.consulta.id;

    this.prescricaoService.salvar(this.prescricao).subscribe({
      next: (prescricaoSalva) => {
        this.prescricao = {
          ...prescricaoSalva,
          data: new Date(prescricaoSalva.data),
        };
        this.salvando = false;
        this.exibirMensagem("Prescrição salva com sucesso!");
        this.navCtrl.back();
      },
      error: (erro) => {
        console.error(erro);
        this.salvando = false;
        this.exibirMensagem(erro.error.message);
      }
    });
  }

  voltar() {
    this.navCtrl.back();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1800
    });
    toast.present();
  }
}
