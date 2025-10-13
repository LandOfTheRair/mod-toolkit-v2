import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CodeEditorModule } from '@ngstack/code-editor';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AgGridModule } from 'ag-grid-angular';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxFloatUiModule } from 'ngx-float-ui';

import { CellButtonsComponent } from './components/cell-buttons/cell-buttons.component';
import { CellIconComponent } from './components/cell-icon/cell-icon.component';
import { CellSpriteComponent } from './components/cell-sprite/cell-sprite.component';
import { DebugViewComponent } from './components/debug-view/debug-view.component';
import { EditBaseeffectComponent } from './components/edit-baseeffect/edit-baseeffect.component';
import { EditStatobjectComponent } from './components/edit-statobject/edit-statobject.component';
import { EditorBaseTableComponent } from './components/editor-base-table/editor-base-table.component';
import { EditorBaseComponent } from './components/editor-base/editor-base.component';
import { EditorViewTableComponent } from './components/editor-view-table/editor-view-table.component';
import { HeaderButtonsComponent } from './components/header-buttons/header-buttons.component';
import { IconComponent } from './components/icon/icon.component';
import { InputAchievementTypeComponent } from './components/input-achievementtype/input-achievementtype.component';
import { InputAlignmentComponent } from './components/input-alignment/input-alignment.component';
import { InputAllegianceComponent } from './components/input-allegiance/input-allegiance.component';
import { InputAnalysisReportComponent } from './components/input-analysis-report/input-analysis-report.component';
import { InputBufftypeComponent } from './components/input-bufftype/input-bufftype.component';
import { InputCategoryComponent } from './components/input-category/input-category.component';
import { InputChallengeratingComponent } from './components/input-challengerating/input-challengerating.component';
import { InputClassComponent } from './components/input-class/input-class.component';
import { InputDamageclassComponent } from './components/input-damageclass/input-damageclass.component';
import { InputEffectComponent } from './components/input-effect/input-effect.component';
import { InputEventComponent } from './components/input-event/input-event.component';
import { InputEventRarityComponent } from './components/input-eventrarity/input-eventrarity.component';
import { InputEventSuccessTypeComponent } from './components/input-eventsuccesstype/input-eventsuccesstype.component';
import { InputFloatingLabelComponent } from './components/input-floating-label/input-floating-label.component';
import { InputHolidayComponent } from './components/input-holiday/input-holiday.component';
import { InputHostilityComponent } from './components/input-hostility/input-hostility.component';
import { InputIconComponent } from './components/input-icon/input-icon.component';
import { InputItemComponent } from './components/input-item/input-item.component';
import { InputItemclassComponent } from './components/input-itemclass/input-itemclass.component';
import { InputItemslotEncrustComponent } from './components/input-itemslot-encrust/input-itemslot-encrust.component';
import { InputItemslotComponent } from './components/input-itemslot/input-itemslot.component';
import { InputMacrotypeComponent } from './components/input-macrotype/input-macrotype.component';
import { InputMapComponent } from './components/input-map/input-map.component';
import { InputMapnpcComponent } from './components/input-mapnpc/input-mapnpc.component';
import { InputMapspawnerComponent } from './components/input-mapspawner/input-mapspawner.component';
import { InputNpcComponent } from './components/input-npc/input-npc.component';
import { InputQuestComponent } from './components/input-quest/input-quest.component';
import { InputQuestrewardComponent } from './components/input-questreward/input-questreward.component';
import { InputQuesttypeComponent } from './components/input-questtype/input-questtype.component';
import { InputRecipeComponent } from './components/input-recipe/input-recipe.component';
import { InputRegionComponent } from './components/input-region/input-region.component';
import { InputSfxComponent } from './components/input-sfx/input-sfx.component';
import { InputSkillComponent } from './components/input-skill/input-skill.component';
import { InputSpawnerComponent } from './components/input-spawner/input-spawner.component';
import { InputSpellComponent } from './components/input-spell/input-spell.component';
import { InputSpriteComponent } from './components/input-sprite/input-sprite.component';
import { InputStatComponent } from './components/input-stat/input-stat.component';
import { InputStemComponent } from './components/input-stem/input-stem.component';
import { InputTradeskillComponent } from './components/input-tradeskill/input-tradeskill.component';
import { InputTraitComponent } from './components/input-trait/input-trait.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SpriteWithInlineNameComponent } from './components/sprite-with-inline-name/sprite-with-inline-name.component';
import { SpriteComponent } from './components/sprite/sprite.component';
import { TestViewComponent } from './components/test-view/test-view.component';
import { AutoTrimDirective, WebviewDirective } from './directives/';
import { InputPropEditorComponent } from './components/input-prop-editor/input-prop-editor.component';
import { InputDialogactiontypeComponent } from './components/input-dialogactiontype/input-dialogactiontype.component';
import { InputCurrencyComponent } from './components/input-currency/input-currency.component';
import { InputAchievementComponent } from './components/input-achievement/input-achievement.component';
import { InputItemBehaviorComponent } from './components/input-item-behavior/input-item-behavior.component';
import { InputItemDialogitemComponent } from './components/input-item-dialogitem/input-item-dialogitem.component';
import { InputJsonComponent } from './components/input-json/input-json.component';
import { InputDialogChatComponent } from './components/input-dialog-chat/input-dialog-chat.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    AutoTrimDirective,
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
    InputMapspawnerComponent,
    SpriteWithInlineNameComponent,
    InputRecipeComponent,
    InputQuestComponent,
    InputItemslotEncrustComponent,
    TestViewComponent,
    EditBaseeffectComponent,
    InputIconComponent,
    IconComponent,
    CellIconComponent,
    InputMacrotypeComponent,
    InputBufftypeComponent,
    EditStatobjectComponent,
    InputSpawnerComponent,
    InputAnalysisReportComponent,
    InputStemComponent,
    InputAchievementTypeComponent,
    InputEventRarityComponent,
    InputEventComponent,
    InputEventSuccessTypeComponent,
    InputPropEditorComponent,
    InputDialogactiontypeComponent,
    InputCurrencyComponent,
    InputAchievementComponent,
    InputItemBehaviorComponent,
    InputItemDialogitemComponent,
    InputJsonComponent,
    InputDialogChatComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    SweetAlert2Module,
    AgGridModule,
    NgxFloatUiModule,
    NgIconsModule,
    CodeEditorModule,
    AngularSvgIconModule,
    ColorPickerModule,
  ],
  exports: [
    WebviewDirective,
    AutoTrimDirective,
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
    InputMapspawnerComponent,
    SpriteWithInlineNameComponent,
    InputRecipeComponent,
    InputQuestComponent,
    InputItemslotEncrustComponent,
    TestViewComponent,
    EditBaseeffectComponent,
    InputIconComponent,
    IconComponent,
    CellIconComponent,
    InputMacrotypeComponent,
    InputBufftypeComponent,
    EditStatobjectComponent,
    InputSpawnerComponent,
    InputAnalysisReportComponent,
    InputStemComponent,
    InputAchievementTypeComponent,
    InputEventRarityComponent,
    InputEventComponent,
    InputEventSuccessTypeComponent,
    InputPropEditorComponent,
    InputDialogactiontypeComponent,
    InputCurrencyComponent,
    InputAchievementComponent,
    InputItemBehaviorComponent,
    InputItemDialogitemComponent,
    InputJsonComponent,
    InputDialogChatComponent,
  ],
})
export class SharedModule {}
