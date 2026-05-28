import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastrar.page').then(m => m.CadastrarPage)
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then(m => m.InicioPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'alterar-dados',
    loadComponent: () => import('./pages/alterar-dados/alterar-dados.page').then( m => m.AlterarDadosPage)
  },
  {
    path: 'consultas',
    loadComponent: () => import('./pages/consultas/consultas.page').then( m => m.ConsultasPage)
  },
  {
    path: 'explorar',
    loadComponent: () => import('./pages/explorar/explorar.page').then( m => m.ExplorarPage)
  },
  {
    path: 'add-formacao-profissional',
    loadComponent: () => import('./pages/add-formacao-profissional/add-formacao-profissional.page').then( m => m.AddFormacaoProfissionalPage)
  },
  {
    path: 'alterar-horario',
    loadComponent: () => import('./pages/alterar-horario/alterar-horario.page').then( m => m.AlterarHorarioPage)
  },
  {
    path: 'medico',
    loadComponent: () => import('./pages/medico/medico.page').then( m => m.MedicoPage)
  },
  {
    path: 'agendar-consulta',
    loadComponent: () => import('./pages/agendar-consulta/agendar-consulta.page').then( m => m.AgendarConsultaPage)
  },
];

