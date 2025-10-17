import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonList,
  IonLabel, IonCheckbox, IonChip, IonItemSliding, IonItemOptions, IonItemOption,
  IonBadge
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';

import { TaskService } from '../../data/services/task.service';
import { CategoryService } from '../../data/services/category.service';
import { RemoteConfigService } from '../../data/services/remote-config.service';
import { environment } from '../../environments/environment';
import { Task } from '../../domain/models/task.model';
import { Category } from '../../domain/models/category.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonList,
    IonLabel, IonCheckbox, IonChip, IonItemSliding, IonItemOptions, IonItemOption, IonBadge
  ],
  styles: [`
    .toolbar-spacer { flex: 1; }
    .filter-card, .creator-card { margin: 12px; border-radius: 10px; }
    .row-inline { display: grid; grid-template-columns: 1fr 170px auto; gap: 8px; align-items: center; }
    .clear-link { font-size: 12px; margin-left: 8px; }
    .cat-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; vertical-align: middle; }
    .muted { opacity: .7; font-size: 12px; }
  `],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>ToDo</ion-title>
        <span class="toolbar-spacer"></span>
        <ion-buttons slot="end">
          <ion-button routerLink="/categories">CATEGORIES</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      
      <ion-item class="filter-card" lines="full">
        <ion-label>Filter by category</ion-label>
        <ion-select
          placeholder="All"
          [ngModel]="filterCategoryId()"
          (ngModelChange)="onFilterChange($event)">
          <ion-select-option [value]="null">All</ion-select-option>
          <ion-select-option
            *ngFor="let c of categoriesSignal(); trackBy: trackByCategory"
            [value]="c.id">
            {{ c.name }}
          </ion-select-option>
        </ion-select>
        <ion-button fill="clear" class="clear-link" (click)="clearFilter()">CLEAR</ion-button>
      </ion-item>

      <ng-container *ngIf="categoriesEnabled()">
        <ion-item class="creator-card" lines="full">
          <div class="row-inline" style="width:100%">
            <ion-input
              placeholder="New task"
              [ngModel]="newTaskTitle()"
              (ngModelChange)="newTaskTitle.set($event)"
              (keyup.enter)="addTask()">
            </ion-input>

            <ion-select
              interface="popover"
              placeholder="Category"
              [ngModel]="newTaskCategoryId()"
              (ngModelChange)="onNewTaskCategoryChange($event)">
              <ion-select-option [value]="null">None</ion-select-option>
              <ion-select-option
                *ngFor="let c of categoriesSignal(); trackBy: trackByCategory"
                [value]="c.id">
                {{ c.name }}
              </ion-select-option>
            </ion-select>

            <ion-button (click)="addTask()">ADD</ion-button>
          </div>
        </ion-item>
      </ng-container>
      
      <ion-list>
        <ion-item-sliding *ngFor="let task of filteredTasks(); trackBy: trackByTask">
          <ion-item lines="full">
            <ion-checkbox slot="start" [checked]="task.completed" (ionChange)="toggleTask(task)"></ion-checkbox>

            <ion-label>
              <div [ngStyle]="{ 'text-decoration': task.completed ? 'line-through' : 'none' }">
                {{ task.title }}
              </div>
              <div class="muted" *ngIf="task.categoryId">
                <span *ngIf="catById(task.categoryId) as cat">
                  <span class="cat-dot" [ngStyle]="{ 'background': cat.color || '#3b82f6' }"></span>
                  Category: {{ cat.name }}
                </span>
              </div>
            </ion-label>

            <ion-badge slot="end" color="medium" *ngIf="task.completed">Done</ion-badge>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" (click)="deleteTask(task)">Delete</ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

    </ion-content>
  `
})
export class TasksPage {
  private router = inject(Router);

  tasksSignal = this.taskService.tasksSignal;
  categoriesSignal = this.categoryService.categoriesSignal;

  filterCategoryId = signal<string | null>(null);
  newTaskCategoryId = signal<string | null>(null);

  newTaskTitle = signal('');
  newCategoryName = signal('');
  categoriesEnabled = signal(environment.featureFlags.enableCategories);

  filteredTasks = computed(() => {
    const cat = this.filterCategoryId();
    const tasks = this.tasksSignal();
    return cat == null ? tasks : tasks.filter(t => t.categoryId === cat);
  });

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private remoteConfig: RemoteConfigService
  ) { this.initFeatureFlags(); }

  private async initFeatureFlags() {
    const val = (this.remoteConfig as any).getBoolean
      ? await (this.remoteConfig as any).getBoolean('enableCategories', environment.featureFlags.enableCategories)
      : environment.featureFlags.enableCategories;
    this.categoriesEnabled.set(val);
  }

  onFilterChange(v: any) {
    this.filterCategoryId.set(v == null || v === 'null' || v === 'undefined' ? null : v);
  }
  onNewTaskCategoryChange(v: any) {
    this.newTaskCategoryId.set(v == null || v === 'null' || v === 'undefined' ? null : v);
  }

  clearFilter() { this.filterCategoryId.set(null); }

  catById(id?: string | null) { return this.categoriesSignal().find(c => c.id === id!); }

  async addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      categoryId: this.newTaskCategoryId() ?? undefined
    };
    await this.taskService.addTask(task).toPromise();
    this.newTaskTitle.set('');
  }

  async toggleTask(task: Task) {
    await this.taskService.updateTask({ ...task, completed: !task.completed }).toPromise();
  }

  async deleteTask(task: Task) {
    await this.taskService.deleteTask(task.id).toPromise();
  }

  trackByTask(_: number, t: Task) { return t.id; }
  trackByCategory(_: number, c: Category) { return c.id; }
}
