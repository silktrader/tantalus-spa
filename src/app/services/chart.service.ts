import { Injectable } from '@angular/core';
import { NgxChartEntry } from '../pages/diary/diary-summary/diary-summary.component';
import { FoodProp } from '../models/food-prop.model';
import { Diary } from '../models/diary.model';
import { UiService } from './ui.service';

export interface MacronutrientsChartData {
  calories: Array<NgxChartEntry>;
  meals: Array<{ name: string; series: Array<NgxChartEntry> }>;
  scheme: { domain: ReadonlyArray<string> };
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  constructor(private ui: UiService) {}

  public macronutrientsData(diary: Diary): MacronutrientsChartData {
    // establish relevant macronutrients
    const macros = [FoodProp.proteins, FoodProp.carbs, FoodProp.fats, FoodProp.alcohol];
    const kcalMultipliers = [4, 4, 9, 7];

    const mealsData: Array<{ name: string; series: Array<NgxChartEntry> }> = [];

    for (const kvp of Diary.mealTypes) {
      const series = [];
      for (const macro of macros) {
        series.push({ name: macro, value: 0 });
      }
      mealsData.push({ name: kvp[1], series });
    }

    const caloriesData: Array<NgxChartEntry> = macros.map(macro => ({ name: macro, value: 0 }));

    // establish macronutrients aggregates in grams
    for (let meal = 0; meal < diary.meals.size; meal++) {
      let totalCalories = 0;
      for (const portion of diary.meals.get(meal)) {
        for (let m = 0; m < macros.length; m++) {
          const calories = portion.getTotalProperty(macros[m]) * kcalMultipliers[m];
          caloriesData[m].value += calories;
          totalCalories += calories;
          mealsData[meal].series[m].value += calories;
        }
      }
    }

    return {
      calories: caloriesData,
      meals: mealsData,
      scheme: this.ui.chartsConfiguration.macronutrientsScheme
    };
  }
}
