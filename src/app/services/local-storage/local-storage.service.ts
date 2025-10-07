import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Category } from '../../models/category.interface';
import { Task } from '../../models/task.interface';
import { CURRENT_SCHEMA, KEY_CATEGORIES, KEY_TASKS, STORAGE_SCHEMA_VERSION } from './local-storage.constants';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private ready = false;
  private _categories$ = new BehaviorSubject<Category[]>([]);
  private _tasks$ = new BehaviorSubject<Task[]>([]);
  categories$ = this._categories$.asObservable();
  tasks$ = this._tasks$.asObservable();

  constructor(private storage: Storage) {
    this.init();
  }

  private async init() {
    if (this.ready) return;
    try {
      await this.storage.create();
    } catch (err) {
      console.warn('Storage create failed (non-fatal):', err);
    }
    await this.migrateIfNeeded();
    const [cats, tasks] = await Promise.all([
      this.getRaw<Category[]>(KEY_CATEGORIES, []),
      this.getRaw<Task[]>(KEY_TASKS, [])
    ]);
    this._categories$.next(cats);
    this._tasks$.next(tasks);
    this.ready = true;
  }

  private async migrateIfNeeded() {
    const ver = await this.storage.get(STORAGE_SCHEMA_VERSION);
    if (ver === CURRENT_SCHEMA) return;
    const cats = await this.storage.get(KEY_CATEGORIES);
    if (!cats) {
      const defaultCats: Category[] = [
        { id: uuidv4(), name: 'Personal', color: '#007bff', createdAt: Date.now() },
        { id: uuidv4(), name: 'Work', color: '#28a745', createdAt: Date.now() }
      ];
      await this.storage.set(KEY_CATEGORIES, defaultCats);
    }
    await this.storage.set(STORAGE_SCHEMA_VERSION, CURRENT_SCHEMA);
  }

  private async getRaw<T>(key: string, fallback: T): Promise<T> {
    const v = await this.storage.get(key);
    return v ?? fallback;
  }

  private async setRaw<T>(key: string, value: T) {
    await this.storage.set(key, value);
  }

  async createCategory(name: string, color?: string) {
    await this.init();
    const cat: Category = { id: uuidv4(), name, color, createdAt: Date.now() };
    const cats = [...this._categories$.value, cat];
    await this.setRaw(KEY_CATEGORIES, cats);
    this._categories$.next(cats);
    return cat;
  }

  async updateCategory(updated: Category) {
    await this.init();
    const cats = this._categories$.value.map(c => c.id === updated.id ? updated : c);
    await this.setRaw(KEY_CATEGORIES, cats);
    this._categories$.next(cats);
  }

  async removeCategory(id: string) {
    await this.init();
    const cats = this._categories$.value.filter(c => c.id !== id);
    await this.setRaw(KEY_CATEGORIES, cats);
    this._categories$.next(cats);
    const tasks = this._tasks$.value.map(t => t.categoryId === id ? { ...t, categoryId: null } : t);
    await this.setRaw(KEY_TASKS, tasks);
    this._tasks$.next(tasks);
  }

  async createTask(payload: Partial<Task> & { title: string }) {
    await this.init();
    const task: Task = {
      id: uuidv4(),
      title: payload.title,
      description: payload.description ?? '',
      categoryId: payload.categoryId ?? null,
      done: false,
      createdAt: Date.now(),
      dueDate: payload.dueDate ?? null
    };
    const tasks = [task, ...this._tasks$.value];
    await this.setRaw(KEY_TASKS, tasks);
    this._tasks$.next(tasks);
    return task;
  }

  async updateTask(updated: Task) {
    await this.init();
    const tasks = this._tasks$.value.map(t => t.id === updated.id ? updated : t);
    await this.setRaw(KEY_TASKS, tasks);
    this._tasks$.next(tasks);
  }

  async toggleTaskDone(id: string) {
    await this.init();
    const tasks = this._tasks$.value.map(t => t.id === id ? { ...t, done: !t.done } : t);
    await this.setRaw(KEY_TASKS, tasks);
    this._tasks$.next(tasks);
  }

  async removeTask(id: string) {
    await this.init();
    const tasks = this._tasks$.value.filter(t => t.id !== id);
    await this.setRaw(KEY_TASKS, tasks);
    this._tasks$.next(tasks);
  }

  async clearAll() {
    await this.storage.clear();
    this._categories$.next([]);
    this._tasks$.next([]);
  }

  async exportData() {
    return {
      categories: this._categories$.value,
      tasks: this._tasks$.value
    };
  }
}
