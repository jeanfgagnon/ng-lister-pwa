import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { PersistService } from 'src/app/services/persist.service';
import { ListCategory } from 'src/app/models/list-category';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { combineLatest } from 'rxjs';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { IIDText } from 'src/app/models/interface-id-text';
import { Tools } from 'src/app/common/Tools';
import { IListItem } from 'src/app/models/interface-list-item';
import { ConfirmDialogModel } from 'src/app/models/confirm-dialog-model';
import { ConfirmDialogComponent } from '../../management/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-consolidated-view',
  templateUrl: './consolidated-view.component.html',
  styleUrls: ['./consolidated-view.component.scss']
})
export class ConsolidatedViewComponent implements OnInit {

  public cleaned = false;
  public expandedState = true;
  public categories: ListCategory[] = [];
  public headers: ListHeader[] = [];
  public quickHeaderId = '';

  private items: ListItem[] = [];

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.globalStateService.sendMessage('ConsolidatedView');
    this.loadAllData();
  }

  // event handlers

  public onRefreshClick(): void {
    this.loadAllData();
  }

  public quickAddToggle(idHeader: string): void {
    if (this.quickHeaderId === idHeader) {
      this.quickHeaderId = '';
    }
    else {
      this.quickHeaderId = idHeader;
    }
  }

  public removeDone(header: ListHeader): void {
    if (header.id !== 'quick') {
      header.items = header.items.filter(x => x.checked);
    }
    else {
      const dialogData = new ConfirmDialogModel('Permanently remove completed item?', 'Confirm Action');
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '300px',
        data: dialogData
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          this.deleteCompleted(header);
        }
      });
    }
  }

  public onItemAdded(idt: IIDText): void {
    this.quickAdd(idt);
  }

  // helpers

  public isListHaveDone(header: ListHeader): boolean {
    return header.items.filter(x => !x.checked).length > 0;
  }

  // private

  private deleteCompleted(header: ListHeader): void {
    for (let i = header.items.length - 1; i >= 0; i--) {
      if (!header.items[i].checked) {
        this.persistService.delete('items', header.items[i].id).subscribe(() => { /* noop */ });
        header.items.splice(i, 1);
      }
    }
  }

  private loadAllData(): void {
    this.cleaned = false;

    this.categories = [];
    this.headers = [];
    this.items = [];

    const tree$ = combineLatest(
      [
        this.persistService.query('categories', true),
        this.persistService.query('headers', true),
        this.persistService.query('items', true)
      ]
    );
    tree$.subscribe(
      ([category, header, item]) => {
        this.appendObject(this.categories, category);
        this.appendObject(this.headers, header);
        this.appendItem(item as ListItem);
      },
      (error) => { },
      (/* complete */) => {
        this.tieAll();
        this.removeDeadWood();
        this.categories = this.categories.sort((a: ListCategory, b: ListCategory) => {
          if (a.id === 'quick') {
            return -1;
          }
          else {
            return a.text.localeCompare(b.text);
          }
        });

        this.categories.forEach((category: ListCategory) => {
          category.headers = category.headers.sort((a: ListHeader, b: ListHeader) => {
            return a.text.localeCompare(b.text);
          });
        });
      }
    );
  }

  private removeDeadWood(): void {
    for (let i = this.categories.length - 1; i >= 0; i--) {
      for (let j = this.categories[i].headers.length - 1; j >= 0; j--) {
        if (this.categories[i].headers[j].items.length === 0 && this.categories[i].id !== 'quick') {
          this.categories[i].headers.splice(j, 1);
        }
      } // j

      if (this.categories[i].headers.length === 0 && this.categories[i].id !== 'quick') {
        this.categories.splice(i, 1);
      }
    } // i

    this.cleaned = true;
  }

  private appendObject(srcArray: any[], v: ListCategory | ListHeader): void {
    if (srcArray.findIndex(x => x.id === v.id) === -1) {
      srcArray.push(v);
    }
  }

  private appendItem(item: ListItem): void {
    if (this.items.findIndex(x => x.id === item.id) === -1) {
      this.items.push(item);
    }
  }

  private tieAll(): void {
    this.categories.forEach((category: ListCategory) => {
      category.headers = this.headers.filter(h => h.idCategory === category.id);
      this.headers.forEach((header: ListHeader) => {
        header.items = this.items.filter(x => x.idHeader === header.id && (x.idHeader === 'quick' || x.checked));
      });
    });
  }

  private quickAdd(idt: IIDText): void {
    this.persistService.exists<ListItem>('items', (itm: ListItem) => {
      return idt.id === itm.idHeader && itm.text.toLowerCase() === idt.text.toLowerCase();
    }).subscribe((exist: boolean) => {

      if (exist) {
        this.addExistingItem(idt, true);
      }
      else {
        const splitted = idt.text.split(/[,;]/);

        const item = this.persistService.newItemInstance(idt.id);
        item.text = Tools.capitalize((splitted.shift() as string).trim());
        item.checked = true;

        this.persistService.put('items', item.id, item as IListItem).subscribe(() => {
          const header = this.headers.find(x => x.id === idt.id);
          if (header) {
            header.items.push(item);
            for (let i = 0; i < splitted.length; i++) {
              const subItem = this.persistService.newSubitemInstance(item.id);
              subItem.text = Tools.capitalize(splitted[i].trim());
              subItem.rank = (i + 1);
              this.persistService.put('subitems', subItem.id, subItem).subscribe(() => {
                /* noop */
              });
            }
          }
        });
      }
    });

  }

  private addExistingItem(idt: IIDText, checkedState: boolean): void {
    const header = this.headers.find(x => x.id === idt.id);
    if (header) {
      this.persistService.query('items', true).subscribe((itm: ListItem) => {
        if (itm.idHeader === idt.id && itm.text.toLowerCase() === idt.text.toLowerCase()) {
          itm.checked = checkedState;
          const curItem = header.items.find(x => x.id === itm.id);
          if (curItem) {
            curItem.checked = checkedState;
          }
          else {
            header.items.push(itm);
          }
          this.persistService.put('items', itm.id, itm as IListItem).subscribe(() => { /* noop */ });
        }
      });
    }
  }
}
