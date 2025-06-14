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
            console.log(`🤖 ChatAIActions.processContent called`)
            console.log(`📋 Template: ${options.templateType}, Policy: ${options.policy}`)
            console.log(`📊 Content: ${content.title}`)

            // Validate input
            if (!content || !content.title) {
                throw new Error('Invalid content provided')
            }

            // Log content structure for debugging
            console.log(`📊 Content structure:`)
            console.log(`  - Title: ${content.title}`)
            console.log(`  - Description: ${content.description?.substring(0, 100)}...`)
            console.log(`  - Methods: ${content.methods?.length || 0}`)
            console.log(`  - Test cases: ${content.testCases?.length || 0}`)
            console.log(`  - Solutions: ${content.solutions?.length || 0}`)

            let processedContent: string
            let metadata: any = {}

            // Use template processors to generate proper prompts and responses
            if (options.templateType === 'exercise') {
                console.log(`🎯 Using Exercise Template Processor`)
                const { ExerciseTemplateProcessor } = require('../template/exercise')

                // Generate prompt using template processor
                const prompt = ExerciseTemplateProcessor.generatePrompt(content)
                console.log(`📝 Generated prompt length: ${prompt.length}`)

                // For now, use mock response but with proper template structure
                processedContent = this.generateExerciseResponse(content)

                // Validate output using template processor
                const isValid = ExerciseTemplateProcessor.validateOutput(processedContent)
                console.log(`✅ Template validation: ${isValid}`)

                // Extract metadata using template processor
                metadata = ExerciseTemplateProcessor.extractMetadata(processedContent)
                console.log(`🏷️ Extracted metadata:`, metadata)

            } else if (options.templateType === 'lesson') {
                console.log(`🎯 Using Lesson Template Processor`)
                const { LessonTemplateProcessor } = require('../template/lesson')

                // Generate prompt using template processor
                const prompt = LessonTemplateProcessor.generatePrompt(content)
                console.log(`📝 Generated prompt length: ${prompt.length}`)

                // For now, use mock response but with proper template structure
                processedContent = this.generateLessonResponse(content)

                // Validate output using template processor
                const isValid = LessonTemplateProcessor.validateOutput(processedContent)
                console.log(`✅ Template validation: ${isValid}`)

                // Extract metadata using template processor
                metadata = LessonTemplateProcessor.extractMetadata(processedContent)
                console.log(`🏷️ Extracted metadata:`, metadata)

            } else {
                console.log(`📝 Using raw processing`)
                processedContent = this.generateRawResponse(content)
                metadata = {
                    title: content.title,
                    processingType: 'raw'
                }
            }

            const processingTime = Date.now() - startTime
            console.log(`⏱️ Processing completed in ${processingTime}ms`)
            console.log(`📏 Output length: ${processedContent.length} characters`)

            return {
                success: true,
                data: processedContent,
                processingTime,
                metadata,
                rawResponse: processedContent
            }

        } catch (error) {
            const processingTime = Date.now() - startTime
            console.error(`❌ AI processing error:`, error)

            return {
                success: false,
                error: error.message,
                processingTime
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
     * Tạo response theo template exercise
     */
    private generateExerciseResponse(content: ProblemContent): string {
        const { BRAND_INFO } = require('../template/info-const')

        // Dịch đề bài sang tiếng Việt
        const vietnameseTitle = this.translateTitle(content.title)
        const vietnameseDescription = this.translateDescription(content.description)

        return `# ${vietnameseTitle}

## 📝 Đề bài
${vietnameseDescription}

## 💡 Giải thích đề bài
Hãy cùng phân tích yêu cầu của bài tập này một cách chi tiết:

- **Mục tiêu:** Hiểu và áp dụng các khái niệm lập trình cơ bản để giải quyết vấn đề thực tế
- **Input:** Dữ liệu đầu vào sẽ được cung cấp theo định dạng cụ thể trong đề bài
- **Output:** Chương trình cần trả về kết quả chính xác theo yêu cầu đã nêu
- **Thuật ngữ cần biết:** 
  - *Biến (Variable)*: Vùng nhớ để lưu trữ dữ liệu trong chương trình
  - *Hàm (Function)*: Khối lệnh thực hiện một nhiệm vụ cụ thể
  - *Vòng lặp (Loop)*: Cấu trúc để lặp lại một đoạn code nhiều lần
  - *Điều kiện (Condition)*: Cấu trúc để kiểm tra và thực hiện các hành động khác nhau

## 🧪 Test Cases
${this.generateTestCasesSection(content)}

## 🔍 Giải thích Test Cases
${this.generateTestCasesExplanation(content)}

## 💻 Code và Giải thích

${content.methods.map((method, index) => `
### Phương pháp ${index + 1}: ${this.translateMethodName(method.name)}
**Ý tưởng:** ${this.translateDescription(method.description)}

\`\`\`python
${method.sourceCode.split('\n').map(line => {
            if (line.trim() === '') return line;
            // Thêm comment tiếng Việt cho từng dòng code
            const comment = line.includes('def ') ? '# Định nghĩa hàm' :
                line.includes('return') ? '# Trả về kết quả' :
                    line.includes('for ') ? '# Vòng lặp for' :
                        line.includes('while ') ? '# Vòng lặp while' :
                            line.includes('if ') ? '# Điều kiện if' :
                                line.includes('elif ') ? '# Điều kiện elif' :
                                    line.includes('else') ? '# Trường hợp còn lại' :
                                        line.includes('print') ? '# In kết quả ra màn hình' :
                                            line.includes('input') ? '# Nhập dữ liệu từ người dùng' :
                                                line.includes('=') && !line.includes('==') ? '# Gán giá trị cho biến' :
                                                    '# Thực hiện phép tính';
            return line + '  ' + comment;
        }).join('\n')}
\`\`\`

**Giải thích chi tiết:**
1. **Khởi tạo:** Định nghĩa các biến và hàm cần thiết
2. **Xử lý logic:** Thực hiện thuật toán chính để giải quyết bài toán
3. **Trả về kết quả:** Xuất ra kết quả cuối cùng theo yêu cầu

**Độ phức tạp:**
- **Thời gian:** ${this.extractTimeComplexity(method.complexity)} - Phụ thuộc vào kích thước dữ liệu đầu vào
- **Không gian:** O(1) - Sử dụng bộ nhớ cố định
`).join('\n')}

## 📚 Tài liệu tham khảo

### Học thêm:
- [Python Cơ bản - Hướng dẫn cho người mới bắt đầu](https://docs.python.org/3/tutorial/)
- [Thuật toán và Cấu trúc dữ liệu cơ bản](https://www.geeksforgeeks.org/python-programming-language/)
- [Luyện tập lập trình online miễn phí](https://www.hackerrank.com/domains/python)
- [Khóa học Python miễn phí](https://www.codecademy.com/learn/learn-python-3)

### Câu hỏi mở rộng:
1. Bạn có thể tối ưu hóa thuật toán này để chạy nhanh hơn không?
2. Nếu thay đổi điều kiện đầu vào, code cần sửa đổi như thế nào?
3. Có cách nào khác để giải quyết bài toán này không?
4. Làm thế nào để xử lý các trường hợp đặc biệt (edge cases)?

---
${BRAND_INFO}`
    }

    /**
     * Dịch tiêu đề sang tiếng Việt
     */
    private translateTitle(title: string): string {
        const translations = {
            'Python Program to Check if a Number is Odd or Even': 'Chương trình Python kiểm tra số chẵn lẻ',
            'Python Program to Check Whether a Number is Positive or Negative': 'Chương trình Python kiểm tra số dương âm',
            'Python Program to Print All Odd Numbers in a Range': 'Chương trình Python in tất cả số lẻ trong khoảng',
            'Palindrome Program in Python': 'Chương trình kiểm tra số palindrome trong Python',
            'Python Program to Reverse a Number': 'Chương trình Python đảo ngược số',
            'Python Program to Print All Integers that Aren\'t Divisible by Either 2 or 3': 'Chương trình Python in số không chia hết cho 2 hoặc 3'
        }

        return translations[title] || title
    }

    /**
     * Dịch mô tả sang tiếng Việt
     */
    private translateDescription(description: string): string {
        if (!description) return 'Viết chương trình Python để giải quyết bài toán được yêu cầu.'

        const translations = {
            'Write a Python Program to check whether a given number is even or odd.': 'Viết chương trình Python kiểm tra một số cho trước là chẵn hay lẻ.',
            'Write a Python program to check whether a number is positive or negative.': 'Viết chương trình Python kiểm tra một số là dương hay âm.',
            'Write a Python program to print all odd numbers in a range.': 'Viết chương trình Python in tất cả các số lẻ trong một khoảng cho trước.',
            'Write a Python program to check if a number is a palindrome.': 'Viết chương trình Python kiểm tra một số có phải là palindrome hay không.',
            'Write a Python program to reverse a number.': 'Viết chương trình Python đảo ngược một số.',
        }

        return translations[description] || description
    }

    /**
     * Dịch tên phương pháp
     */
    private translateMethodName(methodName: string): string {
        const translations = {
            'Method 1': 'Phương pháp sử dụng toán tử modulus',
            'Method 2': 'Phương pháp sử dụng toán tử bitwise',
            'Method 3': 'Phương pháp sử dụng đệ quy',
            'Method 4': 'Phương pháp sử dụng lambda function'
        }

        return translations[methodName] || methodName
    }

    /**
     * Tạo section test cases
     */
    private generateTestCasesSection(content: ProblemContent): string {
        // Lấy test cases từ methods hoặc từ content chính
        let allTestCases: string[] = []

        // Lấy từ methods trước
        content.methods.forEach(method => {
            allTestCases = allTestCases.concat(method.testCases)
        })

        // Nếu không có, lấy từ content chính
        if (allTestCases.length === 0) {
            allTestCases = content.testCases || []
        }

        if (allTestCases.length === 0) {
            return `**Ví dụ test case:**
\`\`\`
Input: 4
Output: 4 is an even number.

Input: 7  
Output: 7 is an odd number.
\`\`\``
        }

        return allTestCases.map((testCase, index) => `
**Test Case ${index + 1}:**
\`\`\`
${testCase}
\`\`\`
`).join('')
    }

    /**
     * Tạo giải thích test cases
     */
    private generateTestCasesExplanation(content: ProblemContent): string {
        return `Để hiểu rõ bài tập, hãy cùng phân tích các test cases:

- **Test Case 1:** Đây là một ví dụ minh họa cách chương trình hoạt động với dữ liệu đầu vào cụ thể.
- **Test Case 2:** Cho thấy cách chương trình xử lý trường hợp khác, giúp bạn hiểu rõ logic của bài toán.

**Kết luận:** Các test cases này giúp bạn hiểu rõ logic của bài toán và có thể sử dụng để kiểm tra tính đúng đắn của code.`
    }

    /**
     * Trích xuất time complexity
     */
    private extractTimeComplexity(complexity: string): string {
        if (!complexity) return 'O(1)'

        const match = complexity.match(/Time Complexity:\s*([^.\n]+)/)
        if (match) {
            return match[1].trim()
        }

        if (complexity.includes('O(')) {
            const oMatch = complexity.match(/O\([^)]+\)/)
            return oMatch ? oMatch[0] : 'O(1)'
        }

        return 'O(1)'
    }

    /**
     * Tạo response theo template lesson
     */
    private generateLessonResponse(content: ProblemContent): string {
        const { BRAND_INFO } = require('../template/info-const')

        return `# ${content.title} - Bài học lập trình

## 📚 Thông tin bài học
- **Chủ đề:** Lập trình cơ bản
- **Thời gian học:** 30-45 phút
- **Độ khó:** Dành cho người mới bắt đầu
- **Kỹ năng đạt được:** Hiểu và áp dụng các khái niệm lập trình cơ bản

## 🎯 Mục tiêu bài học
Sau khi học xong bài này, bạn sẽ có thể:
- Hiểu được các khái niệm lập trình cơ bản được trình bày
- Vận dụng kiến thức vào việc giải quyết các bài toán thực tế
- Phát triển tư duy logic và kỹ năng giải quyết vấn đề
- Viết code đơn giản và hiệu quả

## 📋 Kiến thức cần có trước
- Hiểu biết cơ bản về máy tính
- Đã cài đặt môi trường lập trình Python
- Biết cách chạy chương trình Python đơn giản

## 🌟 Giới thiệu chủ đề
${content.description}

Trong bài học này, chúng ta sẽ tìm hiểu các kỹ thuật lập trình quan trọng thông qua các ví dụ thực tế và dễ hiểu.

## 📖 Nội dung lý thuyết

${content.methods.map((method, index) => `
### ${index + 1}. ${method.name}
**Khái niệm:** ${method.description}

**Ví dụ minh họa:**
\`\`\`python
${method.sourceCode}
\`\`\`

**Giải thích chi tiết:**
${method.explanation || 'Đây là một kỹ thuật quan trọng trong lập trình, giúp giải quyết bài toán một cách hiệu quả.'}

**Ứng dụng thực tế:**
- Sử dụng trong các bài toán tương tự
- Có thể mở rộng cho các trường hợp phức tạp hơn
- Là nền tảng cho các kỹ thuật nâng cao
`).join('\n')}

## 🛠️ Thực hành

### Bài tập thực hành
**Yêu cầu:** Áp dụng kiến thức đã học để thực hành

**Hướng dẫn thực hiện:**
1. Đọc hiểu code mẫu một cách kỹ lưỡng
2. Chạy thử với các test cases được cung cấp
3. Thử nghiệm với dữ liệu khác nhau
4. Tự tạo thêm test cases để kiểm tra

## 🧪 Test Cases để thực hành
${content.testCases.map((testCase, index) => `
**Test Case ${index + 1}:**
\`\`\`
${testCase}
\`\`\`
`).join('')}

## 💡 Mẹo và Kinh nghiệm
- **Luôn test code:** Kiểm tra với nhiều trường hợp khác nhau trước khi hoàn thành
- **Viết comment:** Thêm ghi chú để code dễ hiểu và bảo trì
- **Tối ưu từ từ:** Viết code chạy đúng trước, sau đó mới tối ưu hóa
- **Học từ lỗi:** Mỗi lỗi là một cơ hội học hỏi quý giá

## 📝 Tóm tắt bài học
Bài học này đã giới thiệu các khái niệm quan trọng trong lập trình. Những kiến thức này sẽ là nền tảng vững chắc cho việc học các chủ đề nâng cao hơn.

**Điểm chính cần nhớ:**
- Hiểu rõ logic trước khi viết code
- Thực hành thường xuyên để nắm vững kiến thức
- Không ngại thử nghiệm và mắc lỗi

## 🚀 Bước tiếp theo
- Thực hành thêm với các bài tập tương tự
- Tìm hiểu các kỹ thuật lập trình nâng cao
- Áp dụng kiến thức vào các dự án thực tế
- Tham gia cộng đồng lập trình để học hỏi

## 📚 Tài liệu tham khảo thêm
- [Hướng dẫn Python chính thức](https://docs.python.org/3/tutorial/)
- [Khóa học lập trình miễn phí](https://www.codecademy.com/)
- [Cộng đồng lập trình Việt Nam](https://viblo.asia/)
- [Thực hành lập trình online](https://www.hackerrank.com/)

---
${BRAND_INFO}`
    }

    /**
     * Tạo response cho raw content
     */
    private generateRawResponse(content: ProblemContent): string {
        return `# ${content.title}

## Thông tin gốc
**Tiêu đề:** ${content.title}
**Mô tả:** ${content.description}
**URL:** ${content.url}

## Nội dung đã chuyển đổi
Đây là nội dung được AI chuyển đổi sang tiếng Việt với định dạng markdown chuẩn.

## Các phương pháp giải
${content.methods.map((method, index) => `
### Phương pháp ${index + 1}: ${method.name}
**Mô tả:** ${method.description}

\`\`\`python
${method.sourceCode}
\`\`\`

**Giải thích:** ${method.explanation}
**Độ phức tạp:** ${method.complexity}
`).join('\n')}

## Test Cases
${content.testCases.map((testCase, index) => `
**Test ${index + 1}:**
\`\`\`
${testCase}
\`\`\`
`).join('\n')}

---
*Được xử lý bởi AI Assistant - ${new Date().toLocaleString('vi-VN')}*`
    }

    /**
     * Tạo mock stream cho development
     */
    private createMockStream(content: ProblemContent, options: AIProcessingOptions): any {
        // Tạo response dựa trên template type
        let responseText: string
        switch (options.templateType) {
            case 'exercise':
                responseText = this.generateExerciseResponse(content)
                break
            case 'lesson':
                responseText = this.generateLessonResponse(content)
                break
            default:
                responseText = this.generateRawResponse(content)
                break
        }

        // Tạo mock stream từ response text
        const chunks = responseText.split('\n')
        let currentIndex = 0

        return {
            getReader: () => ({
                read: async () => {
                    if (currentIndex >= chunks.length) {
                        return { done: true, value: undefined }
                    }

                    const chunk = chunks[currentIndex] + '\n'
                    currentIndex++

                    // Simulate streaming delay
                    await new Promise(resolve => setTimeout(resolve, 50))

                    return {
                        done: false,
                        value: new TextEncoder().encode(chunk)
                    }
                }
            })
        }
    }
}

// Export singleton instance
export const aiActions = new ChatAIActions() 