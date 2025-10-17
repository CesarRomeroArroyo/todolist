import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonItem, IonInput, IonButton, IonList, IonLabel, IonChip
} from '@ionic/angular/standalone';
import { CategoryService } from '../../data/services/category.service';
import { Category } from '../../domain/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonContent, IonItem, IonInput, IonButton, IonList, IonLabel, IonChip
  ],
  styles: [`
    .card { margin: 12px; border-radius: 10px; }
    .color-box { width: 28px; height: 28px; border-radius: 6px; margin-left: 8px; }
    .row-inline { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; width: 100%; }
    .muted { opacity: .7; font-size: 12px; }
  `],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/"></ion-back-button></ion-buttons>
        <ion-title>Categories</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-item class="card" lines="full">
        <div class="row-inline">
          <ion-input placeholder="Category name" [ngModel]="name()" (ngModelChange)="name.set($event)"></ion-input>
          <input type="color" [ngModel]="color()" (ngModelChange)="color.set($event)" class="color-box" />
          <ion-button (click)="createOrUpdate()">{{ editingId() ? 'SAVE' : 'CREATE' }}</ion-button>
        </div>
      </ion-item>

      <ion-list>
        <ion-item *ngFor="let c of categories(); trackBy: trackByCategory" lines="full">
          <ion-label>
            <div>
              <span class="color-box" [style.background]="c.color || '#3b82f6'"></span>
              {{ c.name }}
            </div>
            <div class="muted" *ngIf="c.createdAt">Created: {{ c.createdAt }}</div>
          </ion-label>
          <ion-button fill="clear" (click)="startEdit(c)">EDIT</ion-button>
          <ion-button fill="clear" color="danger" (click)="remove(c)">DELETE</ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class CategoriesPage {
  categories = this.categoryService.categoriesSignal;
  name = signal('');
  color = signal('#3b82f6');
  editingId = signal<string | null>(null);

  constructor(private categoryService: CategoryService) {}

  async createOrUpdate() {
    const n = this.name().trim();
    if (!n) return;
    if (this.editingId()) {
      const cat: Category = { id: this.editingId()!, name: n, color: this.color() };
      await this.categoryService.updateCategory(cat).toPromise();
    } else {
      const cat: Category = { id: crypto.randomUUID(), name: n, color: this.color(), createdAt: new Date().toLocaleString() };
      await this.categoryService.addCategory(cat).toPromise();
    }
    this.name.set('');
    this.color.set('#3b82f6');
    this.editingId.set(null);
  }

  startEdit(c: Category) {
    this.name.set(c.name);
    this.color.set(c.color || '#3b82f6');
    this.editingId.set(c.id);
  }

  async remove(c: Category) {
    await this.categoryService.deleteCategory(c.id).toPromise();
    if (this.editingId() === c.id) {
      this.name.set('');
      this.color.set('#3b82f6');
      this.editingId.set(null);
    }
  }

  trackByCategory(_: number, c: Category) { return c.id; }
}
