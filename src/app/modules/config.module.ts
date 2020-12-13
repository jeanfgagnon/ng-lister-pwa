import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { MyMaterialModule } from './my-material.module';
import { ConfigRoutingModule } from './config-routing.module';

import { RestoreDatabaseComponent } from 'src/app/components/Management/restore-database/restore-database.component';
import { ConfirmDialogComponent } from 'src/app/components/Management/confirm-dialog/confirm-dialog.component';
import { DumpDatabaseComponent } from 'src/app/components/Management/dump-database/dump-database.component';
import { EditItemComponent } from 'src/app/components/Management/manage-item/edit-item/edit-item.component';
import { ManageCategoryComponent } from 'src/app/components/Management/manage-category/manage-category.component';
import { ManageComponent } from 'src/app/components/Management/manage/manage.component';
import { ManageItemComponent } from 'src/app/components/Management/manage-item/manage-item.component';
import { ManageListComponent } from 'src/app/components/Management/manage-list/manage-list.component';

@NgModule({
  declarations: [
    RestoreDatabaseComponent,
    ConfirmDialogComponent,
    DumpDatabaseComponent,
    EditItemComponent,
    ManageCategoryComponent,
    ManageComponent,
    ManageItemComponent,
    ManageListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    MyMaterialModule,
    ConfigRoutingModule
  ]
})
export class ConfigModule { }
