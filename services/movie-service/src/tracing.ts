// MUST be imported and started BEFORE any other imports
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressLayerType } from '@opentelemetry/instrumentation-express';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const serviceName = process.env.SERVICE_NAME ?? 'movie-service';
const tracesUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  ? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
  : 'http://otel-collector:4318/v1/traces';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  }),

  traceExporter: new OTLPTraceExporter({
    url: tracesUrl,
  }),

  contextManager: new AsyncLocalStorageContextManager(),

  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) =>
          req.url?.includes('/health') ?? false,
        ignoreOutgoingRequestHook: (req) =>
          req.path?.includes('api/v1/push') ?? false,
      },
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-express': {
        ignoreLayersType: [ExpressLayerType.MIDDLEWARE],
      },
    }),
  ],
});

console.log(`[OTEL] Starting instrumentation for ${serviceName}`);
sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => {
      console.log('[OTEL] Tracing terminated');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[OTEL] Error terminating tracing', error);
      process.exit(1);
    });
});
