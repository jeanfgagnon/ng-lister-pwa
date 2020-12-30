import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MyMaterialModule } from './my-material.module';
import { ConfigRoutingModule } from './config-routing.module';

import { RestoreDatabaseComponent } from 'src/app/components/management/restore-database/restore-database.component';
import { ConfirmDialogComponent } from 'src/app/components/management/confirm-dialog/confirm-dialog.component';
import { DumpDatabaseComponent } from 'src/app/components/management/dump-database/dump-database.component';
import { EditItemComponent } from 'src/app/components/management/manage-item/edit-item/edit-item.component';
import { ManageCategoryComponent } from 'src/app/components/management/manage-category/manage-category.component';
import { ManageItemComponent } from 'src/app/components/management/manage-item/manage-item.component';
import { ManageListComponent } from 'src/app/components/management/manage-list/manage-list.component';
import { EditSettingsComponent } from 'src/app/components/management/edit-settings/edit-settings.component';
import { FreshInstallComponent } from 'src/app/components/management/fresh-install/fresh-install.component';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
