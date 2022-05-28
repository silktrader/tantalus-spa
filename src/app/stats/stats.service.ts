import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WeightMeasurement } from '../models/weightMeasurement';
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
  records?: number;
  pageSize?: number;
  pageIndex?: number;
  sort?: string;
  direction?: 'asc' | 'desc' | '';
  start: Date;
  end: Date;
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

  public getAllWeightMeasurements(parameters: GetStatsParameters): Observable<any> {
    return this.http.get(`${environment.apiUrl}weight`, { params: this.buildStatParameters(parameters) });
  }

  public updateWeightMeasurement(request: WeightMeasurement) {
    return this.http.put(`${environment.apiUrl}weight`, request);
  }

  public deleteWeightMeasurement(measuredOn) {
    return this.http.delete(`${environment.apiUrl}weight/${measuredOn}`);
  }

  public getOverview() {
    return this.http.get<StatsOverview>(`${this.url}/overview`);
  }

  private buildStatParameters(parameters: GetStatsParameters): HttpParams {
    let params = new HttpParams();

    if (parameters.pageIndex)
      params = params.set('pageIndex', parameters.pageIndex);
    if (parameters.pageSize)
      params = params.set('pageSize', parameters.pageSize);

    // tk rememeber to substitute this
    if (parameters.records)
      params = params.set('records', parameters.records);

    if (parameters.sort)
      params = params.set('sort', parameters.sort);

    if (parameters.direction)
      params = params.set('direction', parameters.direction);

    params = params.set('start', DiaryService.toDateUrl(parameters.start));
    params = params.set('end', DiaryService.toDateUrl(parameters.end));

    parameters.included?.forEach(id => params = params.append('included', id));

    return params;
  }
}

export interface StatsOverview {

  weightOverview: {
    lastWeight: number,
    lastMeasured: Date,
    measurements: number,
    minWeight: number,
    maxWeight: number,
    averageWeight: number
  }

}
