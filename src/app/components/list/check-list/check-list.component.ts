import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { PersistService } from 'src/app/services/persist.service';
import { ListItem } from 'src/app/models/list-item';
import { ListHeader } from 'src/app/models/list-header';

@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss']
})
export class CheckListComponent implements OnInit {

  public items: ListItem[] = [];

  // faut passer le header il a deja ses items attaches
  @Input() header!: ListHeader;
  @Output() itemClicked = new EventEmitter<string>();

  constructor(
    private persistService: PersistService,
  ) { }

  ngOnInit(): void {
    // si on passe le header on scrap
    // this.persistService.query('items', true).subscribe((item: ListItem) => {
    //   if (item.idHeader === this.header.id) {
    //     this.items.push(item);
    //   }
    // });
  }

  // helpers

  public get sortedItems(): ListItem[] {
    return this.header.items.sort((i1: ListItem, i2: ListItem) => {
      const i1check = i1.checked ? 1 : 0;
      const i2check = i2.checked ? 1 : 0;
      return i2check - i1check || (i1.text < i2.text ? -1 : (i1.text > i2.text ? 1 : 0));
    })
  }

  // event handlers

  public onCheckChange(): void {
    this.itemClicked.emit(this.header.id);
  }
}
