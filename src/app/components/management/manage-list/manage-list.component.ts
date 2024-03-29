import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { GlobalStateService } from 'src/app/services/global-state.service';
import { PersistService } from 'src/app/services/persist.service';

import { ListCategory } from 'src/app/models/list-category';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { Tools } from 'src/app/common/Tools';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manage-list',
  templateUrl: './manage-list.component.html',
  styleUrls: ['./manage-list.component.scss']
})
export class ManageListComponent implements OnInit, OnDestroy, AfterViewInit {

  public listName = '';
  public formVisible = false;
  public headers: ListHeader[] = [];
  public allItems: ListItem[] = [];
  public categories: ListCategory[] = [];
  public errorMessage = '';

  public selectedCategoryId = '';

  private scrollSetted = false;
  private unsubscribe$ = new Subject<void>();

  @ViewChild('scrollzone') scrollzone!: ElementRef;

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
  ) { }

  ngOnInit(): void {
    this.globalStateService.sendMessage('ManageLists');
    this.globalStateService.message$.pipe(takeUntil(this.unsubscribe$)).subscribe((m: string) => {
      if (m === 'CategoryChanged') {
        this.categories = [];
        this.persistService.query('categories', true).pipe(takeUntil(this.unsubscribe$)).subscribe((cat: ListCategory) => {
          if (cat.id !== 'quick') {
            this.categories.push(cat);
          }
        });
      }
    });

    this.persistService.query('categories', true).pipe(takeUntil(this.unsubscribe$)).subscribe(
      (cat: ListCategory) => {
        if (cat.id !== 'quick') {
          this.categories.push(cat);
          if (cat.isDefault) {
            this.selectedCategoryId = this.globalStateService.CurrentSelectedIdCategory;
          }
        }
      },
      (err) => { },
      (/* completed */) => {
        this.persistService.query('headers', true).pipe(takeUntil(this.unsubscribe$)).subscribe((header: ListHeader) => {
          if (header.idCategory === this.selectedCategoryId || header.idCategory === undefined) {
            this.headers.push(header);
          }
        });
      }
    );

    this.persistService.query('items', true).pipe(takeUntil(this.unsubscribe$)).subscribe((item: ListItem) => {
      this.allItems.push(item);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    //this.setScrollerHeight();
  }

  // event handlers

  public onCategorySelected(e: MatSelectChange): void {
    this.globalStateService.CurrentSelectedIdCategory = e.value;
    this.selectedCategoryId = this.globalStateService.CurrentSelectedIdCategory;
    this.headers = [];
    this.persistService.query('headers', true).pipe(takeUntil(this.unsubscribe$)).subscribe((header: ListHeader) => {
      if (header.idCategory === this.selectedCategoryId) {
        this.headers.push(header);
      }
    });
  }

  public formSubmitted(e: Event): void {
    if (this.listName.trim() !== '') {
      const stdListText = Tools.capitalize(this.listName.trim());
      this.persistService.exists<ListHeader>('headers', (h: ListHeader) => {
        return (h.idCategory === this.selectedCategoryId && h.text === stdListText);
      }).pipe(takeUntil(this.unsubscribe$)).subscribe((exists: boolean) => {

        if (!exists) {
          const header = this.persistService.newHeaderInstance(this.selectedCategoryId);
          header.text = Tools.capitalize(this.listName);
          this.persistService.put('headers', header.id, header).pipe(takeUntil(this.unsubscribe$)).subscribe((key: any) => {
            this.headers.push(header);
            this.listName = '';
            this.formVisible = false;
            setTimeout(() => this.recalcScroll(), 0);
          });
        }
        else {
          const selectedCategory = this.categories.find(x => x.id === this.selectedCategoryId);
          this.errorMessage = `This list exists in ${selectedCategory?.text}!`;
          setTimeout(() => { this.errorMessage = ''; }, 5000);
        }
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
      return a.text.localeCompare(b.text);
    });
  }

  public get sortedCategories(): ListCategory[] {
    return this.categories.sort((a: ListCategory, b: ListCategory) => {
      return a.text.localeCompare(b.text);
    });
  }

  public toggleFormVisibility(): void {
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
