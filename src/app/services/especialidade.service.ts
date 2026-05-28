import { Injectable } from '@angular/core';
import { EspecialidadeModel } from '../model/especialidade.model';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadeService {
  getEspecialidade(id: string): EspecialidadeModel {

    let especialidades: EspecialidadeModel[] = JSON.parse(
      localStorage.getItem('especialidades') || '[]'
    );

    return especialidades.find(
      (especialidade) => especialidade.id === id
    ) as EspecialidadeModel;
  }

  especialidades: EspecialidadeModel[] = [
    {
      id: '1',
      nome: 'Cardiologia',
      descricao: 'Especialidade médica focada no coração e sistema cardiovascular.',
      imagem: 'cardiologia.png'
    },
    {
      id: '2',
      nome: 'Dermatologia',
      descricao: 'Área responsável pelo diagnóstico e tratamento da pele.',
      imagem: 'dermatologia.png'
    },
    {
      id: '3',
      nome: 'Nutrição Esportiva',
      descricao: 'Especialidade voltada para alimentação e desempenho físico.',
      imagem: 'nutricao-esportiva.png'
    },
    {
      id: '4',
      nome: 'Psicologia Clínica',
      descricao: 'Atendimento psicológico focado em saúde mental e emocional.',
      imagem: 'psicologia-clinica.png'
    },
    {
      id: '5',
      nome: 'Ortopedia',
      descricao: 'Especialidade relacionada aos ossos, músculos e articulações.',
      imagem: 'ortopedia.png'
    }
  ];

  constructor() {
    this.inicializarEspecialidades();
  }

  qtdEspecialidades(): number {
    return this.especialidades.length;
  }

  inicializarEspecialidades(): void {
    const especialidadesStorage = localStorage.getItem('especialidades');

    if (!especialidadesStorage) {
      localStorage.setItem(
        'especialidades',
        JSON.stringify(this.especialidades)
      );
    }
  }

  listar(): EspecialidadeModel[] {
    return JSON.parse(
      localStorage.getItem('especialidades') || '[]'
    );
  }

}
