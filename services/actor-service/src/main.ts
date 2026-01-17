import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import './tracing';
import { winstonConfig } from './winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Actor service running on port ${port}`);
}

bootstrap().catch((error) => {
  console.error('Error starting actor service', error);
  process.exit(1);
});
