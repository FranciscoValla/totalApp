import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNote } from './modal-note';

describe('ModalNote', () => {
  let component: ModalNote;
  let fixture: ComponentFixture<ModalNote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNote],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalNote);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
