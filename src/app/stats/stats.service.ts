import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DiaryService } from '../services/diary.service';
import { UiService } from '../services/ui.service';

interface MoodFoods {
  foods: MoodFood[]
}

interface MoodFood {
  id: string;
  name: string;
  short_url: string;
  total?: number;
  percent?: number;
  averageMood?: number;
}

interface MoodPerCaloricRanges {
  ranges: CaloricRange[]
}

interface CaloricRange {
  lowerLimit: number;
  upperLimit: number;
  averageMood: number;
}

export interface GetStatsParameters {
  records: number;
  startDate: Date;
  endDate: Date;
  included?: ReadonlyArray<string>;
}

@Injectable({ providedIn: 'root' })
export class StatsService {

  private readonly url = environment.apiUrl + 'stats';

  constructor(private readonly http: HttpClient, private ui: UiService) { }

  public getHighMoodFoods(parameters: GetStatsParameters): Observable<MoodFoods> {
    return this.http.get<MoodFoods>(`${this.url}/mood/high-mood-foods`, { params: this.buildStatParameters(parameters) });
  }

  public getLowMoodFoods(parameters: GetStatsParameters): Observable<MoodFoods> {
    return this.http.get<MoodFoods>(`${this.url}/mood/low-mood-foods`, { params: this.buildStatParameters(parameters) });
  }

  public getMoodPerCaloricRange(parameters: GetStatsParameters): Observable<MoodPerCaloricRanges> {
    return this.http.get<MoodPerCaloricRanges>(`${this.url}/mood/mood-per-caloric-range`, { params: this.buildStatParameters(parameters) });
  }

  public getFoodsHighestAverageMood(parameters: GetStatsParameters): Observable<MoodFoods> {
    return this.http.get<MoodFoods>(`${this.url}/mood/foods-highest-average-mood`, { params: this.buildStatParameters(parameters) });
  }

  public getFoodsLowestAverageMood(parameters: GetStatsParameters): Observable<MoodFoods> {
    return this.http.get<MoodFoods>(`${this.url}/mood/foods-lowest-average-mood`, { params: this.buildStatParameters(parameters) });
  }

  public getAverageMoodPerDoW(parameters: GetStatsParameters): Observable<ReadonlyArray<number>> {
    return this.http.get<ReadonlyArray<number>>(`${this.url}/mood/average-mood-per-DoW`, { params: this.buildStatParameters(parameters) });
  }

  private buildStatParameters(parameters: GetStatsParameters): HttpParams {
    let params = new HttpParams();
    params = params.set('records', parameters.records);
    params = params.set('startDate', DiaryService.toDateUrl(parameters.startDate));
    params = params.set('endDate', DiaryService.toDateUrl(parameters.endDate));

    parameters.included.forEach(id => params = params.append('included', id));

    return params;
  }
}
