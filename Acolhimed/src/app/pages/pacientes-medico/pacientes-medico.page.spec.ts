import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacientesMedicoPage } from './pacientes-medico.page';

describe('PacientesMedicoPage', () => {
  let component: PacientesMedicoPage;
  let fixture: ComponentFixture<PacientesMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PacientesMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
