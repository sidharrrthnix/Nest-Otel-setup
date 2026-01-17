import { Module } from '@nestjs/common';
import { ActorModule } from './actor/actor.module';

@Module({
  imports: [ActorModule],
})
export class AppModule {}
