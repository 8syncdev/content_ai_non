// Cấu hình AI Provider
export interface AIConfig {
    provider: 'mistral'
    apiKey: string
    model: string
    temperature: number
    maxTokens: number
}

export const DEFAULT_AI_CONFIG: AIConfig = {
    provider: 'mistral',
    apiKey: 'AhjH8mbZ51JANWzJRbkbBsESb4rQQKmu', // User must provide their own key
    model: 'devstral-small-2505',
    temperature: 0.7,
    maxTokens: 4000
}

// Cấu hình templates
export type TemplateType = 'exercise' | 'lesson' | 'raw'

export const TEMPLATES = {
    exercise: {
        name: 'Bài tập',
        description: 'Chuyển thành bài tập lập trình tiếng Việt',
        icon: '📝'
    },
    lesson: {
        name: 'Bài học',
        description: 'Chuyển thành bài học có cấu trúc',
        icon: '📚'
    },
    raw: {
        name: 'Gốc',
        description: 'Giữ nguyên định dạng gốc',
        icon: '📄'
    }
}

// Brand information
export const BRAND_INFO = `
---
Tác giả: Nguyễn Phương Anh Tú   
Phone/Zalo: 0767449819
` 