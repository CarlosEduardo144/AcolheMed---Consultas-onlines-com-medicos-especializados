import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlterarHorarioPage } from './alterar-horario.page';

describe('AlterarHorarioPage', () => {
  let component: AlterarHorarioPage;
  let fixture: ComponentFixture<AlterarHorarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlterarHorarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
