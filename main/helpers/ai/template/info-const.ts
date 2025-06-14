// Cấu hình AI Provider
export interface AIProviderConfig {
    provider: 'mistral' | 'openai' | 'claude'
    apiKey: string
    model: string
    temperature: number
    maxTokens: number
}

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
    provider: 'mistral',
    apiKey: 'AhjH8mbZ51JANWzJRbkbBsESb4rQQKmu', // Default key - user should override
    model: 'pixtral-12b-2409',
    temperature: 0.7,
    maxTokens: 4000
}

// Các chính sách xử lý AI
export const AI_PROCESSING_POLICIES = {
    fast: {
        name: 'Xử lý nhanh',
        model: 'pixtral-12b-2409',
        maxTokens: 3000,
        temperature: 0.3,
        description: 'Xử lý nhanh, phù hợp cho content đơn giản'
    },
    balanced: {
        name: 'Cân bằng',
        model: 'pixtral-12b-2409',
        maxTokens: 4000,
        temperature: 0.7,
        description: 'Cân bằng giữa chất lượng và tốc độ'
    },
    quality: {
        name: 'Chất lượng cao',
        model: 'pixtral-12b-2409',
        maxTokens: 6000,
        temperature: 0.5,
        description: 'Xử lý chất lượng cao, phù hợp cho content phức tạp'
    }
} as const

export type ProcessingPolicy = keyof typeof AI_PROCESSING_POLICIES

// Cấu hình templates
export const TEMPLATE_CONFIGS = {
    exercise: {
        name: 'Bài tập lập trình',
        description: 'Chuyển đổi nội dung crawl thành bài tập có cấu trúc tiếng Việt',
        icon: '📝',
        maxTokens: 5000,
        outputFormat: 'markdown' as const,
        features: [
            'Dịch sang tiếng Việt tự nhiên',
            'Cấu trúc markdown chuẩn',
            'Giải thích code chi tiết',
            'Giữ nguyên test cases gốc',
            'Thêm ví dụ minh họa'
        ]
    },
    lesson: {
        name: 'Bài học',
        description: 'Chuyển đổi thành bài học có cấu trúc rõ ràng cho người mới học',
        icon: '📚',
        maxTokens: 6000,
        outputFormat: 'markdown' as const,
        features: [
            'Ngôn ngữ dễ hiểu cho người mới',
            'Bố cục bài học logic',
            'Ví dụ thực tế phong phú',
            'Câu hỏi ôn tập',
            'Tài liệu tham khảo'
        ]
    }
} as const

export type TemplateType = keyof typeof TEMPLATE_CONFIGS

// System prompts chung
export const COMMON_SYSTEM_RULES = `
QUAN TRỌNG - QUY TẮC BẮT BUỘC:
1. **Giữ nguyên 100% test cases gốc** - Không được thay đổi input/output của test cases
2. **Giữ nguyên code gốc** - Chỉ thêm comment tiếng Việt, không sửa logic
3. **Dịch tự nhiên** - Không dịch máy, phải tự nhiên như người Việt viết
4. **Cấu trúc markdown chuẩn** - Sử dụng heading, subheading, code blocks đúng format
5. **Giải thích chi tiết** - Mỗi đoạn code phải có giải thích dễ hiểu
6. **Phù hợp người mới** - Ngôn ngữ đơn giản, tránh thuật ngữ phức tạp
7. **Thêm giá trị** - Bổ sung ví dụ, tips, best practices
8. **Links tham khảo** - Thêm nguồn học thêm nếu có thể

PHONG CÁCH VIẾT:
- Câu ngắn, rõ ràng
- Sử dụng emoji phù hợp
- Tạo cảm giác thân thiện
- Khuyến khích người học
`

// Brand information
export const BRAND_INFO = `Tác giả: Nguyễn Phương Anh Tú
Facebook: https://www.facebook.com/dev.alex.698447
Phone: 0767449819` 