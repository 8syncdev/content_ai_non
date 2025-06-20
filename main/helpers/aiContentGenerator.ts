import { BrowserWindow } from 'electron'
import { chromium, Browser, Page } from 'playwright'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as cheerio from 'cheerio'
import { log, getBrowserExecutablePath, checkBrowserExists, ensureDirectories, AI_CONTENT_DIR } from '../settings'
import { ChatAIActions } from './ai/actions/chat-ai.actions'
import { DEFAULT_AI_CONFIG } from './ai/info-const'

// Helper function to send progress updates to the renderer process
const sendProgress = (win: BrowserWindow | null, message: string) => {
    if (win) {
        log(`[ai-content-generator] ${message}`)
        win.webContents.send('ai-content:progress', message)
    }
}

// Real AI content generation using Mistral AI
async function generateContentFromAI(articleText: string, template: string, title: string, apiKey?: string): Promise<string> {
    log('Calling Mistral AI for content generation')

    try {
        // Use provided API key or default one
        const effectiveApiKey = apiKey || DEFAULT_AI_CONFIG.apiKey

        if (!effectiveApiKey) {
            throw new Error('API key không được cung cấp')
        }

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${effectiveApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: DEFAULT_AI_CONFIG.model,
                messages: [
                    {
                        role: 'user',
                        content: `${template}\n\n=== BÀI VIẾT GỐC ===\nTiêu đề: ${title}\n\nNội dung:\n${articleText}`
                    }
                ],
                max_tokens: DEFAULT_AI_CONFIG.maxTokens,
                temperature: DEFAULT_AI_CONFIG.temperature
            })
        })

        if (!response.ok) {
            const errorData = await response.text()
            throw new Error(`Mistral API error: ${response.status} ${response.statusText} - ${errorData}`)
        }

        const data = await response.json()

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response from Mistral AI')
        }

        const aiContent = data.choices[0].message.content

        // Add metadata footer
        const finalContent = `${aiContent}

---

**Thông tin bài viết:**
- Tiêu đề gốc: ${title}
- Được tạo bởi: AI Content Generator
- Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}
- API: Mistral AI (${DEFAULT_AI_CONFIG.model})

**Lưu ý:** Nội dung được tạo tự động bởi AI. Vui lòng xem xét và chỉnh sửa cho phù hợp với thương hiệu của bạn.`

        return finalContent

    } catch (error) {
        log(`❌ AI generation error: ${error.message}`)

        // Fallback to simple template
        const fallbackContent = `# ${title}

## Nội dung

${template}

### Bài viết gốc

${articleText.substring(0, 1000)}${articleText.length > 1000 ? '...' : ''}

---

**Lưu ý:** Đã xảy ra lỗi khi tạo nội dung AI: ${error.message}. Đây là nội dung fallback được tạo tự động.

**Ngày tạo:** ${new Date().toLocaleDateString('vi-VN')}`

        return fallbackContent
    }
}

export interface AiContentOptions {
    source: 'upvoted' | 'discussed' | 'latest' | 'tags'
    tag?: string
    articleCount: number
    template: string
    apiKey?: string
}

export class AiContentGenerator {
    private browser: Browser | null = null
    private page: Page | null = null
    private mainWindow: BrowserWindow | null = null

    constructor(mainWindow: BrowserWindow | null = null) {
        this.mainWindow = mainWindow
    }

    async initialize(): Promise<void> {
        try {
            sendProgress(this.mainWindow, '🔧 Khởi tạo AI Content Generator...')

            // Ensure directories exist
            await ensureDirectories()

            // Note: Browser check and installation is handled by background.ts
            // before this method is called

            // Launch browser
            const executablePath = getBrowserExecutablePath()
            sendProgress(this.mainWindow, `🔍 Sử dụng browser tại: ${executablePath}`)

            this.browser = await chromium.launch({
                headless: true,
                executablePath,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            })

            const context = await this.browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })

            this.page = await context.newPage()
            this.page.setDefaultTimeout(30000)

            sendProgress(this.mainWindow, '✅ AI Content Generator đã sẵn sàng')
        } catch (error) {
            sendProgress(this.mainWindow, `❌ Lỗi khởi tạo: ${error.message}`)
            throw error
        }
    }

    async generateContent(options: AiContentOptions): Promise<void> {
        if (!this.page) {
            throw new Error('Generator chưa được khởi tạo')
        }

        const { source, tag, articleCount, template, apiKey } = options

        try {
            // 1. Navigate to the source page
            let url: string
            if (source === 'tags') {
                if (!tag) throw new Error('Tag is required for source "tags"')
                url = `https://app.daily.dev/tags/${tag}`
                sendProgress(this.mainWindow, `🏷️ Đang truy cập tag: ${tag}`)
            } else {
                const sourceMap = {
                    upvoted: 'upvoted',
                    discussed: 'discussed',
                    latest: 'latest'
                }
                url = `https://app.daily.dev/posts/${sourceMap[source]}`
                sendProgress(this.mainWindow, `📰 Đang truy cập: ${source}`)
            }

            await this.page.goto(url, { waitUntil: 'networkidle' })
            await this.delay(3000)

            // 2. Collect article links and images by scrolling
            sendProgress(this.mainWindow, `🔍 Bắt đầu thu thập ${articleCount} bài viết...`)
            const articlesData = new Map<string, { url: string; imageUrl: string }>()

            while (articlesData.size < articleCount) {
                // Get current articles on page using cheerio (like scraper.ts)
                const pageContent = await this.page.content()
                const $ = cheerio.load(pageContent)

                // Look for articles in the grid - collect both links and images
                $('article').each((index, element) => {
                    const $article = $(element)

                    // Get article link
                    const linkEl = $article.find('a[href*="/posts/"]').first()
                    if (linkEl.length === 0) return

                    const href = linkEl.attr('href')
                    if (!href || !href.includes('/posts/')) return

                    // Convert relative URLs to absolute URLs
                    const fullUrl = href.startsWith('http') ? href : `https://app.daily.dev${href}`

                    // Get image from the article (based on prompt specification)
                    let imageUrl = ''

                    // Priority 1: Look for images with the specific class first
                    const specificImages = $article.find('img.w-full.my-2.rounded-12.h-40.object-cover')
                    if (specificImages.length > 0) {
                        imageUrl = $(specificImages[0]).attr('src') || ''
                        // Debug: log if multiple images with specific class found
                        if (specificImages.length > 1 && articlesData.size <= 3) {
                            sendProgress(this.mainWindow, `    📊 Found ${specificImages.length} specific class images, using first one`)
                        }
                    } else {
                        // Priority 2: Get the first img in article (DOM order - closest to opening <article> tag)
                        const articleImages = $article.find('img')
                        if (articleImages.length > 0) {
                            imageUrl = $(articleImages[0]).attr('src') || ''
                            // Debug: log image selection for first few articles
                            if (articlesData.size <= 3) {
                                sendProgress(this.mainWindow, `    📊 Found ${articleImages.length} images in article, using first one (DOM order)`)
                            }
                        }
                    }

                    // Only add if we don't have this URL yet
                    if (!articlesData.has(fullUrl)) {
                        articlesData.set(fullUrl, { url: fullUrl, imageUrl })

                        // Debug log first few URLs
                        if (articlesData.size <= 3) {
                            sendProgress(this.mainWindow, `🔗 Found article: ${fullUrl}`)
                            if (imageUrl) {
                                sendProgress(this.mainWindow, `  🖼️ With image: ${imageUrl.substring(0, 80)}...`)
                            }
                        }
                    }
                })

                sendProgress(this.mainWindow, `📄 Đã tìm thấy ${articlesData.size}/${articleCount} bài viết`)

                if (articlesData.size >= articleCount) break

                // Scroll to load more content
                await this.page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight)
                })
                await this.delay(2000)
            }

            // 3. Process each article
            const articlesToProcess = Array.from(articlesData.values()).slice(0, articleCount)
            sendProgress(this.mainWindow, `🚀 Bắt đầu xử lý ${articlesToProcess.length} bài viết`)

            for (let i = 0; i < articlesToProcess.length; i++) {
                const articleInfo = articlesToProcess[i]
                const articleUrl = articleInfo.url
                const preloadedImageUrl = articleInfo.imageUrl

                try {
                    sendProgress(this.mainWindow, `[${i + 1}/${articlesToProcess.length}] Đang xử lý: ${articleUrl}`)

                    // Validate URL before navigation
                    if (!articleUrl.startsWith('https://app.daily.dev/posts/')) {
                        sendProgress(this.mainWindow, `  ⚠️ Invalid URL format, skipping: ${articleUrl}`)
                        continue
                    }

                    // Navigate to article
                    await this.page.goto(articleUrl, { waitUntil: 'networkidle' })
                    await this.delay(2000)

                    // Extract article data using cheerio (like scraper.ts)
                    const pageContent = await this.page.content()
                    const $ = cheerio.load(pageContent)

                    // Extract title
                    let title = 'Untitled'
                    const titleEl = $('h1').first()
                    if (titleEl.length > 0) {
                        title = titleEl.text().trim()
                    } else {
                        const testTitleEl = $('[data-testid="post-title"]').first()
                        if (testTitleEl.length > 0) {
                            title = testTitleEl.text().trim()
                        }
                    }

                    // Use preloaded image URL from list page, fallback to detail page if needed
                    let imageUrl = preloadedImageUrl
                    if (!imageUrl) {
                        // Priority 1: Look for images with the specific class first
                        const specificImages = $('img.w-full.my-2.rounded-12.h-40.object-cover')
                        if (specificImages.length > 0) {
                            imageUrl = $(specificImages[0]).attr('src') || ''
                            sendProgress(this.mainWindow, `  🖼️ Found image in detail page with specific class: ${imageUrl.substring(0, 80)}...`)
                        } else {
                            // Priority 2: Get the first img in article (DOM order)
                            const articleImages = $('article img')
                            if (articleImages.length > 0) {
                                imageUrl = $(articleImages[0]).attr('src') || ''
                                sendProgress(this.mainWindow, `  🖼️ Found first image in article: ${imageUrl.substring(0, 80)}...`)
                            } else {
                                // Priority 3: Any img on the page
                                const anyImages = $('img')
                                if (anyImages.length > 0) {
                                    imageUrl = $(anyImages[0]).attr('src') || ''
                                    sendProgress(this.mainWindow, `  🖼️ Found fallback image: ${imageUrl.substring(0, 80)}...`)
                                } else {
                                    sendProgress(this.mainWindow, `  ⚠️ No image found`)
                                }
                            }
                        }
                    } else {
                        sendProgress(this.mainWindow, `  🖼️ Using preloaded image from list: ${imageUrl.substring(0, 80)}...`)
                    }

                    // Extract content from specified selectors
                    let content = ''
                    const contentSelectors = [
                        'div.relative.flex.min-w-0.flex-1.flex-col.px-4.laptop\\:px-8.laptop\\:pt-8',
                        'main.relative.laptop\\:pt-8.flex.flex-col.flex-1.px-4.laptop\\:px-8',
                        '[data-testid="post-content"]',
                        '.post-content',
                        'article'
                    ]

                    for (let i = 0; i < contentSelectors.length; i++) {
                        const selector = contentSelectors[i]
                        const contentEl = $(selector).first()
                        if (contentEl.length > 0) {
                            content = contentEl.text().trim()
                            if (content.length > 100) break
                        }
                    }

                    const articleData = { title, imageUrl, content }

                    if (!articleData.content || articleData.content.length < 100) {
                        sendProgress(this.mainWindow, `  ⚠️ Không tìm thấy nội dung đủ dài, bỏ qua`)
                        continue
                    }

                    // 4. Generate AI content
                    sendProgress(this.mainWindow, `  🤖 Đang tạo content AI...`)
                    const aiContent = await generateContentFromAI(
                        articleData.content,
                        template,
                        articleData.title,
                        apiKey
                    )

                    // 5. Save to file system
                    const slug = this.extractSlugFromUrl(articleUrl)
                    sendProgress(this.mainWindow, `  📂 Creating folder: ${slug}`)
                    const outputDir = path.join(AI_CONTENT_DIR, slug)
                    await fs.ensureDir(outputDir)

                    // Save markdown content
                    await fs.writeFile(path.join(outputDir, 'content.md'), aiContent, 'utf-8')
                    sendProgress(this.mainWindow, `  💾 Đã lưu content.md`)

                    // Download and save image if available
                    if (articleData.imageUrl) {
                        try {
                            const imageExtension = this.getImageExtension(articleData.imageUrl)
                            const imageName = `image${imageExtension}`
                            const imagePath = path.join(outputDir, imageName)
                            const success = await this.downloadImageWithPlaywright(articleData.imageUrl, imagePath)
                            if (success) {
                                sendProgress(this.mainWindow, `  🖼️ Đã tải ảnh: ${imageName}`)
                            }
                        } catch (imageError) {
                            sendProgress(this.mainWindow, `  ⚠️ Không thể tải ảnh: ${imageError.message}`)
                        }
                    }

                    sendProgress(this.mainWindow, `  ✅ Hoàn thành: ${articleData.title}`)

                } catch (error) {
                    sendProgress(this.mainWindow, `  ❌ Lỗi xử lý ${articleUrl}: ${error.message}`)
                }

                // Delay between articles
                await this.delay(1500)
            }

            sendProgress(this.mainWindow, `🎉 Hoàn thành tạo ${articlesToProcess.length} content AI!`)
            sendProgress(this.mainWindow, `📁 Kết quả được lưu tại: ${AI_CONTENT_DIR}`)

        } catch (error) {
            sendProgress(this.mainWindow, `❌ Lỗi tổng quát: ${error.message}`)
            throw error
        }
    }

    private extractSlugFromUrl(url: string): string {
        try {
            // Handle both full URLs and relative paths
            let pathname = url
            if (url.startsWith('http')) {
                const urlObj = new URL(url)
                pathname = urlObj.pathname
            }

            // Extract the slug from pathname like /posts/article-slug--id
            const parts = pathname.split('/')
            const lastPart = parts[parts.length - 1]

            // Remove trailing hash or query params
            const cleanPart = lastPart.split('?')[0].split('#')[0]

            // Remove ID suffix if present (--abc123) to get clean slug
            const slug = cleanPart.replace(/--[a-zA-Z0-9]+$/, '')

            return slug || `article-${Date.now()}`
        } catch {
            return `article-${Date.now()}`
        }
    }

    private getImageExtension(url: string): string {
        try {
            const urlObj = new URL(url)
            const pathname = urlObj.pathname
            const extension = path.extname(pathname)
            return extension || '.jpg'
        } catch {
            return '.jpg'
        }
    }

    private async downloadImageWithPlaywright(imageUrl: string, outputPath: string): Promise<boolean> {
        try {
            if (!this.page) return false

            // Create a new page context for downloading the image
            const context = this.page.context()
            const downloadPage = await context.newPage()

            try {
                // Navigate to the image URL
                const response = await downloadPage.goto(imageUrl, { waitUntil: 'networkidle' })

                if (!response || !response.ok()) {
                    sendProgress(this.mainWindow, `  ⚠️ Image response not OK: ${response?.status()}`)
                    return false
                }

                // Get the image buffer
                const imageBuffer = await response.body()
                if (!imageBuffer) {
                    sendProgress(this.mainWindow, `  ⚠️ No image buffer received`)
                    return false
                }

                // Save the image
                await fs.writeFile(outputPath, imageBuffer)
                return true

            } finally {
                await downloadPage.close()
            }

        } catch (error) {
            sendProgress(this.mainWindow, `  ❌ Error downloading image with Playwright: ${error.message}`)
            return false
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async close(): Promise<void> {
        try {
            if (this.browser) {
                await this.browser.close()
                this.browser = null
                this.page = null
                sendProgress(this.mainWindow, '🔒 Đã đóng browser')
            }
        } catch (error) {
            sendProgress(this.mainWindow, `❌ Lỗi đóng browser: ${error.message}`)
        }
    }
} 