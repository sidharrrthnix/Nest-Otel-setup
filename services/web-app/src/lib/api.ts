import { trace, context, propagation, SpanStatusCode } from "@opentelemetry/api";

const MOVIE_SERVICE_URL =
  process.env.MOVIE_SERVICE_URL || "http://localhost:3000";

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

const tracer = trace.getTracer("web-app");

export async function getMovie(id: number): Promise<Movie> {
  const url = `${MOVIE_SERVICE_URL}/api/movies/${id}`;

  return tracer.startActiveSpan(`GET /api/movies/${id}`, async (span) => {
    try {
      // Inject trace context into headers for propagation
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      propagation.inject(context.active(), headers);

      // Log for debugging
      console.log(`[web-app] Fetching movie from: ${url}`);
      console.log(`[web-app] Trace headers:`, {
        traceparent: headers["traceparent"],
        tracestate: headers["tracestate"],
      });

      span.setAttribute("http.method", "GET");
      span.setAttribute("http.url", url);
      span.setAttribute("movie.id", id);

      const res = await fetch(url, {
        cache: "no-store",
        headers,
      });

      span.setAttribute("http.status_code", res.status);

      if (!res.ok) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${res.status}`,
        });
        throw new Error(
          `Failed to fetch movie ${id}: ${res.status} ${res.statusText}`
        );
      }

      span.setStatus({ code: SpanStatusCode.OK });
      return res.json();
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

export async function getAllMovieIds(): Promise<number[]> {
  return [1, 2, 3, 4];
}
