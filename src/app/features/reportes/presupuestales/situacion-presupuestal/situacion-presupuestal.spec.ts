import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SituacionPresupuestal } from './situacion-presupuestal';

describe('SituacionPresupuestal', () => {
  let component: SituacionPresupuestal;
  let fixture: ComponentFixture<SituacionPresupuestal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SituacionPresupuestal],
    }).compileComponents();

    fixture = TestBed.createComponent(SituacionPresupuestal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
