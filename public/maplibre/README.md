# public/maplibre

`maplibre-gl-worker.mjs` + `maplibre-gl-shared.mjs`, copied verbatim from
`node_modules/maplibre-gl/dist/`.

**Why these are duplicated here instead of just importing from the
package:** Next.js 16's default bundler (Turbopack) doesn't correctly
resolve maplibre-gl's internal Web Worker module (the file that does
off-main-thread vector tile parsing) when it's left to load it the normal
bundler-relative way — the map silently never fires `load`/`idle` and no
tiles ever render, with no thrown error. Serving the worker (and the
sibling chunk it imports) as plain static files and pointing
`setWorkerUrl()` at them (see `src/components/map/MapCanvas.tsx`)
sidesteps bundler worker resolution entirely.

**Keep in sync with the installed maplibre-gl version.** After bumping
`maplibre-gl` in package.json, re-copy both files:

```bash
cp node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs public/maplibre/
cp node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs public/maplibre/
```

A version mismatch between the app bundle's maplibre-gl and this worker
file can cause subtle protocol/message-format errors between the main
thread and the worker.
