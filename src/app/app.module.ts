import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

import { HomeModule } from './home/home.module';

import { NgIconsModule, provideNgIconsConfig } from '@ng-icons/core';
import { CodeEditorModule } from '@ngstack/code-editor';
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
import { appIcons } from './app.icons';
import { AssetsService } from './services/assets.service';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    SharedModule,
    HomeModule,
    AppRoutingModule,
    AngularSvgIconModule.forRoot(),
    NgxFloatUiModule.forRoot({
      trigger: NgxFloatUiTriggers.hover,
      showDelay: 500,
      placement: NgxFloatUiPlacements.TOPEND,
      appendTo: 'body',
    }),
    SweetAlert2Module.forRoot({
      provideSwal: () => import('sweetalert2/dist/sweetalert2.js'),
    }),
    NgIconsModule.withIcons({
      ...appIcons,
    }),
    CodeEditorModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (assetsService: AssetsService) => async () => {
        await assetsService.load();
        return assetsService;
      },
      deps: [AssetsService],
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideHotToastConfig(),
    provideNgxWebstorage(
      withNgxWebstorageConfig({ separator: ':', caseSensitive: true }),
      withLocalStorage()
    ),
    provideNgIconsConfig({
      size: '1.5em',
    }),
  ],
  exports: [],
})
export class AppModule {}
