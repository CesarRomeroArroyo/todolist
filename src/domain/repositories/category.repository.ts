import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

export interface CategoryRepository {
  getCategories(): Observable<Category[]>;
  addCategory(category: Category): Observable<void>;
  updateCategory(category: Category): Observable<void>;
  deleteCategory(id: string): Observable<void>;
}