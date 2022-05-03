import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ListHeader } from 'src/app/models/list-header';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss']
})
export class HeaderMenuComponent implements OnInit, AfterViewInit {

  private _selectedIdHeader: string;

  public scrollto: HTMLDivElement;

  @Input() listHeaders: ListHeader[];
  @Output() selected = new EventEmitter<string>()
  @ViewChildren('menu', { read: ElementRef }) menuItems: QueryList<ElementRef>;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void { // TODO: this should be a function DRY
    const index = this.listHeaders.findIndex(x => x.id === this.selectedIdHeader);
    if (index > -1) {
      this.menuItems.forEach((el: ElementRef, i: number) => {
        if (i === index) {
          el.nativeElement.scrollIntoView({ behaviour: 'smooth' });
        }
      })
    }
  }

  // event handlers

  public headerSelected(id: string): void {
    this.selected.emit(id);
  }

  // properties

  @Input() public set selectedIdHeader(id: string) {
    this._selectedIdHeader = id;
    if (this.menuItems) { // DRY
      const index = this.listHeaders.findIndex(x => x.id === this._selectedIdHeader);
      if (index > -1) {
        this.menuItems.forEach((el: ElementRef, i: number) => {
          if (i === index) {
            el.nativeElement.scrollIntoView({ behaviour: 'smooth' });
          }
        })
      }
    }
  }
  public get selectedIdHeader(): string {
    return this._selectedIdHeader;
  }

}
