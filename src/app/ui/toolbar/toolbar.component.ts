import { Component, OnInit, Input } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input() title: string;

  constructor(public ui: UiService) {}

  ngOnInit() {}

  get sidenavOpened(): boolean {
    return this.ui.sidenavOpened;
  }
}
