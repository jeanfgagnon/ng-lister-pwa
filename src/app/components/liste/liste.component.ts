import { Component, OnInit } from '@angular/core';
import { ListHeader } from 'src/app/models/list-header';

import { PersistService } from 'src/app/services/persist.service';

@Component({
  selector: 'app-liste',
  templateUrl: './liste.component.html',
  styleUrls: ['./liste.component.scss']
})
export class ListeComponent implements OnInit {

  public headers: ListHeader[] = [];

  constructor(
    private persistService: PersistService
  ) { }

  ngOnInit(): void {
    this.persistService.query("headers").subscribe((pair: any) => {
      this.headers.push(pair.value);
    });

  }

}
