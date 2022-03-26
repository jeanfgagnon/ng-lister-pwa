import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MyMaterialModule } from './my-material.module';
import { ConfigRoutingModule } from './config-routing.module';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmDialogComponent } from '../components/management/confirm-dialog/confirm-dialog.component';
import { DumpDatabaseComponent } from '../components/management/dump-database/dump-database.component';
import { EditSettingsComponent } from '../components/management/edit-settings/edit-settings.component';
import { FreshInstallComponent } from '../components/management/fresh-install/fresh-install.component';
import { ManageCategoryComponent } from '../components/management/manage-category/manage-category.component';
import { EditItemComponent } from '../components/management/manage-item/edit-item/edit-item.component';
import { ManageItemComponent } from '../components/management/manage-item/manage-item.component';
import { ManageListComponent } from '../components/management/manage-list/manage-list.component';
import { RestoreDatabaseComponent } from '../components/management/restore-database/restore-database.component';


@NgModule({
  declarations: [
    ConfirmDialogComponent,
    DumpDatabaseComponent,
    ManageCategoryComponent,
    ManageItemComponent,
    EditItemComponent,
    ManageListComponent,
    RestoreDatabaseComponent,
    EditSettingsComponent,
    FreshInstallComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ClipboardModule,
    MyMaterialModule,
    ConfigRoutingModule,
    MatProgressSpinnerModule
  ]
})
export class ConfigModule { }
