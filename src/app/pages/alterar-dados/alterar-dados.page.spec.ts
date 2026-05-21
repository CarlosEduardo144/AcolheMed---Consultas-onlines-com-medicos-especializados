import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlterarDadosPage } from './alterar-dados.page';

describe('AlterarDadosPage', () => {
  let component: AlterarDadosPage;
  let fixture: ComponentFixture<AlterarDadosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlterarDadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
