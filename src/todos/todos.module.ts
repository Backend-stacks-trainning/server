import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Todo, TodoSchema } from 'src/schemas/todo.schema';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'exchange1',
          type: 'topic',
        },
      ],
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: false },
    }),
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        cloud: {
          id: 'tuannt02-elasticsearch:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQ5YWY5NTExYmY2YTQ0MzdlOGU2YWUzODBjNTc1YTE0OSRmM2ZiNjNmZDJmZmY0NGEyYjJiMjE2YTEyMjE2Y2FmYQ==',
        },
        auth: {
          username: 'elastic',
          password: '6mGdrrDqKUBMCysKeu61xaby',
        },
      }),
    }),
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: redisStore,
        host: 'localhost',
        port: 6379,
        ttl: 20,
      }),
    }),
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
