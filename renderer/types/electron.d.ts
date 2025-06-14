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
    methods: ProblemMethod[]
    solutions: string[]
    testCases: string[]
    url: string
}

export interface ProblemMethod {
    name: string
    description: string
    sourceCode: string
    explanation: string
    testCases: string[]
    complexity: string
}

declare global {
    interface Window {
        electron: {
            scraper: {
                initialize: () => Promise<{ success: boolean; error?: string }>
                getTopics: (url: string) => Promise<{ success: boolean; data?: Topic[]; error?: string }>
                getProblemContent: (url: string) => Promise<{ success: boolean; data?: ProblemContent; error?: string }>
                exportContent: (content: ProblemContent, topicName: string, topicIndex?: number, problemIndex?: number) => Promise<{ success: boolean; error?: string }>
                close: () => Promise<{ success: boolean; error?: string }>
            }
            versions: {
                node: () => string
                chrome: () => string
                electron: () => string
            }
        }
    }
} 