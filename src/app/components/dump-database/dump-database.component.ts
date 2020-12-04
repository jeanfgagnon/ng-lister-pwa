import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { PersistService } from 'src/app/services/persist.service';

import { ListHeader } from 'src/app/models/list-header';
import { ListItem } from 'src/app/models/list-item';
import { SubItem } from 'src/app/models/sub-item';

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
    this.loadTree();
    // this.persistService.query('headers', true).subscribe(
    //   (header: ListHeader) => {
    //     console.log('header ', header.name);
    //     this.headers.push(header);
    //     header.items = [];
    //     this.persistService.query('items', true).subscribe((item: ListItem) => {
    //       console.log('item ', item.text);
    //       if (item.idHeader === header.id) {
    //         header.items.push(item);
    //         item.subs = [];
    //         this.persistService.query('subitems', true).subscribe((sub: SubItem) => {
    //           console.log('subitem ', sub.text);
    //           if (sub.idItem === item.id) {
    //             item.subs.push(sub);
    //           }
    //         });
    //       }
    //     });
    //   },
    //   (err) => { },
    //   () => {
    //     /* finaly */
    //     console.log(JSON.stringify(this.headers, null, 2));
    //   }
    // );
  }

  ngAfterViewInit(): void {
    this.dumpzone.nativeElement.innerText = "putain\nde\nchameau";
    setTimeout(() => console.log(JSON.stringify(this.headers, null, 2), 1000));
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
        console.log('all header loaded');
        console.log(JSON.stringify(this.headers, null, 2));
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
}
