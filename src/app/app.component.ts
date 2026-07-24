import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { Config } from './helpers/config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor() {
    const html = document.documentElement;
    html.lang = environment.locale;
    html.dir = environment.rtl ? 'rtl' : 'ltr';
    document.body?.classList.toggle('rtl-layout', environment.rtl);
  }

  ngOnInit(): void {
    document.title = `${Config.APP_TITLE} v${Config.APP_VERSION}`;
  }
}
