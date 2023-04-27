import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { UUID } from 'crypto';

@Controller('todo')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  getAllTodos() {
    return this.todosService.getTodos();
  }

  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.todosService.searchTodo(keyword);
  }

  @Get(':id')
  getSingleTodo(@Param('id') id: UUID) {
    return this.todosService.getTodo(id);
  }

  @Post()
  async addTodo(
    @Body('title') todoTitle: string,
    @Body('timestamp') todoTimestamp: Date,
  ) {
    if (!todoTimestamp) {
      todoTimestamp = new Date();
    }

    // Send new todo to mongodb
    const generatedTodo = await this.todosService.insertTodo(
      todoTitle,
      todoTimestamp,
    );

    // Send todo to worker
    this.todosService.sendCreatedTodoToWorker({
      title: todoTitle,
      timestamp: todoTimestamp,
    });

    return generatedTodo;
  }

  @Put(':id')
  updateTodo(@Param('id') id: string, @Body('title') todoTitle: string) {
    return this.todosService.updateTodo(id, todoTitle);
  }

  @Delete(':id')
  removeTodo(@Param('id') id: string) {
    return this.todosService.deleteTodo(id);
  }
}
