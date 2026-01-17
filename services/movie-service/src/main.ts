import './tracing';

import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { winstonConfig } from './winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Movie service running on port ${port}`);
}

bootstrap().catch((error) => {
  console.error('Error starting movie service', error);
  process.exit(1);
});
