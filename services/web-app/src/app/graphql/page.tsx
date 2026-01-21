"use client";

import { useState } from "react";

const GRAPHQL_URL = "/api/graphql";

type QueryResult = {
  data: unknown;
  loading: boolean;
  error: string | null;
};

const QUERIES = {
  getMovie: {
    name: "GetMovie",
    description: "Fetch movie by ID with actors",
    query: `query GetMovie($id: Int!) {
  movie(id: $id) {
    id
    title
    year
    actors { id name birthYear }
  }
}`,
    variables: { id: 1 },
  },
  getAllMovies: {
    name: "GetAllMovies",
    description: "Fetch all movies",
    query: `query GetAllMovies {
  movies {
    id
    title
    year
  }
}`,
    variables: {},
  },
  getMoviesByYear: {
    name: "GetMoviesByYear",
    description: "Filter movies by year",
    query: `query GetMoviesByYear($year: Int!) {
  moviesByYear(year: $year) {
    id
    title
    actors { name }
  }
}`,
    variables: { year: 1994 },
  },
};

export default function GraphQLPage() {
  const [results, setResults] = useState<Record<string, QueryResult>>({});

  const executeQuery = async (key: string) => {
    const q = QUERIES[key as keyof typeof QUERIES];
    setResults((prev) => ({
      ...prev,
      [key]: { data: null, loading: true, error: null },
    }));

    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.query, variables: q.variables }),
      });
      const json = await res.json();
      setResults((prev) => ({
        ...prev,
        [key]: { data: json, loading: false, error: null },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [key]: { data: null, loading: false, error: String(err) },
      }));
    }
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.875rem",
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#0f0f1a", minHeight: "100vh", color: "#e5e5e5", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        GraphQL Tracing Demo
      </h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>
        Click buttons to trigger traced requests: web-app → movie-service → actor-service
      </p>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {Object.entries(QUERIES).map(([key, q]) => (
          <div key={key} style={{ backgroundColor: "#1a1a2e", padding: "1rem", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <span style={{ color: "#4ade80", fontWeight: "600" }}>{q.name}</span>
                <span style={{ color: "#666", marginLeft: "0.5rem", fontSize: "0.875rem" }}>
                  {q.description}
                </span>
              </div>
              <button
                onClick={() => executeQuery(key)}
                disabled={results[key]?.loading}
                style={{ ...buttonStyle, opacity: results[key]?.loading ? 0.5 : 1 }}
              >
                {results[key]?.loading ? "Loading..." : "Execute"}
              </button>
            </div>

            <pre style={{ backgroundColor: "#0d1117", padding: "0.75rem", borderRadius: "4px", fontSize: "0.75rem", color: "#7dd3fc", margin: 0, overflow: "auto" }}>
              {q.query.trim()}
            </pre>

            {results[key]?.data !== null && results[key]?.data !== undefined && (
              <pre style={{ backgroundColor: "#0d1117", padding: "0.75rem", borderRadius: "4px", fontSize: "0.75rem", color: "#a5f3fc", marginTop: "0.5rem", overflow: "auto" }}>
                {JSON.stringify(results[key]?.data, null, 2)}
              </pre>
            )}

            {results[key]?.error && (
              <div style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.875rem" }}>
                Error: {results[key].error}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#1a1a2e", borderRadius: "8px" }}>
        <p style={{ color: "#888", fontSize: "0.875rem" }}>
          <strong style={{ color: "#f59e0b" }}>Playground:</strong>{" "}
          <a href="http://localhost:3000/graphql" target="_blank" style={{ color: "#60a5fa" }}>
            http://localhost:3000/graphql
          </a>
          {" | "}
          <strong style={{ color: "#f59e0b" }}>Grafana:</strong>{" "}
          <a href="http://localhost:3030" target="_blank" style={{ color: "#60a5fa" }}>
            http://localhost:3030
          </a>
        </p>
      </div>
    </div>
  );
}
