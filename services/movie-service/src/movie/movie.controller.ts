import { Controller, Get, Logger, Param } from '@nestjs/common';
import { MovieService } from './movie.service';

@Controller('api/movies')
export class MovieController {
  private readonly logger = new Logger(MovieController.name);

  constructor(private readonly movieService: MovieService) {}

  @Get(':id')
  getMovie(@Param('id') id: string) {
    this.logger.log(`Request for movie id: ${id}`);
    return this.movieService.getMovieData(parseInt(id, 10));
  }
}
