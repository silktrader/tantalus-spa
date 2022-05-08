import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UiService } from '../services/ui.service';

interface MoodFoods {
  foods: MoodFood[]
}

interface MoodFood {
  name: string;
  total: number;
  percent: number;
}

interface MoodPerCaloricRanges {
  ranges: CaloricRange[]
}

interface CaloricRange {
  lowerLimit: number;
  upperLimit: number;
  averageMood: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {

  private readonly url = environment.apiUrl + 'stats';

  constructor(private readonly http: HttpClient, private ui: UiService) { }

  public getHighMoodFoods(parameters): Observable<MoodFoods> {
    return this.http.get<MoodFoods>(`${this.url}/mood/high-mood-foods`, { params: new HttpParams().appendAll(parameters) });
  }

  public getLowMoodFoods(parameters): Observable<MoodFoods> {
    return this.http.get<MoodFoods>(`${this.url}/mood/low-mood-foods`, { params: new HttpParams().appendAll(parameters) });
  }

  public getMoodPerCaloricRange(parameters): Observable<MoodPerCaloricRanges> {
    return this.http.get<MoodPerCaloricRanges>(`${this.url}/mood/mood-per-caloric-range`, { params: new HttpParams().appendAll(parameters) });
  }
}
