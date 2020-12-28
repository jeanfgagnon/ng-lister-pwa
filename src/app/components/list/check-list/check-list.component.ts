import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

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

  @Input() fromConsol = false;
  @Input() header!: ListHeader;
  @Input() isQuick = false;
  @Output() itemClicked = new EventEmitter<string>();

  @ViewChild('scrollzone1') set elem(e: ElementRef) {
    if (e) {
      this.setScrollerHeight(e);
    }
  }

  constructor(
    private persistService: PersistService,
  ) { }

  ngOnInit(): void {
  }

  // helpers

  public get sortedItems(): ListItem[] {
    return this.header.items.sort((i1: ListItem, i2: ListItem) => {
      const i1check = i1.checked ? 1 : 0;
      const i2check = i2.checked ? 1 : 0;
      return i2check - i1check || (i1.text < i2.text ? -1 : (i1.text > i2.text ? 1 : 0));
    });
  }

  // event handlers

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
