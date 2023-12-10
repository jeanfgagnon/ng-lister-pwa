import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';
import { ListItem } from 'src/app/models/list-item';
import { ConfirmDialogModel } from 'src/app/models/confirm-dialog-model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-settings',
  templateUrl: './edit-settings.component.html',
  styleUrls: ['./edit-settings.component.scss']
})
export class EditSettingsComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();

  public formSettings: UntypedFormGroup;

  constructor(
    private globalStateService: GlobalStateService,
    private persistService: PersistService,
    public dialog: MatDialog,
    private router: Router,
    private fb: UntypedFormBuilder,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.globalStateService.sendMessage('EditSettings');

    this.createForm();
    this.initForm();
    this.formSettings.get('QuickList').valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((b: boolean) => {
      this.prepareQuickList(b);
    });
    this.formSettings.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((v: any) => {
      this.saveValues(v);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  // helpers

  // privates

  private saveValues(obj: object): void {
    for (const key in obj) {
      const v = obj[key];
      switch (key) {
        case 'SortChecked':
          this.globalStateService.putSetting('sort-checked', v ? '1' : '0');
          break;
      }
    }
  }

  private initForm(): void {
    this.formSettings.patchValue({
      QuickList: this.globalStateService.getSetting('quick-mode') === '1',
      SortChecked: this.globalStateService.getSetting('sort-checked') === '1'
    });
  }

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
          this.formSettings.patchValue({ QuickList: true })

          //          location.reload();
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
            this.formSettings.patchValue({ QuickList: true })
            //this.ref.detectChanges();
          }
          //location.reload();
        });
      }
    });
  }

  private quickRemoval(): void {
    this.persistService.delete('headers', 'quick').pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.persistService.delete('categories', 'quick').pipe(takeUntil(this.unsubscribe$)).subscribe(() => undefined);
    });
  }

  private createForm(): void {
    this.formSettings = this.fb.group({
      QuickList: [false],
      SortChecked: [false]
    });
  }
}
