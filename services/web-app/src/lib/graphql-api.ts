import { context, propagation } from "@opentelemetry/api";

const MOVIE_SERVICE_URL =
  process.env.MOVIE_SERVICE_URL || "http://localhost:3000";

const GRAPHQL_ENDPOINT = `${MOVIE_SERVICE_URL}/graphql`;

export interface Actor {
  id: number;
  name: string;
  birthYear: number;
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  actorIds: number[];
  actors?: Actor[];
}

// Generic GraphQL fetch with trace propagation
async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Inject trace context for distributed tracing
  propagation.inject(context.active(), headers);

  console.log(`[web-app] GraphQL request to: ${GRAPHQL_ENDPOINT}`);
  console.log(`[web-app] Trace headers:`, {
    traceparent: headers["traceparent"],
  });

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

// Query: Get single movie by ID
export async function getMovieGql(id: number): Promise<Movie> {
  const query = `
    query GetMovie($id: Int!) {
      movie(id: $id) {
        id
        title
        year
        actorIds
        actors {
          id
          name
          birthYear
        }
      }
    }
  `;

  const data = await graphqlFetch<{ movie: Movie }>(query, { id });
  return data.movie;
}

// Query: Get all movies
export async function getAllMoviesGql(): Promise<Movie[]> {
  const query = `
    query GetAllMovies {
      movies {
        id
        title
        year
        actorIds
        actors {
          id
          name
          birthYear
        }
      }
    }
  `;

  const data = await graphqlFetch<{ movies: Movie[] }>(query);
  return data.movies;
}

// Query: Get movies by year
export async function getMoviesByYearGql(year: number): Promise<Movie[]> {
  const query = `
    query GetMoviesByYear($year: Int!) {
      moviesByYear(year: $year) {
        id
        title
        year
        actorIds
        actors {
          id
          name
          birthYear
        }
      }
    }
  `;

  const data = await graphqlFetch<{ moviesByYear: Movie[] }>(query, { year });
  return data.moviesByYear;
}
