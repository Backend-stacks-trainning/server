import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from 'src/schemas/todo.schema';
import { ElasticsearchService } from '@nestjs/elasticsearch';

interface ISendEvent {
  msg: string;
  data: object | string;
}

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    private readonly rmqService: AmqpConnection,
    private readonly esService: ElasticsearchService,
  ) {}

  async getTodos(): Promise<Todo[]> {
    return await this.todoModel.find().exec();
  }

  async getTodo(id: string): Promise<Todo> {
    return await this.todoModel.findById(id).exec();
  }

  async searchTodo(keyword: string) {
    const index = 'todo';

    const result = await this.esService.search<any>({
      index,
      body: {
        query: {
          bool: {
            should: [
              {
                wildcard: {
                  title: {
                    value: `*${keyword}*`,
                    boost: 10,
                  },
                },
              },
              {
                match: {
                  title: {
                    query: keyword,
                    fuzziness: 'AUTO',
                    boost: 1,
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
        sort: [
          '_score',
          {
            title: {
              order: 'asc',
            },
          },
        ],
      },
    });

    return result.hits.hits.map((item: any) => ({
      title: item._source['title'],
    }));
  }

  async insertTodo(title: string, timestamp: Date): Promise<Todo> {
    const createdTodo = new this.todoModel({
      title,
      timestamp,
    });

    return await createdTodo.save();
  }

  sendCreatedTodoToWorker(todo: Todo): void {
    const payload: ISendEvent = {
      msg: 'TODO_CREATED',
      data: todo,
    };

    this.rmqService.publish('exchange1', 'todo_created', payload);

    console.log('Send created Todo to worker successfully');
  }

  async updateTodo(id: string, title: string): Promise<Todo> {
    const updatedTodo = await this.todoModel.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
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
