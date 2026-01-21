import {
  Args,
  Field,
  ID,
  Int,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { MovieService } from './movie.service';

@ObjectType()
export class ActorType {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  birthYear: number;
}

@ObjectType()
export class MovieType {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field(() => Int)
  year: number;

  @Field(() => [Int])
  actorIds: number[];

  @Field(() => [ActorType], { nullable: true })
  actors?: ActorType[];
}

@Resolver(() => MovieType)
export class MovieResolver {
  constructor(private readonly movieService: MovieService) {}

  @Query(() => MovieType, { name: 'movie' })
  async getMovie(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<MovieType> {
    return this.movieService.getMovie(id);
  }

  @Query(() => [MovieType], { name: 'movies' })
  async getMovies(): Promise<MovieType[]> {
    const movies = await Promise.all([
      this.movieService.getMovie(1),
      this.movieService.getMovie(2),
      this.movieService.getMovie(3),
      this.movieService.getMovie(4),
    ]);
    return movies;
  }

  @Query(() => [MovieType], { name: 'moviesByYear' })
  async getMoviesByYear(
    @Args('year', { type: () => Int }) year: number,
  ): Promise<MovieType[]> {
    const allMovies = await this.getMovies();
    return allMovies.filter((m) => m.year === year);
  }
}
