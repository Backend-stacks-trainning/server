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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager/dist';
import { Cache } from 'cache-manager';
import { JsonRespond } from 'src/utils/interface';

@Controller('todo')
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  async getAllTodos() {
    return <JsonRespond>{
      statusCode: 200,
      message: 'Success',
      data: await this.todosService.getTodos(),
    };
  }

  @Get('search')
  @UseInterceptors(CacheInterceptor)
  async search(@Query('keyword') keyword: string) {
    return <JsonRespond>{
      statusCode: 200,
      message: 'Success',
      data: await this.todosService.searchTodo(keyword),
    };
  }

  @Get(':id')
  async getSingleTodo(@Param('id') id: string) {
    await this.todosService.checkTodoExist(id);

    return <JsonRespond>{
      statusCode: 200,
      message: 'Got succesfully',
      data: await this.todosService.getTodo(id),
    };
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
      todoId: generatedTodo._id.toString(),
      title: todoTitle,
      timestamp: todoTimestamp,
    });

    return <JsonRespond>{
      statusCode: 200,
      message: 'Added succesfully',
      data: generatedTodo,
    };
  }

  @Put(':id')
  async updateTodo(@Param('id') id: string, @Body('title') todoTitle: string) {
    // Check todo exist
    const todoExist = await this.todosService.checkTodoExist(id);
    if (!todoExist) {
      throw new HttpException(
        <JsonRespond>{
          statusCode: 400,
          message: 'Fail to update',
          error: 'DOCUMENT NOT EXIST WITH PROVIDED ID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Clear all cache
    this.cacheManager.reset();

    // Update data in ES
    this.todosService.sendUpdatedTodoToWorker({
      todoId: id,
      title: todoTitle,
    });

    return <JsonRespond>{
      statusCode: 200,
      message: 'Updated successfully',
      data: await this.todosService.updateTodo(id, todoTitle),
    };
  }

  @Delete(':id')
  async removeTodo(@Param('id') id: string) {
    // Check todo exist
    const todoExist = await this.todosService.checkTodoExist(id);
    if (!todoExist) {
      throw new HttpException(
        <JsonRespond>{
          statusCode: 400,
          message: 'Fail to delete',
          error: 'DOCUMENT NOT EXIST WITH PROVIDED ID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Delete data in ES
    this.todosService.sendDeletedTodoToWorker({
      todoId: id,
    });

    return <JsonRespond>{
      statusCode: 200,
      message: 'Deleted successfully',
      data: await this.todosService.deleteTodo(id),
    };
  }
}
