import { Component } from '@angular/core';
import { shareReplay } from 'rxjs';
import { StatsService } from '../stats.service';

@Component({
  selector: 'app-stats-overview',
  templateUrl: './stats-overview.component.html',
  styleUrls: ['./stats-overview.component.scss']
})
export class StatsOverviewComponent {

  statsOverview$ = this.ss.getOverview().pipe(shareReplay(1));

  constructor(private ss: StatsService) {

  }



}
