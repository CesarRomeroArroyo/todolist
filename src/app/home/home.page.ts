import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent, IonButtons, IonButton } from '@ionic/angular/standalone';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { ToDoListComponent } from "./components/to-do-list/to-do-list.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonButton, IonButtons, 
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CreateTaskComponent,
    ToDoListComponent
]
})
export class HomePage { 

  constructor(private router: Router) {}
  
  goCategories() {
    this.router.navigateByUrl('/categories');
  }
}
