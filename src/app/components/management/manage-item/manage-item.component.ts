import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmDialogModel } from 'src/app/models/confirm-dialog-model';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';

import { PersistService } from 'src/app/services/persist.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ListCategory } from 'src/app/models/list-category';
import { MatSelectChange } from '@angular/material/select';
import { Tools } from 'src/app/common/Tools';
import { SubItem } from 'src/app/models/sub-item';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-manage-item',
  templateUrl: './manage-item.component.html',
  styleUrls: ['./manage-item.component.scss']
})
export class ManageItemComponent implements OnInit, OnDestroy {

  public title = '';
  public idHeader = '';
  public header = new ListHeader();
  public items: ListItem[] = [];
  public categories: ListCategory[] = [];

  @ViewChild('scrollzone') set elem(e: ElementRef) {
    if (e) {
      this.setScrollerHeight(e);
    }
  }

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private persistService: PersistService,
    private location: Location,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      this.idHeader = params.id;
      this.persistService.query('categories', true).pipe(takeUntil(this.unsubscribe$)).subscribe((cat: ListCategory) => {
        this.categories.push(cat);
      });
      this.persistService.get('headers', this.idHeader).pipe(takeUntil(this.unsubscribe$)).subscribe((header: ListHeader) => {
        this.header = header;
        this.title = header.text;
        const localItems: ListItem[] = [];
        this.persistService.query('items', true).pipe(takeUntil(this.unsubscribe$)).subscribe(
          (item: ListItem) => {
            if (item.idHeader === header.id) {
              localItems.push(item);
              item.subs = [];
              this.persistService.query('subitems', true).pipe(takeUntil(this.unsubscribe$)).subscribe((subItem: SubItem) => {
                if (subItem.idItem === item.id) {
                  item.subs.push(subItem);
                }
              });
            }
          },
          (err) => console.log(err),
          (/* completed */) => {
            this.items = localItems.sort((a: ListItem, b: ListItem) => {
              return a.text.localeCompare(b.text);
            });
          }
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  public onCategorySelected(matCatEvent: MatSelectChange): void {
    this.header.idCategory = matCatEvent.value;
    this.persistService.put('headers', this.header.id, this.header).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
  }

  public confirmClear(): void {
    const dialogData = new ConfirmDialogModel('You want to clear this list?', 'Confirm Action');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.clearList();
      }
    });
  }

  public confirmDelete(): void {
    const dialogData = new ConfirmDialogModel('You want to delete this list?', 'Confirm Action');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(dialogResult => {
      if (dialogResult) {
        this.clearList();
        this.persistService.delete('headers', this.header.id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          this.location.back();
        });
      }
    });
  }

  // prevent [enter] while editing list name
  public onKeypress(e: KeyboardEvent): boolean {
    if (e.key === 'Enter') {
      return false;
    }

    return true;
  }

  // list name has been changed in place
  public onNameChanged(e: Event): void {
    const el = e.target as HTMLElement;
    if (this.header.id !== undefined) {
      this.header.text = el.innerText;
      if (this.header.text.length > 16) {
        this.header.text = el.innerText.substring(0, 16);
      }
      this.header.text = Tools.capitalize(this.header.text);
      this.persistService.put('headers', this.header.id, this.header).pipe(takeUntil(this.unsubscribe$)).subscribe((h: ListHeader) => {
        if (el.innerText.length > 16) {
          el.innerText = el.innerText.substring(0, 16);
        }
      });
    }
  }

  public addItem(): void {
    this.route.navigate(['/Manage/EditItem', this.header.id, '']);
  }

  public goBack(): void {
    this.location.back();
  }

  // helpers

  public getSubText(item: ListItem): string {
    let subtext = item.subs.map(subitem => subitem.text).join(', ');

    if (subtext.length) {
      subtext = '[' + subtext + ']';
    }

    return subtext;
  }

  // privates

  private clearList(): void {
    for (const item of this.items) {
      this.persistService.delete('items', item.id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        // noop
      });
    }

    this.items = [];
  }

  private setScrollerHeight(el: ElementRef): void {
    const top = el.nativeElement.getBoundingClientRect().top;
    el.nativeElement.style.height = `${window.innerHeight - (top + 20 + 50)}px`;
  }

}
