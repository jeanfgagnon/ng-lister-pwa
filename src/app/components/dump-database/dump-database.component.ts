import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { PersistService } from 'src/app/services/persist.service';

import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { SubItem } from 'src/app/models/sub-item';
import { combineLatest, forkJoin, Observable, Subscription, zip } from 'rxjs';

import { map } from 'rxjs/operators';
@Component({
  selector: 'app-dump-database',
  templateUrl: './dump-database.component.html',
  styleUrls: ['./dump-database.component.scss']
})
export class DumpDatabaseComponent implements OnInit, AfterViewInit {

  private headers: ListHeader[] = [];
  private items: ListItem[] = [];
  private subItems: SubItem[] = [];

  public json = '';

  @ViewChild('dumpzone') dumpzone!: ElementRef;

  constructor(
    private persistService: PersistService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const tree$ = combineLatest(
      [
        this.persistService.query('headers', true),
        this.persistService.query('items', true),
        this.persistService.query('subitems', true)
      ]
    );
    tree$.subscribe(
      ([v1, v2, v3]) => {
        this.appendObject(this.headers, v1);
        this.appendObject(this.items, v2);
        this.appendObject(this.subItems, v3);
      },
      (error) => { },
      (/* complete */) => {
        this.tieAll();
        this.writeTree();
      }
    );
  }

  // privates

  private appendObject(srcArray: any[], v: ListHeader | ListItem | SubItem): void {
    if (srcArray.findIndex(x => x.id === v.id) === -1) {
      srcArray.push(v);
    }
  }

  private tieAll(): void {
    this.headers.forEach((header: ListHeader) => {
      header.items = this.items.filter(x => x.idHeader === header.id);
      header.items.forEach((item: ListItem) => {
        item.subs = this.subItems.filter(x => x.idItem === item.id);
      });
    });

  }

  private writeTree(): void {
    this.json = JSON.stringify(this.headers, null, 2)
    this.dumpzone.nativeElement.innerText = this.json;
  }

}
