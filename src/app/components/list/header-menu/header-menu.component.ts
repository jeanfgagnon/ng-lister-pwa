import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ListHeader } from 'src/app/models/list-header';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss']
})
export class HeaderMenuComponent implements OnInit, AfterViewInit {

  public scrollto: HTMLDivElement;

  @Input() listHeaders: ListHeader[];
  @Input() selectedIdHeader: string;
  @Output() selected = new EventEmitter<string>()
  @ViewChildren('menu', { read: ElementRef }) menuItems: QueryList<ElementRef>;

  constructor() { }

  ngOnInit(): void {
    console.log('menu headers ', this.listHeaders);
  }

  ngAfterViewInit(): void {
    const index = this.listHeaders.findIndex(x => x.id === this.selectedIdHeader);
    if (index > -1) {
      this.menuItems.forEach((el: ElementRef, i: number) => {
        if (i === index) {
          el.nativeElement.scrollIntoView({behaviour: 'smooth'});
        }
      })
    }
  }

  // event handlers

  public headerSelected(id: string): void {
    this.selected.emit(id);
  }

}
