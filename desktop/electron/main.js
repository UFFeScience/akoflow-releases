const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const os = require('node:os');
const path = require('node:path');

const execFileAsync = promisify(execFile);
const shouldOpenDevTools = process.env.AKOFLOW_OPEN_DEVTOOLS === '1';

function logMain(message, details) {
  if (details !== undefined) {
    console.log(`[AkoFlow] ${message}`, details);
    return;
  }

  console.log(`[AkoFlow] ${message}`);
}

async function checkDockerStatus() {
  logMain('Checking Docker availability');

  try {
    await execFileAsync('docker', ['--version']);
  } catch (error) {
    logMain('Docker CLI not found', error?.message || 'Docker CLI is unavailable.');

    return {
      status: 'missing',
      title: 'Docker not found',
      message: 'Install Docker Desktop to continue using AkoFlow locally.',
      error: error?.message || 'Docker CLI is unavailable.',
      actionLabel: 'Install Docker Desktop',
      actionUrl: 'https://www.docker.com/products/docker-desktop/',
    };
  }

  try {
    const { stdout } = await execFileAsync('docker', ['info', '--format', '{{json .ServerVersion}}'], { timeout: 8000 });
    const serverVersion = JSON.parse(stdout.trim());

    logMain('Docker daemon is ready', `Server version: ${serverVersion}`);

    return {
      status: 'ready',
      title: 'Docker is ready',
      message: `Daemon available. Server version: ${serverVersion}.`,
      error: null,
      actionLabel: 'Check again',
      actionUrl: null,
    };
  } catch (error) {
    const isTimeout = error?.killed || error?.code === 'ETIMEDOUT' || error?.signal === 'SIGTERM';
    if (isTimeout) {
      logMain('Docker info timed out after 8s');
      return {
        status: 'daemon-off',
        title: 'Docker daemon is not active',
        message: 'Docker daemon did not respond within 8 seconds. Open Docker Desktop and wait until the engine turns on.',
        error: 'Timeout waiting for Docker daemon.',
        actionLabel: 'Open Docker Desktop',
        actionUrl: 'open-docker-desktop',
      };
    }
    const output = `${error?.stdout || ''}\n${error?.stderr || ''}`.toLowerCase();
    const daemonIsDown = output.includes('cannot connect to the docker daemon') || output.includes('is the docker daemon running');

    logMain(
      daemonIsDown ? 'Docker daemon is off' : 'Docker verification failed',
      error?.message || error?.stderr || error?.stdout || 'Docker verification failed.',
    );

    return {
      status: daemonIsDown ? 'daemon-off' : 'missing',
      title: daemonIsDown ? 'Docker daemon is not active' : 'Docker is not ready',
      message: daemonIsDown
        ? 'Docker daemon is not active. Open Docker Desktop and wait until the engine turns on.'
        : 'We could not confirm the daemon. Please verify your Docker Desktop installation.',
      error: error?.message || error?.stderr || error?.stdout || 'Docker verification failed.',
      actionLabel: daemonIsDown ? 'Open Docker Desktop' : 'Install Docker Desktop',
      actionUrl: 'open-docker-desktop',
    };
  }
}

function getSystemInfo() {
  const logs = [];
  const platformLabels = {
    darwin: 'macOS',
    win32: 'Windows',
    linux: 'Linux',
  };

  const architectureLabels = {
    arm64: 'Apple Silicon / ARM64',
    x64: 'Intel / x64',
  };

  const platform = process.platform;
  const architecture = process.arch;
  const platformLabel = platformLabels[platform] ?? platform;
  const architectureLabel = architectureLabels[architecture] ?? architecture.toUpperCase();

  logs.push(`[AkoFlow] Collecting system information: ${platformLabel} / ${architectureLabel}`);
  logMain('Collecting system information', `${platformLabel} / ${architectureLabel}`);

  return {
    platform,
    architecture,
    platformLabel,
    architectureLabel,
    release: os.release(),
    hostname: os.hostname(),
    dockerDownloadUrl: 'https://www.docker.com/products/docker-desktop/',
    dockerGuideLabel:
      platform === 'darwin'
        ? `Download Docker Desktop for ${architectureLabel}`
        : 'Download the Docker Desktop build for your platform',
    downloadHint:
      platform === 'darwin'
        ? `This machine is running ${platformLabel} on ${architectureLabel}. Use the matching Docker Desktop installer.`
        : `This machine is running ${platformLabel} on ${architectureLabel}. Use the installer that matches this architecture.`,
    logs,
  };
}

async function getDiagnostics() {
  logMain('Starting diagnostics run');

  const systemInfo = getSystemInfo();
  const dockerStatus = await checkDockerStatus();

  logMain('Diagnostics complete', `${systemInfo.platformLabel} / ${dockerStatus.status}`);

  return {
    systemInfo,
    dockerStatus,
    checks: [
      {
        key: 'system',
        label: 'System',
        status: 'ready',
        message: `Detected ${systemInfo.platformLabel} on ${systemInfo.architectureLabel}.`,
        error: null,
      },
      {
        key: 'docker',
        label: 'Docker',
        status: dockerStatus.status,
        message: dockerStatus.message,
        error: dockerStatus.error || null,
      },
    ],
    logs: [
      `System check complete: ${systemInfo.platformLabel} / ${systemInfo.architectureLabel}.`,
      dockerStatus.status === 'ready'
        ? `Docker daemon active: ${dockerStatus.message}`
        : `Docker daemon is not active: ${dockerStatus.message}`,
    ],
  };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: '#07111f',
    title: 'AkoFlow',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.removeMenu();
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  win.webContents.on('did-finish-load', () => {
    logMain('Renderer finished loading');

    if (shouldOpenDevTools) {
      win.webContents.openDevTools({ mode: 'detach' });
      logMain('DevTools opened');
    }
  });

  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer:${level}] ${message} (${sourceId}:${line})`);
  });

  win.webContents.on('before-input-event', (event, input) => {
    const isInspectShortcut =
      (process.platform === 'darwin' && input.meta && input.alt && input.key.toLowerCase() === 'i') ||
      (process.platform !== 'darwin' && input.control && input.shift && input.key.toLowerCase() === 'i');

    if (isInspectShortcut) {
      win.webContents.openDevTools({ mode: 'detach' });
      event.preventDefault();
    }
  });
}

ipcMain.handle('docker:get-status', async () => checkDockerStatus());
ipcMain.handle('system:get-info', async () => getSystemInfo());
// (os logs agora são retornados em systemInfo.logs)
ipcMain.handle('diagnostics:get', async () => getDiagnostics());

ipcMain.handle('docker:open-action', async (_event, actionUrl) => {
  if (actionUrl === 'open-docker-desktop') {
    if (process.platform === 'darwin') {
      await execFileAsync('open', ['-a', 'Docker']);
      return { opened: true };
    }

    await shell.openExternal('https://www.docker.com/products/docker-desktop/');
    return {
      opened: true,
    };
  }

  if (typeof actionUrl === 'string' && actionUrl.length > 0) {
    await shell.openExternal(actionUrl);
  }

  return { opened: true };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});