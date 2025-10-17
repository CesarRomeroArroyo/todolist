import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Task } from '../../domain/models/task.model';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
    localStorage.clear();
  });

  it('should add a task', (done) => {
    const task: Task = { id: '1', title: 'Test', completed: false };
    service.addTask(task).subscribe(() => {
      service.getTasks().subscribe((tasks) => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].title).toBe('Test');
        done();
      });
    });
  });

  it('should delete a task', (done) => {
    const task1: Task = { id: '1', title: 'Task1', completed: false };
    const task2: Task = { id: '2', title: 'Task2', completed: false };
    service.addTask(task1).subscribe(() => {
      service.addTask(task2).subscribe(() => {
        service.deleteTask('1').subscribe(() => {
          service.getTasks().subscribe((tasks) => {
            expect(tasks.length).toBe(1);
            expect(tasks[0].id).toBe('2');
            done();
          });
        });
      });
    });
  });
});