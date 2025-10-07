export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId?: string | null;
  done: boolean;
  createdAt: number;
  dueDate?: number | null;
}
