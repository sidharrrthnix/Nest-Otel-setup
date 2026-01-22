import {
  Args,
  Directive,
  Field,
  ID,
  Int,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver,
} from '@nestjs/graphql';
import { MovieService } from './movie.service';

// Actor stub - full type defined in actor-service, referenced here for federation
@ObjectType()
@Directive('@key(fields: "id")')
export class ActorType {
  @Field(() => ID)
  id: number;
}

@ObjectType()
@Directive('@key(fields: "id")')
export class MovieType {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field(() => Int)
  year: number;

  @Field(() => [Int])
  actorIds: number[];
}

@Resolver(() => MovieType)
export class MovieResolver {
  constructor(private readonly movieService: MovieService) {}

  @Query(() => MovieType, { name: 'movie', nullable: true })
  getMovie(@Args('id', { type: () => Int }) id: number): MovieType | null {
    return this.movieService.getMovieData(id);
  }

  @Query(() => [MovieType], { name: 'movies' })
  getMovies(): MovieType[] {
    return this.movieService.getAllMovies();
  }

  @Query(() => [MovieType], { name: 'moviesByYear' })
  getMoviesByYear(
    @Args('year', { type: () => Int }) year: number,
  ): MovieType[] {
    return this.movieService.getMoviesByYear(year);
  }

  // Resolve actors field - returns Actor references for federation
  @ResolveField(() => [ActorType], { name: 'actors' })
  getActors(@Parent() movie: MovieType): ActorType[] {
    // Return actor stubs with just IDs - gateway resolves full Actor from actor-service
    return movie.actorIds.map((id) => ({ id }));
  }

  // Federation: called by gateway when resolving Movie references
  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: number;
  }): MovieType | null {
    return this.movieService.getMovieData(reference.id);
  }
}
