import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';

import { ListCategory } from 'src/app/models/list-category';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { Tools } from 'src/app/common/Tools';

@Component({
  selector: 'app-manage-list',
  templateUrl: './manage-list.component.html',
  styleUrls: ['./manage-list.component.scss']
})
export class ManageListComponent implements OnInit, AfterViewInit {

  public listName = '';
  public formVisible = false;
  public headers: ListHeader[] = [];
  public allItems: ListItem[] = [];
  public categories: ListCategory[] = [];

  public selectedCategoryId = '';

  private scrollSetted = false;
  @ViewChild('scrollzone') scrollzone!: ElementRef;

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
  ) { }

  ngOnInit(): void {
    this.globalStateService.sendMessage('ManageLists');
    this.globalStateService.message$.subscribe((m: string) => {
      if (m === 'CategoryChanged') {
        this.categories = [];
        this.persistService.query('categories', true).subscribe((cat: ListCategory) => {
          this.categories.push(cat);
        });
      }
    });

    this.persistService.query('categories', true).subscribe(
      (cat: ListCategory) => {
        this.categories.push(cat);
        if (cat.isDefault) {

          // douteux. pas besoin de faire ce machin je crois
          // console.log('douteux curr cat id ==> %s', this.globalStateService.CurrentSelectedIdCategory);
          // if (this.globalStateService.CurrentSelectedIdCategory === '') {
          //   this.globalStateService.CurrentSelectedIdCategory = cat.id;
          // }

          this.selectedCategoryId = this.globalStateService.CurrentSelectedIdCategory;
        }
      },
      (err) => { },
      (/* completed */) => {
        this.persistService.query("headers", true).subscribe((header: ListHeader) => {
          if (header.idCategory === this.selectedCategoryId || header.idCategory === undefined) {
            this.headers.push(header);
          }
        });
      }
    );

    this.persistService.query("items", true).subscribe((item: ListItem) => {
      this.allItems.push(item);
    });
  }

  ngAfterViewInit(): void {
    this.setScrollerHeight();
  }

  // event handlers

  public onCategorySelected(e: MatSelectChange) {
    this.globalStateService.CurrentSelectedIdCategory = e.value;
    this.selectedCategoryId = this.globalStateService.CurrentSelectedIdCategory;
    this.headers = [];
    this.persistService.query("headers", true).subscribe((header: ListHeader) => {
      if (header.idCategory === this.selectedCategoryId) {
        this.headers.push(header);
      }
    });
  }

  public formSubmitted(e: Event): void {
    if (this.listName.trim() !== '') {
      const h = this.persistService.newHeaderInstance(this.selectedCategoryId);
      h.name = Tools.capitalize(this.listName);
      this.persistService.put('headers', h.id, h).subscribe((key: any) => {
        this.headers.push(h);
        this.listName = '';
        this.formVisible = false;
        setTimeout(() => this.recalcScroll(), 0);
      });
    }
  }

  // helpers

  public itemCount(idHeader: string): string {
    let rv = '';
    const count = this.allItems.filter(x => x.idHeader === idHeader).length;
    if (count > 0) {
      rv = `(${count})`;
    }

    return rv;
  }

  public get sortedHeaders(): ListHeader[] {
    return this.headers.sort((a: ListHeader, b: ListHeader) => {
      return a.name.localeCompare(b.name);
    });
  }

  public get sortedCategories(): ListCategory[] {
    return this.categories.sort((a: ListCategory, b: ListCategory) => {
      return a.name.localeCompare(b.name);
    });
  }

  public toggleFormVisibility() {
    this.formVisible = !this.formVisible;
    setTimeout(() => this.recalcScroll(), 0);
  }

  // privates

  private recalcScroll(): void {
    this.globalStateService.IsManageListScrollSetted = false;
    this.setScrollerHeight();
  }

  private setScrollerHeight(): void {
    if (!this.globalStateService.IsManageListScrollSetted) { // PTF? this is far from clean ;-(
      const top = this.scrollzone.nativeElement.getBoundingClientRect().top;
      this.scrollzone.nativeElement.style.height = `${window.innerHeight - (top + 20)}px`;
      this.globalStateService.IsManageListScrollSetted = true;
    }
  }
}
