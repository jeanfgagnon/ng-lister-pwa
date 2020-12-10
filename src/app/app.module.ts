import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { MyMaterialModule } from './modules/my-material.module';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatIconModule } from '@angular/material/icon';
// import { MatListModule } from '@angular/material/list';
import { ListeComponent } from './components/liste/liste.component';
import { ManageListComponent } from './components/manage-list/manage-list.component';
import { ManageItemComponent } from './components/manage-item/manage-item.component';
import { EditItemComponent } from './components/manage-item/edit-item/edit-item.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { CheckListComponent } from './components/check-list/check-list.component';
import { CheckItemComponent } from './components/check-item/check-item.component';
import { environment } from '../environments/environment';
import { DumpDatabaseComponent } from './components/dump-database/dump-database.component';
import { ManageComponent } from './components/manage/manage.component';
import { ManageCategoryComponent } from './components/manage-category/manage-category.component';
import { ConsolidatedViewComponent } from './components/consolidated-view/consolidated-view.component';
import { BackupDatabaseComponent } from './components/backup-database/backup-database.component';
import { RestoreDatabaseComponent } from './components/restore-database/restore-database.component';

// cette scrap pour que la date pipe fonctionne!!!
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeFr, 'fr-CA', localeFrExtra);

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    ListeComponent,
    ManageListComponent,
    ManageItemComponent,
    EditItemComponent,
    ConfirmDialogComponent,
    CheckListComponent,
    CheckItemComponent,
    DumpDatabaseComponent,
    ManageComponent,
    ManageCategoryComponent,
    ConsolidatedViewComponent,
    BackupDatabaseComponent,
    RestoreDatabaseComponent
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
