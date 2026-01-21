import { getMovie } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovie(parseInt(id, 10));

  return (
    <main className="min-h-screen p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 block">
        ← Back to Movies
      </Link>

      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
      <p className="text-gray-600 mb-6">Released: {movie.year}</p>

      <h2 className="text-xl font-semibold mb-3">Cast</h2>
      {movie.actors && movie.actors.length > 0 ? (
        <ul className="space-y-2">
          {movie.actors.map((actor) => (
            <li key={actor.id} className="bg-gray-100 p-3 rounded">
              <span className="font-medium">{actor.name}</span>
              <span className="text-gray-500 ml-2">
                Born: {actor.birthYear}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No cast information available</p>
      )}

      <div className="mt-8 p-4 bg-green-50 rounded border border-green-200">
        <p className="text-green-800 text-sm">
          ✓ This page made a server-side request to movie-service, which called
          actor-service.
          <br />
          Check Grafana at{" "}
          <code className="bg-green-100 px-1">http://localhost:3030</code> to
          see the distributed trace!
        </p>
      </div>
    </main>
  );
}
