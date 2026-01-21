import { registerOTel } from "@vercel/otel";

export function register() {
  const serviceName = process.env.SERVICE_NAME || "web-app";
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  console.log(`[OTEL] Registering OpenTelemetry for service: ${serviceName}`);
  console.log(`[OTEL] OTLP Endpoint: ${otlpEndpoint}`);

  registerOTel({
    serviceName: serviceName,
    // Configure fetch to propagate trace context to downstream services
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: [/.*/], // Propagate to all URLs
      },
    },
  });
}
