import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Config } from './helpers/config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    document.title = `${Config.APP_TITLE} v${Config.APP_VERSION}`;
  }
}
