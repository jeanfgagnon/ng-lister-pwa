import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { Observable, Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IListItem } from 'src/app/models/interface-list-item';
import { ListCategory } from 'src/app/models/list-category';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { SubItem } from 'src/app/models/sub-item';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-restore-database',
  templateUrl: './restore-database.component.html',
  styleUrls: ['./restore-database.component.scss']
})
export class RestoreDatabaseComponent implements OnInit, OnDestroy {

  public textData = '';
  public dbIsValid = false;
  public error = false;
  public restoreMode = 'R';

  public topObject: any = {};
  public dbDate = '';
  public dbVersion = 0;
  public database: ListCategory[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService
  ) { }

  ngOnInit(): void {
    this.globalStateService.sendMessage('ManageRestore');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  public onDataPasted(event: ClipboardEvent): void {
    this.error = false;
    this.dbIsValid = false;
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text');
    if (pastedText !== undefined) {
      try {
        this.topObject = JSON.parse(pastedText);
        if (this.topObject.version && this.topObject.date && this.topObject.database) {
          this.dbIsValid = true;
          this.dbDate = this.topObject.date;

          this.dbVersion = this.topObject.version;
          this.database = this.topObject.database;
        }
        else {
          this.textData = '';
          this.error = true;
        }
      }
      catch {
        this.error = true;
      }
    }
  }

  public onRadioChange(event: MatRadioChange): void {
    this.restoreMode = event.value;
  }

  public onRestoreClick(): void {
    this.textData = '';

    const clearAll$ = zip(
      this.persistService.clear('categories'),
      this.persistService.clear('headers'),
      this.persistService.clear('items'),
      this.persistService.clear('subitems')
    );

    clearAll$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      // here, database clearing jobs are done and we are reloading with backup in an ugly looop
      this.database.forEach((cat: ListCategory) => {
        this.persistService.put('categories', cat.id, cat).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          cat.headers.forEach((header: ListHeader) => {
            this.persistService.put('headers', header.id, header).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
              header.items.forEach((item: ListItem) => {
                this.persistService.put('items', item.id, item as IListItem).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
                  item.subs.forEach((sub: SubItem) => {
                    this.persistService.put('subitems', sub.id, sub).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
                  });
                });
              });
            });
          });
        });
      });
      this.globalStateService.sendMessage('CategoryChanged');
    });
  }

  public onCancelClick(): void {
    this.textData = '';
    this.error = false;
    this.dbIsValid = false;
  }
}
