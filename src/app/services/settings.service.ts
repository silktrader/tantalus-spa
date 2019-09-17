import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { ReplaySubject } from 'rxjs';

export interface SettingsSchema extends DBSchema {
  ui: {
    key: string;
    value: ISummarySettings;
  };
}

export interface ISummarySettings {
  useMacroColours: boolean;
  largeColumnSet: number;
  smallColumnSet: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public static largeColumnSet: ReadonlyArray<string> = ['Macronutrients', 'Fats'];

  public static smallColumnSet: ReadonlyArray<string> = [
    'Calories',
    'Proteins',
    'Carbohydrates',
    'Fats'
  ];

  // determine a default object to fall back to when missing configuration
  private static defaultSettings = {
    summary: {
      useMacroColours: true,
      largeColumnSet: 0,
      smallColumnSet: 0
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
