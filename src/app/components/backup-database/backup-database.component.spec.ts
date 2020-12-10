import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupDatabaseComponent } from './backup-database.component';

describe('BackupDatabaseComponent', () => {
  let component: BackupDatabaseComponent;
  let fixture: ComponentFixture<BackupDatabaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackupDatabaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BackupDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
