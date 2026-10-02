import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOperativo } from './dashboard-operativo';

describe('DashboardOperativo', () => {
  let component: DashboardOperativo;
  let fixture: ComponentFixture<DashboardOperativo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOperativo],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOperativo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
