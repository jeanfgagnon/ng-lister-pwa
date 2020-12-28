import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
import { Tools } from 'src/app/common/Tools';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manage-category',
  templateUrl: './manage-category.component.html',
  styleUrls: ['./manage-category.component.scss']
})
export class ManageCategoryComponent implements OnInit, OnDestroy {

  public categories: ListCategory[] = [];
  public headers: ListHeader[] = [];

  public categoryName = '';
  public categoryIsDefault = false;
  public formVisible = false;
  public actionVerb = 'Add';
  public errorMessage = '';

  private currentCategory!: ListCategory;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {

    this.loadCategories();

    // ramasse tout les headers plus quick
    this.persistService.query('headers', true).pipe(takeUntil(this.unsubscribe$)).subscribe((header: ListHeader) => {
      this.headers.push(header);
    });

    this.globalStateService.sendMessage('ManageCategories');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // event handlers

  public formSubmitted(e: Event): void {
    const normalizedName = Tools.capitalize(this.categoryName);
    this.persistService.exists<ListCategory>('categories', (cat: ListCategory) => {
      return (cat.text === normalizedName);
    }).pipe(takeUntil(this.unsubscribe$)).subscribe((exist: boolean) => {

      if (this.actionVerb === 'Add' && exist) {
        this.errorMessage = 'This category exists!';
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      }
      else {
        if (this.actionVerb === 'Add') {
          this.currentCategory = this.persistService.newCategoryInstance();
          this.categories.push(this.currentCategory);
        }

        this.currentCategory.text = normalizedName;
        this.currentCategory.isDefault = this.categoryIsDefault;

        if (this.currentCategory.isDefault) {
          this.removeDefaultAll();
        }
        else {
          this.persistService.put('categories', this.currentCategory.id, this.currentCategory).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.globalStateService.sendMessage('CategoryChanged');
          });
        }

        this.resetForm();
        this.formVisible = false;
      }
    });

  }

  public xxxformSubmitted(e: Event): void {
    const normalizedName = Tools.capitalize(this.categoryName);
    this.persistService.exists<ListCategory>('categories', (cat: ListCategory) => {
      return (cat.text === normalizedName);
    }).pipe(takeUntil(this.unsubscribe$)).subscribe((exists: boolean) => {

      if (!exists) {
        if (this.actionVerb === 'Add') {
          this.currentCategory = this.persistService.newCategoryInstance();
          this.categories.push(this.currentCategory);
        }

        this.currentCategory.text = normalizedName;
        this.currentCategory.isDefault = this.categoryIsDefault;

        if (this.currentCategory.isDefault) {
          this.removeDefaultAll();
        }
        else {
          this.persistService.put('categories', this.currentCategory.id, this.currentCategory).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.globalStateService.sendMessage('CategoryChanged');
          });
        }

        this.resetForm();
        this.formVisible = false;
      }
      else {
        this.errorMessage = 'This category exists!';
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      }
    });

  }

  public onCheckboxChange(event: MatCheckboxChange): void {
    this.categoryIsDefault = event.checked;
  }

  public onCategoryClick(category: ListCategory): void {
    this.actionVerb = 'Save';
    this.formVisible = true;

    this.currentCategory = category;
    this.categoryName = category.text;
    this.categoryIsDefault = category.isDefault;
  }

  public onDeleteCategory(): void {
    const dialogData = new ConfirmDialogModel('You want to delete this category?', 'Confirm Action');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.persistService.delete('categories', this.currentCategory.id).pipe(takeUntil(this.unsubscribe$)).subscribe((cat: ListCategory) => {
          this.globalStateService.sendMessage('CategoryChanged');
          this.persistService.query('headers', true).pipe(takeUntil(this.unsubscribe$)).subscribe((header: ListHeader) => {
            if (header.idCategory === this.currentCategory.id) {
              this.persistService.query('items', true).pipe(takeUntil(this.unsubscribe$)).subscribe(
                (item: ListItem) => {

                  if (item.idHeader === header.id) {
                    this.persistService.query('subitems', true).subscribe(
                      (sub: SubItem) => {
                        if (sub.idItem === item.id) {
                          this.persistService.delete('subitems', sub.id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
                        }
                      },
                      (err) => console.log(err),
                      (/* subitems completed */) => {
                        this.persistService.delete('items', item.id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
                      }
                    );
                  }

                },
                (err) => console.log(err),
                (/* items completed */) => {
                  this.persistService.delete('headers', header.id).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
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

  public toggleFormVisibility(): void {
    this.formVisible = !this.formVisible;
    this.categoryName = '';
  }

  public get sortedCategories(): ListCategory[] {
    return this.categories.sort((a: ListCategory, b: ListCategory) => {
      return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
    });
  }

  // private

  private resetForm(): void {
    this.categoryName = '';
    this.categoryIsDefault = false;
    this.actionVerb = 'Add';
  }

  // There can only be one category with the default flag
  private removeDefaultAll(): void {
    this.categories.forEach((cat: ListCategory) => {
      if (cat.id !== this.currentCategory.id) {
        cat.isDefault = false;
      }
    });

    this.persistService.query('categories', true).pipe(takeUntil(this.unsubscribe$)).subscribe(
      (cat: ListCategory) => {
        cat.isDefault = false;
        this.persistService.put('categories', cat.id, cat).pipe(takeUntil(this.unsubscribe$)).subscribe(() => { /* noop */ });
      },
      err => { },
      ( /* completed */) => {
        this.persistService.put('categories', this.currentCategory.id, this.currentCategory).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          this.globalStateService.sendMessage('CategoryChanged');
        });
      });
  }

  private loadCategories(): void {
    this.categories = [];
    this.persistService.query('categories', true).pipe(takeUntil(this.unsubscribe$)).subscribe((category: ListCategory) => {
      if (category.id !== 'quick') {
        this.categories.push(category);
      }
    });
  }

}
