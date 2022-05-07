import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UiService } from '../services/ui.service';

interface HighMoodFoods {
  foods: HighMoodFood[]
}

interface HighMoodFood {
  name: string;
  total: number;
  percent: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {

  private readonly url = environment.apiUrl + 'stats';

  constructor(private readonly http: HttpClient, private ui: UiService) { }

  public getHighMoodFoods(parameters): Observable<HighMoodFoods> {
    return this.http.get<HighMoodFoods>(`${this.url}/mood/high-mood-foods`, { params: new HttpParams().appendAll(parameters) });
  }
}
