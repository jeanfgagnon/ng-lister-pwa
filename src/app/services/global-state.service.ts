import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ListCategory } from '../models/list-category';

import { PersistService } from './persist.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {

  private _isManageListScrollSetted = false;
  private _currentSelectedIdCategory = '';
  private messageSubject = new Subject<string>();

  public message$ = this.messageSubject.asObservable();

  constructor(
    private persistService: PersistService
  ) {
    this.persistService.query('categories', true).subscribe((cat: ListCategory) => {
      if (cat.isDefault || this._currentSelectedIdCategory === '') {
        this._currentSelectedIdCategory = cat.id;
      }
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


  public get IsManageListScrollSetted(): boolean {
    return this._isManageListScrollSetted;
  }
  public set IsManageListScrollSetted(value: boolean) {
    this._isManageListScrollSetted = value;
  }

  // public interface

  public sendMessage(message: string): void {
    this.messageSubject.next(message);
  }
}
