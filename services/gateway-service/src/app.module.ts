import {
  ApolloGatewayDriver,
  ApolloGatewayDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from '@apollo/gateway';

const movieServiceUrl =
  process.env.MOVIE_SERVICE_URL || 'http://localhost:3000';
const actorServiceUrl =
  process.env.ACTOR_SERVICE_URL || 'http://localhost:3001';

// Custom data source that propagates trace context headers to subgraphs
class TracingDataSource extends RemoteGraphQLDataSource {
  override willSendRequest(options: {
    request: { http?: { headers: { set: (k: string, v: string) => void } } };
    context: { req?: { headers?: Record<string, string | string[]> } };
  }) {
    // Forward trace context headers from incoming request to subgraph
    const incomingHeaders = options.context?.req?.headers || {};

    // Propagate W3C Trace Context headers
    const traceparent = incomingHeaders['traceparent'];
    if (traceparent) {
      options.request.http?.headers.set(
        'traceparent',
        Array.isArray(traceparent) ? traceparent[0] : traceparent,
      );
    }

    const tracestate = incomingHeaders['tracestate'];
    if (tracestate) {
      options.request.http?.headers.set(
        'tracestate',
        Array.isArray(tracestate) ? tracestate[0] : tracestate,
      );
    }
  }
}

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: 'movie', url: `${movieServiceUrl}/graphql` },
            { name: 'actor', url: `${actorServiceUrl}/graphql` },
          ],
        }),
        buildService({ url }) {
          const ds = new TracingDataSource();
          ds.url = url;
          return ds;
        },
      },
      server: {
        // Pass request to context for header propagation
        context: async ({ req }) => ({ req }),
      },
    }),
  ],
})
export class AppModule {}
