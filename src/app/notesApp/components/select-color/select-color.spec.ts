import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectColor } from './select-color';

describe('SelectColor', () => {
  let component: SelectColor;
  let fixture: ComponentFixture<SelectColor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectColor],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectColor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
