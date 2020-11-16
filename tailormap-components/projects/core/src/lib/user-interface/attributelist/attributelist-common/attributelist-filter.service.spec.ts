import { TestBed } from '@angular/core/testing';

import { AttributelistFilterService } from './attributelist-filter.service';

describe('AttributelistFilterService', () => {
  let service: AttributelistFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttributelistFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
