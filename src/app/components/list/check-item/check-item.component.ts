import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
export class CheckItemComponent implements OnInit, OnDestroy {

  public subItems: SubItem[] = [];

  @Input() item!: ListItem;
  @Input() isQuick = false;
  @Output() checkChange = new EventEmitter<boolean>();

  private unsubscribe$ = new Subject<void>();

  constructor(
    private persistService: PersistService,
  ) { }

  ngOnInit(): void {
    if (this.item) {
      if (this.item.subs && this.item.subs.length == 0) {
        this.persistService.query('subitems', true).pipe(takeUntil(this.unsubscribe$)).subscribe({
          next: (subitem: SubItem) => {
            if (subitem.idItem === this.item.id) {
              this.item.subs.push(subitem);
            }
          },
          error: (err: any) => {},
          complete: () => {
            this.subItems = this.item.subs;
          }
        });
      }
      else {
        this.subItems = this.item.subs;
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  public onCheckboxChange(event: MatCheckboxChange, src: number): void {
    if (src === 0) {
      // persist item
      this.item.checked = event.checked;
      if (!event.checked) {
        this.uncheckSubs();
      }
      this.persistService.put('items', this.item.id, this.item as IListItem).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.checkChange.emit(event.checked);
      });
    }
    else {
      // persist subitem
      this.subItems[src - 1].checked = event.checked;
      if (event.checked) {
        this.item.checked = true;
        this.checkChange.emit(true);
      }
      this.persistService.put('items', this.item.id, this.item as IListItem).pipe(takeUntil(this.unsubscribe$)).subscribe(() => undefined);
    }
  }

  public getFirstFlex = (): number => {
    if (this.subItems.length === 0) return 100;
    else return 40;
  };
  
  // privates

  private uncheckSubs(): void {
    this.subItems.forEach((s: SubItem) => {
      s.checked = false;
    });
  }
}
