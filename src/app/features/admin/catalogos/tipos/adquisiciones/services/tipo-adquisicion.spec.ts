import { TestBed } from '@angular/core/testing';

import { TipoAdquisicion } from './tipo-adquisicion';

describe('TipoAdquisicion', () => {
  let service: TipoAdquisicion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoAdquisicion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
