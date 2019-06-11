import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DateYMD } from '../models/date-ymd.model';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  constructor(private router: Router) {}

  public static getYMD(date: Date): DateYMD {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  public static getDate(YMD: DateYMD): Date {
    return new Date(YMD.year, YMD.month - 1, YMD.day);
  }

  public static getID(YMD: DateYMD): string {
    return `${YMD.year}-${YMD.month}-${YMD.day}`;
  }

  public static IDToYMD(id: string): DateYMD {
    const numbers = id.split('-');
    return { year: +numbers[0], month: +numbers[1], day: +numbers[2] };
  }

  public get today(): Date {
    return new Date();
  }

  public get yesterday(): Date {
    const date = this.today;
    date.setDate(date.getDate() - 1);
    return date;
  }

  public get tomorrow(): Date {
    const date = this.today;
    date.setDate(date.getDate() + 1);
    return date;
  }

  public gotoDate(date: Date) {
    this.router.navigate([
      `diary/${date.getFullYear()}/${+date.getMonth() + 1}/${date.getDate()}`
    ]);
  }
}
