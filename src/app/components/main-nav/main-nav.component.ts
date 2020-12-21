import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

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
export class MainNavComponent implements OnInit {

  public categories: ListCategory[] = [];
  public selectedCategoryName = 'loading';
  public nextTheme = '';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    private themingService: ThemingService
  ) { }

  ngOnInit() {
    this.themingService.theme.subscribe((theme: string) => {
      if (theme === 'dark-theme') {
        this.nextTheme = 'Light mode';
      }
      else {
        this.nextTheme = 'Dark mode';
      }
    });

    this.loadCategories();
    this.globalStateService.message$.subscribe((m: string) => {
      if (m === 'CategoryChanged') {
        this.loadCategories();
      }
      else if (m === 'SelectedCategory' ||  m === 'DefaultCategory') {
        this.persistService.get('categories', this.globalStateService.CurrentSelectedIdCategory).subscribe((cat: ListCategory) => {
          this.selectedCategoryName = (cat ? cat.text : 'bug!');
        });
      }
      else if (m === 'ConsolidatedView') {
        this.selectedCategoryName = 'Consolidated';
      }
      else if (m === 'ManageLists') {
        this.selectedCategoryName = 'Manage Lists';
      }
      else if (m === 'ManageCategories') {
        this.selectedCategoryName = 'Manage Categories';
      }
      else if (m === 'ManageBackup') {
        this.selectedCategoryName = 'Backup Database';
      }
      else if (m === 'ManageRestore') {
        this.selectedCategoryName = 'Restore Database';
      }
    });
  }

  // event handlers

  public changeTheme(drawer: MatSidenav) {
    drawer.toggle();
    if (this.nextTheme === 'Light mode') {
      this.themingService.theme.next('light-theme')
    }
    else {
      this.themingService.theme.next('dark-theme');
    }
  }

  // helpers

  public get sortedCategories(): ListCategory[] {
    return this.categories.sort((a: ListCategory, b: ListCategory) => {
      return a.text.localeCompare(b.text);
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
