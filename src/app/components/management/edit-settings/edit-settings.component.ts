import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-edit-settings',
  templateUrl: './edit-settings.component.html',
  styleUrls: ['./edit-settings.component.scss']
})
export class EditSettingsComponent implements OnInit, OnDestroy{

  public quickMode = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private globalStateService: GlobalStateService,
    private persistService: PersistService,
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
    console.log(e);
    if (e.source && e.source.name) {
      this.globalStateService.putSetting(e.source.name, e.checked ? '1' : '0');
    }
    this.prepareQuickList(e.checked);
  }

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
        this.persistService.put('headers', header.id, header).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
      });
    }
    else {
      this.persistService.delete('headers', 'quick').pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.persistService.delete('categories', 'quick').pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
      });
    }
  }
}
