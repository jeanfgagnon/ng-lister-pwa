import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { LayoutModule } from '@angular/cdk/layout';

import { environment } from '../environments/environment';

import { MyMaterialModule } from './modules/my-material.module';

import { MainNavComponent } from './components/main-nav/main-nav.component';
import { ListeComponent } from './components/list/liste-menu/liste-menu.component';
import { CheckListComponent } from './components/list/check-list/check-list.component';
import { CheckItemComponent } from './components/list/check-item/check-item.component';
import { ConsolidatedViewComponent } from './components/list/consolidated-view/consolidated-view.component';
import { QuickAddComponent } from './components/list/quick-add/quick-add.component';

// Ceci pour permettre que le Date Pipe fonctionne.
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeFr, 'fr-CA', localeFrExtra);

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    ListeComponent,
    CheckListComponent,
    CheckItemComponent,
    ConsolidatedViewComponent,
    QuickAddComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MyMaterialModule,
    LayoutModule,
    ClipboardModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    { provide: 'Window', useValue: window }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
