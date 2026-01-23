// MUST be imported and started BEFORE any other imports
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressLayerType } from '@opentelemetry/instrumentation-express';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

// Service configuration
const serviceName = process.env.SERVICE_NAME ?? 'actor-service';
const serviceVersion = process.env.SERVICE_VERSION ?? '1.0.0';
const environment = process.env.NODE_ENV ?? 'development';
const samplingRatio = parseFloat(process.env.OTEL_SAMPLING_RATIO ?? '1.0');

const tracesUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  ? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
  : 'http://otel-collector:4318/v1/traces';

const sdk = new NodeSDK({
  // Resource attributes for service identification
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    'deployment.environment': environment,
  }),

  traceExporter: new OTLPTraceExporter({ url: tracesUrl }),

  contextManager: new AsyncLocalStorageContextManager(),

  // Sampling: Parent-based with configurable ratio for root spans
  // In production, set OTEL_SAMPLING_RATIO=0.1 for 10% sampling
  sampler: new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(samplingRatio),
  }),

  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) =>
          req.url?.includes('/health') ?? false,
        ignoreOutgoingRequestHook: (req) =>
          req.path?.includes('/v1/traces') ?? false,
      },
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-express': {
        ignoreLayersType: [ExpressLayerType.MIDDLEWARE],
      },
      // GraphQL instrumentation - production config
      '@opentelemetry/instrumentation-graphql': {
        allowValues: true,
        mergeItems: true,
        ignoreTrivialResolveSpans: true,
      },
    }),
  ],
});

console.log(
  `[OTEL] ${serviceName} v${serviceVersion} (${environment}) - sampling: ${samplingRatio * 100}%`,
);
sdk.start();

// Graceful shutdown
const shutdown = async () => {
  try {
    await sdk.shutdown();
    console.log('[OTEL] Tracing terminated');
    process.exit(0);
  } catch (error) {
    console.error('[OTEL] Error terminating tracing', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
