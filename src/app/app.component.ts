import { Component, HostBinding, OnInit } from '@angular/core';

import { ThemingService } from './services/theming.service';
import { GlobalStateService } from './services/global-state.service';
import { PersistService } from './services/persist.service';
import { ApplicationSetting } from './models/application-setting';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ng-lister-pwa';

  constructor(
    private themingService: ThemingService
  ) { }
  @HostBinding('class') public cssClass!: string;

  ngOnInit(): void {
    this.themingService.theme.subscribe((theme: string) => {
      this.cssClass = theme;
    });
  }
}
