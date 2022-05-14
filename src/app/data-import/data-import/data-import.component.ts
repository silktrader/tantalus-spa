import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-data-import',
  templateUrl: './data-import.component.html',
  styleUrls: ['./data-import.component.scss']
})
export class DataImportComponent {

  weightMeasurementsForm = new FormGroup({
    data: new FormControl(undefined)
  });

  progress: number;
  uploading$ = new BehaviorSubject(false);
  weightsFile$ = new BehaviorSubject(undefined);

  private readonly url = environment.apiUrl + 'import/weight';

  constructor(private http: HttpClient) {
  }

  uploadWeightMeasurements() {
    console.log(this.weightMeasurementsForm.value);
    const formData = new FormData();
    formData.append('overwrite', 'true');
    formData.append('data', this.weightMeasurementsForm.value.data);
    this.uploading$.next(true);

    this.http.post<unknown>(this.url, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round((100 * event.loaded) / event.total);
        }
        else if (event.type === HttpEventType.Response) {
          console.log(event.body);
          this.weightMeasurementsForm.reset();
        }
      },
      complete: () => this.uploading$.next(false)
    });
  }

  onWeightsFileChanged(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.weightsFile$.next(file);
      this.weightMeasurementsForm.patchValue({
        data: file,
      });
    }
    else {
      this.weightsFile$.next(undefined);
    }
  }
}
