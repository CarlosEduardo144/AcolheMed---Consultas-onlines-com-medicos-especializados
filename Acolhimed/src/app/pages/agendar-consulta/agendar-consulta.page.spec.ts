import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendarCosultaPage } from './agendar-consulta.page';

describe('AgendarCosultaPage', () => {
  let component: AgendarCosultaPage;
  let fixture: ComponentFixture<AgendarCosultaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendarCosultaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
