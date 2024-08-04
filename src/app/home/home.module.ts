import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from '../shared/shared.module';
import { DialogsComponent } from '../tabs/dialogs/dialogs.component';
import { DroptablesComponent } from '../tabs/droptables/droptables.component';
import { ItemsComponent } from '../tabs/items/items.component';
import { MapsComponent } from '../tabs/maps/maps.component';
import { NpcsComponent } from '../tabs/npcs/npcs.component';
import { QuestsComponent } from '../tabs/quests/quests.component';
import { RecipesComponent } from '../tabs/recipes/recipes.component';
import { SpawnersComponent } from '../tabs/spawners/spawners.component';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [
    HomeComponent,
    DialogsComponent,
    DroptablesComponent,
    ItemsComponent,
    MapsComponent,
    NpcsComponent,
    QuestsComponent,
    RecipesComponent,
    SpawnersComponent,
  ],
  imports: [CommonModule, SharedModule, HomeRoutingModule, SweetAlert2Module],
})
export class HomeModule {}
