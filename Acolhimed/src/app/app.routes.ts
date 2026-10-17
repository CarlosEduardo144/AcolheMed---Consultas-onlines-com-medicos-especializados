import { Routes } from '@angular/router';
import { tipoUsuarioGuard } from './guards/tipo-usuario-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  //rotas globais
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastrar.page').then(m => m.CadastrarPage)
  },
    {
    path: 'validar-prescricao',
    loadComponent: () => import('./pages/validar-prescricao/validar-prescricao.page').then(m => m.ValidarPrescricaoPage)
  },
  {
    path: 'validar-prescricao/:token',
    loadComponent: () => import('./pages/validar-prescricao/validar-prescricao.page').then(m => m.ValidarPrescricaoPage)
  },

  //Rotas restritas
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then(m => m.InicioPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico', 'paciente']
    }
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico', 'paciente']
    }
  },
  {
    path: 'alterar-dados',
    loadComponent: () => import('./pages/alterar-dados/alterar-dados.page').then(m => m.AlterarDadosPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico', 'paciente']
    }
  },
  {
    path: 'explorar',
    loadComponent: () => import('./pages/explorar/explorar.page').then(m => m.ExplorarPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['paciente']
    }
  },
  {
    path: 'add-formacao-profissional',
    loadComponent: () => import('./pages/add-formacao-profissional/add-formacao-profissional.page').then(m => m.AddFormacaoProfissionalPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico']
    }
  },
  {
    path: 'consultas',
    loadComponent: () => import('./pages/consultas/consultas.page').then(m => m.ConsultasPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['paciente']
    }
  },
  {
    path: 'add-especialidade',
    loadComponent: () => import('./pages/add-especialidade/add-especialidade.page').then(m => m.AddEspecialidadePage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico']
    }
  },
  {
    path: 'medico',
    loadComponent: () => import('./pages/medico/medico.page').then(m => m.MedicoPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['paciente']
    }
  },
  {
    path: 'medico/:id',
    loadComponent: () => import('./pages/medico/medico.page').then(m => m.MedicoPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['paciente']
    }
  },
  {
    path: 'add-horario',
    loadComponent: () => import('./pages/add-horario/add-horario.page').then(m => m.AddHorarioPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico']
    }
  },
  {
    path: 'agendar-consulta',
    loadComponent: () => import('./pages/agendar-consulta/agendar-consulta.page').then(m => m.AgendarCosultaPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['paciente']
    }
  },
  {
    path: 'agendar-consulta/:id',
    loadComponent: () => import('./pages/agendar-consulta/agendar-consulta.page').then(m => m.AgendarCosultaPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['paciente']
    }
  },
  {
    path: 'add-avaliacao',
    loadComponent: () => import('./pages/add-avaliacao/add-avaliacao.page').then(m => m.AddAvaliacaoPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['paciente']
    }
  },
  {
    path: 'add-avaliacao/:id',
    loadComponent: () => import('./pages/add-avaliacao/add-avaliacao.page').then(m => m.AddAvaliacaoPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['paciente']
    }
  },
  {
    path: 'notificacoes',
    loadComponent: () => import('./pages/notificacoes/notificacoes.page').then(m => m.NotificacoesPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico', 'paciente']
    }
  },
  {
    path: 'avaliacoes',
    loadComponent: () => import('./pages/avaliacoes/avaliacoes.page').then(m => m.AvaliacoesPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico', 'paciente']
    }
  },
  {
    path: 'avaliacoes/:id',
    loadComponent: () => import('./pages/avaliacoes/avaliacoes.page').then(m => m.AvaliacoesPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico', 'paciente']
    }
  },
  {
    path: 'agendamentos',
    loadComponent: () => import('./pages/agendamentos/agendamentos.page').then(m => m.AgendamentosPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico']
    }
  },
  {
    path: 'add-prescricao',
    loadComponent: () => import('./pages/add-prescricao/add-prescricao.page').then(m => m.AddPrescricaoPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico']
    }
  },
  {
    path: 'add-prescricao/:id',
    loadComponent: () => import('./pages/add-prescricao/add-prescricao.page').then(m => m.AddPrescricaoPage),
    canActivate: [tipoUsuarioGuard],
    data: {
      tiposPermitidos: ['medico']
    }
  },
];

