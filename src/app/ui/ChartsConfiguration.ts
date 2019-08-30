export class ChartsConfiguration {
  // tslint:disable-next-line: variable-name
  private _macronutrientsScheme: { domain: ReadonlyArray<string> };

  public get macronutrientsScheme() {
    return this._macronutrientsScheme;
  }

  public setMacronutrientsScheme(proteins: string, carbs: string, fats: string) {
    this._macronutrientsScheme = { domain: [proteins, carbs, fats] };
  }
}
