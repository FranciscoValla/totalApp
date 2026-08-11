import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalMenu } from './horizontal-menu';

describe('HorizontalMenu', () => {
  let component: HorizontalMenu;
  let fixture: ComponentFixture<HorizontalMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(HorizontalMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
