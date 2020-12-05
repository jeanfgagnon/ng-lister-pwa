import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { PersistService } from 'src/app/services/persist.service';

import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { SubItem } from 'src/app/models/sub-item';
import { combineLatest, forkJoin, Observable, Subscription } from 'rxjs';

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

  @ViewChild('dumpzone') dumpzone!: ElementRef;

  constructor(
    private persistService: PersistService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.loadTree();
  }

  // privates

  private loadTree(): void {
    this.persistService.query('headers', true).subscribe(
      (header: ListHeader) => {
        this.headers.push(header);
      },
      (error) => { },
      (/* complete */) => {
        this.loadItems();
      }
    );
  }

  private loadItems(): void {
    this.persistService.query('items', true).subscribe(
      (item: ListItem) => {
        this.items.push(item);
      },
      (error) => { },
      (/* complete */) => {
        this.loadSubItems();
      }
    );
  }

  private loadSubItems(): void {
    this.persistService.query('subitems', true).subscribe(
      (subItem: SubItem) => {
        this.subItems.push(subItem);
      },
      (error) => { },
      (/* complete */) => {
        this.tieAll();
        this.writeTree();
      }
    );
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
    this.dumpzone.nativeElement.innerText = JSON.stringify(this.headers, null, 2);
  }
}
