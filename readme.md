# OpenTelemetry Distributed Tracing Demo

A complete end-to-end demonstration of OpenTelemetry distributed tracing across a microservices architecture, featuring a Next.js frontend communicating with NestJS backend services.

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────────┐
│             │         │                  │         │                  │
│   Web App   │────────▶│  Movie Service   │────────▶│  Actor Service   │
│  (Next.js)  │         │    (NestJS)      │         │    (NestJS)      │
│   :3003     │         │     :3000        │         │     :3001        │
└─────────────┘         └──────────────────┘         └──────────────────┘
       │                         │                            │
       │                         │                            │
       └─────────────────────────┴────────────────────────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │  OTEL Collector     │
                      │      :4318          │
                      └─────────────────────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │    Tempo     │
                         │ (Trace Store)│
                         └──────────────┘
                                 │
                                 ▼
                           ┌──────────┐
                           │ Grafana  │
                           │  :3030   │
                           └──────────┘
```

## Tech Stack

### Frontend

- **Next.js 16.1.2** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **OpenTelemetry** - Distributed tracing instrumentation

### Backend Services

- **NestJS 11** - Progressive Node.js framework
- **TypeScript** - Type safety
- **Winston** - Structured logging
- **OpenTelemetry** - Distributed tracing with auto-instrumentation

### Observability Stack

- **OpenTelemetry Collector 0.141.0** - Trace aggregation and forwarding
- **Grafana Tempo 2.8.2** - Distributed tracing backend
- **Grafana 12.0.0** - Observability UI and trace visualization

## Services

### 1. Web App (Frontend)

- **Port:** 3003
- **Technology:** Next.js 16 with App Router
- **Features:**
  - Server-side rendering
  - Movie listing and detail pages
  - Automatic trace propagation via OpenTelemetry
  - Fetch instrumentation for outgoing HTTP calls

### 2. Movie Service (Backend)

- **Port:** 3000
- **Technology:** NestJS
- **Endpoints:**
  - `GET /api/movies/:id` - Fetch movie details
- **Features:**
  - Fetches actor data from Actor Service
  - Full OpenTelemetry auto-instrumentation
  - Structured logging with Winston
  - Health check endpoint

### 3. Actor Service (Backend)

- **Port:** 3001
- **Technology:** NestJS
- **Endpoints:**
  - `GET /api/actors/:id` - Fetch actor details
- **Features:**
  - Mock actor database
  - Full OpenTelemetry auto-instrumentation
  - Structured logging with Winston
  - Health check endpoint

## Getting Started

### Prerequisites

- **Docker** and **Docker Compose**
- **Node.js 20+** (for local development)
- **npm** or **yarn**

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd nest-otel
   ```

2. **Start all services**

   ```bash
   docker-compose up --build
   ```

3. **Access the services**

   - **Web App:** http://localhost:3003
   - **Movie Service:** http://localhost:3000/api/movies/1
   - **Actor Service:** http://localhost:3001/api/actors/1
   - **Grafana:** http://localhost:3030

4. **View traces in Grafana**
   - Navigate to http://localhost:3030
   - Go to **Explore** → Select **Tempo** data source
   - Click **Search** and select service names to view traces

### View Distributed Traces

1. Visit http://localhost:3003/movies/1 in your browser
2. Open Grafana at http://localhost:3030
3. Navigate to **Explore** → **Tempo**
4. Use the **Search** tab and filter by:
   - **Service Name:** `web-app`, `movie-service`, or `actor-service`
   - View the complete trace flow across all three services

You should see traces showing the complete request flow:

```
web-app → movie-service → actor-service
```

All spans share the same **Trace ID**, demonstrating end-to-end distributed tracing.

## Local Development

### Running Services Individually

#### Web App

```bash
cd services/web-app
npm install
npm run dev
# Runs on http://localhost:3000
```

#### Movie Service

```bash
cd services/movie-service
npm install
npm run start:dev
# Runs on http://localhost:3000
```

#### Actor Service

```bash
cd services/actor-service
npm install
npm run start:dev
# Runs on http://localhost:3001
```

## OpenTelemetry Configuration

### Web App (Next.js)

- Uses `@vercel/otel` with explicit `OTLPTraceExporter`
- Configured in `instrumentation.ts` (Next.js 16 convention)
- Automatic fetch instrumentation
- Trace context propagation via W3C Trace Context headers

### Backend Services (NestJS)

- Uses `@opentelemetry/sdk-node` with `NodeSDK`
- Auto-instrumentation via `@opentelemetry/auto-instrumentations-node`
- Configured in `tracing.ts` (loaded before application bootstrap)
- HTTP, Express, and custom instrumentations enabled

### OTEL Collector

- Receives traces via OTLP HTTP (port 4318) and gRPC (port 4317)
- Batches and forwards to Tempo
- Debug logging enabled for troubleshooting

## Environment Variables

### Web App

```env
PORT=3003
SERVICE_NAME=web-app
MOVIE_SERVICE_URL=http://movie-service:3000
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
NEXT_OTEL_VERBOSE=1
```

### Movie Service

```env
PORT=3000
SERVICE_NAME=movie-service
ACTOR_SERVICE_URL=http://actor-service:3001
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

### Actor Service

```env
PORT=3001
SERVICE_NAME=actor-service
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

## Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f web-app
```

## Project Structure

```
nest-otel/
├── services/
│   ├── web-app/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   └── lib/          # API client
│   │   ├── instrumentation.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── movie-service/        # NestJS movie API
│   │   ├── src/
│   │   │   ├── movie/        # Movie module
│   │   │   ├── main.ts
│   │   │   └── tracing.ts    # OTEL configuration
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── actor-service/        # NestJS actor API
│       ├── src/
│       │   ├── actor/        # Actor module
│       │   ├── main.ts
│       │   └── tracing.ts    # OTEL configuration
│       ├── Dockerfile
│       └── package.json
│
├── docker-volume/
│   ├── collector-config.yaml # OTEL Collector configuration
│   ├── tempo.yaml            # Tempo configuration
│   └── grafana-datasources.yaml
│
├── docker-compose.yaml       # Orchestration
└── README.md
```

## Key Features

### ✅ Distributed Tracing

- End-to-end trace propagation from frontend to backend services
- W3C Trace Context standard for trace ID propagation
- Automatic instrumentation for HTTP requests and responses

### ✅ Service Health Checks

- Docker Compose health checks ensure services start in correct order
- Prevents connection refused errors during startup

### ✅ Structured Logging

- Winston logger integration in NestJS services
- Correlation between logs and traces via trace IDs

### ✅ Production-Ready Setup

- Multi-stage Docker builds for optimized images
- Next.js standalone output for minimal production bundle
- Proper error handling and graceful shutdowns

## Troubleshooting

### Traces not appearing in Grafana

1. **Check OTEL Collector logs:**

   ```bash
   docker-compose logs otel-collector
   ```

2. **Verify services are exporting traces:**

   ```bash
   docker-compose logs web-app | grep OTEL
   docker-compose logs movie-service | grep OTEL
   ```

3. **Check Tempo is receiving data:**
   ```bash
   docker-compose logs tempo
   ```

### Connection Refused Errors

The health checks should prevent this, but if it occurs:

```bash
# Restart services in order
docker-compose restart actor-service
docker-compose restart movie-service
docker-compose restart web-app
```

### Web App Not Showing in Grafana

Ensure the instrumentation is loaded:

```bash
docker-compose logs web-app | grep "Registering"
```

You should see: `[OTEL] Registering web-app, endpoint: http://otel-collector:4318/v1/traces`

## Resources

- [OpenTelemetry Official Docs](https://opentelemetry.io/docs/)
- [Next.js OpenTelemetry Guide](https://nextjs.org/docs/app/guides/open-telemetry)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Grafana Tempo Documentation](https://grafana.com/docs/tempo/latest/)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
