import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISummarySettings, SettingsService } from 'src/app/services/settings.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import * as deepEqual from 'deep-equal';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  public summaryGroup = new FormGroup({
    useMacroColours: new FormControl()
  });

  // provides a reference for comparison when evaluating the group's changes
  private summaryReference: ISummarySettings;

  private subscription = new Subscription();

  constructor(private ss: SettingsService) {
    this.subscription.add(
      this.ss.summary$.subscribe(settings => {
        this.summaryReference = settings;
        if (!deepEqual(settings, this.summaryGroup.value)) {
          this.summaryGroup.patchValue(settings);
        }
      })
    );
  }

  ngOnInit() {
    this.subscription.add(
      this.summaryGroup.valueChanges.subscribe(newValues => {
        if (!deepEqual(newValues, this.summaryReference)) {
          this.ss.setSummary(newValues);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
