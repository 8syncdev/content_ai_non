import { DEFAULT_AI_CONFIG, AI_PROCESSING_POLICIES, ProcessingPolicy, TemplateType } from '../template/info-const'
import type { ProblemContent } from '../../scraper'
import { ExerciseTemplateProcessor } from '../template/exercise'
import { LessonTemplateProcessor } from '../template/lesson'

// Note: Requires npm install ai @ai-sdk/mistral
// Uncomment when AI SDK is installed:
// import { streamText, generateText } from 'ai'
// import { mistral } from '@ai-sdk/mistral'
// import { createStreamableValue } from 'ai/rsc'

export interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export interface AIConfig {
    provider: 'mistral' | 'openai' | 'claude'
    apiKey: string
    model: string
    temperature: number
    maxTokens: number
}

export interface AIProcessingOptions {
    templateType: TemplateType | 'raw'
    useStream: boolean
    policy: ProcessingPolicy
    customPrompt?: string
}

export interface AIResponse {
    success: boolean
    data?: string
    error?: string
    rawResponse?: string
    processingTime?: number
    metadata?: any
}

export interface StreamResponse {
    success: boolean
    stream?: any // ReadableStream<string> when AI SDK is available
    error?: string
}

export class ChatAIActions {
    private config: AIConfig

    constructor(config?: Partial<AIConfig>) {
        this.config = { ...DEFAULT_AI_CONFIG, ...config }
    }

    updateConfig(newConfig: Partial<AIConfig>): void {
        this.config = { ...this.config, ...newConfig }
    }

    /**
     * Xử lý content với AI (no-stream mode - mặc định)
     * Dựa trên pattern từ continueConversation function
     */
    async processContent(
        content: ProblemContent,
        options: AIProcessingOptions
    ): Promise<AIResponse> {
        const startTime = Date.now()

        try {
            // Validate API key - allow default key for demo
            if (!this.config.apiKey) {
                return {
                    success: false,
                    error: 'Vui lòng cấu hình API key trong settings'
                }
            }

            const policyConfig = AI_PROCESSING_POLICIES[options.policy]
            let prompt: string

            // Tạo prompt theo template
            switch (options.templateType) {
                case 'exercise':
                    prompt = ExerciseTemplateProcessor.generatePrompt(content)
                    break
                case 'lesson':
                    prompt = LessonTemplateProcessor.generatePrompt(content)
                    break
                case 'raw':
                    prompt = options.customPrompt || this.generateRawPrompt(content)
                    break
                default:
                    throw new Error('Invalid template type')
            }

            // TODO: Uncomment when AI SDK is installed
            /*
            console.log('Processing with API key:', this.config.apiKey)
            process.env.MISTRAL_API_KEY = this.config.apiKey

            const { text } = await generateText({
                model: mistral(policyConfig.model),
                system: `Bạn là chuyên gia giáo dục lập trình Python. Hãy chuyển đổi nội dung theo yêu cầu:
- Dịch sang tiếng Việt tự nhiên
- Giữ nguyên 100% test cases gốc
- Cấu trúc markdown chuẩn
- Giải thích chi tiết dễ hiểu
- Phù hợp cho người mới học`,
                prompt: prompt,
                maxTokens: policyConfig.maxTokens,
                temperature: policyConfig.temperature,
            })

            // Validate output
            let isValid = false
            let metadata = {}

            if (options.templateType === 'exercise') {
                isValid = ExerciseTemplateProcessor.validateOutput(text)
                if (isValid) {
                    metadata = ExerciseTemplateProcessor.extractMetadata(text)
                }
            } else if (options.templateType === 'lesson') {
                isValid = LessonTemplateProcessor.validateOutput(text)
                if (isValid) {
                    metadata = LessonTemplateProcessor.extractMetadata(text)
                }
            } else {
                isValid = text.length > 100 // Basic validation for raw
            }

            if (!isValid) {
                return {
                    success: false,
                    error: 'AI output không đúng format yêu cầu',
                    rawResponse: text,
                    processingTime: Date.now() - startTime
                }
            }

            return {
                success: true,
                data: text,
                rawResponse: text,
                processingTime: Date.now() - startTime,
                metadata
            }
            */

            // Mock response for development (remove when AI SDK is installed)
            console.log('🧪 Generating mock AI response...')
            console.log('📋 Content title:', content.title)
            console.log('🎯 Template type:', options.templateType)
            console.log('⚙️ Policy:', options.policy)

            const mockData = this.generateMockResponse(content, options)
            console.log('✅ Mock response generated, length:', mockData.length)

            return {
                success: true,
                data: mockData,
                rawResponse: mockData,
                processingTime: Date.now() - startTime,
                metadata: { mock: true, template: options.templateType, policy: options.policy }
            }

        } catch (error) {
            return {
                success: false,
                error: error.message || 'Lỗi xử lý AI không xác định',
                processingTime: Date.now() - startTime
            }
        }
    }

    /**
     * Xử lý content với AI (stream mode)
     * Dựa trên pattern từ continueConversation function
     */
    async processContentStream(
        content: ProblemContent,
        options: AIProcessingOptions
    ): Promise<StreamResponse> {
        try {
            // Validate API key - allow default key for demo
            if (!this.config.apiKey) {
                return {
                    success: false,
                    error: 'Vui lòng cấu hình API key trong settings'
                }
            }

            const policyConfig = AI_PROCESSING_POLICIES[options.policy]
            let prompt: string

            // Tạo prompt theo template
            switch (options.templateType) {
                case 'exercise':
                    prompt = ExerciseTemplateProcessor.generatePrompt(content)
                    break
                case 'lesson':
                    prompt = LessonTemplateProcessor.generatePrompt(content)
                    break
                case 'raw':
                    prompt = options.customPrompt || this.generateRawPrompt(content)
                    break
                default:
                    throw new Error('Invalid template type')
            }

            // TODO: Uncomment when AI SDK is installed
            /*
            console.log('Processing stream with API key:', this.config.apiKey)
            process.env.MISTRAL_API_KEY = this.config.apiKey

            const stream = createStreamableValue()

            // Format history for AI (similar to continueConversation)
            const messages = [
                {
                    role: 'user' as const,
                    content: this.formatPromptForAI(prompt)
                }
            ]

            // Start streaming
            ;(async () => {
                const { textStream } = await streamText({
                    model: mistral(policyConfig.model),
                    system: `Bạn là chuyên gia giáo dục lập trình Python. Hãy chuyển đổi nội dung theo yêu cầu:
- Dịch sang tiếng Việt tự nhiên
- Giữ nguyên 100% test cases gốc  
- Cấu trúc markdown chuẩn
- Giải thích chi tiết dễ hiểu
- Phù hợp cho người mới học`,
                    messages: messages,
                    maxTokens: policyConfig.maxTokens,
                    temperature: policyConfig.temperature,
                })

                for await (const text of textStream) {
                    stream.update(text)
                }

                stream.done()
            })()

            return {
                success: true,
                stream: stream.value
            }
            */

            // Mock stream for development (remove when AI SDK is installed)
            const mockStream = this.createMockStream(content, options)

            return {
                success: true,
                stream: mockStream
            }

        } catch (error) {
            return {
                success: false,
                error: error.message || 'Lỗi xử lý AI stream không xác định'
            }
        }
    }

    /**
     * Tạo prompt raw đơn giản
     */
    private generateRawPrompt(content: ProblemContent): string {
        return `
Hãy chuyển đổi nội dung bài tập lập trình sau sang tiếng Việt với format markdown chuẩn:

Tiêu đề: ${content.title}
Mô tả: ${content.description}

Solutions:
${content.solutions.map((sol, i) => `Solution ${i + 1}:\n${sol}`).join('\n\n')}

Test Cases:
${content.testCases.join('\n')}

Yêu cầu:
- Dịch sang tiếng Việt tự nhiên
- Giữ nguyên 100% test cases
- Thêm comment tiếng Việt vào code
- Cấu trúc markdown rõ ràng
- Giải thích chi tiết
        `
    }

    /**
     * Format prompt for AI (similar to formatUserMessage)
     */
    private formatPromptForAI(content: string): string {
        return `[CONTENT_CONVERSION_REQUEST]\n${content}\n[/CONTENT_CONVERSION_REQUEST]`
    }

    /**
     * Tạo mock response cho development
     */
    private generateMockResponse(content: ProblemContent, options: AIProcessingOptions): string {
        const templateConfig = options.templateType !== 'raw' ?
            require('../template/info-const').TEMPLATE_CONFIGS[options.templateType] : null

        switch (options.templateType) {
            case 'exercise':
                return `# ${content.title} - Bài tập lập trình Python

## 📋 Thông tin bài tập
- **Độ khó:** Trung bình
- **Thời gian:** 30 phút
- **Kiến thức:** Python cơ bản, thuật toán
- **Tags:** python, algorithm, programming

## 🎯 Mô tả bài toán
${content.description}

*Đây là bài tập được chuyển đổi từ tiếng Anh sang tiếng Việt với cấu trúc rõ ràng, dễ hiểu cho người học.*

## 💡 Phân tích
Bài toán này yêu cầu chúng ta hiểu và áp dụng các khái niệm cơ bản của lập trình Python.

## 🔧 Các phương pháp giải

${content.methods.map((method, index) => `
### Phương pháp ${index + 1}: ${method.name}
**Ý tưởng:** ${method.description}

**Code:**
\`\`\`python
# ${method.name} - Giải pháp được tối ưu
${method.sourceCode}
\`\`\`

**Giải thích:**
${method.explanation}

**Độ phức tạp:**
- Thời gian: O(n)
- Không gian: O(1)
`).join('\n')}

## 🧪 Test Cases
${content.testCases.map((testCase, index) => `
**Test Case ${index + 1}:**
\`\`\`
${testCase}
\`\`\`
`).join('\n')}

## 🤔 Bài tập mở rộng
1. Hãy thử tối ưu hóa thuật toán để có độ phức tạp thời gian tốt hơn
2. Viết thêm test cases để kiểm tra các trường hợp đặc biệt
3. Cài đặt phương pháp khác để giải quyết bài toán

## 📚 Tài liệu tham khảo
- [Python Documentation](https://docs.python.org/)
- [Algorithm Design Techniques](https://example.com)

---
*Bài tập được tạo bởi AI Assistant - ${new Date().toLocaleString('vi-VN')}*`

            case 'lesson':
                return `# ${content.title} - Bài học lập trình Python

## 📚 Thông tin bài học
- **Chương:** Python Programming Fundamentals
- **Bài:** 1
- **Thời gian:** 45 phút
- **Độ khó:** Trung bình

## 🎯 Mục tiêu bài học
Sau khi học xong bài này, bạn sẽ:
- Hiểu được các khái niệm cơ bản được trình bày
- Vận dụng được kiến thức vào thực tế
- Phát triển tư duy lập trình logic

## 📋 Kiến thức cần có
- Python cơ bản
- Hiểu về biến và hàm

## 🌟 Giới thiệu
${content.description}

Trong bài học này, chúng ta sẽ tìm hiểu các kỹ thuật lập trình quan trọng thông qua ví dụ thực tế.

## 📖 Lý thuyết

${content.methods.map((method, index) => `
### ${method.name}
${method.description}

**Ví dụ minh họa:**
\`\`\`python
# ${method.name} - Ví dụ thực tế
${method.sourceCode}
\`\`\`

**Giải thích:**
${method.explanation}
`).join('\n')}

## 🛠️ Thực hành

### Bài tập 1: Áp dụng kiến thức
**Yêu cầu:** Thực hành với các ví dụ đã học

**Hướng dẫn:**
1. Đọc hiểu code mẫu
2. Chạy thử với test cases
3. Thử biến đổi và cải tiến

## 🧪 Test Cases
${content.testCases.map((testCase, index) => `
**Test Case ${index + 1}:**
\`\`\`
${testCase}
\`\`\`
`).join('\n')}

## 💡 Tips và Tricks
- Luôn test code với nhiều trường hợp khác nhau
- Viết comment để code dễ hiểu
- Tối ưu hóa sau khi code đã chạy đúng

## 📝 Tóm tắt
Bài học này đã giới thiệu các khái niệm quan trọng trong lập trình Python. Hãy thực hành nhiều để nắm vững kiến thức.

## 🚀 Bước tiếp theo
- Thực hành thêm với các bài tập tương tự
- Tìm hiểu các kỹ thuật nâng cao
- Áp dụng vào dự án thực tế

## 📚 Tài liệu tham khảo
- [Python Tutorial](https://docs.python.org/3/tutorial/)
- [Programming Best Practices](https://example.com)

---
*Bài học được tạo bởi AI Assistant - ${new Date().toLocaleString('vi-VN')}*`

            default:
                return `# Nội dung được AI xử lý

## Thông tin gốc
**Tiêu đề:** ${content.title}
**Mô tả:** ${content.description}

## Nội dung đã chuyển đổi
Đây là nội dung được AI chuyển đổi sang tiếng Việt với format markdown chuẩn.

## Code Examples
${content.solutions.map((solution, index) => `
### Ví dụ ${index + 1}
\`\`\`python
${solution}
\`\`\`
`).join('\n')}

## Test Cases
${content.testCases.map((testCase, index) => `
**Test ${index + 1}:**
\`\`\`
${testCase}
\`\`\`
`).join('\n')}

---
*Được xử lý bởi AI Assistant*`
        }
    }

    /**
     * Tạo mock stream cho development
     */
    private createMockStream(content: ProblemContent, options: AIProcessingOptions): any {
        const mockResponse = this.generateMockResponse(content, options)
        const chunks = mockResponse.match(/.{1,100}/g) || [mockResponse]

        let index = 0

        // Simple mock stream object
        return {
            value: {
                subscribe: (callback: (chunk: string) => void) => {
                    const interval = setInterval(() => {
                        if (index < chunks.length) {
                            callback(chunks[index])
                            index++
                        } else {
                            clearInterval(interval)
                        }
                    }, 200) // Emit chunk every 200ms
                }
            }
        }
    }
}

// Export singleton instance
export const aiActions = new ChatAIActions() 