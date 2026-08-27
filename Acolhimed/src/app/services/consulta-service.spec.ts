import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ConsultaService } from './consulta-service';
import { ConsultaModel } from '../model/consulta.model';
import { environment } from 'src/environments/environment';

describe('ConsultaService', () => {
  let service: ConsultaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ConsultaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve enviar dataHora como data local sem converter para UTC', () => {
    const consulta = new ConsultaModel();
    consulta.dataHora = new Date(2026, 7, 19, 14, 30, 0, 0);

    service.salvar(consulta).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/consultas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.dataHora).toBe('2026-08-19T14:30:00');

    req.flush({});
  });
});
