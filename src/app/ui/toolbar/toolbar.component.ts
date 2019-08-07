import { Component, OnInit } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  private ready = false;

  constructor(public ui: UiService) {}

  ngOnInit() {
    // usual nasty hack to avoid expression changes errors
    setTimeout(() => (this.ready = true), 0);
  }

  public get isSidenavOpen() {
    return this.ready && this.ui.sidenavOpened;
  }

  public toggleSidenav(): void {
    this.ui.toggleSidenav();
  }
}
