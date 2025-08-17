import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'document-processing' },
      { name: 'ai-analysis' },
      { name: 'pdf-generation' },
      { name: 'notifications' },
    ),
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService, BullModule],
})
export class JobsModule {}