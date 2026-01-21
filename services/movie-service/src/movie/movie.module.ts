import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieResolver } from './movie.graphql';
import { MovieService } from './movie.service';

@Module({
  imports: [HttpModule],
  controllers: [MovieController],
  providers: [MovieService, MovieResolver],
  exports: [MovieService],
})
export class MovieModule {}
