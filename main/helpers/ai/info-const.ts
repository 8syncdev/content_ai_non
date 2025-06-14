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
    apiKey: '', // User must provide their own key
    model: 'pixtral-12b-2409',
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