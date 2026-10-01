import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesgloseSaldo } from './desglose-saldo';

describe('DesgloseSaldo', () => {
  let component: DesgloseSaldo;
  let fixture: ComponentFixture<DesgloseSaldo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesgloseSaldo],
    }).compileComponents();

    fixture = TestBed.createComponent(DesgloseSaldo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
