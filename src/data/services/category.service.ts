import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Category } from '../../domain/models/category.model';
import { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable({ providedIn: 'root' })
export class CategoryService implements CategoryRepository {
  private storageKey = 'categories';
  private categoriesSubject = new BehaviorSubject<Category[]>(this.loadCategories());
  readonly categories$ = this.categoriesSubject.asObservable();
  readonly categoriesSignal = signal<Category[]>(this.categoriesSubject.getValue());

  private loadCategories(): Category[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? (JSON.parse(data) as Category[]) : [];
  }

  private save(categories: Category[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(categories));
    this.categoriesSubject.next(categories);
    this.categoriesSignal.set(categories);
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  addCategory(category: Category): Observable<void> {
    const categories = [...this.categoriesSubject.getValue(), category];
    this.save(categories);
    return of(void 0);
  }

  updateCategory(category: Category): Observable<void> {
    const categories = this.categoriesSubject
      .getValue()
      .map((c) => (c.id === category.id ? category : c));
    this.save(categories);
    return of(void 0);
  }

  deleteCategory(id: string): Observable<void> {
    const categories = this.categoriesSubject.getValue().filter((c) => c.id !== id);
    this.save(categories);
    return of(void 0);
  }
}