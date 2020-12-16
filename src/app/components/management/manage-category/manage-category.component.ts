import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';
import { ListCategory } from 'src/app/models/list-category';
import { ListHeader } from 'src/app/models/list-header';
import { ConfirmDialogModel } from 'src/app/models/confirm-dialog-model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/models/list-item';
import { SubItem } from 'src/app/models/sub-item';

@Component({
  selector: 'app-manage-category',
  templateUrl: './manage-category.component.html',
  styleUrls: ['./manage-category.component.scss']
})
export class ManageCategoryComponent implements OnInit {

  public categories: ListCategory[] = [];
  public headers: ListHeader[] = [];

  public categoryName = '';
  public categoryIsDefault = false;
  public formVisible = false;
  public actionVerb = "Add";

  private currentCategory!: ListCategory;

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {

    this.loadCategories();

    // ramasse tout les headers plus quick
    this.persistService.query('headers', true).subscribe((header: ListHeader) => {
      this.headers.push(header);
    });
  }

  // event handlers

  public formSubmitted(e: Event): void {
    if (this.actionVerb === "Add") {
      this.currentCategory = this.persistService.newCategoryInstance();
      this.categories.push(this.currentCategory);
    }

    this.currentCategory.name = this.categoryName;
    this.currentCategory.isDefault = this.categoryIsDefault;

    if (this.currentCategory.isDefault) {
      this.removeDefaultAll();
    }
    else {
      this.persistService.put('categories', this.currentCategory.id, this.currentCategory).subscribe(() => {
        this.globalStateService.sendMessage('CategoryChanged');
      });
    }

    this.resetForm();
    this.formVisible = false;
  }

  public onCheckboxChange(event: MatCheckboxChange): void {
    this.categoryIsDefault = event.checked;
  }

  public onCategoryClick(category: ListCategory): void {
    this.actionVerb = "Save";
    this.formVisible = true;

    this.currentCategory = category;
    this.categoryName = category.name;
    this.categoryIsDefault = category.isDefault;
  }

  public onDeleteCategory(): void {
    const dialogData = new ConfirmDialogModel("You want to delete this category?", "Confirm Action");
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "300px",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        // rendu ici
        this.persistService.delete('categories', this.currentCategory.id).subscribe((cat: ListCategory) => {
          this.globalStateService.sendMessage('CategoryChanged');
          this.persistService.query('headers', true).subscribe((header: ListHeader) => {
            if (header.idCategory === this.currentCategory.id) {
              this.persistService.query('items', true).subscribe(
                (item: ListItem) => {

                  if (item.idHeader === header.id) {
                    this.persistService.query('subitems', true).subscribe(
                      (sub: SubItem) => {
                        if (sub.idItem === item.id) {
                          this.persistService.delete('subitems', sub.id).subscribe(() => { /* noop */ });
                        }
                      },
                      (err) => console.log(err),
                      (/* subitems completed */) => {
                        this.persistService.delete('items', item.id).subscribe(() => { /* noop */ });
                      }
                    );
                  }

                },
                (err) => console.log(err),
                (/* items completed */) => {
                  this.persistService.delete('headers', header.id).subscribe(() => { /* noop */ });
                }
              );
            }
          });
        });
        this.loadCategories();
        this.toggleFormVisibility();
      }
    });
  }

  // helpers

  public toggleFormVisibility() {
    this.formVisible = !this.formVisible;
    this.categoryName = '';
  }

  public get sortedCategories(): ListCategory[] {
    return this.categories.sort((a: ListCategory, b: ListCategory) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });
  }

  // private

  private resetForm(): void {
    this.categoryName = '';
    this.categoryIsDefault = false;
    this.actionVerb = "Add";
  }

  // There can only be one category with the default flag
  private removeDefaultAll(): void {
    this.categories.forEach((cat: ListCategory) => {
      if (cat.id !== this.currentCategory.id) {
        cat.isDefault = false;
      }
    });

    this.persistService.query('categories', true).subscribe(
      (cat: ListCategory) => {
        cat.isDefault = false;
        this.persistService.put('categories', cat.id, cat).subscribe(() => { /* noop */ });
      },
      err => { },
      ( /* completed */) => {
        this.persistService.put('categories', this.currentCategory.id, this.currentCategory).subscribe(() => {
          this.globalStateService.sendMessage('CategoryChanged');
        });
      });
  }

  private loadCategories() {
    this.categories = [];
    this.persistService.query('categories', true).subscribe((category: ListCategory) => {
      this.categories.push(category);
    });
  }

}
