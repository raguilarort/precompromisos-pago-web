import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Precompromisos } from './precompromisos';

describe('Precompromisos', () => {
  let component: Precompromisos;
  let fixture: ComponentFixture<Precompromisos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Precompromisos],
    }).compileComponents();

    fixture = TestBed.createComponent(Precompromisos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
