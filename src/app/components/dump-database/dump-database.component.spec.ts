import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DumpDatabaseComponent } from './dump-database.component';

describe('DumpDatabaseComponent', () => {
  let component: DumpDatabaseComponent;
  let fixture: ComponentFixture<DumpDatabaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DumpDatabaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DumpDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
