import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ActorService } from './actor.service';

@Controller('api/actors')
export class ActorController {
  private readonly logger = new Logger(ActorController.name);

  constructor(private readonly actorService: ActorService) {}

  @Get(':id')
  getActor(@Param('id') id: string) {
    this.logger.log(`Request received for actor id: ${id}`);
    return this.actorService.getActor(parseInt(id, 10));
  }
}
