import { TestBed } from '@angular/core/testing';

import { CompressImage } from './compress-image';

describe('CompressImage', () => {
  let service: CompressImage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressImage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
