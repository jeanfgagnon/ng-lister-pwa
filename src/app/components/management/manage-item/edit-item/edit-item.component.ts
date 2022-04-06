import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { ListHeader } from 'src/app/models/list-header';
import { PersistService } from 'src/app/services/persist.service';
import { ListItem } from 'src/app/models/list-item';
import { SubItem } from 'src/app/models/sub-item';
import { ConfirmDialogModel } from 'src/app/models/confirm-dialog-model';
import { ConfirmDialogComponent } from 'src/app/components/management/confirm-dialog/confirm-dialog.component';
import { Tools } from 'src/app/common/Tools';
import { IListItem } from 'src/app/models/interface-list-item';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss']
})
export class EditItemComponent implements OnInit, OnDestroy {

  public allHeaders: ListHeader[] = [];

  public header = new ListHeader();
  public item = new ListItem();

  public subItems: SubItem[] = [];
  public nbSubItem = 0;
  public addMore = false;
  public subItemText1 = '';
  public subItemText2 = '';
  public errorMessage = '';

  public verb = 'Edit';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private persistService: PersistService,
    private location: Location,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.item.text = '';
    this.activatedRoute.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      const headerId = params.id;
      const itemId = params.itemid;
      if (itemId === '') {
        this.verb = 'Add';
      }
      else {
        this.persistService.get('items', itemId).pipe(takeUntil(this.unsubscribe$)).subscribe((item: ListItem) => {
          this.item = item;
          this.loadSubitems(item.id);
        });
      }
      this.persistService.get('headers', headerId).pipe(takeUntil(this.unsubscribe$)).subscribe((header: ListHeader) => {
        this.header = header;

        this.persistService.query('headers', true).pipe(takeUntil(this.unsubscribe$)).subscribe({
          next: (other: ListHeader) => {
            if (other.idCategory === header.idCategory) {
              this.allHeaders.push(other);
            }
          },
          error: (err: any) => {},
          complete: () => {
            this.allHeaders = [...this.allHeaders].sort((a: ListHeader, b: ListHeader) => {
              return a.text.localeCompare(b.text);
            })
          }
        });

      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  public onDeleteItem(): void {
    const dialogData = new ConfirmDialogModel('You want to delete this item?', 'Confirm Action');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.persistService.delete('items', this.item.id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          for (const subItem of this.subItems) {
            this.persistService.delete('subitems', subItem.id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
          }
        });
        this.location.back();
      }
    });
  }

  public onIncrementSubItem(): void {
    if (this.canAddSubItem()) {
      this.nbSubItem++;
      if (this.nbSubItem > 2) {
        this.nbSubItem = 1;
      }
    }
  }

  public onDecrementSubItem(): void {
    if (this.nbSubItem === 0) {
      this.subItemText1 = '';
    }
    else {
      this.subItemText2 = '';
    }
    this.nbSubItem--;
    if (this.nbSubItem < 0) {
      this.nbSubItem = 0;
    }
  }

  public cancel(): void {
    this.location.back();
  }

  public formSubmitted(e: Event): void {
    if (this.item.text.trim() !== '') {
      let listItem = new ListItem();
      const normalizedText = Tools.capitalize(this.item.text);

      if (this.verb === 'Add') {

        this.persistService.exists<ListItem>('items', (itm: ListItem) => {
          return (itm.idHeader === this.header.id && itm.text === normalizedText);
        }).pipe(takeUntil(this.unsubscribe$)).subscribe((exists: boolean) => {
          if (!exists) {
            listItem = this.persistService.newItemInstance(this.header.id);
            listItem.text = normalizedText;

            this.persistService.put('items', listItem.id, listItem as IListItem).pipe(takeUntil(this.unsubscribe$)).subscribe((key: any) => {
              this.saveSubitems(listItem.id);
              if (this.addMore) {
                this.reset();
              }
              else {
                this.location.back();
              }
            });
          }
          else {
            this.errorMessage = `This item exists in ${this.header.text}`;
            setTimeout(() => { this.errorMessage = ''; }, 5000);
          }
        });

      }
      else {

        this.persistService.exists<ListItem>('items', (itm: ListItem) => {
          return (itm.idHeader === this.header.id && itm.text === normalizedText && itm.id !== this.item.id);
        }).pipe(takeUntil(this.unsubscribe$)).subscribe((exists: boolean) => {
          if (!exists) {
            this.item.text = normalizedText;
            this.item.idHeader = this.header.id;
            this.persistService.put('items', this.item.id, this.item as IListItem).pipe(takeUntil(this.unsubscribe$)).subscribe((key: any) => {
              this.saveSubitems(this.item.id);
              this.location.back();
            });
          }
          else {
            this.errorMessage = `This item already exists in ${this.header.text}`;
            setTimeout(() => { this.errorMessage = ''; }, 5000);
          }
        });

      }
    }
  }

  // helpers

  public canAddSubItem(): boolean {
    if (this.nbSubItem === 0) { return true; }
    if (this.nbSubItem === 1 && this.subItemText1.length > 0) { return true; }
    return false;
  }

  // private

  private loadSubitems(idItem: string): void {
    this.subItems = [];
    this.persistService.query('subitems', true).pipe(takeUntil(this.unsubscribe$)).subscribe((si: SubItem) => {
      if (si.idItem === idItem) {
        this.subItems.push(si);
        this.nbSubItem++;
        if (si.rank === 1) {
          this.subItemText1 = si.text;
        }
        else if (si.rank === 2) {
          this.subItemText2 = si.text;
        }
      }
    });
  }

  private saveSubitems(idItem: string): void {
    if (this.nbSubItem > 0) {
      let subItem = this.persistService.newSubitemInstance(idItem);
      if (this.subItems.length > 0) {
        subItem = this.subItems[0];
      }
      subItem.text = Tools.capitalize(this.subItemText1.trim());
      subItem.rank = 1;
      this.persistService.put('subitems', subItem.id, subItem).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        if (this.subItemText2) {
          subItem = this.persistService.newSubitemInstance(idItem);
          if (this.subItems.length > 1) {
            subItem = this.subItems[1];
          }
          subItem.text = Tools.capitalize(this.subItemText2.trim());
          subItem.rank = 2;
          this.persistService.put('subitems', subItem.id, subItem).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
        }
      });
    }

    for (let i = this.nbSubItem; i < this.subItems.length; i++) {
      this.persistService.delete('subitems', this.subItems[i].id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
    }
  }

  private reset(): void {
    this.item.text = '';
    this.nbSubItem = 0;
    this.subItemText1 = '';
    this.subItemText2 = '';
  }
}
