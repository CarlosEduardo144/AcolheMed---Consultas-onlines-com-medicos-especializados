import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddFormacaoProfissionalPage } from './add-formacao-profissional.page';

describe('AddFormacaoProfissionalPage', () => {
  let component: AddFormacaoProfissionalPage;
  let fixture: ComponentFixture<AddFormacaoProfissionalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFormacaoProfissionalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
