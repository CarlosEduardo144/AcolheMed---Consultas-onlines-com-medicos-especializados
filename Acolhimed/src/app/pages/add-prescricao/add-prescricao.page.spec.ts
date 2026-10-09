import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddPrescricaoPage } from './add-prescricao.page';

describe('AddPrescricaoPage', () => {
  let component: AddPrescricaoPage;
  let fixture: ComponentFixture<AddPrescricaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPrescricaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
