import { TestBed } from '@angular/core/testing';

import { Saldos } from './saldos';

describe('Saldos', () => {
  let service: Saldos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Saldos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
