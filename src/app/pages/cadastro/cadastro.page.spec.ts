import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastrarPage } from './cadastrar.page';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';

describe('CadastrarPage', () => {
  let component: CadastrarPage;
  let fixture: ComponentFixture<CadastrarPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarPage, RouterTestingModule, IonicModule.forRoot()],
      providers: [
        { provide: LoginService, useValue: {} },
        { provide: UsuarioService, useValue: { salvar: () => {} } },
        { provide: NavController, useValue: { back: () => {}, navigateBack: () => {} } },
        { provide: ToastController, useValue: { create: () => Promise.resolve({ present: () => {} }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastrarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
