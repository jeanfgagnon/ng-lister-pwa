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

}
