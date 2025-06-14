import { DEFAULT_AI_CONFIG, TemplateType } from '../info-const'
import type { ProblemContent } from '../../scraper'
import { ExerciseTemplate } from '../template/exercise'
import { LessonTemplate } from '../template/lesson'

export interface AIResponse {
    success: boolean
    data?: string
    error?: string
    processingTime?: number
}

export interface AIOptions {
    templateType: TemplateType
    useAI: boolean
    apiKey?: string
}

export class ChatAIActions {
    private apiKey: string = ''

    constructor(apiKey?: string) {
        this.apiKey = apiKey || DEFAULT_AI_CONFIG.apiKey
    }

    setApiKey(apiKey: string): void {
        this.apiKey = apiKey
    }

    async processContent(content: ProblemContent, options: AIOptions): Promise<AIResponse> {
        const startTime = Date.now()

        try {
            console.log(`🤖 Processing: ${content.title}`)
            console.log(`📋 Template: ${options.templateType}, AI: ${options.useAI}`)

            let result: string

            if (options.useAI && this.apiKey) {
                // Real AI processing
                result = await this.callMistralAPI(content, options.templateType)
            } else {
                // Fallback to template-only
                result = this.generateTemplateOnly(content, options.templateType)
            }

            const processingTime = Date.now() - startTime
            console.log(`✅ Completed in ${processingTime}ms`)

            return {
                success: true,
                data: result,
                processingTime
            }

        } catch (error) {
            const processingTime = Date.now() - startTime
            console.error(`❌ Processing error:`, error)

            return {
                success: false,
                error: error.message || 'Lỗi xử lý không xác định',
                processingTime
            }
        }
    }

    private async callMistralAPI(content: ProblemContent, templateType: TemplateType): Promise<string> {
        const prompt = this.generatePrompt(content, templateType)

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: DEFAULT_AI_CONFIG.model,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: DEFAULT_AI_CONFIG.temperature,
                max_tokens: DEFAULT_AI_CONFIG.maxTokens
            })
        })

        if (!response.ok) {
            throw new Error(`Mistral API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.choices || !data.choices[0]) {
            throw new Error('Invalid response from Mistral API')
        }

        return data.choices[0].message.content
    }

    private generatePrompt(content: ProblemContent, templateType: TemplateType): string {
        switch (templateType) {
            case 'exercise':
                return ExerciseTemplate.generatePrompt(content)
            case 'lesson':
                return LessonTemplate.generatePrompt(content)
            case 'raw':
                return this.generateRawPrompt(content)
            default:
                throw new Error(`Unknown template type: ${templateType}`)
        }
    }

    private generateRawPrompt(content: ProblemContent): string {
        return `Chuyển đổi nội dung sau sang tiếng Việt, giữ nguyên test cases:

Title: ${content.title}
Description: ${content.description}

Code:
${content.methods.map(m => m.sourceCode).join('\n\n')}

Test Cases:
${content.testCases.join('\n')}

Yêu cầu: Dịch tiếng Việt tự nhiên, format markdown, giữ nguyên code và test cases.`
    }

    private generateTemplateOnly(content: ProblemContent, templateType: TemplateType): string {
        // Simple template without AI
        const vietnameseTitle = this.translateTitle(content.title)

        switch (templateType) {
            case 'exercise':
                return this.generateSimpleExercise(content, vietnameseTitle)
            case 'lesson':
                return this.generateSimpleLesson(content, vietnameseTitle)
            default:
                return this.generateSimpleRaw(content, vietnameseTitle)
        }
    }

    private generateSimpleExercise(content: ProblemContent, title: string): string {
        return `# ${title}

## 📝 Đề bài
${content.description}

## 🧪 Test Cases
\`\`\`
${content.testCases.join('\n')}
\`\`\`

## 💻 Lời giải
\`\`\`python
${content.methods[0]?.sourceCode || '# Code here'}
\`\`\`

**Giải thích:** Chương trình này giải quyết bài toán bằng cách xử lý input và trả về output theo yêu cầu.

---
Tác giả: Nguyễn Phương Anh Tú  
Facebook: https://www.facebook.com/dev.alex.698447`
    }

    private generateSimpleLesson(content: ProblemContent, title: string): string {
        return `# ${title}

## 📚 Giới thiệu
${content.description}

## 🎯 Mục tiêu
- Hiểu được khái niệm cơ bản
- Áp dụng vào bài tập thực tế

## 📖 Nội dung

### Khái niệm chính
${content.methods[0]?.description || 'Nội dung bài học'}

\`\`\`python
${content.methods[0]?.sourceCode || '# Code example'}
\`\`\`

## 🛠️ Thực hành
Thực hành với các test cases sau:
\`\`\`
${content.testCases.join('\n')}
\`\`\`

---
Tác giả: Nguyễn Phương Anh Tú  
Facebook: https://www.facebook.com/dev.alex.698447`
    }

    private generateSimpleRaw(content: ProblemContent, title: string): string {
        return `# ${title}

**Mô tả:** ${content.description}

**Code:**
\`\`\`python
${content.methods.map(m => m.sourceCode).join('\n\n')}
\`\`\`

**Test Cases:**
\`\`\`
${content.testCases.join('\n')}
\`\`\`

---
Tác giả: Nguyễn Phương Anh Tú`
    }

    private translateTitle(title: string): string {
        // Simple title translation
        const translations = {
            'Python Program to Check if a Number is Odd or Even': 'Kiểm tra số chẵn lẻ',
            'Python Program to Check Whether a Number is Positive or Negative': 'Kiểm tra số dương âm',
            'Python Program to Print All Odd Numbers in a Range': 'In các số lẻ trong khoảng',
            'Palindrome Program in Python': 'Kiểm tra số palindrome',
            'Python Program to Reverse a Number': 'Đảo ngược số'
        }

        return translations[title] || title.replace(/Python Program to/gi, '').trim()
    }
}

export const aiActions = new ChatAIActions() 