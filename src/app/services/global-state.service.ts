import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ListCategory } from '../models/list-category';

import { PersistService } from './persist.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {

  private _currentSelectedIdCategory = '';
  private categorySubject = new Subject<string>();

  public category$ = this.categorySubject.asObservable();

  constructor(
    private persistService: PersistService
  ) {
    this.persistService.query('categories', true).subscribe(
      (cat: ListCategory) => {
        if (cat.isDefault || this._currentSelectedIdCategory === '') {
          this._currentSelectedIdCategory = cat.id;
        }
      },
      (err) => { },
      (/* complete */) => {
        this.categorySubject.next(this._currentSelectedIdCategory);
      });
  }

  // properties

  public get CurrentSelectedIdCategory(): string {
    return this._currentSelectedIdCategory;
  }
  public set CurrentSelectedIdCategory(value: string) {
    this._currentSelectedIdCategory = value;
  }

  // public interface

  public changeCategory(idCategory: string): void {
    this.categorySubject.next(idCategory);
  }
}
