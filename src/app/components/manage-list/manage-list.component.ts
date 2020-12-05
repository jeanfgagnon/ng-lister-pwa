import { AfterViewInit } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';

import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-manage-list',
  templateUrl: './manage-list.component.html',
  styleUrls: ['./manage-list.component.scss']
})
export class ManageListComponent implements OnInit {

  public listName = '';
  public formVisible = false;
  public headers: ListHeader[] = [];
  public allItems: ListItem[] = [];

  constructor(
    private persistService: PersistService
  ) { }

  ngOnInit(): void {
    this.persistService.query("headers", true).subscribe((header: ListHeader) => {
      this.headers.push(header);
    });

    this.persistService.query("items", true).subscribe((item: ListItem) => {
      this.allItems.push(item);
    });
  }

  // event handlers

  public formSubmitted(e: Event): void {
    if (this.listName.trim() !== '') {
      const h = this.persistService.newHeaderInstance();
      h.name = this.listName;
      this.persistService.put('headers', h.id, h).subscribe((key: any) => {
        this.headers.push(h);
        this.listName = '';
        this.formVisible = false;
      });
    }
  }

  // helpers

  public itemCount(idHeader: string): string {
    let rv = '';
    const count = this.allItems.filter(x=>x.idHeader === idHeader).length;
    if (count > 0) {
      rv = `(${count})`;
    }

    return rv;
  }

  public get sortedHeaders(): ListHeader[] {
    return this.headers.sort((a: ListHeader, b: ListHeader) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });
  }

  public toggleFormVisibility() {
    this.formVisible = !this.formVisible;
  }

  // privates

}
