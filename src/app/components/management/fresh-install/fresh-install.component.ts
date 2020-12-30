import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-fresh-install',
  templateUrl: './fresh-install.component.html',
  styleUrls: ['./fresh-install.component.scss']
})
export class FreshInstallComponent implements OnInit, OnDestroy {

  public categoryName = 'Grocery';
  public listName = 'Dairies'

  private unsubscribe$ = new Subject<void>();

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    private route: Router,
    @Inject(DOCUMENT) private document: Document
    ) { }

  ngOnInit(): void {
    this.globalStateService.sendMessage('FreshInstall');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  public cancel(): void {
    this.document.location.href = 'https://www.google.com';
  }

  public install(): void {
    const category = this.persistService.newCategoryInstance();
    category.text = this.categoryName;
    this.persistService.put('categories', category.id, category).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      const header = this.persistService.newHeaderInstance(category.id);
      header.text = this.listName;
      this.persistService.put('headers', header.id, header).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.route.navigate(['/Liste', category.id]);
      });
    })
  }

  // helpers

  public get formValid(): boolean {
    return this.categoryName.trim() != '' && this.listName.trim() != '';
  }
}
