import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';

import { PersistService } from 'src/app/services/persist.service';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { ListCategory } from 'src/app/models/list-category';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {

  public categories: ListCategory[] = [];
  public selectedCategoryName = 'loading';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.globalStateService.message$.subscribe((m: string) => {
      if (m === 'CategoryChanged') {
        this.loadCategories();
      }
      else if (m === 'SelectedCategory' ||  m === 'DefaultCategory') {
        this.persistService.get('categories', this.globalStateService.CurrentSelectedIdCategory).subscribe((cat: ListCategory) => {
          this.selectedCategoryName = (cat ? cat.name : 'bug!');
        });
      }
      else if (m === 'ConsolidatedView') {
        this.selectedCategoryName = 'Consolidated';
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
