import { AfterViewInit } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ListHeader } from 'src/app/models/list-header';

import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-manage-list',
  templateUrl: './manage-list.component.html',
  styleUrls: ['./manage-list.component.scss']
})
export class ManageListComponent implements OnInit, AfterViewInit {

  public listName = '';
  public formVisible = false;
  public headers: ListHeader[] = [];

  private scrollDivTop = 0;

  @ViewChild('container') container!: ElementRef;
  @ViewChild('scrollDiv') scrollDiv!: ElementRef;

  constructor(
    private persistService: PersistService
  ) { }

  ngOnInit(): void {
    this.persistService.query("headers").subscribe((pair: any) => {
      this.headers.push(pair.value);
    });
  }

  ngAfterViewInit(): void {
    //this.container.nativeElement.style.height = (window.innerHeight - this.container.nativeElement.offsetTop - 10) + 'px';
    this.scrollDiv.nativeElement.style.width = `${window.innerWidth - this.scrollDiv.nativeElement.offsetLeft - 10}px`;
    this.scrollDivTop = this.scrollDiv.nativeElement.offsetTop;
    this.replaceScollerDiv();
  }

  // event handlers

  public formSubmitted(e: Event): void {
    if (this.listName.trim() !== '') {
      const h = this.persistService.newHeaderInstance();
      h.name = this.listName;
      this.persistService.put('headers', h.id, h).subscribe((key: any) => {
        this.headers.push(h);
        this.listName = '';
        this.formVisible = false;
        this.replaceScollerDiv();
      });
    }
  }

  // helpers

  public toggleFormVisibility() {
    this.formVisible = !this.formVisible;
    this.replaceScollerDiv();
  }

  // privates

  private replaceScollerDiv(): void {
    let h = window.innerHeight - (this.container.nativeElement.offsetTop + this.scrollDivTop);
    if (this.formVisible) {
      h -= 40;
    }
    else {
      h += 30;
    }
    this.scrollDiv.nativeElement.style.height = `${h}px`;
  }
}
