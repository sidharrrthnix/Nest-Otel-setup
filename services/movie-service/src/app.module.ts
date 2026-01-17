import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';

@Module({
  imports: [HttpModule, MovieModule],
})
export class AppModule {}
