# AkôFlow Desktop

Local interface for AkôFlow built with Electron.

## What it does

- Checks if Docker is installed.
- Checks if the Docker daemon is running.
- Guides the user to install or open Docker Desktop when needed.
- Serves as an entry point for the local flow that will use the release image.

## Structure

- `electron/` - main process, preload, and system integration.
- `renderer/app.js` - interface bootstrap.
- `renderer/components/` - reusable screen blocks.
- `renderer/services/` - access to Docker state and external actions.
- `renderer/styles.css` - application's visual theme.
- `renderer/styles/` - tokens, layout, hero, status, and responsiveness.

## Expected flow

1. Install dependencies with `npm install`.
2. Open the application with `npm start`.
3. If Docker is not installed, the screen shows the installation link.
4. If the daemon is off, the screen guides the user to open Docker Desktop.

## Welcome flow

- Step-by-step initial screen with animation and progress.
- Automatic system detection to suggest the correct download.
- Guided path: welcome, Docker, daemon, release image.
