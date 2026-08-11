import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBin } from './modal-bin';

describe('ModalBin', () => {
  let component: ModalBin;
  let fixture: ComponentFixture<ModalBin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBin],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalBin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
