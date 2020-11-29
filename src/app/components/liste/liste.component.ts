import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { ListHeader } from 'src/app/models/list-header';

import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {

  public headers: ListHeader[] = [];
  public loaded = false;

  @ViewChild('tabgroup') tabgroup!: MatTabGroup;

  constructor(
    private persistService: PersistService
  ) { }

  ngOnInit(): void {
    this.persistService.query("headers", true).subscribe(
      (header: ListHeader) => {
        this.headers.push(header);
      },
      (err) => {
        console.log('Error %s', err);
      },
      () => {
        this.loaded = true;
        console.log('---------HEADERS LOADED');
      }
    );
  }

  // helpers

  // return mat-tab label and an * when there is checked item in the list
  public getLabel(h: ListHeader): string {
    let rv = h.name;
    return rv;
  }

  public get sortedHeaders(): ListHeader[] {
    if (!this.loaded) {
      setTimeout(() => { this.tabgroup.selectedIndex = 0 });
    }
    return this.headers.sort((a: ListHeader, b: ListHeader) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });
  }

}
