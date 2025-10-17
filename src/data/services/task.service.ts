import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Task } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';

@Injectable({ providedIn: 'root' })
export class TaskService implements TaskRepository {
  private storageKey = 'tasks';
  private tasksSubject = new BehaviorSubject<Task[]>(this.loadTasks());
  readonly tasks$ = this.tasksSubject.asObservable();
  readonly tasksSignal = signal<Task[]>(this.tasksSubject.getValue());

  private loadTasks(): Task[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? (JSON.parse(data) as Task[]) : [];
  }

  private save(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
    this.tasksSignal.set(tasks);
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  addTask(task: Task): Observable<void> {
    const tasks = [...this.tasksSubject.getValue(), task];
    this.save(tasks);
    return of(void 0);
  }

  updateTask(task: Task): Observable<void> {
    const tasks = this.tasksSubject
      .getValue()
      .map((t) => (t.id === task.id ? task : t));
    this.save(tasks);
    return of(void 0);
  }

  deleteTask(id: string): Observable<void> {
    const tasks = this.tasksSubject.getValue().filter((t) => t.id !== id);
    this.save(tasks);
    return of(void 0);
  }
}