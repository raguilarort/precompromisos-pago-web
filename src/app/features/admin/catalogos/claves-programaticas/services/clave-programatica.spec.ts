import { TestBed } from '@angular/core/testing';

import { ClaveProgramatica } from './clave-programatica';

describe('ClaveProgramatica', () => {
  let service: ClaveProgramatica;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaveProgramatica);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
