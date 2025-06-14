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

    // AI Processing if enabled - Kiểm tra chi tiết hơn
    log(`🔍 Checking AI options: ${JSON.stringify(aiOptions)}`)

    if (aiOptions && aiOptions.useAI) {
      log(`📋 AI Options found:`)
      log(`  - templateType: ${aiOptions.templateType}`)
      log(`  - useAI: ${aiOptions.useAI}`)
      log(`  - apiKey: ${aiOptions.apiKey ? '***provided***' : 'not provided'}`)

      // Kiểm tra điều kiện AI processing
      const shouldProcessWithAI = aiOptions.useAI && aiOptions.templateType &&
        (aiOptions.templateType === 'exercise' || aiOptions.templateType === 'lesson' || aiOptions.templateType === 'raw')

      log(`🤖 Should process with AI: ${shouldProcessWithAI}`)

      if (shouldProcessWithAI) {
        log(`🤖 AI Processing ENABLED`)
        log(`🎯 Template: ${aiOptions.templateType}`)

        try {
          log(`🔄 Starting AI processing...`)
          log(`📊 Content structure:`)
          log(`  - Title: ${content.title}`)
          log(`  - Description length: ${content.description?.length || 0}`)
          log(`  - Methods count: ${content.methods?.length || 0}`)
          log(`  - Test cases count: ${content.testCases?.length || 0}`)

          const aiResult = await aiActions.processContent(content, aiOptions)
          log(`📊 AI Result: success=${aiResult.success}, processingTime=${aiResult.processingTime}ms`)

          if (aiResult.success && aiResult.data) {
            log(`✅ AI processing successful`)
            log(`📏 AI output length: ${aiResult.data.length} characters`)

            // Use AI-processed markdown as description
            finalContent = {
              ...content,
              description: aiResult.data, // AI-generated markdown
              aiEnhanced: true,
              aiTemplate: aiOptions.templateType,
              aiProcessingTime: aiResult.processingTime,
              originalDescription: content.description
            }

            log(`🎨 Final content prepared with AI enhancement`)
            log(`📝 Final description length: ${finalContent.description.length}`)
          } else {
            log(`⚠️ AI processing failed: ${aiResult.error}`)
            log(`📄 Using enhanced template as fallback`)

            // Use enhanced template fallback
            const fallbackResult = await aiActions.processContent(content, { ...aiOptions, useAI: false })
            if (fallbackResult.success && fallbackResult.data) {
              finalContent = {
                ...content,
                description: fallbackResult.data,
                aiEnhanced: false,
                templateEnhanced: true,
                aiTemplate: aiOptions.templateType
              }
            }
          }
        } catch (aiError) {
          log(`❌ AI processing error: ${aiError.message}`)
          log(`📄 Using enhanced template as fallback`)

          // Use enhanced template fallback
          try {
            const fallbackResult = await aiActions.processContent(content, { ...aiOptions, useAI: false })
            if (fallbackResult.success && fallbackResult.data) {
              finalContent = {
                ...content,
                description: fallbackResult.data,
                aiEnhanced: false,
                templateEnhanced: true,
                aiTemplate: aiOptions.templateType
              }
            }
          } catch (fallbackError) {
            log(`❌ Template fallback also failed: ${fallbackError.message}`)
          }
        }
      } else {
        log(`📝 AI Processing DISABLED - useAI is false or invalid template type`)
      }
    } else {
      log(`📝 AI Processing DISABLED - No AI options provided or useAI is false`)
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

// AI Handlers
ipcMain.handle('ai:processContent', async (event, content, options) => {
  try {
    const result = await aiActions.processContent(content, options)
    return result
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Lỗi xử lý AI không xác định'
    }
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

ipcMain.handle('ai:setApiKey', async (event, apiKey) => {
  try {
    aiActions.setApiKey(apiKey)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Lỗi cấu hình API key'
    }
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
