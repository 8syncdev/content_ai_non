import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { ContentScraper } from './helpers/scraper'
import { AiContentGenerator } from './helpers/aiContentGenerator'
import { ensureDirectories, log, checkBrowserExists, getBrowserExecutablePath } from './settings'
import { aiActions } from './helpers/ai/actions/chat-ai.actions'
import { PROGRAMMING_LANGUAGES } from './helpers/ai/info-const'
import { execSync } from 'child_process'
import * as fs from 'fs-extra'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let scraper: ContentScraper | null = null
let aiContentGenerator: AiContentGenerator | null = null
let mainWindow: BrowserWindow | null = null

// Browser Management Functions
async function downloadBrowser(): Promise<{ success: boolean; error?: string }> {
  try {
    log('📦 Starting browser download...')

    // Ensure browser directory exists
    const browserDir = path.join(process.cwd(), 'temp', 'browser')
    await fs.ensureDir(browserDir)

    // Set environment variable for custom browser location
    process.env.PLAYWRIGHT_BROWSERS_PATH = browserDir

    log(`📁 Browser installation directory: ${browserDir}`)

    // Install chromium browser
    execSync('npx playwright install chromium', {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browserDir }
    })

    log('✅ Browser installation completed successfully!')
    return { success: true }
  } catch (error) {
    log(`❌ Browser installation failed: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function checkAndInstallBrowser(): Promise<{ success: boolean; browserExists: boolean; error?: string }> {
  try {
    log('🔍 Checking browser availability...')

    const browserExists = await checkBrowserExists()

    if (browserExists) {
      log('✅ Browser found and ready')
      return { success: true, browserExists: true }
    }

    log('⚠️ Browser not found, starting auto-installation...')
    const installResult = await downloadBrowser()

    if (installResult.success) {
      // Verify installation
      const verifyExists = await checkBrowserExists()
      if (verifyExists) {
        log('✅ Browser installed and verified successfully')
        return { success: true, browserExists: true }
      } else {
        log('❌ Browser installation verification failed')
        return { success: false, browserExists: false, error: 'Installation verification failed' }
      }
    } else {
      return { success: false, browserExists: false, error: installResult.error }
    }
  } catch (error) {
    log(`❌ Browser check/install failed: ${error.message}`)
    return { success: false, browserExists: false, error: error.message }
  }
}

// Browser IPC Handlers
ipcMain.handle('browser:check', async () => {
  try {
    const browserExists = await checkBrowserExists()
    const executablePath = getBrowserExecutablePath()

    return {
      success: true,
      data: {
        browserExists,
        executablePath,
        browserDir: path.join(process.cwd(), 'temp', 'browser')
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('browser:install', async () => {
  try {
    const result = await downloadBrowser()
    return result
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('browser:checkAndInstall', async () => {
  try {
    const result = await checkAndInstallBrowser()
    return result
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// IPC Handlers
ipcMain.handle('scraper:initialize', async () => {
  try {
    log('🚀 Initializing scraper from main process...')

    // Auto-check and install browser if needed
    const browserResult = await checkAndInstallBrowser()
    if (!browserResult.success || !browserResult.browserExists) {
      throw new Error(`Browser not available: ${browserResult.error}`)
    }

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
        (aiOptions.templateType === 'exercise' || aiOptions.templateType === 'lesson' || aiOptions.templateType === 'translate' || aiOptions.templateType === 'raw')

      log(`🤖 Should process with AI: ${shouldProcessWithAI}`)

      if (shouldProcessWithAI) {
        log(`🤖 AI Processing ENABLED`)
        log(`🎯 Template: ${aiOptions.templateType}`)

        try {
          log(`🔄 Starting AI processing...`)
          log(`📊 Content structure:`)
          log(`  - Title: ${content.title}`)
          log(`  - Content length: ${content.content?.length || 0}`)

          const aiResult = await aiActions.processContent(content, aiOptions)
          log(`📊 AI Result: success=${aiResult.success}, processingTime=${aiResult.processingTime}ms`)

          if (aiResult.success && aiResult.data) {
            log(`✅ AI processing successful`)
            log(`📏 AI output length: ${aiResult.data.length} characters`)

            // Use AI-processed markdown as aiProcessedContent
            finalContent = {
              ...content,
              aiProcessedContent: aiResult.data, // AI-generated markdown
              aiEnhanced: true,
              aiTemplate: aiOptions.templateType,
              aiProcessingTime: aiResult.processingTime,
              originalContent: content.content
            }

            log(`🎨 Final content prepared with AI enhancement`)
            log(`📝 Final AI content length: ${finalContent.aiProcessedContent.length}`)
          } else {
            log(`⚠️ AI processing failed: ${aiResult.error}`)
            log(`📄 Using simple template as fallback`)

            // Use simple template fallback
            const fallbackResult = await aiActions.processContent(content, { ...aiOptions, useAI: false })
            if (fallbackResult.success && fallbackResult.data) {
              finalContent = {
                ...content,
                aiProcessedContent: fallbackResult.data,
                aiEnhanced: false,
                templateEnhanced: true,
                aiTemplate: aiOptions.templateType
              }
            }
          }
        } catch (aiError) {
          log(`❌ AI processing error: ${aiError.message}`)
          log(`📄 Using simple template as fallback`)

          // Use simple template fallback
          try {
            const fallbackResult = await aiActions.processContent(content, { ...aiOptions, useAI: false })
            if (fallbackResult.success && fallbackResult.data) {
              finalContent = {
                ...content,
                aiProcessedContent: fallbackResult.data,
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
    return { success: false, error: error.message }
  }
})

// Programming languages handler
ipcMain.handle('app:getProgrammingLanguages', async () => {
  try {
    return { success: true, data: PROGRAMMING_LANGUAGES }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// AI Content Generator IPC Handlers
ipcMain.handle('ai-content:initialize', async () => {
  try {
    log('🚀 Initializing AI Content Generator...')

    // Auto-check and install browser if needed
    const browserResult = await checkAndInstallBrowser()
    if (!browserResult.success || !browserResult.browserExists) {
      throw new Error(`Browser not available: ${browserResult.error}`)
    }

    await ensureDirectories()
    aiContentGenerator = new AiContentGenerator(mainWindow)
    await aiContentGenerator.initialize()
    log('✅ AI Content Generator initialized successfully')
    return { success: true }
  } catch (error) {
    log(`❌ AI Content Generator initialization failed: ${error.message}`)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ai-content:close', async () => {
  try {
    if (aiContentGenerator) {
      log('🔒 Closing AI Content Generator...')
      await aiContentGenerator.close()
      aiContentGenerator = null
      log('✅ AI Content Generator closed successfully')
    }
    return { success: true }
  } catch (error) {
    log(`❌ Failed to close AI Content Generator: ${error.message}`)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ai-content:start', async (_, options) => {
  try {
    log('🚀 Starting AI Content Generation...')

    // Check if AI Content Generator is initialized
    if (!aiContentGenerator) {
      throw new Error('AI Content Generator chưa được khởi tạo. Vui lòng khởi tạo trước khi sử dụng.')
    }

    // Start content generation process
    await aiContentGenerator.generateContent(options)

    // Send completion signal
    if (mainWindow) {
      mainWindow.webContents.send('ai-content:done', '🎉 AI Content Generation completed!')
    }

    log('✅ AI Content Generation completed successfully')
    return { success: true }
  } catch (error) {
    log(`❌ AI Content Generation failed: ${error.message}`)
    if (mainWindow) {
      mainWindow.webContents.send('ai-content:done', `❌ Error: ${error.message}`)
    }
    return { success: false, error: error.message }
  }
})

  ; (async () => {
    await app.whenReady()
    mainWindow = createWindow('main', {
      width: 1000,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    })

    if (isProd) {
      await mainWindow.loadURL('app://./home')
    } else {
      const port = process.argv[2]
      await mainWindow.loadURL(`http://localhost:${port}/home`)
      // mainWindow.webContents.openDevTools()
    }
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
