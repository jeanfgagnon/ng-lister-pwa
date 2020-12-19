import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';

import { PersistService } from 'src/app/services/persist.service';

import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { Tools } from 'src/app/common/Tools';
import { ListCategory } from 'src/app/models/list-category';

@Component({
  selector: 'app-liste-menu',
  templateUrl: './liste-menu.component.html',
  styleUrls: ['./liste-menu.component.scss']
})
export class ListeComponent implements OnInit {

  public headers: ListHeader[] = [];
  public _sortedHeaders: ListHeader[] = [];
  public loaded = false;
  public quickText = '';

  //@ViewChild('tabgroup') tabgroup!: MatTabGroup;

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.globalStateService.message$.subscribe((m: string) => {
      if (m === 'DefaultCategory') {
        this.loadDataByCategoryId(this.globalStateService.CurrentSelectedIdCategory);
      }
    });

    this.activatedRoute.params.subscribe(params => {
      if (params.id) {
        this.loadDataByCategoryId(params.id);
        this.globalStateService.CurrentSelectedIdCategory = params.id;
      }
      else {
        if (this.globalStateService.CurrentSelectedIdCategory) {
          this.loadDataByCategoryId(this.globalStateService.CurrentSelectedIdCategory);
          this.globalStateService.sendMessage('SelectedCategory');
        }
        else {
          this.findDefaultCategory();
        }
      }
    });
  }

  // helpers

  // event handlers

  public onItemClicked(idHeader: string): void {
    const h = this.headers.find(h => h.id === idHeader);
    if (h) {
      if (h.items.filter(x => x.checked).length === 0) {
        h.name = h.name.replace(/\*/, '');
      }
      else if (h.name.indexOf('*') === -1) {
        h.name += '*';
      }
    }
  }

  public onQuickAddClick(idHeader: string): void {
    if (this.quickText.trim() !== '') {
      this.quickAdd(idHeader);
      this.quickText = '';
    }
  }

  public sortedHeaders(): ListHeader[] {
    this._sortedHeaders = this.headers.sort((a: ListHeader, b: ListHeader) => {
      return a.name.localeCompare(b.name);
    });

    return this._sortedHeaders;
  }

  // privates

  private loadDataByCategoryId(id: string): void {
    this.headers = [];
    this.loaded = false;
    const noFlickerHeaders: ListHeader[] = [];
    this.persistService.query("headers", true).subscribe(
      (header: ListHeader) => {
        if (header.idCategory === id) {
          noFlickerHeaders.push(header);
          header.items = [];
          this.persistService.query('items', true).subscribe(
            (item: ListItem) => {
              if (item.idHeader === header.id) {
                header.items.push(item);
              }
            },
            (err) => { },
            (/* complete */) => {
              if (header.items.filter(x => x.checked).length > 0) {
                header.name += "*";
              }
            }
          );
        }
      },
      (err) => {
      },
      (/* complete */) => {
        this.loaded = true;
        this.headers = noFlickerHeaders;
      }
    );
  }

  private quickAdd(idHeader: string): void {
    const splitted = this.quickText.split(/[,;]/);

    const item = this.persistService.newItemInstance(idHeader);
    item.text = Tools.capitalize((splitted.shift() as string).trim());
    item.checked = true;

    this.persistService.put('items', item.id, item).subscribe(() => {
      const header = this.headers.find(x => x.id === idHeader);
      if (header) {
        header.items.push(item);
        for (let i = 0; i < splitted.length; i++) {
          const subItem = this.persistService.newSubitemInstance(item.id);
          subItem.text = Tools.capitalize(splitted[i].trim());
          subItem.rank = (i + 1);
          this.persistService.put('subitems', subItem.id, subItem).subscribe(() => {
            /* noop */
          });
        }
      }
    });
  }

  // If luser is starting by Liste
  private findDefaultCategory(): void {
    this.persistService.query('categories', true).subscribe((cat: ListCategory) => {
      if (cat.isDefault) {
        this.globalStateService.CurrentSelectedIdCategory = cat.id;
        this.loadDataByCategoryId(cat.id);
      }
    });
  }

}
