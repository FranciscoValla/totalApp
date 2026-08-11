import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LisBin } from './list-bin';

describe('LisBin', () => {
  let component: LisBin;
  let fixture: ComponentFixture<LisBin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LisBin],
    }).compileComponents();

    fixture = TestBed.createComponent(LisBin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
