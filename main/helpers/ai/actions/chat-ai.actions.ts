import { DEFAULT_AI_CONFIG, TemplateType } from '../info-const'
import type { ProblemContent } from '../../scraper'
import { ExerciseTemplate } from '../template/exercise'
import { LessonTemplate } from '../template/lesson'
import { TranslateTemplate, TranslateOptions } from '../template/translate'

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
    translateOptions?: TranslateOptions
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
                result = await this.callMistralAPI(content, options.templateType, options)
            } else {
                // Fallback to simple content
                result = `# ${content.title}

**Nội dung gốc:**
${content.content}

---
Tác giả: Nguyễn Phương Anh Tú  
Phone/Zalo: 0767449819`
            }

            const processingTime = Date.now() - startTime
            console.log(`✅ Completed in ${processingTime}ms`)

            return { success: true, data: result, processingTime }

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

    private async callMistralAPI(content: ProblemContent, templateType: TemplateType, options?: AIOptions): Promise<string> {
        // Generate prompt from template
        const prompt = this.getTemplate(content, templateType, options)

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: DEFAULT_AI_CONFIG.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: DEFAULT_AI_CONFIG.temperature,
                max_tokens: DEFAULT_AI_CONFIG.maxTokens
            })
        })

        if (!response.ok) {
            throw new Error(`Mistral API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        return data.choices[0].message.content
    }

    private getTemplate(content: ProblemContent, templateType: TemplateType, options?: AIOptions): string {
        switch (templateType) {
            case 'exercise':
                return ExerciseTemplate.generatePrompt(content)
            case 'lesson':
                return LessonTemplate.generatePrompt(content)
            case 'translate':
                if (!options?.translateOptions) {
                    throw new Error('Translate options are required for translate template')
                }
                return TranslateTemplate.generatePrompt(content, options.translateOptions)
            case 'raw':
                return `Chuyển đổi nội dung sau sang tiếng Việt, giữ nguyên format và cấu trúc:

Title: ${content.title}
Content: ${content.content}

Yêu cầu: Dịch tiếng Việt tự nhiên, format markdown, giữ nguyên code và test cases nếu có.`
            default:
                throw new Error(`Unknown template type: ${templateType}`)
        }
    }
}

export const aiActions = new ChatAIActions() 