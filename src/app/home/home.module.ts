import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';

import { NgIconsModule } from '@ng-icons/core';
import { CodeEditorModule } from '@ngstack/code-editor';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AgGridModule } from 'ag-grid-angular';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxFloatUiModule } from 'ngx-float-ui';

import { VflowComponent } from 'ngx-vflow';
import { AnalysisComponent } from '../analysis/analysis.component';
import { DependenciesComponent } from '../dependencies/dependencies.component';
import { PinpointComponent } from '../pinpoint/pinpoint.component';
import { QueryComponent } from '../query/query.component';
import { SharedModule } from '../shared/shared.module';
import { AchievementsEditorComponent } from '../tabs/achievements/achievements-editor/achievements-editor.component';
import { AchievementsComponent } from '../tabs/achievements/achievements.component';
import { CoresEditorComponent } from '../tabs/cores/cores-editor/cores-editor.component';
import { CoresComponent } from '../tabs/cores/cores.component';
import { DialogsEditorVisualComponent } from '../tabs/dialogs/dialogs-editor-visual/dialogs-editor-visual.component';
import { DialogsEditorComponent } from '../tabs/dialogs/dialogs-editor/dialogs-editor.component';
import { DialogsComponent } from '../tabs/dialogs/dialogs.component';
import { DroptablesEditorComponent } from '../tabs/droptables/droptables-editor/droptables-editor.component';
import { DroptablesComponent } from '../tabs/droptables/droptables.component';
import { EventsEditorComponent } from '../tabs/events/events-editor/events-editor.component';
import { EventsComponent } from '../tabs/events/events.component';
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
import { StemsEditorComponent } from '../tabs/stems/stems-editor/stems-editor.component';
import { StemsComponent } from '../tabs/stems/stems.component';
import { TraitTreesEditorComponent } from '../tabs/trait-trees/trait-trees-editor/trait-trees-editor.component';
import { TraitTreesComponent } from '../tabs/trait-trees/trait-trees.component';
import { ValidationComponent } from '../validation/validation.component';
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
    ValidationComponent,
    CoresComponent,
    CoresEditorComponent,
    TraitTreesComponent,
    TraitTreesEditorComponent,
    AchievementsComponent,
    AchievementsEditorComponent,
    StemsComponent,
    StemsEditorComponent,
    PinpointComponent,
    AnalysisComponent,
    QueryComponent,
    DependenciesComponent,
    EventsComponent,
    EventsEditorComponent,
    DialogsEditorVisualComponent,
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
    ColorPickerModule,
    VflowComponent,
  ],
  exports: [],
})
export class HomeModule {}
