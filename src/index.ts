import type { AliasOptions, Plugin } from 'vite'
import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'

const LUCKY_ENV = process.env['LUCKY_ENV'] || 'development'
const LUCKY_ROOT = process.cwd()

export default (
  { configPath = 'config/lucky_vite.json' } = {} as PluginConfig
): Plugin => {
  const config = loadConfig(configPath)
  const root = join(LUCKY_ROOT, config.root, config.entry)

  return {
    name: 'vite-plugin-lucky',

    config() {
      return {
        root: root,

        resolve: {
          alias: resolveAliases(config.aliases)
        },

        server: configureServer(config),

        build: {
          outDir: resolve(LUCKY_ROOT, config.outDir),
          sourcemap: LUCKY_ENV === 'production',
          emptyOutDir: true,
          manifest: true,

          rollupOptions: {
            input: findEntryScripts(root),

            output: {
              entryFileNames: formatAssetFilePath('js', '.js'),
              chunkFileNames: formatAssetFilePath('js', '.js'),
              assetFileNames: determineAssetFilePath
            }
          }
        }
      }
    }
  }
}

/**
 * Loads and parses the Lucky Vite config file.
 *
 * @param configPath - Path to the config file
 * @returns The parsed config
 */
function loadConfig(
  configPath: string
): LuckyViteConfig {
  return Object.assign({
    outDir: 'public/assets',
    entry: 'entry',
    host: '127.0.0.1',
    port: 3010,
    root: 'src/js'
  }, JSON.parse(readFileSync(configPath, {encoding: 'utf8', flag: 'r'})))
}

/**
 * Resolves alias map to a Vite alias mapping.
 *
 * @param [aliasMap={}] - The lucky vite alias map
 * @returns The Vite alias mapping
 */
function resolveAliases(
  aliasMap: AliasMap = {}
): AliasOptions {
  return Object.entries(aliasMap).map(alias => ({
    find: alias[0], replacement: resolve(LUCKY_ROOT, alias[1])
  }))
}

/**
 * Generates the server host configuration.
 *
 * @param config - The main config object
 * @returns The server configuration
 */
function configureServer(
  {
    https = false,
    host,
    port ,
    origin
  }: LuckyViteConfig
): object {
  if (typeof host === 'boolean') host = '0.0.0.0'
  const uri = new URL(origin ||= `http${https ? 's' : ''}://${host}:${port}`)
  return {
    origin,
    host: uri.hostname,
    port: uri.port,
    https: uri.protocol === 'https:'
  }
}

/**
 * Scans the entry directory for entry scripts.
 *
 * @param root - The entry root dir
 * @returns A list of entry scripts
 */
function findEntryScripts(
  root: string
): string[] {
  return readdirSync(resolve(root)).map(entry => resolve(join(root, entry)))
}

/**
 * Determines the file path of an asset based on its extension.
 *
 * @param {name} - Object with a name property
 * @returns The asset file path
 */
function determineAssetFilePath(
  {  name = '' }: PreRenderedAsset
): string {
  if (/\.(gif|jpe?g|png|svg)$/.test(name))
    return formatAssetFilePath('images')
  if (/\.css$/.test(name))
    return formatAssetFilePath('css')
  if (/\.woff2?$/.test(name))
    return formatAssetFilePath('fonts')
  return formatAssetFilePath()
}

/**
 * Formats an asset path.
 *
 * @param [dir] - The target dir
 * @param [ext=[extname]] - The extension
 * @returns The asset's formatted file path
 */
function formatAssetFilePath(
  dir?: string,
  ext: string = '[extname]'
): string {
  const name = `[name].[hash]${ext}`
  return dir ? `${dir}/${name}` : name
}


export type AliasMap = { [key: string]: string }

export interface PreRenderedAsset   {
  name: string | undefined
  source: string | Uint8Array
  type: 'asset'
}

export interface PluginConfig {
  /**
   * Where to find the shared config file for Lucky and Vite.
   *
   * @default config/lucky_vite.json
   */
  configPath?: string
}

export interface LuckyViteConfig {
  /**
   * An object mapping aliases to directories relative to Lucky's root.
   */
  aliases?: AliasMap,

  /**
   * Directory withing the JavaScript root dir containing the entry scripts.
   *
   * @default entry
   */
  entry: string,

  /**
   * Host for the vite server.
   *
   * @default localhost
   */
  host?: string,

  /**
   * Use https or not.
   *
   * @default false
   */
  https?: boolean,

  /**
   * Full uri of the vite server (alternative to `host` and `port`)
   */
  origin?: string,

  /**
   * The output directory for the manifest and packaged files.
   *
   * @default public/assets
   */
  outDir: string,

  /**
   * Port for the vite server.
   *
   * @default 3010
   */
  port?: number | string,

  /**
   * The JavaScript root dir of the project.
   *
   * @default src/js
   */
  root: string
}
