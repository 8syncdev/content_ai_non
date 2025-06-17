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
    temperature: 0.85,
    maxTokens: 4000
}

// Cấu hình templates
export type TemplateType = 'exercise' | 'lesson' | 'translate' | 'raw'

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
    translate: {
        name: 'Dịch ngôn ngữ',
        description: 'Chuyển đổi giữa các ngôn ngữ lập trình',
        icon: '🔄'
    },
    raw: {
        name: 'Gốc',
        description: 'Giữ nguyên định dạng gốc',
        icon: '📄'
    }
}

// Ngôn ngữ lập trình được hỗ trợ
export interface ProgrammingLanguage {
    name: string
    displayName: string
    codeBlock: string
    extension: string
    icon: string
}

export const PROGRAMMING_LANGUAGES: Record<string, ProgrammingLanguage> = {
    python: {
        name: 'python',
        displayName: 'Python',
        codeBlock: 'python',
        extension: 'py',
        icon: '🐍'
    },
    javascript: {
        name: 'javascript',
        displayName: 'JavaScript',
        codeBlock: 'javascript',
        extension: 'js',
        icon: '📜'
    },
    typescript: {
        name: 'typescript',
        displayName: 'TypeScript',
        codeBlock: 'typescript',
        extension: 'ts',
        icon: '🔷'
    },
    java: {
        name: 'java',
        displayName: 'Java',
        codeBlock: 'java',
        extension: 'java',
        icon: '☕'
    },
    csharp: {
        name: 'csharp',
        displayName: 'C#',
        codeBlock: 'csharp',
        extension: 'cs',
        icon: '💎'
    },
    cpp: {
        name: 'cpp',
        displayName: 'C++',
        codeBlock: 'cpp',
        extension: 'cpp',
        icon: '⚡'
    },
    c: {
        name: 'c',
        displayName: 'C',
        codeBlock: 'c',
        extension: 'c',
        icon: '🔧'
    },
    go: {
        name: 'go',
        displayName: 'Go',
        codeBlock: 'go',
        extension: 'go',
        icon: '🚀'
    },
    rust: {
        name: 'rust',
        displayName: 'Rust',
        codeBlock: 'rust',
        extension: 'rs',
        icon: '🦀'
    },
    php: {
        name: 'php',
        displayName: 'PHP',
        codeBlock: 'php',
        extension: 'php',
        icon: '🐘'
    },
    ruby: {
        name: 'ruby',
        displayName: 'Ruby',
        codeBlock: 'ruby',
        extension: 'rb',
        icon: '💎'
    },
    kotlin: {
        name: 'kotlin',
        displayName: 'Kotlin',
        codeBlock: 'kotlin',
        extension: 'kt',
        icon: '🎯'
    },
    swift: {
        name: 'swift',
        displayName: 'Swift',
        codeBlock: 'swift',
        extension: 'swift',
        icon: '🦉'
    },
    dart: {
        name: 'dart',
        displayName: 'Dart',
        codeBlock: 'dart',
        extension: 'dart',
        icon: '🎯'
    }
}

// Brand information
export const BRAND_INFO = `
---
Tác giả: Nguyễn Phương Anh Tú   
Phone/Zalo: 0767449819
` 