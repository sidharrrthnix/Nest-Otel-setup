import {
  Args,
  Directive,
  Field,
  ID,
  Int,
  ObjectType,
  Query,
  ResolveReference,
  Resolver,
} from '@nestjs/graphql';
import { ActorService } from './actor.service';

@ObjectType()
@Directive('@key(fields: "id")')
export class ActorType {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  birthYear: number;
}

@Resolver(() => ActorType)
export class ActorResolver {
  constructor(private readonly actorService: ActorService) {}

  @Query(() => ActorType, { name: 'actor', nullable: true })
  getActor(@Args('id', { type: () => Int }) id: number): ActorType | null {
    try {
      return this.actorService.getActor(id);
    } catch {
      return null;
    }
  }

  @Query(() => [ActorType], { name: 'actors' })
  getActors(): ActorType[] {
    return this.actorService.getAllActors();
  }

  // Federation: called by gateway when resolving Actor references from other subgraphs
  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string | number;
  }): ActorType | null {
    try {
      // ID comes as string from federation, convert to number
      const id =
        typeof reference.id === 'string'
          ? parseInt(reference.id, 10)
          : reference.id;
      return this.actorService.getActor(id);
    } catch {
      return null;
    }
  }
}
