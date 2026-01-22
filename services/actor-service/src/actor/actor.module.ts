import { Module } from '@nestjs/common';
import { ActorController } from './actor.controller';
import { ActorResolver } from './actor.graphql';
import { ActorService } from './actor.service';

@Module({
  controllers: [ActorController], // Keep REST API
  providers: [ActorService, ActorResolver],
  exports: [ActorService],
})
export class ActorModule {}
