import { chromium, Browser, Page } from 'playwright'
import * as cheerio from 'cheerio'
import * as fs from 'fs-extra'
import * as path from 'path'
import { execSync } from 'child_process'
import {
    BROWSER_SETTINGS,
    SCRAPER_SETTINGS,
    EXPORT_DIR,
    USER_DATA_DIR,
    SCREENSHOTS_DIR,
    ensureDirectories,
    getBrowserExecutablePath,
    checkBrowserExists,
    log
} from '../settings'

export interface Topic {
    name: string
    id: string
    links: ProblemLink[]
}

export interface ProblemLink {
    title: string
    url: string
}

export interface ProblemContent {
    title: string
    content: string
    url: string
}

export class ContentScraper {
    private browser: Browser | null = null
    private page: Page | null = null

    async initialize(): Promise<void> {
        try {
            log('🔧 Initializing ContentScraper...')

            // Ensure all directories exist
            await ensureDirectories()
            log('📁 Created necessary directories')

            // Check if browser exists, if not download it
            const browserExists = await checkBrowserExists()
            if (!browserExists) {
                log('📥 Browser not found, downloading...')
                await this.downloadBrowser()
            }

            // Launch browser with custom settings
            this.browser = await chromium.launch({
                headless: BROWSER_SETTINGS.headless,
                args: BROWSER_SETTINGS.args,
                executablePath: getBrowserExecutablePath()
            })

            // Create new page with persistent context
            const context = await this.browser.newContext({
                userAgent: SCRAPER_SETTINGS.userAgent,
                viewport: { width: 1920, height: 1080 }
            })

            this.page = await context.newPage()

            // Set timeouts
            this.page.setDefaultTimeout(SCRAPER_SETTINGS.defaultTimeout)
            this.page.setDefaultNavigationTimeout(SCRAPER_SETTINGS.navigationTimeout)

            // Add stealth settings
            await this.page.addInitScript(() => {
                // Remove webdriver property
                delete (window as any).navigator.webdriver

                // Mock plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                })

                // Mock languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en']
                })
            })

            log('✅ ContentScraper initialized successfully')
        } catch (error) {
            log(`❌ Failed to initialize ContentScraper: ${error.message}`)
            throw error
        }
    }

    private async downloadBrowser(): Promise<void> {
        try {
            log('📦 Installing Playwright browsers...')

            // Set environment variable to install browsers in custom location
            process.env.PLAYWRIGHT_BROWSERS_PATH = path.dirname(getBrowserExecutablePath())

            // Install browsers
            execSync('npx playwright install chromium', {
                stdio: 'inherit',
                cwd: process.cwd()
            })

            log('✅ Browser installation completed')
        } catch (error) {
            log(`❌ Failed to download browser: ${error.message}`)
            throw new Error(`Browser installation failed: ${error.message}`)
        }
    }

    async scrapeTopics(url: string): Promise<Topic[]> {
        if (!this.page) throw new Error('Scraper not initialized')

        try {
            log(`🌐 Navigating to: ${url}`)

            // Thử nhiều strategy để load trang
            let content = ''
            let retryCount = 0
            const maxRetries = 3

            while (retryCount < maxRetries && !content) {
                try {
                    // Strategy 1: Load với domcontentloaded (nhanh hơn)
                    if (retryCount === 0) {
                        await this.page.goto(url, {
                            waitUntil: 'domcontentloaded',
                            timeout: 30000
                        })
                        await this.delay(2000)
                    }
                    // Strategy 2: Load với networkidle
                    else if (retryCount === 1) {
                        await this.page.goto(url, {
                            waitUntil: 'networkidle',
                            timeout: 45000
                        })
                        await this.delay(3000)
                    }
                    // Strategy 3: Load với load event
                    else {
                        await this.page.goto(url, {
                            waitUntil: 'load',
                            timeout: 60000
                        })
                        await this.delay(5000)
                    }

                    // Đợi main content load
                    await this.page.waitForSelector('#main.site-main', { timeout: 10000 })

                    // Scroll để trigger lazy loading
                    await this.page.evaluate(() => {
                        window.scrollTo(0, document.body.scrollHeight / 2)
                    })
                    await this.delay(2000)

                    content = await this.page.content()

                    if (content && content.includes('sf-toc')) {
                        log(`✅ Successfully loaded page on attempt ${retryCount + 1}`)
                        break
                    }
                } catch (error) {
                    log(`⚠️ Attempt ${retryCount + 1} failed: ${error.message}`)
                    retryCount++
                    if (retryCount < maxRetries) {
                        await this.delay(3000)
                    }
                }
            }

            if (!content || !content.includes('sf-toc')) {
                throw new Error('Failed to load page content after all retries')
            }

            // Take screenshot for debugging
            const screenshotPath = path.join(SCREENSHOTS_DIR, `topics-${Date.now()}.png`)
            await this.page.screenshot({ path: screenshotPath, fullPage: true })
            log(`📸 Screenshot saved: ${screenshotPath}`)

            const $ = cheerio.load(content)
            const topics: Topic[] = []

            // Lấy danh sách các chủ đề từ table of contents theo HTML structure trong prompt
            $('.sf-toc .sf-lcol ul li a, .sf-toc .sf-rcol ul li a').each((index, element) => {
                const $element = $(element)
                const topicName = $element.text().trim()
                const href = $element.attr('href')

                if (topicName && href && href.startsWith('#')) {
                    const topicId = href.replace('#', '')
                    topics.push({
                        name: topicName,
                        id: topicId,
                        links: []
                    })
                }
            })

            log(`📚 Found ${topics.length} topics`)

            // Lấy các bài tập cho từng chủ đề theo structure trong prompt
            for (const topic of topics) {
                const problemLinks: ProblemLink[] = []

                // Tìm section với id tương ứng
                const topicSection = $(`#${topic.id}`)
                if (topicSection.length === 0) {
                    log(`⚠️ Topic section not found for: ${topic.id}`)
                    continue
                }

                // Tìm div chứa danh sách bài tập (thường là div tiếp theo sau h2)
                let nextElement = topicSection.parent()

                // Tìm ul chứa các link bài tập
                const listContainer = nextElement.find('ul').first()
                if (listContainer.length > 0) {
                    listContainer.find('li a').each((index, element) => {
                        const $link = $(element)
                        const title = $link.text().trim()
                        const url = $link.attr('href')

                        if (title && url && url.startsWith('https://www.sanfoundry.com/')) {
                            problemLinks.push({ title, url })
                        }
                    })
                } else {
                    // Fallback: tìm trong toàn bộ section
                    const sectionDiv = topicSection.closest('div')
                    sectionDiv.find('ul li a').each((index, element) => {
                        const $link = $(element)
                        const title = $link.text().trim()
                        const url = $link.attr('href')

                        if (title && url && url.startsWith('https://www.sanfoundry.com/')) {
                            problemLinks.push({ title, url })
                        }
                    })
                }

                topic.links = problemLinks
                log(`📖 Topic "${topic.name}": ${problemLinks.length} problems`)
            }

            const validTopics = topics.filter(topic => topic.links.length > 0)
            log(`✅ Successfully scraped ${validTopics.length} topics with problems`)

            return validTopics
        } catch (error) {
            log(`❌ Error scraping topics: ${error.message}`)
            throw error
        }
    }

    async scrapeProblemContent(url: string): Promise<ProblemContent | null> {
        if (!this.page) throw new Error('Scraper not initialized')

        try {
            log(`📄 Scraping problem: ${url}`)

            // Retry logic cho việc load trang
            let pageContent = ''
            let retryCount = 0
            const maxRetries = 2

            while (retryCount < maxRetries && !pageContent) {
                try {
                    await this.page.goto(url, {
                        waitUntil: 'domcontentloaded',
                        timeout: 30000
                    })

                    // Đợi main content
                    await this.page.waitForSelector('body', { timeout: 10000 })
                    await this.delay(2000)

                    // Scroll để trigger lazy loading
                    await this.page.evaluate(() => {
                        window.scrollTo(0, document.body.scrollHeight / 2)
                    })
                    await this.delay(1000)

                    pageContent = await this.page.content()
                    break
                } catch (error) {
                    retryCount++
                    log(`⚠️ Retry ${retryCount}/${maxRetries} for ${url}: ${error.message}`)
                    if (retryCount >= maxRetries) throw error
                    await this.delay(2000)
                }
            }

            if (!pageContent) {
                throw new Error('Failed to get page content')
            }

            // Parse HTML với Cheerio
            const $ = cheerio.load(pageContent)

            // Lấy title từ header có class="entry-header"
            const headerElement = $('.entry-header')
            const title = headerElement.text().trim() || 'Untitled'
            log(`📝 Found title: ${title}`)

            // Lấy content từ div có class="entry-content"
            const contentElement = $('.entry-content')
            const content = contentElement.text().trim() || ''
            log(`📄 Content length: ${content.length} characters`)

            if (!title && !content) {
                throw new Error('No title or content found')
            }

            return {
                title,
                content,
                url
            }

        } catch (error) {
            log(`❌ Error scraping ${url}: ${error.message}`)
            return null
        }
    }

    async exportToFile(content: ProblemContent, topicName: string, topicIndex?: number, problemIndex?: number): Promise<void> {
        try {
            // Tạo tên chương với số thứ tự 000x
            const formattedTopicName = topicIndex !== undefined
                ? `${String(topicIndex + 1).padStart(4, '0')}-${this.formatFileName(topicName)}`
                : this.formatFileName(topicName)

            // Tạo thư mục theo tên chương
            const topicDir = path.join(EXPORT_DIR, formattedTopicName)
            await fs.ensureDir(topicDir)

            // Tạo tên file với số thứ tự 000x
            const formattedProblemName = problemIndex !== undefined
                ? `${String(problemIndex + 1).padStart(4, '0')}-${this.formatFileName(content.title)}`
                : this.formatFileName(content.title)

            const fileName = `${formattedProblemName}.md`
            const filePath = path.join(topicDir, fileName)

            let markdownContent: string

            // Kiểm tra xem content có được AI xử lý hay không
            if ((content as any).aiEnhanced && (content as any).aiProcessedContent) {
                log(`🤖 Using AI-enhanced content for: ${content.title}`)
                log(`📝 AI template: ${(content as any).aiTemplate}`)
                log(`⏱️ AI processing time: ${(content as any).aiProcessingTime}ms`)

                // Sử dụng AI-processed markdown trực tiếp
                markdownContent = (content as any).aiProcessedContent

                log(`📏 AI content length: ${markdownContent.length} characters`)
            } else {
                log(`📄 Using simple content format for: ${content.title}`)

                // Tạo nội dung markdown đơn giản
                markdownContent = `# ${content.title}

## 📋 Nội dung

${content.content}

---

**Nguồn:** [${content.url}](${content.url})

**Thời gian tạo:** ${new Date().toLocaleString('vi-VN')}
`
            }

            await fs.writeFile(filePath, markdownContent, 'utf-8')
            log(`💾 Exported: ${filePath}`)
        } catch (error) {
            log(`❌ Export error: ${error.message}`)
            throw error
        }
    }

    private formatFileName(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50)
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
                log('🔒 Browser closed successfully')
            }
        } catch (error) {
            log(`❌ Error closing browser: ${error.message}`)
        }
    }
} 