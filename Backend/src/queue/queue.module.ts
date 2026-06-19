import { Global, Module, DynamicModule, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { SystemProcessor } from './processors/system.processor';

@Global()
@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    // The QUEUE_ENABLED flag is resolved natively using process.env
    // before the Nest DI container finishes to allow conditional synchronous registration.
    const isQueueEnabled = process.env.QUEUE_ENABLED === 'true';
    const logger = new Logger('QueueModule');

    if (isQueueEnabled) {
      logger.log('Queue infrastructure is ENABLED. Booting BullMQ with Redis.');
      
      return {
        module: QueueModule,
        imports: [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              connection: {
                host: configService.get<string>('queue.redis.host'),
                port: configService.get<number>('queue.redis.port'),
                password: configService.get<string>('queue.redis.password'),
                db: configService.get<number>('queue.redis.db'),
              },
              defaultJobOptions: {
                attempts: 3,
                backoff: {
                  type: 'exponential',
                  delay: 1000,
                },
                removeOnComplete: 100,
                removeOnFail: 1000,
              },
            }),
          }),
          // Register the 'system' queue
          BullModule.registerQueue({
            name: 'system',
          }),
          // Register the 'notifications' queue
          BullModule.registerQueue({
            name: 'notifications',
            defaultJobOptions: {
              attempts: 5,
              backoff: { type: 'exponential', delay: 2000 },
            },
          }),
        ],
        providers: [SystemProcessor],
        exports: [BullModule],
      };
    }

    // QUEUE IS DISABLED - Mock Strategy
    logger.warn('Queue infrastructure is DISABLED. Queue injections will safely no-op.');

    const mockQueue = {
      add: async (name: string, data: any) => {
        logger.debug(`[MOCK QUEUE] Job '${name}' intercepted and discarded.`);
        return { id: 'mock-job', name, data };
      },
      on: () => {},
      close: async () => {},
    };

    const mockSystemQueueProvider = {
      provide: getQueueToken('system'),
      useValue: mockQueue,
    };

    const mockNotificationsQueueProvider = {
      provide: getQueueToken('notifications'),
      useValue: mockQueue,
    };

    return {
      module: QueueModule,
      providers: [mockSystemQueueProvider, mockNotificationsQueueProvider],
      exports: [mockSystemQueueProvider, mockNotificationsQueueProvider],
    };
  }
}
