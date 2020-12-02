import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';

import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {

  public headers: ListHeader[] = [];
  public _sortedHeaders: ListHeader[] = [];
  public loaded = false;
  public quickText = '';

  @ViewChild('tabgroup') tabgroup!: MatTabGroup;

  constructor(
    private persistService: PersistService
  ) { }

  ngOnInit(): void {
    this.persistService.query("headers", true).subscribe(
      (header: ListHeader) => {
        this.headers.push(header);
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
      },
      (err) => {
        console.log('Error %s', err);
      },
      () => {
        this.loaded = true;
      }
    );
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

  public get sortedHeaders(): ListHeader[] {
    if (!this.loaded) {
      setTimeout(() => { this.tabgroup.selectedIndex = 0 });
    }

    this._sortedHeaders = this.headers.sort((a: ListHeader, b: ListHeader) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });

    return this._sortedHeaders;
  }

  // privates

  private quickAdd(idHeader: string): void {
    const splitted = this.quickText.split(/[,;]/);
    const itemText = splitted.shift() as string;

    const item = this.persistService.newItemInstance(idHeader);
    item.text = itemText;
    this.persistService.put('items', item.id, item).subscribe(() => {
      const header = this.headers.find(x => x.id === idHeader);
      if (header) {
        header.items.push(item);
        for (let i = 0; i < splitted.length; i++) {
          const subItem = this.persistService.newSubitemInstance(item.id);
          subItem.text = splitted[i];
          subItem.rank = (i + 1);
          this.persistService.put('subitems', subItem.id, subItem).subscribe(() => {

          });
        }
      }
    });
  }
}
