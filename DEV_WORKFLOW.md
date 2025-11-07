## Dev vs Prod Compose

- `docker-compose.yml` defines the shared stack (MongoDB, backend, frontend) with production defaults.
- `docker-compose.dev.yml` overrides the backend/frontend to run hot-reload dev servers, mounts the source folders, installs dependencies, and exposes the CRA dev server on port 3000.

## Run the Dev Stack

- **Start / rebuild (foreground logs)**: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`
- **Start detached**: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`
- **Follow logs**: `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend` (or `backend`/`mongodb`)
- **Open Mongo shell**: `docker exec -it eventhub-mongodb mongosh`

## Stop & Clean

- **Stop foreground stack**: press `Ctrl+C`
- **Tear down containers**: `docker compose -f docker-compose.yml -f docker-compose.dev.yml down`
- **Remove dev node_modules volumes (fix npm errors)**: `docker volume rm eventhub_frontend_node_modules eventhub_backend_node_modules`
- **Full reset including Mongo data**: `docker compose down -v`

## Production Containers

- **Build production images**: `docker compose build --no-cache`
- **Start production stack**: `docker compose up -d`
- **Stop production stack**: `docker compose down` (`-v` to wipe Mongo data)

