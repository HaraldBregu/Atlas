# Atlas UI

Standalone React + TypeScript web app scaffold for Atlas.

## Commands

From the repository root:

```bash
npm run ui:dev
npm run ui:client
npm run ui:server
npm run ui:build
npm run ui:preview
```

`ui:dev` starts both the Vite client and the local settings API.

Or run the app directly from the `ui/` folder:

```bash
cd ui
npm install
npm run dev
```

Build the app with:

```bash
npm run build
```

To enable saving the API token into the root `settings/` folder, run the local
settings API from the repository root:

```bash
npm run ui:server
```
