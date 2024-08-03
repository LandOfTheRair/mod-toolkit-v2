import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';


import { FormsModule } from '@angular/forms';
import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective],
  imports: [CommonModule, FormsModule],
  exports: [WebviewDirective, FormsModule]
})
export class SharedModule {}
