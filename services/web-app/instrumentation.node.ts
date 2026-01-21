import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const serviceName = process.env.SERVICE_NAME || "web-app";
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  ? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
  : "http://localhost:4318/v1/traces";

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: otlpEndpoint,
    }),
  ),
  instrumentations: [
    getNodeAutoInstrumentations({
      // HTTP instrumentation for trace propagation
      "@opentelemetry/instrumentation-http": {
        ignoreOutgoingRequestHook: (req) =>
          req.path?.includes("/v1/traces") ?? false, // Don't trace OTEL exports
      },
      // Disable noisy instrumentations
      "@opentelemetry/instrumentation-fs": { enabled: false },
      "@opentelemetry/instrumentation-dns": { enabled: false },
      "@opentelemetry/instrumentation-net": { enabled: false },
      // GraphQL config
      "@opentelemetry/instrumentation-graphql": {
        mergeItems: true,
        allowValues: true,
        depth: 1,
        ignoreTrivialResolveSpans: true,
      },
    }),
  ],
});
sdk.start();

console.log(
  `OpenTelemetry initialized for ${serviceName}, exporting to ${otlpEndpoint}`,
);
