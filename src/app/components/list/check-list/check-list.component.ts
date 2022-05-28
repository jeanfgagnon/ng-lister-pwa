import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';
import { ListItem } from 'src/app/models/list-item';
import { ListHeader } from 'src/app/models/list-header';
import { IListItem } from 'src/app/models/interface-list-item';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss']
})
export class CheckListComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();

  public items: ListItem[] = [];
  public dragging = false;

  @Input() fromConsol = false;
  @Input() header: ListHeader;
  @Input() isQuick = false;
  @Output() itemClicked = new EventEmitter<string>();
  @Output() longPressed = new EventEmitter<string>();

  @ViewChild('scrollzone1') set elem(e: ElementRef) {
    if (e) {
      this.setScrollerHeight(e);
    }
  }

  constructor(
    private globalStateService: GlobalStateService,
    private persistService: PersistService,
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // helpers

  // event handlers

  public longPress(id: string): void {
    if (!this.dragging) {
      this.longPressed.emit(id);
    }
  }

  public itemDrop(event: CdkDragDrop<ListItem[]>): void {
    moveItemInArray(this.header.items, event.previousIndex, event.currentIndex);
    this.header.items.forEach((item: ListItem, i: number) => {
      item.rank = i;
      this.persistService.put('items', item.id, item as IListItem).pipe(takeUntil(this.unsubscribe$)).subscribe((key: any) => undefined);
    });
  }

  public onCheckChange(): void {
    this.itemClicked.emit(this.header.id);
  }

  // privates

  private setScrollerHeight(el: ElementRef): void {
    if (!this.fromConsol) {
      // no scrolling in consolidated view
      const br = el.nativeElement.getBoundingClientRect();
      el.nativeElement.style.height = `${window.innerHeight - (br.top + 112)}px`;
    }
  }

}
