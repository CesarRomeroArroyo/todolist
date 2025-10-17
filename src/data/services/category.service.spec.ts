import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { Category } from '../../domain/models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);
    localStorage.clear();
  });

  it('should add a category', (done) => {
    const cat: Category = { id: '1', name: 'Work' };
    service.addCategory(cat).subscribe(() => {
      service.getCategories().subscribe((cats) => {
        expect(cats.length).toBe(1);
        expect(cats[0].name).toBe('Work');
        done();
      });
    });
  });

  it('should delete a category', (done) => {
    const c1: Category = { id: '1', name: 'Work' };
    const c2: Category = { id: '2', name: 'Personal' };
    service.addCategory(c1).subscribe(() => {
      service.addCategory(c2).subscribe(() => {
        service.deleteCategory('1').subscribe(() => {
          service.getCategories().subscribe((cats) => {
            expect(cats.length).toBe(1);
            expect(cats[0].id).toBe('2');
            done();
          });
        });
      });
    });
  });
});