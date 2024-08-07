import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CellButtonsComponent } from './components/cell-buttons/cell-buttons.component';
import { CellSpriteComponent } from './components/cell-sprite/cell-sprite.component';
import { HeaderButtonsComponent } from './components/header-buttons/header-buttons.component';
import { InputFloatingLabelComponent } from './components/input-floating-label/input-floating-label.component';
import { InputItemclassComponent } from './components/input-itemclass/input-itemclass.component';
import { InputSkillComponent } from './components/input-skill/input-skill.component';
import { InputSpriteComponent } from './components/input-sprite/input-sprite.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SpriteComponent } from './components/sprite/sprite.component';
import { WebviewDirective } from './directives/';
import { InputStatComponent } from './components/input-stat/input-stat.component';
import { EditorBaseComponent } from './components/editor-base/editor-base.component';
import { InputDamageclassComponent } from './components/input-damageclass/input-damageclass.component';
import { InputItemComponent } from './components/input-item/input-item.component';
import { InputEffectComponent } from './components/input-effect/input-effect.component';
import { InputTraitComponent } from './components/input-trait/input-trait.component';
import { InputClassComponent } from './components/input-class/input-class.component';

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
  ],
  imports: [CommonModule, FormsModule, NgSelectModule, SweetAlert2Module],
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
  ],
})
export class SharedModule {}
