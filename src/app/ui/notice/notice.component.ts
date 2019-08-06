import { Component, OnInit, Input } from '@angular/core';

export enum NoticeRoles {
  Information,
  Error
}

@Component({
  selector: 'app-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.css']
})
export class NoticeComponent implements OnInit {
  @Input() dismissable: boolean;
  @Input() role: NoticeRoles = NoticeRoles.Information;

  public noticeRoles = NoticeRoles;

  constructor() {}

  ngOnInit() {}

  public get matchingClass(): string {
    switch (this.role) {
      case NoticeRoles.Information:
        return 'information';
      case NoticeRoles.Error:
        return 'error';
      default:
        return 'information';
    }
  }
}
