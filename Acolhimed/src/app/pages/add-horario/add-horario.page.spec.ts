import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddHorarioPage } from './add-horario.page';

describe('AddHorarioPage', () => {
  let component: AddHorarioPage;
  let fixture: ComponentFixture<AddHorarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHorarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
