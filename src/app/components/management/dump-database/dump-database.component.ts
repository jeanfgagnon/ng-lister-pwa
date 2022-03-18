import { combineLatest, Subject } from 'rxjs';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { saveAs } from 'file-saver';

import { PersistService } from 'src/app/services/persist.service';

import { ListCategory } from 'src/app/models/list-category';
import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { SubItem } from 'src/app/models/sub-item';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { takeUntil } from 'rxjs/operators';
import { ApplicationSetting } from 'src/app/models/application-setting';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-dump-database',
  templateUrl: './dump-database.component.html',
  styleUrls: ['./dump-database.component.scss']
})
export class DumpDatabaseComponent implements OnInit, OnDestroy, AfterViewInit {

  private categories: ListCategory[] = [];
  private headers: ListHeader[] = [];
  private items: ListItem[] = [];
  private subItems: SubItem[] = [];
  private settings: ApplicationSetting[] = [];

  private unsubscribe$ = new Subject<void>();

  public json = '';
  public dumpMethod = '';

  @ViewChild('dumpzone') dumpzone!: ElementRef;

  constructor(
    private persistService: PersistService,
    private globalStateService: GlobalStateService,
    @Inject('Window') private window: Window
  ) { }

  ngOnInit(): void {
    this.globalStateService.sendMessage('ManageBackup');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    const tree$ = combineLatest(
      [
        this.persistService.query('categories', true),
        this.persistService.query('headers', true),
        this.persistService.query('items', true),
        this.persistService.query('subitems', true),
        this.persistService.query('settings', true)
      ]
    );
    tree$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      ([category, header, item, subItem, setting]) => {
        this.appendObject(this.categories, category);
        this.appendObject(this.headers, header);
        this.appendObject(this.items, item);
        this.appendObject(this.subItems, subItem);
        this.appendObject(this.settings, setting);
      },
      (error) => { },
      (/* complete */) => {
        this.tieAll();
        this.writeTree();
      }
    );
  }

  // event handlers

  public onClip(): void {
    this.window.navigator.vibrate(200);
  }

  // helpers

  public setDumpMethod(method: string): void {
    this.dumpMethod = method;
    if (method === 'cut') {
      this.dumpzone.nativeElement.innerText = this.json;
    }
    else {
      this.downloadJson(this.json);
    }
  }

  // privates

  private appendObject(srcArray: any[], v: ListCategory | ListHeader | ListItem | SubItem | ApplicationSetting): void {
    if (srcArray.findIndex(x => x.id === v.id) === -1) {
      srcArray.push(v);
    }
  }

  private tieAll(): void {
    this.categories.forEach((category: ListCategory) => {
      category.headers = this.headers.filter(h => h.idCategory === category.id);
      this.headers.forEach((header: ListHeader) => {
        header.items = this.items.filter(x => x.idHeader === header.id);
        header.items.forEach((item: ListItem) => {
          item.subs = this.subItems.filter(x => x.idItem === item.id);
        });
      });
    });
  }

  private writeTree(): void {
    const top = {
      version: this.persistService.dbVersion,
      date: new Date(),
      settings: this.settings,
      database: this.categories
    };
    this.json = JSON.stringify(top, null, 2);
  }

  private downloadJson(json: string): void {
    const blob = new Blob([json], { type: 'application/json' });
    FileSaver.saveAs(blob, "lister-database.txt");
  }

}
