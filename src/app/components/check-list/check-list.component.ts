import { Component, Input, OnInit } from '@angular/core';

import { PersistService } from 'src/app/services/persist.service';
import { ListItem } from 'src/app/models/list-item';

@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss']
})
export class CheckListComponent implements OnInit {

  public items: ListItem[] = [];

  @Input() idHeader = '';

  constructor(
    private persistService: PersistService,
  ) { }

  ngOnInit(): void {
    this.persistService.query('items', true).subscribe((item: ListItem) => {
      if (item.idHeader === this.idHeader) {
        this.items.push(item);
      }
    });
  }

  // helpers

  public get sortedItems(): ListItem[] {
    return this.items.sort((i1: ListItem, i2: ListItem) => {
      const i1check = i1.checked ? 1 : 0;
      const i2check = i2.checked ? 1 : 0;
      return i2check - i1check || (i1.text < i2.text ? -1 : (i1.text > i2.text ? 1 : 0));
    })
  }
}
