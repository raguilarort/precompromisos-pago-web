import { TestBed } from '@angular/core/testing';

import { Estatus } from './estatus';

describe('Estatus', () => {
  let service: Estatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Estatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
