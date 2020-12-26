import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ApplicationSetting } from '../models/application-setting';
import { ListCategory } from '../models/list-category';

import { PersistService } from './persist.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {

  private _appSettings: ApplicationSetting[] = [];
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
    this.persistService.query('settings', true).subscribe((setting: ApplicationSetting) => {
      this._appSettings.push(setting);
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

  public putSetting(name: string, value: string): void {
    let setting = this._appSettings.find(x => x.name === name);
    if (setting) {
      setting.value = value;
    }
    else {
      setting = this.persistService.newSettingInstance();
      setting.name = name;
      setting.value = value;
    }

    this.persistService.put('settings', setting.id, setting).subscribe((setting: ApplicationSetting) => {
      this._appSettings.push(setting);
    });
  }

  public getSetting(name: string): string {
    const rv = this._appSettings.find(x => x.name === name);

    return rv ? rv.value : '';
  }
}
