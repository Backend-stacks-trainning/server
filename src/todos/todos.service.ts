import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from 'src/schemas/todo.schema';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    private readonly rmqService: AmqpConnection,
  ) {}

  async getTodos(): Promise<Todo[]> {
    return await this.todoModel.find().exec();
  }

  async getTodo(id: string): Promise<Todo> {
    return await this.todoModel.findById(id).exec();
  }

  async insertTodo(
    title: string,
    content: string,
    priority: number,
  ): Promise<Todo> {
    const createdTodo = new this.todoModel({
      title,
      content,
      priority,
    });

    return await createdTodo.save();
  }

  sendCreatedTodoToWorker(todo: Todo): void {
    this.rmqService.publish('exchange1', 'todo_created', todo);

    console.log('Send created Todo to worker successfully');
  }

  async updateTodo(
    id: string,
    title: string,
    content: string,
    priority: number,
  ): Promise<Todo> {
    const updatedTodo = await this.todoModel.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          content,
          priority,
        },
      },
      { new: true },
    );

    return updatedTodo;
  }

  async deleteTodo(id: string) {
    const deletedTodo = await this.todoModel.deleteOne({
      _id: id,
    });

    return deletedTodo;
  }
}
