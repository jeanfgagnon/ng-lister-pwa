import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ListHeader } from 'src/app/models/list-header';
import { PersistService } from 'src/app/services/persist.service';
import { ListItem } from 'src/app/models/list-item';

@Component({
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss']
})
export class EditItemComponent implements OnInit {

  public headerId = ''; // oter ca
  public itemId = '';   // idem

  public header = new ListHeader();
  public item = new ListItem();

  public addMore = false;
  public itemText = '';
  public subItem = false;
  public subItemText1 = '';
  public subItemText2 = '';

  public verb = 'Edit';

  constructor(
    private activatedRoute: ActivatedRoute,
    private persistService: PersistService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.item.text = '';
    this.activatedRoute.params.subscribe(params => {
      this.headerId = params['id'];
      this.itemId = params['itemid'];
      if (this.itemId === '') {
        this.verb = 'Add';
      }
      else {
        console.log('edit-item itemId ', this.itemId);
        this.persistService.get('items', this.itemId).subscribe((item: ListItem) => {
          this.item = item;
        });
      }
      this.persistService.get('headers', this.headerId).subscribe((header: ListHeader) => {
        console.log('header ', header);
        this.header = header;
      });
    });
  }

  // event handlers

  public cancel() {
    this.location.back();
  }

  public formSubmitted(e: Event) {

    let listItem;
    if (this.verb === 'Add') {
      listItem = this.persistService.newItemInstance(this.header.id);
      listItem.text = this.item.text;
    }
    else {
      listItem = this.item;
    }

    this.persistService.put('items', listItem.id, listItem).subscribe((key: any) => {
      if (this.addMore) {
        this.reset();
      }
      else {
        this.location.back(); // ou navigate pour le reload? weeeellll sees ssoon
      }
    });
  }

  // private

  private reset(): void {
    this.itemText = '';
    this.subItemText1 = '';
    this.subItemText2 = '';
    this.subItem = false;
  }
}
