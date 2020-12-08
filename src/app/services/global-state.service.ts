import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ListCategory } from '../models/list-category';

import { PersistService } from './persist.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {

  private _currentSelectedIdCategory = '';
  private messageSubject = new Subject<string>();

  public message$ = this.messageSubject.asObservable();

  constructor(
    private persistService: PersistService
  ) {
    this.persistService.query('categories', true).subscribe(
      (cat: ListCategory) => {
        if (cat.isDefault || this._currentSelectedIdCategory === '') {
          this._currentSelectedIdCategory = cat.id;
        }
      },
      (err) => {
      },
      (/* complete */) => {
        this.sendMessage('DefaultCategory');
      });
  }

  // properties

  public get CurrentSelectedIdCategory(): string {
    return this._currentSelectedIdCategory;
  }
  public set CurrentSelectedIdCategory(value: string) {
    this._currentSelectedIdCategory = value;
    this.sendMessage('SelectedCategory');
  }

  // public interface

  public sendMessage(message: string): void {
    this.messageSubject.next(message);
  }
}
