import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AgGridModule } from 'ag-grid-angular';
import { NgxFloatUiModule } from 'ngx-float-ui';
import { CellButtonsComponent } from './components/cell-buttons/cell-buttons.component';
import { CellSpriteComponent } from './components/cell-sprite/cell-sprite.component';
import { DebugViewComponent } from './components/debug-view/debug-view.component';
import { EditorBaseTableComponent } from './components/editor-base-table/editor-base-table.component';
import { EditorBaseComponent } from './components/editor-base/editor-base.component';
import { EditorViewTableComponent } from './components/editor-view-table/editor-view-table.component';
import { HeaderButtonsComponent } from './components/header-buttons/header-buttons.component';
import { InputClassComponent } from './components/input-class/input-class.component';
import { InputDamageclassComponent } from './components/input-damageclass/input-damageclass.component';
import { InputEffectComponent } from './components/input-effect/input-effect.component';
import { InputFloatingLabelComponent } from './components/input-floating-label/input-floating-label.component';
import { InputHolidayComponent } from './components/input-holiday/input-holiday.component';
import { InputItemComponent } from './components/input-item/input-item.component';
import { InputItemclassComponent } from './components/input-itemclass/input-itemclass.component';
import { InputMapComponent } from './components/input-map/input-map.component';
import { InputRegionComponent } from './components/input-region/input-region.component';
import { InputSkillComponent } from './components/input-skill/input-skill.component';
import { InputSpellComponent } from './components/input-spell/input-spell.component';
import { InputSpriteComponent } from './components/input-sprite/input-sprite.component';
import { InputStatComponent } from './components/input-stat/input-stat.component';
import { InputTradeskillComponent } from './components/input-tradeskill/input-tradeskill.component';
import { InputTraitComponent } from './components/input-trait/input-trait.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SpriteComponent } from './components/sprite/sprite.component';
import { WebviewDirective } from './directives/';
import { InputAlignmentComponent } from './components/input-alignment/input-alignment.component';
import { InputHostilityComponent } from './components/input-hostility/input-hostility.component';
import { InputAllegianceComponent } from './components/input-allegiance/input-allegiance.component';
import { InputCategoryComponent } from './components/input-category/input-category.component';
import { InputChallengeratingComponent } from './components/input-challengerating/input-challengerating.component';
import { InputItemslotComponent } from './components/input-itemslot/input-itemslot.component';
import { InputSfxComponent } from './components/input-sfx/input-sfx.component';
import { InputNpcComponent } from './components/input-npc/input-npc.component';
import { InputQuesttypeComponent } from './components/input-questtype/input-questtype.component';
import { InputQuestrewardComponent } from './components/input-questreward/input-questreward.component';
import { InputMapnpcComponent } from './components/input-mapnpc/input-mapnpc.component';
import { SpriteWithInlineNameComponent } from './components/sprite-with-inline-name/sprite-with-inline-name.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    SpriteComponent,
    InputSpriteComponent,
    InputFloatingLabelComponent,
    InputItemclassComponent,
    InputSkillComponent,
    CellButtonsComponent,
    CellSpriteComponent,
    HeaderButtonsComponent,
    InputStatComponent,
    EditorBaseComponent,
    InputDamageclassComponent,
    InputItemComponent,
    InputEffectComponent,
    InputTraitComponent,
    InputClassComponent,
    EditorViewTableComponent,
    EditorBaseTableComponent,
    InputMapComponent,
    InputRegionComponent,
    InputHolidayComponent,
    InputTradeskillComponent,
    InputSpellComponent,
    DebugViewComponent,
    InputAlignmentComponent,
    InputHostilityComponent,
    InputAllegianceComponent,
    InputCategoryComponent,
    InputChallengeratingComponent,
    InputItemslotComponent,
    InputSfxComponent,
    InputNpcComponent,
    InputQuesttypeComponent,
    InputQuestrewardComponent,
    InputMapnpcComponent,
    SpriteWithInlineNameComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    SweetAlert2Module,
    AgGridModule,
    NgxFloatUiModule,
    NgIconsModule,
  ],
  exports: [
    WebviewDirective,
    FormsModule,
    SpriteComponent,
    InputSpriteComponent,
    InputFloatingLabelComponent,
    InputItemclassComponent,
    InputSkillComponent,
    CellButtonsComponent,
    CellSpriteComponent,
    HeaderButtonsComponent,
    InputStatComponent,
    EditorBaseComponent,
    InputDamageclassComponent,
    InputItemComponent,
    InputEffectComponent,
    InputTraitComponent,
    InputClassComponent,
    EditorViewTableComponent,
    EditorBaseTableComponent,
    InputMapComponent,
    InputRegionComponent,
    InputHolidayComponent,
    InputTradeskillComponent,
    InputSpellComponent,
    DebugViewComponent,
    InputAlignmentComponent,
    InputHostilityComponent,
    InputAllegianceComponent,
    InputCategoryComponent,
    InputChallengeratingComponent,
    InputItemslotComponent,
    InputSfxComponent,
    InputNpcComponent,
    InputQuesttypeComponent,
    InputQuestrewardComponent,
    InputMapnpcComponent,
    SpriteWithInlineNameComponent,
  ],
})
export class SharedModule {}
