import {
  Body,
  Controller,
  Post,
  Get,
  Param,
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

  @Get(':id')
  getSingleTodo(@Param('id') id: UUID) {
    return this.todosService.getTodo(id);
  }

  @Post()
  async addTodo(
    @Body('title') todoTitle: string,
    @Body('content') todoContent: string,
    @Body('priority') todoPriority: number,
  ) {
    // Send new todo to mongodb
    const generatedTodo = await this.todosService.insertTodo(
      todoTitle,
      todoContent,
      todoPriority,
    );

    // Send todo to worker
    this.todosService.sendCreatedTodoToWorker(generatedTodo);

    return generatedTodo;
  }

  @Put(':id')
  updateTodo(
    @Param('id') id: string,
    @Body('title') todoTitle: string,
    @Body('content') todoContent: string,
    @Body('priority') todoPriority: number,
  ) {
    return this.todosService.updateTodo(
      id,
      todoTitle,
      todoContent,
      todoPriority,
    );
  }

  @Delete(':id')
  removeTodo(@Param('id') id: string) {
    return this.todosService.deleteTodo(id);
  }
}
