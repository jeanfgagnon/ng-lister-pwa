import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IIDText } from 'src/app/models/interface-id-text';

@Component({
  selector: 'app-quick-add',
  templateUrl: './quick-add.component.html',
  styleUrls: ['./quick-add.component.scss']
})
export class QuickAddComponent implements OnInit {

  public quickText = '';

  @Output() itemAdded = new EventEmitter<IIDText>();
  @Input() idHeader = '';

  constructor() { }

  ngOnInit(): void {
  }

  // event handlers

  public onAddClick(): void {
    if (this.quickText.trim() !== '') {
      if (this.itemAdded && this.idHeader) {
        this.itemAdded.emit({
          id: this.idHeader,
          text: this.quickText
        });
      }
      this.quickText = '';
    }
  }
}
