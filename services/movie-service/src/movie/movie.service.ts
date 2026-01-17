/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

const MOVIES = [
  { id: 1, title: 'Forrest Gump', year: 1994, actorIds: [1, 2] },
  { id: 2, title: 'The Shawshank Redemption', year: 1994, actorIds: [1, 2] },
  { id: 3, title: 'Inception', year: 2010, actorIds: [3, 4] },
  { id: 4, title: 'Fight Club', year: 1999, actorIds: [5, 3] },
];

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);
  private readonly actorServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.actorServiceUrl =
      process.env.ACTOR_SERVICE_URL || 'http://localhost:3001';
  }

  async getMovie(id: number) {
    this.logger.log(`Looking up movie id: ${id}`);

    const movie = MOVIES.find((m) => m.id === id);

    if (!movie) {
      this.logger.warn(`Movie not found: ${id}`);
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    this.logger.log(`Found movie: ${movie.title}, fetching actors...`);

    // HTTP call to actor-service - trace ID propagates automatically via OTEL
    const actors = await this.fetchActors(movie.actorIds);

    return { ...movie, actors };
  }

  private async fetchActors(actorIds: number[]) {
    const actors: any[] = [];

    for (const actorId of actorIds) {
      try {
        this.logger.log(`Calling actor-service for actor ${actorId}`);
        const { data } = await firstValueFrom(
          this.httpService.get(`${this.actorServiceUrl}/api/actors/${actorId}`),
        );
        actors.push(data);
      } catch (error: unknown) {
        this.logger.warn(`Failed to fetch actor ${actorId}`);
        this.logger.warn(`Error: ${error as string}`);
      }
    }

    return actors;
  }
}
