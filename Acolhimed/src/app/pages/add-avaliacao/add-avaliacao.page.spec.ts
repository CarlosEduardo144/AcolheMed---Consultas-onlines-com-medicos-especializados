import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddAvaliacaoPage } from './add-avaliacao.page';

describe('AddAvaliacaoPage', () => {
  let component: AddAvaliacaoPage;
  let fixture: ComponentFixture<AddAvaliacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAvaliacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
