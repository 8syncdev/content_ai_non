import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { ContentScraper } from './helpers/scraper'
import { ensureDirectories, log } from './settings'
import { aiActions } from './helpers/ai/actions/chat-ai.actions'

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

ipcMain.handle('scraper:exportContent', async (_, content: any, topicName: string, topicIndex?: number, problemIndex?: number, aiOptions?: any) => {
  try {
    if (!scraper) throw new Error('Scraper not initialized')
    const topicNum = topicIndex !== undefined ? topicIndex + 1 : '?'
    const problemNum = problemIndex !== undefined ? problemIndex + 1 : '?'
    log(`💾 Exporting content: ${content.title} to topic: ${topicName} (Topic #${topicNum}, Problem #${problemNum})`)

    let finalContent = content

    // AI Processing if enabled
    if (aiOptions && aiOptions.templateType && aiOptions.templateType !== 'raw') {
      log(`🤖 AI Processing ENABLED`)
      log(`📋 AI Options received: ${JSON.stringify(aiOptions)}`)
      log(`🎯 Template: ${aiOptions.templateType}, Policy: ${aiOptions.policy}`)

      try {
        log(`🔄 Starting AI processing...`)
        const aiResult = await aiActions.processContent(content, aiOptions)
        log(`📊 AI Result: success=${aiResult.success}, processingTime=${aiResult.processingTime}ms`)

        if (aiResult.success && aiResult.data) {
          log(`✅ AI processing successful`)
          log(`📏 AI output length: ${aiResult.data.length} characters`)
          log(`🏷️ AI metadata: ${JSON.stringify(aiResult.metadata)}`)

          // Use AI-processed markdown as description
          finalContent = {
            ...content,
            title: aiResult.metadata?.title || content.title,
            description: aiResult.data, // AI-generated markdown
            aiEnhanced: true,
            aiTemplate: aiOptions.templateType,
            aiProcessingTime: aiResult.processingTime,
            originalDescription: content.description
          }

          log(`🎨 Final content prepared with AI enhancement`)
        } else {
          log(`⚠️ AI processing failed: ${aiResult.error}`)
          log(`📄 Using original content as fallback`)
        }
      } catch (aiError) {
        log(`❌ AI processing error: ${aiError.message}`)
        log(`📄 Using original content as fallback`)
      }
    } else {
      log(`📝 AI Processing DISABLED or invalid options`)
      if (aiOptions) {
        log(`🔍 AI Options: ${JSON.stringify(aiOptions)}`)
      }
    }

    log(`💾 Exporting final content...`)
    await scraper.exportToFile(finalContent, topicName, topicIndex, problemIndex)
    log(`✅ Content exported successfully`)
    return { success: true }
  } catch (error) {
    log(`❌ Failed to export content: ${error.message}`)
    return { success: false, error: error.message }
  }
})

// AI-specific handlers
ipcMain.handle('ai:processContent', async (_, content: any, options: any) => {
  try {
    log(`🤖 Processing content with AI: ${content.title}`)
    const result = await aiActions.processContent(content, options)
    log(`✅ AI processing completed in ${result.processingTime}ms`)
    return result
  } catch (error) {
    log(`❌ AI processing failed: ${error.message}`)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ai:processContentStream', async (_, content: any, options: any) => {
  try {
    log(`🤖 Processing content with AI stream: ${content.title}`)
    const result = await aiActions.processContentStream(content, options)
    log(`✅ AI stream processing initiated`)
    return result
  } catch (error) {
    log(`❌ AI stream processing failed: ${error.message}`)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ai:updateConfig', async (_, config: any) => {
  try {
    aiActions.updateConfig(config)
    log(`🔧 AI config updated`)
    return { success: true }
  } catch (error) {
    log(`❌ Failed to update AI config: ${error.message}`)
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
