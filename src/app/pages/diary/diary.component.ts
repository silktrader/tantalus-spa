import { Component, OnInit } from '@angular/core';
import { DiaryService } from 'src/app/services/diary.service';

@Component({
  selector: 'app-diary',
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.css'],
  providers: [DiaryService]
})
export class DiaryComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
