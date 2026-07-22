import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEspecialidadePage } from './add-especialidade.page';

describe('AddEspecialidadePage', () => {
  let component: AddEspecialidadePage;
  let fixture: ComponentFixture<AddEspecialidadePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEspecialidadePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
