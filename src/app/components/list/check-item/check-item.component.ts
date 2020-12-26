import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { IListItem } from 'src/app/models/interface-list-item';

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
  @Output() checkChange = new EventEmitter<boolean>();

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

  // event handlers

  public onCheckboxChange(event: MatCheckboxChange, src: number): void {
    if (src === 0) {
      // persist item
      this.item.checked = event.checked;
      this.persistService.put('items', this.item.id, this.item as IListItem).subscribe(() => {
        this.checkChange.emit(event.checked);
        if (!event.checked) {
          this.uncheckSubs();
        }
      });
    }
    else {
      // persist subitem
      this.subItems[src - 1].checked = event.checked;
      this.persistService.put('subitems', this.subItems[src - 1].id, this.subItems[src - 1]).subscribe(() => { /* noop */ });
      if (event.checked) {
        this.item.checked = true;
        this.persistService.put('items', this.item.id, this.item as IListItem).subscribe(() => { /* noop */ });
      }
    }
  }

  // privates

  private uncheckSubs(): void {
    this.subItems.forEach((s: SubItem) => {
      s.checked = false;
      this.persistService.put('subitems', s.id, s).subscribe(() => { /* noop */ });
    });
  }
}
