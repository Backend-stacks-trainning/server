import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  Delete,
  Put,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { UUID } from 'crypto';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager/dist';
import { Cache } from 'cache-manager';

@Controller('todo')
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  getAllTodos() {
    return this.todosService.getTodos();
  }

  @Get('search')
  @UseInterceptors(CacheInterceptor)
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
    // Clear all cache
    this.cacheManager.reset();

    return this.todosService.updateTodo(id, todoTitle);
  }

  @Delete(':id')
  removeTodo(@Param('id') id: string) {
    return this.todosService.deleteTodo(id);
  }
}
