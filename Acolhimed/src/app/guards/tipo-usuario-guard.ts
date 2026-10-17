import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token-service';

export const tipoUsuarioGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  const token = tokenService.extrair();
  if(!token){
    return router.createUrlTree(['/login']);
  }
  const tipoUsuario = token?.tipoUsuario;
  const tiposPermitidos = route.data['tiposPermitidos'] as string[];

  if (tipoUsuario && tiposPermitidos.includes(tipoUsuario)) {
    return true;
  }

  return router.createUrlTree(['/inicio']);
};