import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-manage-item',
  templateUrl: './manage-item.component.html',
  styleUrls: ['./manage-item.component.scss']
})
export class ManageItemComponent implements OnInit {

  public title = '';
  public idHeader = '';
  public header = new ListHeader();
  public items: ListItem[] = [];
  public categories: ListCategory[] = [];

  private scrollzone!: ElementRef;

  @ViewChild('scrollzone') set elem(e: ElementRef) {
    if (e) {
      this.scrollzone = e;
      this.setScrollerHeight(e);
    }
  }

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private persistService: PersistService,
    private location: Location,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.idHeader = params['id'];
      this.persistService.query('categories', true).subscribe((cat: ListCategory) => {
        this.categories.push(cat);
      });
      this.persistService.get('headers', this.idHeader).subscribe((header: ListHeader) => {
        this.header = header;
        this.title = header.name;
        const localItems: ListItem[] = [];
        this.persistService.query('items', true).subscribe(
          (item: ListItem) => {
            if (item.idHeader === header.id) {
              localItems.push(item);
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

  // event handlers

  public onCategorySelected(matCatEvent: MatSelectChange) {
    this.header.idCategory = matCatEvent.value;
    this.persistService.put('headers', this.header.id, this.header).subscribe(() => { /* noop */ });
  }

  public confirmClear(): void {
    const dialogData = new ConfirmDialogModel("You want to clear this list?", "Confirm Action");
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "300px",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.clearList();
      }
    });
  }

  public confirmDelete(): void {
    const dialogData = new ConfirmDialogModel("You want to delete this list?", "Confirm Action");
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "300px",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.clearList();
        this.persistService.delete('headers', this.header.id).subscribe(() => {
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
      this.header.name = el.innerText;
      if (this.header.name.length > 16) {
        this.header.name = el.innerText.substring(0, 16);
      }
      this.header.name = Tools.capitalize(this.header.name);
      this.persistService.put('headers', this.header.id, this.header).subscribe((h: ListHeader) => {
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

  // privates

  private clearList(): void {
    for (let i = 0; i < this.items.length; i++) {
      this.persistService.delete('items', this.items[i].id).subscribe(() => {
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
