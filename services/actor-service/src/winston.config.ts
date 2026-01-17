import { context, trace } from '@opentelemetry/api';
import winston, { format, transports } from 'winston';

const serviceName = process.env.SERVICE_NAME || 'actor-service';
const isProduction = process.env.NODE_ENV === 'production';

// Auto-inject trace_id and span_id into every log
const tracingFormat = format((info) => {
  const span = trace.getSpan(context.active());

  if (span) {
    const spanContext = span.spanContext();
    info.trace_id = spanContext.traceId;
    info.span_id = spanContext.spanId;
  }

  return info;
});

const developmentFormat = format.combine(
  tracingFormat(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ timestamp, level, message, trace_id, stack }) => {
    const traceInfo = trace_id
      ? ` [trace:${(trace_id as string).slice(0, 8)}]`
      : '';
    return `${timestamp as string} [${level}]${traceInfo} ${
      (stack as string) || (message as string)
    }`;
  }),
);

const productionFormat = format.combine(
  tracingFormat(),
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);

export const winstonConfig: winston.LoggerOptions = {
  level: isProduction ? 'info' : 'debug',
  format: isProduction ? productionFormat : developmentFormat,
  defaultMeta: { service: serviceName },
  transports: [new transports.Console()],
};
