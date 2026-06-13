const H5_ASSET_DIRECTORY = 'h5'
const H5_ENTRY = 'index.html'
const H5_ASSET_KEY_MARKER = 'mobile-h5-asset-key.txt'

type ExtractedH5ReuseOptions = {
  entryExists: boolean
  storedAssetKey: string | null
  bundledAssetKey: string | null
}

export function getH5ExtractDirectory(documentDirectory: string): string {
  return `${documentDirectory.replace(/\/$/, '')}/${H5_ASSET_DIRECTORY}`
}

export function getH5AssetKeyMarkerPath(h5Directory: string): string {
  return `${h5Directory.replace(/\/$/, '')}/${H5_ASSET_KEY_MARKER}`
}

export function getBundledH5AssetKey(asset: { hash?: string | null; uri?: string | null; localUri?: string | null }): string | null {
  return asset.hash ?? asset.uri ?? asset.localUri ?? null
}

export function shouldReuseExtractedH5({ entryExists, storedAssetKey, bundledAssetKey }: ExtractedH5ReuseOptions): boolean {
  return entryExists && Boolean(bundledAssetKey) && storedAssetKey === bundledAssetKey
}

export function normalizeServerUrl(url: string): string {
  return `${url.replace(/\/$/, '')}/${H5_ENTRY}`
}

export function toNativeFilePath(fileUri: string): string {
  return decodeURI(fileUri).replace(/^file:\/\//, '')
}

export const toStaticServerPath = toNativeFilePath
