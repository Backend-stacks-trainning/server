import { Body, Controller, Post, Get, Param } from '@nestjs/common';
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
  addTodo(
    @Body('title') todoTitle: string,
    @Body('content') todoContent: string,
    @Body('priority') todoPriority: number,
  ) {
    const generatedId = this.todosService.insertTodo(
      todoTitle,
      todoContent,
      todoPriority,
    );
    return { id: generatedId };
  }
}
