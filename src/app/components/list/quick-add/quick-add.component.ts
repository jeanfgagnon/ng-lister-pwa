import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IIDText } from 'src/app/models/interface-id-text';

@Component({
  selector: 'app-quick-add',
  templateUrl: './quick-add.component.html',
  styleUrls: ['./quick-add.component.scss']
})
export class QuickAddComponent implements OnInit {

  private _editText = '';
  public quickText = '';
  public mode: 'add' | 'edit' = 'add';

  @Output() itemAdded = new EventEmitter<IIDText>();
  @Output() editCancelled = new EventEmitter();
  @Input() idHeader = '';

  constructor() { }

  ngOnInit(): void {
  }

  // event handlers

  public cancelEdit(): void {
    this.editCancelled.emit();
  }

  public onAddClick(): void {
    if (this.quickText.trim() !== '') {
      if (this.itemAdded && this.idHeader) {
        this.itemAdded.emit({
          id: this.idHeader,
          text: this.quickText
        });
      }
      this.quickText = '';
      this.mode = 'add';
    }
  }

  @Input() set editText(text: string) {
    this.quickText = text;
    this.mode = text ? 'edit' : 'add';
  }
}
