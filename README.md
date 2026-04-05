# AkôFlow Releases

Central release repository for AkôFlow. Manages and publishes three artifacts:

| Artifact | Description |
|---|---|
| **AkôFlow** (Docker) | Release image bundling the Control Plane and the UI, exposed on port 80 |
| **AkôFlow Desktop** | Local Electron app that orchestrates the Docker image on the user's machine |
| **AkôFlow Node** | Standalone Node app built for Linux, macOS and Windows |

## Repository structure

```
.
├── Dockerfile          # Main Docker image build
├── docker/             # nginx, php-fpm, supervisord and entrypoint configs
├── desktop/            # Electron app (AkôFlow Desktop)
└── cloud/              # Reserved for the future cloud version
```

---

## AkôFlow (Docker image)

Container that clones the latest version of the Control Plane and the UI, builds both, and exposes the full application on port 80.

### Routing

| Path | Service |
|---|---|
| `/api` | Control Plane |
| `/` | UI |

### Build

```bash
docker build -t akoflow/akoflow .
```

Overriding repository or branch:

```bash
docker build \
  --build-arg BACKEND_REPO=https://github.com/UFFeScience/akoflow-deployment-control-plane.git \
  --build-arg FRONTEND_REPO=https://github.com/UFFeScience/akoflow-deployment-control-plane-ui.git \
  --build-arg BACKEND_REF=main \
  --build-arg FRONTEND_REF=main \
  -t akoflow/akoflow .
```

### Run

```bash
docker run --rm -p 80:80 akoflow/akoflow
```

The container initialises a local SQLite database, runs migrations, seeds the database, starts the queue worker, and serves the Control Plane and the UI behind Nginx.

---

## AkôFlow Desktop

Electron app located in `desktop/`. Entry point for running AkôFlow locally without any manual setup.

- Checks whether Docker is installed and the daemon is running.
- Guides installation or activation when needed.
- Pulls and starts the release image automatically.

### Development

```bash
cd desktop
npm install
npm start
```

### Distribution

The CI/CD pipeline generates installers for all platforms on every `vX.Y.Z` tag:

| Platform | Format |
|---|---|
| macOS (Apple Silicon) | `.dmg` (arm64) |
| macOS (Intel) | `.dmg` (x64) |
| Windows | `.exe` (NSIS installer) |
| Linux | `.AppImage` |

Artifacts are automatically attached to the corresponding GitHub Release.