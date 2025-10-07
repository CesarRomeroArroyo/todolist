import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonItem, IonInput, IonButton } from "@ionic/angular/standalone";
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss'],
  imports: [IonItem, IonInput, IonButton, FormsModule],
})
export class CreateTaskComponent {
  newTitle: string = '';

  constructor(private storageSvc: LocalStorageService) { }

  async addTask() {
    const title = this.newTitle?.trim();
    if (!title) return;
    await this.storageSvc.createTask({ title });
    this.newTitle = '';
  }

}
