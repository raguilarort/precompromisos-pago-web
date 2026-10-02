import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Avisos } from './avisos';

describe('Avisos', () => {
  let component: Avisos;
  let fixture: ComponentFixture<Avisos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avisos],
    }).compileComponents();

    fixture = TestBed.createComponent(Avisos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
