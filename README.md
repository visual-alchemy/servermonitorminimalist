# Server Monitor Minimalist

![NEXT](https://img.shields.io/badge/NEXT.JS-14+-gray?style=for-the-badge&logo=next.js)
![NODE](https://img.shields.io/badge/NODE.JS-18+-green?style=for-the-badge&logo=node.js)
![TAILWIND](https://img.shields.io/badge/TAILWINDCSS-4-gray?style=for-the-badge&logo=tailwind-css)
![SWR](https://img.shields.io/badge/SWR-Real--time-blue?style=for-the-badge)
![SYSTEMINFORMATION](https://img.shields.io/badge/systeminformation-Live%20metrics-purple?style=for-the-badge)

Server Monitor Minimalist is a black-and-white dashboard built with Next.js 14 that surfaces live resource usage for the machine it runs on. It polls the backend every couple of seconds to show the latest CPU, GPU, memory, disk, network, and uptime numbers, and it keeps a customizable list of shortcuts so your most-used tools are a click away.

## Highlights

- **Live metrics** powered by the [`systeminformation`](https://systeminformation.io/) library and the App Router API route.
- **Dark-first UI** with large, readable typography, skeleton states, and responsive cards.
- **Persistent shortcuts** that live on the server (`data/shortcuts.json`), with add/edit dialogs, icon choices, and one-click launch buttons.
- **Accessible components** composed from Radix primitives and Shadcn UI building blocks.

## Prerequisites

- Node.js 18 or newer (Next.js 14 requirement)
- [PNPM](https://pnpm.io/) (the repository sets `packageManager` to pnpm 10 via Corepack)
- macOS, Linux, or Windows Subsystem for Linux; the metrics API relies on `/proc` and `/sys` data exposed by the host OS.

## Getting Started

```bash
git clone https://github.com/your-org/servermonitorminimalist.git
cd servermonitorminimalist

# Install dependencies (Corepack enables pnpm automatically)
pnpm install

# Start the development server on http://localhost:4325
pnpm dev
```

Navigate to `http://localhost:4325` and you should see the dashboard populate with the host machine’s metrics. The site polls `/api/metrics` every two seconds; leave the page open to watch the resource gauges update.

### Creating Shortcuts

1. Click **Add shortcut** in the Shortcuts panel.
2. Enter a title, the destination URL (protocol is optional; `https://` is added automatically), and pick an icon.
3. Save the shortcut. The entry is stored in `data/shortcuts.json` so it survives restarts.

Editing an existing shortcut reopens the dialog with the current values. Shortcuts open in a new tab using `window.open` and always use HTTPS unless you provide a different scheme.

## Production Build

```bash
# Compile the Next.js app
pnpm build

# Start the production server (also listens on port 4325)
pnpm start
```

The build step will emit warnings if optional native modules (e.g., `osx-temperature-sensor`) are unavailable; a webpack alias in `next.config.mjs` silences the missing dependency because it isn’t required for most platforms.

## Metrics Accuracy in Containers

The metrics endpoint samples the environment it runs in. When deployed inside a container, you will see the container’s CPU, memory, and disk usage unless you grant the container access to the host’s `/proc`, `/sys`, and device files or rely on an external exporter. For accurate host readings, either run the service directly on the host or expose those system paths to the container (with the associated security trade-offs).

## Project Structure

```
app/                # Next.js App Router pages & API routes
  api/metrics/      # Live metrics JSON endpoint
  api/shortcuts/    # CRUD endpoints backed by data/shortcuts.json
  page.tsx          # Dashboard UI + shortcuts dialog
components/         # Reusable UI pieces (cards, buttons, dialogs, etc.)
lib/                # Utility modules (metrics service, shortcut store)
data/               # Persistent shortcut JSON store (gitignored)
public/             # Static assets and fonts
```

## License

MIT license — see the source repository for details.
