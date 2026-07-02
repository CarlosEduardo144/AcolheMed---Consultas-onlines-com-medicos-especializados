import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendamentosMedicoPage } from './agendamentos-medico.page';

describe('AgendamentosMedicoPage', () => {
  let component: AgendamentosMedicoPage;
  let fixture: ComponentFixture<AgendamentosMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendamentosMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
