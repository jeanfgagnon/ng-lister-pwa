import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {

  private _currentManagedIdCategory = '';

  constructor() { }

  // properties

  public get CurrentManagedIdCategory(): string {
    return this._currentManagedIdCategory;
  }
  public set CurrentManagedIdCategory(value: string) {
    this._currentManagedIdCategory = value;
  }

}
