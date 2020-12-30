import { TOUCH_BUFFER_MS } from '@angular/cdk/a11y';
import { DOCUMENT, Location } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApplicationSetting } from 'src/app/models/application-setting';
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
  public isRestoring = false;
  public restoreMode = 'R';

  public topObject: any = {};
  public dbDate = '';
  public dbVersion = 0;
  public database: ListCategory[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
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
    this.isRestoring = true;
    setTimeout(() => this.restore());
  }

  private restore(): void {
    this.textData = '';

    const clearAll$ = zip(
      this.persistService.clear('categories'),
      this.persistService.clear('headers'),
      this.persistService.clear('items'),
      this.persistService.clear('subitems'),
      this.persistService.clear('settings')
    );

    clearAll$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      // here, database clearing jobs are done and we are reloading with backup in an ugly looop

      for (const cat of this.database) {
        const flatCat = Object.assign({}, cat);
        flatCat.headers = [];
        this.persistService.put('categories', cat.id, flatCat).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {

          for (const header of cat.headers) {
            const flatHeader = Object.assign({}, header);
            flatHeader.items = [];
            this.persistService.put('headers', header.id, header).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {

              for (const item of header.items) {
                const flatItem = Object.assign({}, item);
                flatItem.subs = [];
                this.persistService.put('items', item.id, item as IListItem).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {

                  for (const sub of item.subs) {
                    this.persistService.put('subitems', sub.id, sub).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
                  }

                });

              }

            });

          }

        });
      }

      this.topObject.settings.forEach((setting: ApplicationSetting) => {
        this.persistService.put('settings', setting.id, setting).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
      });

      this.globalStateService.sendMessage('CategoryChanged');
      setTimeout(() => {
        this.document.location.href = "/";
      }, 5000);
    });
  }

  public onCancelClick(): void {
    this.textData = '';
    this.error = false;
    this.dbIsValid = false;
  }
}
