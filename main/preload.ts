import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

export const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: string, args: unknown[]) {
      ipcRenderer.send(channel, args)
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args)
      ipcRenderer.on(channel, subscription)

      return () => ipcRenderer.removeListener(channel, subscription)
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args))
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
