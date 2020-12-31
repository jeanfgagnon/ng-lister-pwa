import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmDialogModel } from 'src/app/models/confirm-dialog-model';
import { ListItem } from 'src/app/models/list-item';

import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-settings',
  templateUrl: './edit-settings.component.html',
  styleUrls: ['./edit-settings.component.scss']
})
export class EditSettingsComponent implements OnInit, OnDestroy {

  public quickMode = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private globalStateService: GlobalStateService,
    private persistService: PersistService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    const quickModeValue = this.globalStateService.getSetting('quick-mode');
    this.quickMode = quickModeValue === '1';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  public sliderChange(e: MatSlideToggleChange): void {
    if (e.source && e.source.name) {
      this.globalStateService.putSetting(e.source.name, e.checked ? '1' : '0');
    }
    this.prepareQuickList(e.source.checked);
    e.source.checked = this.quickMode;
  }

  // helpers

  // privates

  private prepareQuickList(checked: boolean): void {
    if (checked) {
      // add quick cat and header
      const cat = this.persistService.newCategoryInstance();
      cat.id = 'quick';
      cat.text = 'Quick';
      cat.description = 'Quick Category';
      cat.isDefault = false;
      cat.headers = [];
      this.persistService.put('categories', cat.id, cat).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        const header = this.persistService.newHeaderInstance(cat.id);
        header.id = cat.id;
        header.text = cat.text;
        header.items = [];
        this.persistService.put('headers', header.id, header).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          this.globalStateService.putSetting('quick-mode', '1');
          location.reload();
        });

      });
    }
    else {
      this.confirmRemoval();
    }
  }

  private confirmRemoval(): void {
    this.persistService.exists<ListItem>('items', (item: ListItem) => {
      return item.idHeader === 'quick';
    }).pipe(takeUntil(this.unsubscribe$)).subscribe((exist: boolean) => {
      if (!exist) {
        this.quickRemoval();
      }
      else {
        const dialogData = new ConfirmDialogModel('You want to cancel quick mode?', 'Confirm Action');
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          maxWidth: '300px',
          data: dialogData
        });

        dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((dialogResult: boolean) => {
          if (dialogResult) {
            this.quickRemoval();
          }
          else {
            this.globalStateService.putSetting('quick-mode', '1');
          }
          location.reload();
        });
      }
    });
  }

  private quickRemoval(): void {
    this.persistService.delete('headers', 'quick').pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.persistService.delete('categories', 'quick').pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
    });
  }

}
