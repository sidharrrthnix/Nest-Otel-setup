import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieResolver } from './movie.graphql';
import { MovieService } from './movie.service';

@Module({
  controllers: [MovieController], // Keep REST API
  providers: [MovieService, MovieResolver],
  exports: [MovieService],
})
export class MovieModule {}
