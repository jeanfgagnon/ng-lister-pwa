import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { ListHeader } from 'src/app/models/list-header';
import { PersistService } from 'src/app/services/persist.service';
import { ListItem } from 'src/app/models/list-item';
import { SubItem } from 'src/app/models/sub-item';
import { ConfirmDialogModel } from 'src/app/models/confirm-dialog-model';
import { ConfirmDialogComponent } from 'src/app/components/Management/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss']
})
export class EditItemComponent implements OnInit {

  public headerId = ''; // oter ca
  public itemId = '';   // idem

  public header = new ListHeader();
  public item = new ListItem();
  public subItems: SubItem[] = [];
  public nbSubItem = 0;
  public addMore = false;
  public subItemText1 = '';
  public subItemText2 = '';

  public verb = 'Edit';

  constructor(
    private activatedRoute: ActivatedRoute,
    private persistService: PersistService,
    private location: Location,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.item.text = '';
    this.activatedRoute.params.subscribe(params => {
      this.headerId = params['id'];
      this.itemId = params['itemid'];
      if (this.itemId === '') {
        this.verb = 'Add';
      }
      else {
        this.persistService.get('items', this.itemId).subscribe((item: ListItem) => {
          this.item = item;
          this.loadSubitems(item.id);
        });
      }
      this.persistService.get('headers', this.headerId).subscribe((header: ListHeader) => {
        this.header = header;
      });
    });
  }

  // event handlers

  public onDeleteItem(): void {
    const dialogData = new ConfirmDialogModel("You want to delete this item?", "Confirm Action");
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "300px",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.persistService.delete('items', this.item.id).subscribe(() => {
          for (let i = 0; i < this.subItems.length; i++) {
            this.persistService.delete('subitems', this.subItems[i].id).subscribe(() => {
              this.location.back();
            });
          }
        });
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

  public cancel() {
    this.location.back();
  }

  public formSubmitted(e: Event) {

    let listItem = this.item;

    if (this.verb === 'Add') {
      listItem = this.persistService.newItemInstance(this.header.id);
      listItem.text = this.item.text;
    }

    this.persistService.put('items', listItem.id, listItem).subscribe((key: any) => {
      this.saveSubitems(listItem.id);
      if (this.addMore) {
        this.reset();
      }
      else {
        this.location.back();
      }
    });
  }

  // helpers

  public canAddSubItem(): boolean {
    if (this.nbSubItem === 0) return true;
    if (this.nbSubItem === 1 && this.subItemText1.length > 0) return true;
    return false;
  }

  // private

  private loadSubitems(idItem: string): void {
    this.subItems = [];
    this.persistService.query('subitems', true).subscribe((si: SubItem) => {
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
      subItem.text = this.subItemText1;
      subItem.rank = 1;
      this.persistService.put('subitems', subItem.id, subItem).subscribe(() => {
        if (this.subItemText2) {
          subItem = this.persistService.newSubitemInstance(idItem);
          if (this.subItems.length > 1) {
            subItem = this.subItems[1];
          }
          subItem.text = this.subItemText2;
          subItem.rank = 2;
          this.persistService.put('subitems', subItem.id, subItem).subscribe(() => { /* noop */ });
        }
      });
    }

    for (let i = this.nbSubItem; i < this.subItems.length; i++) {
      this.persistService.delete('subitems', this.subItems[i].id).subscribe(() => { /* noop */});
    }
  }

  private reset(): void {
    this.item.text = '';
    this.nbSubItem = 0;
    this.subItemText1 = '';
    this.subItemText2 = '';
  }
}
