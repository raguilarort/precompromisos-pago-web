import { TestBed } from '@angular/core/testing';

import { ClavePresupuestaria } from './clave-presupuestaria';

describe('ClavePresupuestaria', () => {
  let service: ClavePresupuestaria;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClavePresupuestaria);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
