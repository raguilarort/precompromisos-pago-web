import { TestBed } from '@angular/core/testing';

import { ContextoGlobal } from './contexto-global';

describe('ContextoGlobal', () => {
  let service: ContextoGlobal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContextoGlobal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
