export interface ChartScheme {
  domain: ReadonlyArray<string>;
}

export class ChartsConfiguration {
  private _macronutrientsScheme: ChartScheme;

  public get macronutrientsScheme() {
    return this._macronutrientsScheme;
  }

  public setMacronutrientsScheme(proteins: string, carbs: string, fats: string) {
    this._macronutrientsScheme = { domain: [proteins, carbs, fats] };
  }

  public get proteinsScheme(): ChartScheme {
    return { domain: [this.macronutrientsScheme.domain[0], '#555555'] };
  }
}
