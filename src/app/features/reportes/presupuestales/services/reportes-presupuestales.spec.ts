import { TestBed } from '@angular/core/testing';

import { ReportesPresupuestales } from './reportes-presupuestales';

describe('ReportesPresupuestales', () => {
  let service: ReportesPresupuestales;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportesPresupuestales);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
