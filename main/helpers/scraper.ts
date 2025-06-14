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
    description: string
    methods: ProblemMethod[]
    solutions: string[]
    testCases: string[]
    url: string
}

export interface ProblemMethod {
    name: string
    description: string
    sourceCode: string
    explanation: string
    testCases: string[]
    complexity: string
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
            let content = ''
            let retryCount = 0
            const maxRetries = 2

            while (retryCount < maxRetries && !content) {
                try {
                    await this.page.goto(url, {
                        waitUntil: 'domcontentloaded',
                        timeout: 30000
                    })

                    // Đợi main content
                    await this.page.waitForSelector('#main.site-main', { timeout: 10000 })
                    await this.delay(2000)

                    // Scroll để trigger lazy loading
                    await this.page.evaluate(() => {
                        window.scrollTo(0, document.body.scrollHeight / 2)
                    })
                    await this.delay(1000)

                    content = await this.page.content()
                    break
                } catch (error) {
                    retryCount++
                    log(`⚠️ Retry ${retryCount}/${maxRetries} for ${url}: ${error.message}`)
                    if (retryCount >= maxRetries) throw error
                    await this.delay(2000)
                }
            }

            if (!content) {
                throw new Error('Failed to get page content')
            }

            // Parse HTML với Cheerio
            const $ = cheerio.load(content)
            const mainContent = $('#main.site-main')

            if (mainContent.length === 0) {
                throw new Error('Main content not found')
            }

            // Lấy title từ h1.entry-title
            const title = mainContent.find('h1.entry-title').text().trim() || 'Untitled'
            log(`📝 Found title: ${title}`)

            // Lấy description từ đoạn đầu tiên
            const description = mainContent.find('.entry-content p').first().text().trim() || ''

            // Tìm tất cả các method sections
            const methods: any[] = []
            const solutions: string[] = []
            const testCases: string[] = []

            // Tìm các method bằng cách tìm div.sf-codeh chứa "Method"
            mainContent.find('.sf-codeh').each((index, element) => {
                const methodText = $(element).text().trim()

                if (methodText.includes('Method') && methodText.match(/Method\s+\d+/)) {
                    const methodNumber = methodText.match(/Method\s+(\d+)/)?.[1] || (index + 1).toString()

                    // Tìm description của method (đoạn text sau method header)
                    let methodDescription = ''
                    let nextElement = $(element).next()
                    while (nextElement.length && !nextElement.hasClass('sf-codeh') && nextElement.prop('tagName') !== 'DIV') {
                        if (nextElement.prop('tagName') === 'P') {
                            methodDescription += nextElement.text().trim() + ' '
                        }
                        nextElement = nextElement.next()
                    }

                    // Tìm source code (trong .hk1_style pre hoặc .python pre)
                    let sourceCode = ''
                    let codeElement = $(element)
                    for (let i = 0; i < 10; i++) { // Tìm trong 10 element tiếp theo
                        codeElement = codeElement.next()
                        if (codeElement.length === 0) break

                        const codeBlock = codeElement.find('.hk1_style pre, .python pre').first()
                        if (codeBlock.length > 0) {
                            sourceCode = codeBlock.text().trim()
                            break
                        }
                    }

                    // Tìm program explanation
                    let explanation = ''
                    let explanationElement = $(element)
                    let foundExplanation = false
                    for (let i = 0; i < 15; i++) {
                        explanationElement = explanationElement.next()
                        if (explanationElement.length === 0) break

                        const explanationHeader = explanationElement.find('.sf-codeh').text()
                        if (explanationHeader.includes('Program Explanation') || explanationHeader.includes('Explanation')) {
                            foundExplanation = true
                            // Lấy các đoạn text sau explanation header
                            let nextExplElement = explanationElement.next()
                            while (nextExplElement.length && !nextExplElement.hasClass('sf-codeh')) {
                                if (nextExplElement.prop('tagName') === 'P' || nextExplElement.prop('tagName') === 'OL') {
                                    explanation += nextExplElement.text().trim() + '\n'
                                }
                                nextExplElement = nextExplElement.next()
                            }
                            break
                        }
                    }

                    // Tìm test cases (trong .text pre)
                    let methodTestCases: string[] = []
                    let testElement = $(element)
                    for (let i = 0; i < 20; i++) {
                        testElement = testElement.next()
                        if (testElement.length === 0) break

                        const testHeader = testElement.find('.sf-codeh').text()
                        if (testHeader.includes('Runtime Test Cases') || testHeader.includes('Test case')) {
                            // Tìm tất cả test cases sau header này
                            let nextTestElement = testElement.next()
                            while (nextTestElement.length) {
                                const testCodeBlock = nextTestElement.find('.text pre')
                                if (testCodeBlock.length > 0) {
                                    methodTestCases.push(testCodeBlock.text().trim())
                                }

                                // Dừng nếu gặp method mới hoặc hết content
                                if (nextTestElement.find('.sf-codeh').text().includes('Method') ||
                                    nextTestElement.find('.sf-codeh').text().includes('Related Posts')) {
                                    break
                                }
                                nextTestElement = nextTestElement.next()
                            }
                            break
                        }
                    }

                    // Tìm time/space complexity
                    let complexity = ''
                    let complexityElement = $(element)
                    for (let i = 0; i < 15; i++) {
                        complexityElement = complexityElement.next()
                        if (complexityElement.length === 0) break

                        const complexityText = complexityElement.text()
                        if (complexityText.includes('Time Complexity') || complexityText.includes('Space Complexity')) {
                            complexity += complexityText.trim() + '\n'
                        }
                    }

                    if (sourceCode || methodDescription) {
                        methods.push({
                            name: `Method ${methodNumber}`,
                            description: methodDescription.trim(),
                            sourceCode: sourceCode,
                            explanation: explanation.trim(),
                            testCases: methodTestCases,
                            complexity: complexity.trim()
                        })

                        // Thêm vào solutions và testCases arrays
                        if (sourceCode) solutions.push(sourceCode)
                        methodTestCases.forEach(tc => testCases.push(tc))
                    }
                }
            })

            // Nếu không tìm thấy method nào, thử tìm code blocks chung
            if (methods.length === 0) {
                log(`⚠️ No methods found, trying to find general code blocks`)

                // Tìm tất cả code blocks
                mainContent.find('.hk1_style pre, .python pre').each((index, element) => {
                    const code = $(element).text().trim()
                    if (code && code.length > 10) {
                        solutions.push(code)
                    }
                })

                // Tìm tất cả test cases
                mainContent.find('.text pre').each((index, element) => {
                    const testCase = $(element).text().trim()
                    if (testCase && testCase.length > 5) {
                        testCases.push(testCase)
                    }
                })

                // Tạo một method chung nếu có code
                if (solutions.length > 0) {
                    methods.push({
                        name: 'Main Solution',
                        description: description,
                        sourceCode: solutions[0],
                        explanation: '',
                        testCases: testCases,
                        complexity: ''
                    })
                }
            }

            const result: ProblemContent = {
                title,
                description,
                methods,
                solutions,
                testCases,
                url
            }

            log(`✅ Scraped successfully: ${methods.length} methods, ${solutions.length} solutions, ${testCases.length} test cases`)
            return result

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
            if ((content as any).aiEnhanced && (content as any).description) {
                log(`🤖 Using AI-enhanced content for: ${content.title}`)
                log(`📝 AI template: ${(content as any).aiTemplate}`)
                log(`⏱️ AI processing time: ${(content as any).aiProcessingTime}ms`)

                // Sử dụng AI-processed markdown trực tiếp
                markdownContent = (content as any).description

                log(`📏 AI content length: ${markdownContent.length} characters`)
            } else {
                log(`📄 Using original content format for: ${content.title}`)

                // Tạo nội dung markdown theo format cũ
                markdownContent = `# ${content.title}\n\n`

                if (content.description) {
                    markdownContent += `## 📋 Mô tả bài toán\n${content.description}\n\n`
                }

                // Nếu có methods chi tiết
                if (content.methods.length > 0) {
                    content.methods.forEach((method, index) => {
                        markdownContent += `## ${method.name}\n\n`

                        if (method.description) {
                            markdownContent += `### Mô tả\n${method.description}\n\n`
                        }

                        if (method.sourceCode) {
                            markdownContent += `### 💻 Source Code\n\`\`\`python\n${method.sourceCode}\n\`\`\`\n\n`
                        }

                        if (method.explanation) {
                            markdownContent += `### 📝 Giải thích\n${method.explanation}\n\n`
                        }

                        if (method.testCases.length > 0) {
                            markdownContent += `### 🧪 Test Cases\n`
                            method.testCases.forEach((testCase, tcIndex) => {
                                markdownContent += `**Test case ${tcIndex + 1}:**\n\`\`\`\n${testCase}\n\`\`\`\n\n`
                            })
                        }

                        if (method.complexity) {
                            markdownContent += `### ⚡ Complexity\n${method.complexity}\n\n`
                        }

                        markdownContent += `---\n\n`
                    })
                } else {
                    // Fallback nếu không có methods
                    if (content.solutions.length > 0) {
                        markdownContent += `## 💻 Solutions\n\n`
                        content.solutions.forEach((solution, index) => {
                            markdownContent += `### Solution ${index + 1}\n\`\`\`python\n${solution}\n\`\`\`\n\n`
                        })
                    }

                    if (content.testCases.length > 0) {
                        markdownContent += `## 🧪 Test Cases\n\n`
                        content.testCases.forEach((testCase, index) => {
                            markdownContent += `**Test case ${index + 1}:**\n\`\`\`\n${testCase}\n\`\`\`\n\n`
                        })
                    }
                }

                // Thêm thông tin nguồn
                markdownContent += `---\n\n**Nguồn:** [${content.url}](${content.url})\n\n`
                markdownContent += `**Thời gian tạo:** ${new Date().toLocaleString('vi-VN')}\n`
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