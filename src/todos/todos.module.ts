import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Todo, TodoSchema } from 'src/schemas/todo.schema';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'exchange1',
            type: 'topic',
          },
        ],
        uri: configService.get<string>('RABBITMQ_URI'),
        connectionInitOptions: { wait: false },
      }),
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ES_URL'),
        // ! TEMPORARY SOLUTION
        // cloud: {
        //   id: configService.get<string>('ES_CLOUD_ID'),
        // },
        // auth: {
        //   username: configService.get<string>('ES_AUTH_USERNAME'),
        //   password: configService.get<string>('ES_AUTH_PASSWORD'),
        // },
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        ttl: 20,
      }),
    }),
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
