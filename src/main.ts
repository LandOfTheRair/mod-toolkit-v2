import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { APP_CONFIG } from './environments/environment';

if (APP_CONFIG.production) {
  enableProdMode();
}

if ((module as any)['hot']) {
  (module as any)['hot'].accept();
} else {
  console.error('HMR is not enabled for webpack-dev-server!');
  throw new Error('HMR is not enabled for webpack-dev-server!');
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false,
  })
  .catch((err) => console.error(err));
