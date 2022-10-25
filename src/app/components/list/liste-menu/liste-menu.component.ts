import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';

import { PersistService } from 'src/app/services/persist.service';
import { GlobalStateService } from 'src/app/services/global-state.service';

import { IIDText } from 'src/app/models/interface-id-text';
import { IListItem } from 'src/app/models/interface-list-item';

import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { ListCategory } from 'src/app/models/list-category';
import { ConfirmDialogModel } from 'src/app/models/confirm-dialog-model';
import { ConfirmDialogComponent } from '../../management/confirm-dialog/confirm-dialog.component';

import { Tools } from 'src/app/common/Tools';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-liste-menu',
  templateUrl: './liste-menu.component.html',
  styleUrls: ['./liste-menu.component.scss']
})
export class ListeComponent implements OnInit, OnDestroy {

  private swipeCoord?: [number, number];
  private swipeTime?: number;

  public headers: ListHeader[] = [];
  public header: ListHeader;
  public selectedIdHeader = '';
  public loaded = false;
  public tabIndex = 0;
  public isQuick = false;
  public sortChecked = true;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.sortChecked = this.globalStateService.getSetting('sort-checked') === '1';

    this.globalStateService.message$.subscribe((m: string) => {
      if (m === 'DefaultCategory') {
        this.loadDataByCategoryId(this.globalStateService.CurrentSelectedIdCategory, '');
      }
    });

    this.activatedRoute.params.subscribe(params => {
      if (params.id) {
        this.isQuick = (params.id === 'quick');
        this.selectedIdHeader = params.idheader;
        this.loadDataByCategoryId(params.id, params.idheader);
        this.globalStateService.CurrentSelectedIdCategory = params.id;
      }
      else {
        if (this.globalStateService.CurrentSelectedIdCategory) {
          this.loadDataByCategoryId(this.globalStateService.CurrentSelectedIdCategory, '');
          this.globalStateService.sendMessage('SelectedCategory');
        }
        else {
          this.findDefaultCategory();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  public swipe(e: TouchEvent, when: string): void {
    const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    const time = new Date().getTime();

    if (when === 'start') {
      this.swipeCoord = coord;
      this.swipeTime = time;
    } else if (when === 'end') {
      const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
      const duration = time - this.swipeTime;

      if (duration < 1000 //
        && Math.abs(direction[0]) > 30 // Long enough
        && Math.abs(direction[0]) > Math.abs(direction[1] * 3)) { // Horizontal enough
        const swipeDir: number = direction[0] < 0 ? 1 : -1;
        let index = this.headers.findIndex(x => x.id === this.selectedIdHeader) + swipeDir;
        if (index >= 0 && index < this.headers.length) {
          this.header = this.headers[index];
          this.loadItems(this.header);
          this.selectedIdHeader = this.header.id;
        }
      }
    }
  }

  public headerSelected(idHeader: string): void {
    this.selectedIdHeader = idHeader;
    this.header = this.headers.find(x => x.id === idHeader);
    this.loadItems(this.header);
  }

  public onItemClicked(idHeader: string): void {
    const h = this.headers.find(x => x.id === idHeader);
    if (h) {
      if (h.items.filter(x => x.checked).length === 0) {
        h.text = h.text.replace(/\*/, '');
      }
      else if (h.text.indexOf('*') === -1) {
        h.text += '*';
      }
    }
  }

  public onItemAdded(idt: IIDText): void {
    this.quickAdd(idt);
    const h = this.headers.find(x => x.id === idt.id);
    if (h && h.text.indexOf('*') === -1) {
      h.text += '*';
    }
  }

  public confirmCompletedRemoval(header: ListHeader): void {
    const dialogData = new ConfirmDialogModel('Permanently remove completed item?', 'Confirm Action');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(dialogResult => {
      if (dialogResult) {
        this.deleteCompleted(header);
      }
    });
  }

  // helpers

  public sortedHeaders(): ListHeader[] {
    return this.headers.sort((a: ListHeader, b: ListHeader) => {
      return a.text.localeCompare(b.text);
    });
  }

  public nbUnchekedItems(header: ListHeader): number {
    return header.items.filter(x => !x.checked).length;
  }

  // privates

  private deleteCompleted(header: ListHeader): void {
    for (let i = header.items.length - 1; i >= 0; i--) {
      if (!header.items[i].checked) {
        this.persistService.delete('items', header.items[i].id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
        header.items.splice(i, 1);
      }
    }
  }

  private loadDataByCategoryId(id: string, idheader: string): void {
    let t1 = new Date().getTime();
    this.headers = [];
    this.loaded = false;
    const noFlickerHeaders: ListHeader[] = [];
    this.persistService.query('headers', true).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (header: ListHeader) => {
        if (header.idCategory === id) {
          noFlickerHeaders.push(header);
          header.items = [];
        }
      },

      error: (err) => {
      },

      complete: () => {
        this.headers = noFlickerHeaders;
        if (idheader) {
          this.headers = this.sortedHeaders();
          this.tabIndex = this.headers.findIndex(x => x.id === idheader);
          this.header = this.headers[this.tabIndex];
        }
        else {
          this.header = this.sortedHeaders()[0];
        }

        this.loadItems(this.header);
        this.selectedIdHeader = this.header.id;
      }
    });
  }

  private loadItems(header: ListHeader): void {
    if (this.header.items && this.header.items.length > 0) {
      return;
    }

    this.loaded = false;

    this.persistService.query('items', true).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (item: ListItem) => {
        if (item.idHeader === header.id) {
          header.items.push(item);
        }
      },

      error: (err) => { },

      complete: (/* complete */) => {
        if (header.items.filter(x => x.checked).length > 0) {
          header.text += '*';
        }
        if (header.id === 'quick') {
          header.items = header.items.sort((i1: ListItem, i2: ListItem) => {
            return i1.rank - i2.rank;
          });
        }
        else {
          if (this.sortChecked) {
            header.items = header.items.sort((i1: ListItem, i2: ListItem) => {
              const i1check = i1.checked ? 1 : 0;
              const i2check = i2.checked ? 1 : 0;
              return i2check - i1check || (i1.text < i2.text ? -1 : (i1.text > i2.text ? 1 : 0));
            });
          }
          else {
            header.items = header.items.sort((i1: ListItem, i2: ListItem) => {
              return i1.text.localeCompare(i2.text)
            });
          }
        }

        this.loaded = true;
      }
    });
  }

  private quickAdd(idt: IIDText): void {
    this.persistService.exists<ListItem>('items', (itm: ListItem) => {
      return idt.id === itm.idHeader && itm.text.toLowerCase() === idt.text.toLowerCase();
    }).pipe(takeUntil(this.unsubscribe$)).subscribe((exist: boolean) => {

      if (!exist) {
        const splitted = idt.text.split(/[,;]/);

        const item = this.persistService.newItemInstance(idt.id);
        item.text = Tools.capitalize((splitted.shift() as string).trim());
        item.checked = true;

        this.persistService.put('items', item.id, item as IListItem).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          const header = this.headers.find(x => x.id === idt.id);
          if (header) {
            header.items.push(item);
            for (let i = 0; i < splitted.length; i++) {
              const subItem = this.persistService.newSubitemInstance(item.id);
              subItem.text = Tools.capitalize(splitted[i].trim());
              subItem.rank = (i + 1);
              this.persistService.put('subitems', subItem.id, subItem).pipe(takeUntil(this.unsubscribe$)).subscribe(() => undefined);
            }
          }
        });
      }
    });
  }

  // If luser is starting by Liste
  private findDefaultCategory(): void {
    this.persistService.query('categories', true).pipe(takeUntil(this.unsubscribe$)).subscribe((cat: ListCategory) => {
      if (cat.isDefault) {
        this.globalStateService.CurrentSelectedIdCategory = cat.id;
        this.loadDataByCategoryId(cat.id, '');
      }
    });
  }
}
