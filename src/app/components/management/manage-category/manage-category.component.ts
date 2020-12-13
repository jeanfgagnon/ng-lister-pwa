import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';
import { ListCategory } from 'src/app/models/list-category';
import { ListHeader } from 'src/app/models/list-header';

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
    ) { }

  ngOnInit(): void {

    this.persistService.query('categories', true).subscribe((category: ListCategory) => {
      this.categories.push(category);
    });

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

  // helpers

  public toggleFormVisibility() {
    this.formVisible = !this.formVisible;
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
}
