import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';

import { NgIconsModule } from '@ng-icons/core';
import { CodeEditorModule } from '@ngstack/code-editor';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AgGridModule } from 'ag-grid-angular';
import { NgxFloatUiModule } from 'ngx-float-ui';
import { SharedModule } from '../shared/shared.module';
import { DialogsEditorComponent } from '../tabs/dialogs/dialogs-editor/dialogs-editor.component';
import { DialogsComponent } from '../tabs/dialogs/dialogs.component';
import { DroptablesEditorComponent } from '../tabs/droptables/droptables-editor/droptables-editor.component';
import { DroptablesComponent } from '../tabs/droptables/droptables.component';
import { ItemsEditorComponent } from '../tabs/items/items-editor/items-editor.component';
import { ItemsComponent } from '../tabs/items/items.component';
import { MapsComponent } from '../tabs/maps/maps.component';
import { NpcsEditorComponent } from '../tabs/npcs/npcs-editor/npcs-editor.component';
import { NpcsComponent } from '../tabs/npcs/npcs.component';
import { QuestsEditorComponent } from '../tabs/quests/quests-editor/quests-editor.component';
import { QuestsComponent } from '../tabs/quests/quests.component';
import { RecipesEditorComponent } from '../tabs/recipes/recipes-editor/recipes-editor.component';
import { RecipesComponent } from '../tabs/recipes/recipes.component';
import { SpawnersEditorComponent } from '../tabs/spawners/spawners-editor/spawners-editor.component';
import { SpawnersComponent } from '../tabs/spawners/spawners.component';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [
    HomeComponent,
    DialogsComponent,
    DroptablesComponent,
    DroptablesEditorComponent,
    ItemsComponent,
    ItemsEditorComponent,
    MapsComponent,
    NpcsComponent,
    QuestsComponent,
    RecipesComponent,
    RecipesEditorComponent,
    SpawnersComponent,
    NpcsEditorComponent,
    SpawnersEditorComponent,
    QuestsEditorComponent,
    DialogsEditorComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule,
    SweetAlert2Module,
    AgGridModule,
    NgxFloatUiModule,
    NgIconsModule,
    CodeEditorModule,
  ],
  exports: [],
})
export class HomeModule {}
