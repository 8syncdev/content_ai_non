import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

export type IpcRendererChannel =
  | 'toggle-dark-mode'
  | 'get-settings'
  | 'set-settings'
  | 'get-progress'
  | 'start-process'
  | 'stop-process'
  | 'ai-content:start'
  | 'ai-content:progress'
  | 'ai-content:done'
  | 'ai-content:initialize'
  | 'ai-content:close'

export const electronHandler = {
  ipcRenderer: {
    send: (channel: IpcRendererChannel, ...args: unknown[]) => {
      ipcRenderer.send(channel, ...args)
    },
    on: (channel: IpcRendererChannel, listener: (...args: unknown[]) => void) => {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        listener(...args)
      ipcRenderer.on(channel, subscription)

      return () => ipcRenderer.removeListener(channel, subscription)
    },
    invoke: (channel: IpcRendererChannel, ...args: unknown[]) => {
      return ipcRenderer.invoke(channel, ...args)
    },
  },
  scraper: {
    initialize: () => ipcRenderer.invoke('scraper:initialize'),
    getTopics: (url: string) => ipcRenderer.invoke('scraper:getTopics', url),
    getProblemContent: (url: string) => ipcRenderer.invoke('scraper:getProblemContent', url),
    exportContent: (content: any, topicName: string, topicIndex?: number, problemIndex?: number, aiOptions?: any) =>
      ipcRenderer.invoke('scraper:exportContent', content, topicName, topicIndex, problemIndex, aiOptions),
    close: () => ipcRenderer.invoke('scraper:close'),
  },
  aiContent: {
    initialize: () => ipcRenderer.invoke('ai-content:initialize'),
    start: (options: { source: string; tag?: string; articleCount: number; template: string }) =>
      ipcRenderer.invoke('ai-content:start', options),
    close: () => ipcRenderer.invoke('ai-content:close'),
  },
  ai: {
    processContent: (content: any, options: any) => ipcRenderer.invoke('ai:processContent', content, options),
    setApiKey: (apiKey: string) => ipcRenderer.invoke('ai:setApiKey', apiKey),
  },
  browser: {
    check: () => ipcRenderer.invoke('browser:check'),
    install: () => ipcRenderer.invoke('browser:install'),
    checkAndInstall: () => ipcRenderer.invoke('browser:checkAndInstall'),
  },
  app: {
    getProgrammingLanguages: () => ipcRenderer.invoke('app:getProgrammingLanguages'),
  },
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  },
}

contextBridge.exposeInMainWorld('electron', electronHandler)

export type ElectronHandler = typeof electronHandler
