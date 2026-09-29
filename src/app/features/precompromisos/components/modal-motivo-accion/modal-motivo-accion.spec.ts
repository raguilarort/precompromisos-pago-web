import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMotivoAccion } from './modal-motivo-accion';

describe('ModalMotivoAccion', () => {
  let component: ModalMotivoAccion;
  let fixture: ComponentFixture<ModalMotivoAccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMotivoAccion],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalMotivoAccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
