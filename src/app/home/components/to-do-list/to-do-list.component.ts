import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonList, IonItem, IonCheckbox, IonLabel, IonButton } from "@ionic/angular/standalone";
import { Observable } from 'rxjs';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { Task } from 'src/app/models/task.interface';

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.component.html',
  imports: [IonButton, IonLabel, IonCheckbox, IonItem, IonList, CommonModule],
  styleUrls: ['./to-do-list.component.scss'],
})
export class ToDoListComponent {
  tasks$: Observable<Task[]>;
  
  constructor(private storageSvc: LocalStorageService) {
    this.tasks$ = this.storageSvc.tasks$;
  }

  async toggleTask(id: string) {
    await this.storageSvc.toggleTaskDone(id);
  }

  async removeTask(id: string) {
    await this.storageSvc.removeTask(id);
  }

}
