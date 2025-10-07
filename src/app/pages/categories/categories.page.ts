import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonList,
  IonLabel,
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { Category } from 'src/app/models/category.interface';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonList,
    IonLabel,
    FormsModule,
    CommonModule,
  ],
})
export class CategoriesPage {
  categories$: Observable<Category[]>;
  editingId: string | null = null;
  editingName = '';
  editingColor = '#3880ff';

  constructor(
    private storage: LocalStorageService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    this.categories$ = this.storage.categories$;
  }

  async save() {
    const name = (this.editingName || '').trim();
    if (!name) {
      const toast = await this.toastCtrl.create({ message: 'Name required', duration: 1400, position: 'bottom' });
      await toast.present();
      return;
    }

    try {
      if (this.editingId) {
        // Preserve createdAt if you want, here we set a new timestamp
        await this.storage.updateCategory({
          id: this.editingId,
          name,
          color: this.editingColor,
          createdAt: Date.now()
        } as Category);
        this.cancelEdit();
        const t = await this.toastCtrl.create({ message: 'Category updated', duration: 1200, position: 'bottom' });
        await t.present();
      } else {
        await this.storage.createCategory(name, this.editingColor);
        this.editingName = '';
        this.editingColor = '#3880ff';
        const t = await this.toastCtrl.create({ message: 'Category created', duration: 1200, position: 'bottom' });
        await t.present();
      }
    } catch (err) {
      console.error('save category error', err);
      const errToast = await this.toastCtrl.create({ message: 'Operation failed', duration: 2000, position: 'bottom' });
      await errToast.present();
    }
  }

  onEdit(c: Category) {
    this.editingId = c.id;
    this.editingName = c.name;
    this.editingColor = c.color ?? '#3880ff';
  }

  cancelEdit() {
    this.editingId = null;
    this.editingName = '';
    this.editingColor = '#3880ff';
  }

  async onRemove(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Delete category',
      message: 'Deleting this category will remove its association from tasks. Are you sure?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.storage.removeCategory(id);
              const t = await this.toastCtrl.create({
                message: 'Category deleted',
                duration: 1500,
                position: 'bottom'
              });
              await t.present();
            } catch (err) {
              console.error('removeCategory error', err);
              const errToast = await this.toastCtrl.create({
                message: 'Error deleting category',
                duration: 2000,
                position: 'bottom'
              });
              await errToast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
