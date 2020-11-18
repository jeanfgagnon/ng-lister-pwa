import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListHeader } from 'src/app/models/list-header';

import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-manage-item',
  templateUrl: './manage-item.component.html',
  styleUrls: ['./manage-item.component.scss']
})
export class ManageItemComponent implements OnInit {

  public listId = '';
  public header = new ListHeader();

  constructor(
    private activatedRoute: ActivatedRoute,
    private persistService: PersistService
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.listId = params['id'];
      this.persistService.get('headers', this.listId).subscribe((header: ListHeader) => {
        this.header = header;
      });
    });
  }

  // helpers

  public get xxheader(): ListHeader {
    return this.header;
  }
}
