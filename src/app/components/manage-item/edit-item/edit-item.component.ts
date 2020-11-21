import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ListHeader } from 'src/app/models/list-header';
import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss']
})
export class EditItemComponent implements OnInit {

  public headerId = '';
  public itemId = '';
  public header = new ListHeader();

  public verb = 'Edit';

  constructor(
    private activatedRoute: ActivatedRoute,
    private persistService: PersistService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.headerId = params['id'];
      this.itemId = params['itemid'];
      if (this.itemId === '') {
        this.verb = 'Add';
      }
      this.persistService.get('headers', this.headerId).subscribe((header: ListHeader) => {
        this.header = header;
      });
    });
  }

  // event handlers

  public cancel() {
    this.location.back();
  }
}
