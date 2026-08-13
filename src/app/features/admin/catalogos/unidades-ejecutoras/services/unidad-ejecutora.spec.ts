import { TestBed } from '@angular/core/testing';

import { UnidadEjecutora } from './unidad-ejecutora';

describe('UnidadEjecutora', () => {
  let service: UnidadEjecutora;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnidadEjecutora);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
