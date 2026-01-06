# vue-kavia

This template should help get you started developing with Vue 3 in Vite.

## Tic Tac Toe Stats (local persistence)

This app includes a simple **Statistics** dashboard (total games, wins, draws, rates).

- Stats are persisted to `localStorage` under the key `ttt_stats_v1` (access is guarded with `try/catch` so the game still runs even if storage is unavailable).
- Stats automatically update **once per finished game** (win or draw).
- **Reset Statistics** clears the counters and removes the `localStorage` entry **without resetting the current board**.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
