import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { ReplaySubject } from 'rxjs';
import { DiaryComponent } from '../pages/diary/diary.component';
import { DiarySummaryComponent } from '../pages/diary/diary-summary/diary-summary.component';

export interface SettingsSchema extends DBSchema {
  ui: {
    key: string;
    value: ISummarySettings;
  };
}

export interface ISummarySettings {
  useMacroColours: boolean;
  preferredWidescreenColumn: string;
  preferredSmallscreenColumn: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public static widescreenColumns = new Map<string, string>([
    ['macro', 'Macronutrients'],
    ['fats', 'Fats']
  ]);

  public static smallscreenColumns = new Map<string, string>([
    ['macroShort', 'Macronutrients'],
    ['Calories', 'Calories']
  ]);

  // determine a default object to fall back to when missing configuration
  private static defaultSettings = {
    summary: {
      useMacroColours: true,
      preferredWidescreenColumn: SettingsService.widescreenColumns.keys().next().value,
      preferredSmallscreenColumn: SettingsService.smallscreenColumns.keys().next().value
    }
  };

  private summarySubject$ = new ReplaySubject<ISummarySettings>(1);
  public get summary$() {
    return this.summarySubject$.asObservable();
  }

  private db: IDBPDatabase<SettingsSchema>;

  constructor() {
    // check local storage for existing settings
    this.idbContext().then(db => {
      this.db = db;

      this.db.get('ui', 'summary').then(value => this.summarySubject$.next(value));
    });
  }

  private idbContext() {
    return openDB<SettingsSchema>('settings', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('ui')) {
          db.createObjectStore('ui').put(SettingsService.defaultSettings.summary, 'summary');
        }
      }
    });
  }

  public setSummary(settings: ISummarySettings) {
    this.db.put('ui', settings, 'summary');
    this.summarySubject$.next(settings);
  }
}
