import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { ContentScraper } from './helpers/scraper'
import { ensureDirectories, log } from './settings'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let scraper: ContentScraper | null = null

// IPC Handlers
ipcMain.handle('scraper:initialize', async () => {
  try {
    log('🚀 Initializing scraper from main process...')
    await ensureDirectories()
    scraper = new ContentScraper()
    await scraper.initialize()
    log('✅ Scraper initialized successfully')
    return { success: true }
  } catch (error) {
    log(`❌ Scraper initialization failed: ${error.message}`)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('scraper:getTopics', async (_, url: string) => {
  try {
    if (!scraper) throw new Error('Scraper not initialized')
    log(`📚 Getting topics from: ${url}`)
    const topics = await scraper.scrapeTopics(url)
    log(`✅ Retrieved ${topics.length} topics`)
    return { success: true, data: topics }
  } catch (error) {
    log(`❌ Failed to get topics: ${error.message}`)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('scraper:getProblemContent', async (_, url: string) => {
  try {
    if (!scraper) throw new Error('Scraper not initialized')
    log(`📄 Getting problem content from: ${url}`)
    const content = await scraper.scrapeProblemContent(url)
    if (content) {
      log(`✅ Retrieved content for: ${content.title}`)
    } else {
      log(`⚠️ No content found for: ${url}`)
    }
    return { success: true, data: content }
  } catch (error) {
    log(`❌ Failed to get problem content: ${error.message}`)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('scraper:exportContent', async (_, content: any, topicName: string, topicIndex?: number, problemIndex?: number) => {
  try {
    if (!scraper) throw new Error('Scraper not initialized')
    const topicNum = topicIndex !== undefined ? topicIndex + 1 : '?'
    const problemNum = problemIndex !== undefined ? problemIndex + 1 : '?'
    log(`💾 Exporting content: ${content.title} to topic: ${topicName} (Topic #${topicNum}, Problem #${problemNum})`)
    await scraper.exportToFile(content, topicName, topicIndex, problemIndex)
    log(`✅ Content exported successfully`)
    return { success: true }
  } catch (error) {
    log(`❌ Failed to export content: ${error.message}`)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('scraper:close', async () => {
  try {
    if (scraper) {
      log('🔒 Closing scraper...')
      await scraper.close()
      scraper = null
      log('✅ Scraper closed successfully')
    }
    return { success: true }
  } catch (error) {
    log(`❌ Failed to close scraper: ${error.message}`)
    return { success: false, error: error.message }
  }
})

  ; (async () => {
    await app.whenReady()

    log('🚀 Electron app ready, creating main window...')

    const mainWindow = createWindow('main', {
      width: 1400,
      height: 900,
      webPreferences: {
        preload: `${__dirname}/preload.js`,
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    if (isProd) {
      await mainWindow.loadURL('app://./home')
    } else {
      const port = process.argv[2]
      await mainWindow.loadURL(`http://localhost:${port}/home`)
      mainWindow.webContents.openDevTools()
    }

    log('✅ Main window created and loaded')
  })()

app.on('window-all-closed', () => {
  log('🔒 All windows closed, quitting app...')
  app.quit()
})

app.on('before-quit', async () => {
  log('🔒 App quitting, cleaning up...')
  if (scraper) {
    await scraper.close()
  }
})
