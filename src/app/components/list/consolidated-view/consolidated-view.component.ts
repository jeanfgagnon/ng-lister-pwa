import { Component, OnInit } from '@angular/core';

import { PersistService } from 'src/app/services/persist.service';
import { ListCategory } from 'src/app/models/list-category';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { combineLatest } from 'rxjs';
import { GlobalStateService } from 'src/app/services/global-state.service';

@Component({
  selector: 'app-consolidated-view',
  templateUrl: './consolidated-view.component.html',
  styleUrls: ['./consolidated-view.component.scss']
})
export class ConsolidatedViewComponent implements OnInit {

  public cleaned = false;
  public categories: ListCategory[] = [];
  public headers: ListHeader[] = [];
  private items: ListItem[] = [];

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
  ) { }

  ngOnInit(): void {
    this.globalStateService.sendMessage('ConsolidatedView');
    const tree$ = combineLatest(
      [
        this.persistService.query('categories', true),
        this.persistService.query('headers', true),
        this.persistService.query('items', true)
      ]
    );
    tree$.subscribe(
      ([category, header, item]) => {
        this.appendObject(this.categories, category);
        this.appendObject(this.headers, header);
        this.appendItem(item as ListItem);
      },
      (error) => { },
      (/* complete */) => {
        this.tieAll();
        this.removeDeadWood();
        this.categories = this.categories.sort((a: ListCategory, b: ListCategory) => {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });

        this.categories.forEach((category: ListCategory) => {
          category.headers = category.headers.sort((a: ListHeader, b: ListHeader) => {
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
          });

        })
      }
    );
  }

  // private

  private removeDeadWood(): void {
    for (let i = this.categories.length - 1; i >= 0; i--) {
      for (let j = this.categories[i].headers.length - 1; j >= 0; j--) {
        if (this.categories[i].headers[j].items.length === 0) {
          this.categories[i].headers.splice(j, 1);
        }
      } // j

      if (this.categories[i].headers.length === 0) {
        this.categories.splice(i, 1);
      }
    } // i

    this.cleaned = true;
  }

  private appendObject(srcArray: any[], v: ListCategory | ListHeader): void {
    if (srcArray.findIndex(x => x.id === v.id) === -1) {
      srcArray.push(v);
    }
  }

  appendItem(item: ListItem) {
    if (this.items.findIndex(x => x.id === item.id) === -1) {
      if (item.checked) {
        this.items.push(item);
      }
    }
  }

  private tieAll(): void {
    this.categories.forEach((category: ListCategory) => {
      category.headers = this.headers.filter(h => h.idCategory === category.id);
      this.headers.forEach((header: ListHeader) => {
        header.items = this.items.filter(x => x.idHeader === header.id);
      });
    });
  }

}
