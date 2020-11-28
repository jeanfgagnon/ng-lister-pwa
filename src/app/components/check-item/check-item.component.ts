import { Component, Input, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

import { ListItem } from 'src/app/models/list-item';
import { SubItem } from 'src/app/models/sub-item';
import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-check-item',
  templateUrl: './check-item.component.html',
  styleUrls: ['./check-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CheckItemComponent implements OnInit {

  public subItems: SubItem[] = [];

  @Input() item!: ListItem;

  constructor(
    private persistService: PersistService,
  ) { }

  ngOnInit(): void {
    if (this.item) {
      this.persistService.query('subitems', true).subscribe((subitem: SubItem) => {
        if (subitem.idItem === this.item.id) {
          this.subItems.push(subitem);
        }
      });
    }
  }

}
