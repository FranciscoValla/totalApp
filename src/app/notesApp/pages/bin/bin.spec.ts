import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bin } from './bin';

describe('Bin', () => {
  let component: Bin;
  let fixture: ComponentFixture<Bin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bin],
    }).compileComponents();

    fixture = TestBed.createComponent(Bin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
