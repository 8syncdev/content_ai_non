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
    content: string
    url: string
}

export interface AIProcessingOptions {
    templateType: 'exercise' | 'lesson' | 'translate' | 'raw'
    useAI: boolean
    apiKey?: string
}

export interface AIResponse {
    success: boolean
    data?: string
    error?: string
    processingTime?: number
}

export interface AIConfig {
    provider: 'mistral'
    apiKey: string
    model: string
    temperature: number
    maxTokens: number
}

export interface ProgrammingLanguage {
    name: string
    displayName: string
    codeBlock: string
    extension: string
    icon: string
}

export interface BrowserStatus {
    browserExists: boolean
    executablePath: string
    browserDir: string
}

export interface AiContentOptions {
    source: 'upvoted' | 'discussed' | 'latest' | 'tags'
    tag?: string
    articleCount: number
    template: string
    apiKey?: string
}

declare global {
    interface Window {
        electron: {
            scraper: {
                initialize: () => Promise<{ success: boolean; error?: string }>
                getTopics: (url: string) => Promise<{ success: boolean; data?: Topic[]; error?: string }>
                getProblemContent: (url: string) => Promise<{ success: boolean; data?: ProblemContent; error?: string }>
                exportContent: (content: ProblemContent, topicName: string, topicIndex?: number, problemIndex?: number, aiOptions?: AIProcessingOptions) => Promise<{ success: boolean; error?: string }>
                close: () => Promise<{ success: boolean; error?: string }>
            }
            aiContent: {
                initialize: () => Promise<{ success: boolean; error?: string }>
                start: (options: AiContentOptions) => Promise<{ success: boolean; error?: string }>
                close: () => Promise<{ success: boolean; error?: string }>
            }
            ai: {
                processContent: (content: ProblemContent, options: AIProcessingOptions) => Promise<AIResponse>
                setApiKey: (apiKey: string) => Promise<{ success: boolean; error?: string }>
            }
            browser: {
                check: () => Promise<{ success: boolean; data?: BrowserStatus; error?: string }>
                install: () => Promise<{ success: boolean; error?: string }>
                checkAndInstall: () => Promise<{ success: boolean; browserExists?: boolean; error?: string }>
            }
            app: {
                getProgrammingLanguages: () => Promise<{ success: boolean; data?: Record<string, ProgrammingLanguage>; error?: string }>
            }
            ipcRenderer: {
                on: (channel: string, listener: (...args: unknown[]) => void) => (() => void)
                send: (channel: string, ...args: unknown[]) => void
                invoke: (channel: string, ...args: unknown[]) => Promise<any>
            }
            versions: {
                node: () => string
                chrome: () => string
                electron: () => string
            }
        }
    }
} 