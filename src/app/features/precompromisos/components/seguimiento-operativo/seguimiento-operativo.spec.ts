import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoOperativo } from './seguimiento-operativo';

describe('SeguimientoOperativo', () => {
  let component: SeguimientoOperativo;
  let fixture: ComponentFixture<SeguimientoOperativo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguimientoOperativo],
    }).compileComponents();

    fixture = TestBed.createComponent(SeguimientoOperativo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
