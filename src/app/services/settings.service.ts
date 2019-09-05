import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { Observable, ReplaySubject } from 'rxjs';

export interface SettingsSchema extends DBSchema {
  ui: {
    key: string;
    value: ISummarySettings;
  };
}

export interface ISummarySettings {
  useMacroColours: boolean;
  preferredColumn: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // determine a default object to fall back to when missing configuration
  private static defaultSettings = {
    summary: {
      useMacroColours: true,
      preferredColumn: 0
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
    this.db.put('ui', settings);
    this.summarySubject$.next(settings);
  }
}
