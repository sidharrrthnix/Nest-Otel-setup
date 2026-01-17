import { Injectable, Logger, NotFoundException } from '@nestjs/common';

const ACTORS = [
  { id: 1, name: 'Tom Hanks', birthYear: 1956 },
  { id: 2, name: 'Morgan Freeman', birthYear: 1937 },
  { id: 3, name: 'Leonardo DiCaprio', birthYear: 1974 },
  { id: 4, name: 'Natalie Portman', birthYear: 1981 },
  { id: 5, name: 'Brad Pitt', birthYear: 1963 },
];

@Injectable()
export class ActorService {
  private readonly logger = new Logger(ActorService.name);

  getActor(id: number) {
    this.logger.log(`Looking up actor id: ${id}`);

    const actor = ACTORS.find((a) => a.id === id);

    if (!actor) {
      this.logger.warn(`Actor not found: ${id}`);
      throw new NotFoundException(`Actor with id ${id} not found`);
    }

    this.logger.log(`Found actor: ${actor.name}`);
    return actor;
  }

  getActorsByIds(ids: number[]) {
    this.logger.log(`Looking up actors: ${ids.join(', ')}`);
    return ACTORS.filter((a) => ids.includes(a.id));
  }
}
