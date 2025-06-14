import { chromium, Browser, Page } from 'playwright'
import * as cheerio from 'cheerio'
import * as fs from 'fs-extra'
import * as path from 'path'
import { formatFileName, delay } from './utils'

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
    solutions: string[]
    testCases: string[]
    explanation: string
}

export class ContentScraper {
    private browser: Browser | null = null
    private page: Page | null = null

    async initialize(): Promise<void> {
        this.browser = await chromium.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        this.page = await this.browser.newPage()

        // Thiết lập user agent để tránh bị block
        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )
    }

    async scrapeTopics(url: string = 'https://www.sanfoundry.com/python-problems-solutions/'): Promise<Topic[]> {
        if (!this.page) throw new Error('Scraper not initialized')

        await this.page.goto(url)
        await delay(2000)

        const content = await this.page.content()
        const $ = cheerio.load(content)

        const topics: Topic[] = []

        // Lấy danh sách các chủ đề từ mục lục
        $('.sf-toc .sf-lcol ul li, .sf-toc .sf-rcol ul li').each((index, element) => {
            const $element = $(element)
            const link = $element.find('a')
            const topicName = link.text().trim()
            const topicId = link.attr('href')?.replace('#', '') || ''

            if (topicName && topicId) {
                topics.push({
                    name: topicName,
                    id: topicId,
                    links: []
                })
            }
        })

        // Lấy các bài tập cho từng chủ đề
        for (const topic of topics) {
            const topicSection = $(`#${topic.id}`).parent()
            const problemLinks: ProblemLink[] = []

            topicSection.find('ul li a').each((index, element) => {
                const $link = $(element)
                const title = $link.text().trim()
                const url = $link.attr('href')

                if (title && url && url.startsWith('https://')) {
                    problemLinks.push({ title, url })
                }
            })

            topic.links = problemLinks
        }

        return topics.filter(topic => topic.links.length > 0)
    }

    async scrapeProblemContent(url: string): Promise<ProblemContent | null> {
        if (!this.page) throw new Error('Scraper not initialized')

        try {
            await this.page.goto(url)
            await delay(1500)

            const content = await this.page.content()
            const $ = cheerio.load(content)

            const mainContent = $('#main.site-main')
            if (!mainContent.length) return null

            const title = mainContent.find('h1.entry-title').text().trim()

            // Lấy mô tả bài toán
            const description = mainContent.find('.sf-codeh').first().next('p').text().trim()

            // Lấy các phương pháp giải
            const solutions: string[] = []
            mainContent.find('.hk1_style pre').each((index, element) => {
                const code = $(element).text().trim()
                if (code) solutions.push(code)
            })

            // Lấy test cases
            const testCases: string[] = []
            mainContent.find('.text pre').each((index, element) => {
                const testCase = $(element).text().trim()
                if (testCase) testCases.push(testCase)
            })

            // Lấy giải thích
            const explanation = mainContent.find('.sf-codeh:contains("Program Explanation")').next('p').text().trim()

            return {
                title,
                description,
                solutions,
                testCases,
                explanation
            }
        } catch (error) {
            console.error(`Error scraping ${url}:`, error)
            return null
        }
    }

    async exportToFile(content: ProblemContent, topicName: string): Promise<void> {
        const exportDir = path.join(process.cwd(), 'temp', 'export', formatFileName(topicName))
        await fs.ensureDir(exportDir)

        const fileName = `${formatFileName(content.title)}.md`
        const filePath = path.join(exportDir, fileName)

        const markdownContent = `# ${content.title}

## Mô tả bài toán
${content.description}

## Giải pháp

${content.solutions.map((solution, index) => `### Phương pháp ${index + 1}
\`\`\`python
${solution}
\`\`\`
`).join('\n')}

## Test Cases

${content.testCases.map((testCase, index) => `### Test Case ${index + 1}
\`\`\`
${testCase}
\`\`\`
`).join('\n')}

## Giải thích
${content.explanation}
`

        await fs.writeFile(filePath, markdownContent, 'utf-8')
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close()
            this.browser = null
            this.page = null
        }
    }
} 