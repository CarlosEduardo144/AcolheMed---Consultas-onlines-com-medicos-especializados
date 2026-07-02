import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeMedicoPage } from './home-medico.page';

describe('HomeMedicoPage', () => {
  let component: HomeMedicoPage;
  let fixture: ComponentFixture<HomeMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
