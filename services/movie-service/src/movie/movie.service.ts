import { Injectable, Logger } from '@nestjs/common';

const MOVIES = [
  { id: 1, title: 'Forrest Gump', year: 1994, actorIds: [1, 2] },
  { id: 2, title: 'The Shawshank Redemption', year: 1994, actorIds: [1, 2] },
  { id: 3, title: 'Inception', year: 2010, actorIds: [3, 4] },
  { id: 4, title: 'Fight Club', year: 1999, actorIds: [5, 3] },
];

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  getMovieData(id: number) {
    this.logger.log(`Looking up movie id: ${id}`);
    const movie = MOVIES.find((m) => m.id === id);
    if (!movie) {
      this.logger.warn(`Movie not found: ${id}`);
      return null;
    }
    return movie;
  }

  getAllMovies() {
    this.logger.log('Getting all movies');
    return MOVIES;
  }

  getMoviesByYear(year: number) {
    this.logger.log(`Getting movies by year: ${year}`);
    return MOVIES.filter((m) => m.year === year);
  }
}
