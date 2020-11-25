import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { ConfirmDialogModel } from 'src/app/models/confirm-dialog-model';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';

import { PersistService } from 'src/app/services/persist.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage-item',
  templateUrl: './manage-item.component.html',
  styleUrls: ['./manage-item.component.scss']
})
export class ManageItemComponent implements OnInit {

  public title = '';
  public listId = '';
  public header = new ListHeader();
  public listItems: ListItem[] = [];

  private itemSubject = new Subject<ListItem[]>();

  public itemSubject$ = this.itemSubject.asObservable();

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private persistService: PersistService,
    public dialog: MatDialog,
    private location: Location
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.listId = params['id'];
      this.persistService.get('headers', this.listId).subscribe((header: ListHeader) => {
        this.header = header;
        this.title = header.name;
        this.persistService.query('items', true).subscribe((listItem: ListItem) => {
          if (listItem.idHeader === header.id) {
            this.listItems.push(listItem); // pour alléger essayer avec juste cette array
            this.itemSubject.next(this.listItems);
          }
        });
      });
    });
  }

  // event handlers

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
          this.route.navigateByUrl('/ManageList');
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
      this.persistService.put('headers', this.header.id, this.header).subscribe((h: ListHeader) => {
        if (el.innerText.length > 16) {
          el.innerText = el.innerText.substring(0, 16);
          //this.title = this.header.name;
        }
      });
    }
  }

  public addItem(): void {
    this.route.navigate(['/EditItem', this.header.id, '']);
  }

  public goBack(): void {
    this.location.back();
  }

  // helpers

  // privates

  private clearList(): void {
    for (let i = 0; i < this.listItems.length; i++) {
      this.persistService.delete('items', this.listItems[i].id).subscribe(() => {
        // noop
      });
    }

    this.listItems = [];
    this.itemSubject.next(undefined);
  }

}
