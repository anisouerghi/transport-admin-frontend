/// <reference types="@angular/localize" />
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

const html = document.documentElement;
html.lang = environment.locale;
html.dir = environment.rtl ? 'rtl' : 'ltr';
document.body?.classList.toggle('rtl-layout', environment.rtl);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
