import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

import { HomeModule } from './home/home.module';

import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import {
  NgxFloatUiModule,
  NgxFloatUiPlacements,
  NgxFloatUiTriggers,
} from 'ngx-float-ui';
import {
  provideNgxWebstorage,
  withLocalStorage,
  withNgxWebstorageConfig,
} from 'ngx-webstorage';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    SharedModule,
    HomeModule,
    AppRoutingModule,
    NgxFloatUiModule.forRoot({
      trigger: NgxFloatUiTriggers.hover,
      showDelay: 500,
      placement: NgxFloatUiPlacements.TOPEND,
      appendTo: 'body',
    }),
    SweetAlert2Module.forRoot({
      provideSwal: () => import('sweetalert2/dist/sweetalert2.js'),
    }),
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideHotToastConfig(),
    provideNgxWebstorage(
      withNgxWebstorageConfig({ separator: ':', caseSensitive: true }),
      withLocalStorage()
    ),
  ],
  exports: [],
})
export class AppModule {}
