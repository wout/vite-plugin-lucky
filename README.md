# Vite Plugin Lucky

A plugin to make [Vite](https://github.com/vitejs/vite) play nice with [Lucky Framework](https://github.com/luckyframework/lucky).

## Introduction

This plugin was developed to integrate Vite with Lucky as seamlessly as possible. It respects the folder structure of Lucky and comes with defaults that align with Lucky's. It's meant to be used with the [lucky_vite](https://github.com/wout/lucky_vite) Crystal shard.

## Usage

Install the plugin using your favourite package manager:

```bash
# using npm
$ npm install --save-dev vite-plugin-lucky

# using yarn
$ yarn add --dev vite-plugin-lucky

# using pnpm
$ pnpm add --save-dev vite-plugin-lucky
```

Then initialize the plugin in the `vite.config.js`:

```js
import { defineConfig } from 'vite'
import LuckyPlugin from 'vite-plugin-lucky'

export default defineConfig({
  plugins: [
    LuckyPlugin()
  ]
})
```

**Note**: The [lucky_vite](https://github.com/wout/lucky_vite) shard will generate this file for you.

In case you have the shared `lucky_vite.json` config in another directory, the new path can be passed as the `configPath` property:

```js
LuckyPlugin({
  configPath: 'path/to/lucky_vite.json'
})
```
