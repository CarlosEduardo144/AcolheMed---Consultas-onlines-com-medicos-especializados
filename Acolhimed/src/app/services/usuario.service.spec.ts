import { TestBed } from '@angular/core/testing';
// Altere aqui:
import { UsuarioService } from './usuario.service'; 

describe('UsuarioService', () => {
  // Altere aqui:
  let service: UsuarioService; 

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // Altere aqui:
    service = TestBed.inject(UsuarioService); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
