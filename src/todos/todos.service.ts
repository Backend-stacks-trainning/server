import { Injectable } from '@nestjs/common';
import { Todo } from './todo.model';
import { UUID, randomUUID } from 'crypto';

@Injectable()
export class TodosService {
  todos: Todo[] = [];

  getTodos() {
    return [...this.todos];
  }

  getTodo(id: UUID) {
    return this.todos.find((todo) => todo.id === id);
  }

  insertTodo(title: string, content: string, priority: number) {
    const newId = randomUUID();
    const newTodo = new Todo(newId, title, content, priority);
    this.todos.push(newTodo);

    return newId;
  }
}
