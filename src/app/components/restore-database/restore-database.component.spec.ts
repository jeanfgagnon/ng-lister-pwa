import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreDatabaseComponent } from './restore-database.component';

describe('RestoreDatabaseComponent', () => {
  let component: RestoreDatabaseComponent;
  let fixture: ComponentFixture<RestoreDatabaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestoreDatabaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RestoreDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
