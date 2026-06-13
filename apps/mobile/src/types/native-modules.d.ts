declare module 'react-native-static-server' {
  export default class StaticServer {
    constructor(port: number, root: string, options?: { localOnly?: boolean; keepAlive?: boolean })
    start(): Promise<string>
    stop(): Promise<void>
  }
}

declare module 'react-native-zip-archive' {
  export function unzip(source: string, target: string): Promise<string>
}

declare module '*.zip' {
  const asset: number
  export default asset
}
