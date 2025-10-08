import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonList,
  IonCheckbox,
  IonSelectOption,
  IonSelect,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Category } from '../models/category.interface';
import { Task } from '../models/task.interface';
import { LocalStorageService } from '../services/local-storage/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonCheckbox,
    IonList,
    IonLabel,
    IonItem,
    IonInput,
    IonButton,
    IonButtons,
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSelectOption,
    IonSelect,
  ],
})
export class HomePage {
  tasks$: Observable<Task[]>;
  categories$: Observable<Category[]>;

  newTitle = '';
  selectedCategoryId: string | null = null;

  private filterCategoryIdSubject = new BehaviorSubject<string | null>(null);
  filterCategoryId$ = this.filterCategoryIdSubject.asObservable();

  visibleTasks$: Observable<Task[]>;

  private categoriesCache: Category[] = [];

  constructor(private router: Router, private storage: LocalStorageService) {
    this.tasks$ = this.storage.tasks$;
    this.categories$ = this.storage.categories$;

    this.categories$.subscribe((c) => (this.categoriesCache = c || []));

    this.visibleTasks$ = combineLatest([
      this.tasks$,
      this.filterCategoryId$,
    ]).pipe(
      map(([tasks, catId]) => {
        if (!catId) return tasks;
        return tasks.filter((t) => t.categoryId === catId);
      })
    );
  }

  onFilterChange(value: string | null) {
    this.filterCategoryIdSubject.next(value ?? null);
  }

  clearFilter() {
    this.filterCategoryIdSubject.next(null);
  }

  async addTask() {
    const title = this.newTitle?.trim();
    if (!title) return;
    await this.storage.createTask({
      title,
      categoryId: this.selectedCategoryId ?? null,
    });
    this.newTitle = '';
    this.selectedCategoryId = null;
  }

  async toggleTask(id: string) {
    await this.storage.toggleTaskDone(id);
  }

  async removeTask(id: string) {
    await this.storage.removeTask(id);
  }

  getCategoryName(categoryId?: string | null) {
    if (!categoryId) return '';
    const c = this.categoriesCache.find((x) => x.id === categoryId);
    return c ? c.name : '';
  }

  goCategories() {
    this.router.navigateByUrl('/categories');
  }
}
