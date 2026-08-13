import { TestBed } from '@angular/core/testing';

import { FuenteFinanciamiento } from './fuente-financiamiento';

describe('FuenteFinanciamiento', () => {
  let service: FuenteFinanciamiento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FuenteFinanciamiento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
