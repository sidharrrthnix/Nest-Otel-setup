import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function Home() {
  const movieIds = [1, 2, 3, 4];

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Movies</h1>
      <p className="mb-4 text-gray-600">
        Click a movie to see E2E tracing in action: Web App → Movie Service →
        Actor Service
      </p>
      <ul className="space-y-2">
        {movieIds.map((id) => (
          <li key={id}>
            <Link
              href={`/movies/${id}`}
              className="text-blue-600 hover:underline text-lg"
            >
              View Movie #{id}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
