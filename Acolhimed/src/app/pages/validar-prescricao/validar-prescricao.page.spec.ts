import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidarPrescricaoPage } from './validar-prescricao.page';

describe('ValidarPrescricaoPage', () => {
  let component: ValidarPrescricaoPage;
  let fixture: ComponentFixture<ValidarPrescricaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidarPrescricaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
