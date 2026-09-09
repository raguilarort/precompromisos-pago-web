import { TestBed } from '@angular/core/testing';

import { Precompromiso } from './precompromiso';

describe('Precompromiso', () => {
  let service: Precompromiso;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Precompromiso);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
