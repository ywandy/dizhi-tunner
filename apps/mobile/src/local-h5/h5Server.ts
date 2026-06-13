import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system/legacy'
import StaticServer from 'react-native-static-server'
import { unzip } from 'react-native-zip-archive'

import h5Archive from '../../assets/h5.zip'
import {
  getBundledH5AssetKey,
  getH5AssetKeyMarkerPath,
  getH5ExtractDirectory,
  normalizeServerUrl,
  shouldReuseExtractedH5,
  toNativeFilePath,
  toStaticServerPath,
} from './h5ServerHelpers'

type H5ServerHandle = {
  url: string
  stop: () => Promise<void>
}

const H5_ENTRY = 'index.html'

let activeServer: StaticServer | null = null
let activeServerUrl: string | null = null
let activeServerPromise: Promise<{ server: StaticServer; url: string }> | null = null

async function readStoredAssetKey(markerPath: string): Promise<string | null> {
  const markerInfo = await FileSystem.getInfoAsync(markerPath)
  if (!markerInfo.exists) {
    return null
  }

  return (await FileSystem.readAsStringAsync(markerPath)).trim() || null
}

async function ensureBundledH5Directory(): Promise<string> {
  if (!FileSystem.documentDirectory) {
    throw new Error('Document directory is unavailable')
  }

  const targetDirectory = getH5ExtractDirectory(FileSystem.documentDirectory)
  const entryPath = `${targetDirectory}/${H5_ENTRY}`
  const markerPath = getH5AssetKeyMarkerPath(targetDirectory)
  const asset = Asset.fromModule(h5Archive)
  const bundledAssetKey = getBundledH5AssetKey(asset)
  const entryInfo = await FileSystem.getInfoAsync(entryPath)
  const storedAssetKey = await readStoredAssetKey(markerPath)

  if (shouldReuseExtractedH5({ entryExists: entryInfo.exists, storedAssetKey, bundledAssetKey })) {
    return targetDirectory
  }

  await asset.downloadAsync()

  if (!asset.localUri) {
    throw new Error('Bundled H5 archive is unavailable. Run `pnpm mobile:pack` before starting the app.')
  }

  await FileSystem.deleteAsync(targetDirectory, { idempotent: true })
  await FileSystem.makeDirectoryAsync(targetDirectory, { intermediates: true })
  await unzip(toNativeFilePath(asset.localUri), toNativeFilePath(targetDirectory))

  const unpackedEntry = await FileSystem.getInfoAsync(`${targetDirectory}/${H5_ENTRY}`)
  if (!unpackedEntry.exists) {
    throw new Error('Bundled H5 archive does not contain index.html.')
  }

  if (bundledAssetKey) {
    await FileSystem.writeAsStringAsync(markerPath, `${bundledAssetKey}\n`)
  }

  return targetDirectory
}

async function getOrStartActiveServer(): Promise<{ server: StaticServer; url: string }> {
  if (activeServer && activeServerUrl) {
    return { server: activeServer, url: activeServerUrl }
  }

  if (!activeServerPromise) {
    activeServerPromise = (async () => {
      const h5Directory = await ensureBundledH5Directory()
      const server = new StaticServer(0, toStaticServerPath(h5Directory), { localOnly: true })
      const url = normalizeServerUrl(await server.start())
      activeServer = server
      activeServerUrl = url
      return { server, url }
    })()

    try {
      return await activeServerPromise
    } finally {
      activeServerPromise = null
    }
  }

  return activeServerPromise
}

export async function startH5Server(): Promise<H5ServerHandle> {
  const { url } = await getOrStartActiveServer()

  return {
    url,
    async stop() {
      // NativeTabs hosts separate WebViews. Keeping the local server alive avoids
      // invalidating a sibling tab's localhost URL during tab transitions.
    },
  }
}
