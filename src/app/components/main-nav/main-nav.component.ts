import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';

import { PersistService } from 'src/app/services/persist.service';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { ListCategory } from 'src/app/models/list-category';
import { ThemingService } from 'src/app/services/theming.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit, OnDestroy  {

  public categories: ListCategory[] = [];
  public currentActionDisplay = 'loading';
  public nextTheme = '';

  public isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  private unsubscribe$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    private themingService: ThemingService
  ) { }

  ngOnInit(): void {
    this.themingService.theme.subscribe((theme: string) => {
      if (theme === 'dark-theme') {
        this.nextTheme = 'Light mode';
      }
      else {
        this.nextTheme = 'Dark mode';
      }
    });

    this.loadCategories();
    this.globalStateService.message$.pipe(takeUntil(this.unsubscribe$)).subscribe((m: string) => {
      if (m === 'CategoryChanged') {
        this.loadCategories();
      }
      else if (m === 'SelectedCategory' || m === 'DefaultCategory') {
        this.persistService.get('categories', this.globalStateService.CurrentSelectedIdCategory).pipe(takeUntil(this.unsubscribe$)).subscribe((cat: ListCategory) => {
          this.currentActionDisplay = (cat ? cat.text : 'bug!');
        });
      }
      else if (m === 'ConsolidatedView') {
        this.currentActionDisplay = 'Consolidated';
      }
      else if (m === 'ManageLists') {
        this.currentActionDisplay = 'Manage Lists';
      }
      else if (m === 'ManageCategories') {
        this.currentActionDisplay = 'Manage Categories';
      }
      else if (m === 'ManageBackup') {
        this.currentActionDisplay = 'Backup Database';
      }
      else if (m === 'ManageRestore') {
        this.currentActionDisplay = 'Restore Database';
      }
      else if (m === 'FreshInstall') {
        this.currentActionDisplay = 'Welcome!';
      }
      else if (m === 'EditSettings') {
        this.currentActionDisplay = 'Settings';
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  public changeTheme(drawer: MatSidenav): void {
    drawer.toggle();
    if (this.nextTheme === 'Light mode') {
      this.themingService.theme.next('light-theme');
    }
    else {
      this.themingService.theme.next('dark-theme');
    }
  }

  // helpers

  public get sortedCategories(): ListCategory[] {
    return this.categories.sort((a: ListCategory, b: ListCategory) => {
      if (a.id === 'quick' || b.id === 'quick') {
        return -1;
      }
      else {
        return a.text.localeCompare(b.text);
      }
    });
  }

  // privates

  private loadCategories(): void {
    this.categories = [];
    this.persistService.query('categories', true).subscribe(
      (cat: ListCategory) => {
        this.categories.push(cat);
      },
      (err) => { },
      (/* complete */) => { });
  }

  // event handlers

}
