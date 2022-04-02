import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import { ListItem } from 'src/app/models/list-item';
import { ListHeader } from 'src/app/models/list-header';
import { GlobalStateService } from 'src/app/services/global-state.service';

@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss']
})
export class CheckListComponent implements OnInit {

  public items: ListItem[] = [];
  public sortChecked = true;

  @Input() fromConsol = false;
  @Input() header: ListHeader;
  @Input() isQuick = false;
  @Output() itemClicked = new EventEmitter<string>();

  @ViewChild('scrollzone1') set elem(e: ElementRef) {
    if (e) {
      //this.setScrollerHeight(e);
    }
  }

  constructor(
    private globalStateService: GlobalStateService,
  ) { }

  ngOnInit(): void {
    this.sortChecked = this.globalStateService.getSetting('sort-checked') === '1';
  }

  // helpers

  public get sortedItems(): ListItem[] {
    if (this.isQuick) {
      return  this.header.items.sort((i1: ListItem, i2: ListItem) => {
        return i1.rank - i2.rank;
      });
    }
    else {
      if (this.sortChecked) {
        return this.header.items.sort((i1: ListItem, i2: ListItem) => {
          const i1check = i1.checked ? 1 : 0;
          const i2check = i2.checked ? 1 : 0;
          return i2check - i1check || (i1.text < i2.text ? -1 : (i1.text > i2.text ? 1 : 0));
        });
      }
      else {
        return this.header.items.sort((i1: ListItem, i2: ListItem) => {
          return i1.text.localeCompare(i2.text)
        });
      }
    }
  }

  // event handlers

  public itemDrop(event: CdkDragDrop<ListItem[]>): void {
    moveItemInArray(this.header.items, event.previousIndex, event.currentIndex);
    [this.header.items[event.previousIndex].rank, this.header.items[event.currentIndex].rank] =
    [this.header.items[event.currentIndex].rank,this.header.items[event.previousIndex].rank];

    console.log(JSON.stringify(this.header.items, null, 2));
  }

  public onCheckChange(): void {
    this.itemClicked.emit(this.header.id);
  }

  // privates

  private setScrollerHeight(el: ElementRef): void {
    if (!this.fromConsol) {
      // no scrolling in consolidated view
      const br = el.nativeElement.getBoundingClientRect();
      // 170: top bar 56, tab 48, toolbar 56, 10px free
      el.nativeElement.style.height = `${window.innerHeight - (br.top + 170)}px`;
    }
  }

}
