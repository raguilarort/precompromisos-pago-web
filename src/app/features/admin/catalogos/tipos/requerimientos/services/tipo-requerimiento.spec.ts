import { TestBed } from '@angular/core/testing';

import { TipoRequerimiento } from './tipo-requerimiento';

describe('TipoRequerimiento', () => {
  let service: TipoRequerimiento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoRequerimiento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
