import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorEjercicio } from './selector-ejercicio';

describe('SelectorEjercicio', () => {
  let component: SelectorEjercicio;
  let fixture: ComponentFixture<SelectorEjercicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorEjercicio],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorEjercicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
