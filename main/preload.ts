import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
}

contextBridge.exposeInMainWorld('ipc', handler)

// Custom APIs for renderer
const electronAPI = {
  // Scraper APIs
  scraper: {
    initialize: () => ipcRenderer.invoke('scraper:initialize'),
    getTopics: (url: string) => ipcRenderer.invoke('scraper:getTopics', url),
    getProblemContent: (url: string) => ipcRenderer.invoke('scraper:getProblemContent', url),
    exportContent: (content: any, topicName: string, topicIndex?: number, problemIndex?: number, aiOptions?: any) =>
      ipcRenderer.invoke('scraper:exportContent', content, topicName, topicIndex, problemIndex, aiOptions),
    close: () => ipcRenderer.invoke('scraper:close')
  },

  // AI APIs
  ai: {
    processContent: (content: any, options: any) => ipcRenderer.invoke('ai:processContent', content, options),
    setApiKey: (apiKey: string) => ipcRenderer.invoke('ai:setApiKey', apiKey)
  },

  // App APIs
  app: {
    getProgrammingLanguages: () => ipcRenderer.invoke('app:getProgrammingLanguages')
  },

  // Version APIs
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}

export type IpcHandler = typeof handler
