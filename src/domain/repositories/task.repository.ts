import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

export interface TaskRepository {
  getTasks(): Observable<Task[]>;
  addTask(task: Task): Observable<void>;
  updateTask(task: Task): Observable<void>;
  deleteTask(id: string): Observable<void>;
}