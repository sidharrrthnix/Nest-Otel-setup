import { context, propagation, trace } from "@opentelemetry/api";
import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3002";
const tracer = trace.getTracer("web-app-api");

export async function POST(request: NextRequest) {
  const body = await request.json();
  const operationName = body.operationName || "GraphQL";

  // Create a span for this GraphQL proxy request
  return tracer.startActiveSpan(`graphql ${operationName}`, async (span) => {
    try {
      // Inject trace context into outgoing headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      propagation.inject(context.active(), headers);

      span.setAttribute("graphql.operation.name", operationName);
      span.setAttribute("http.url", `${GATEWAY_URL}/graphql`);

      const res = await fetch(`${GATEWAY_URL}/graphql`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      span.setAttribute("http.status_code", res.status);
      return NextResponse.json(data);
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}
