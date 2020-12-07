import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { PersistService } from 'src/app/services/persist.service';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { ListCategory } from 'src/app/models/list-category';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {

  public categories: ListCategory[] = [];

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
    //this.globalStateService.CurrentSelectedIdCategory = 'x';
    this.persistService.query('categories', true).subscribe(
      (cat: ListCategory) => {
        this.categories.push(cat);
      },
      (err) => { },
      (/* complete */) => { console.log(`cat choisie: ${this.globalStateService.CurrentSelectedIdCategory} `) });
  }


  // event handlers

  public onCategoryClick(e: Event, drawer: MatSidenav, cat: ListCategory): void {
    drawer.toggle();
    this.globalStateService.changeCategory(cat.id);
    e.preventDefault();
  }
}
