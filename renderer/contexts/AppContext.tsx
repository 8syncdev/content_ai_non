import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface Topic {
    name: string
    id: string
    links: ProblemLink[]
}

export interface ProblemLink {
    title: string
    url: string
}

export interface ScrapingProgress {
    currentTopic: string
    currentProblem: string
    completedProblems: number
    totalProblems: number
    isRunning: boolean
}

interface AppState {
    topics: Topic[]
    progress: ScrapingProgress
    sidebarOpen: boolean
}

interface AppAction {
    type: 'SET_TOPICS' | 'SET_PROGRESS' | 'TOGGLE_SIDEBAR' | 'RESET_PROGRESS'
    payload?: any
}

const initialState: AppState = {
    topics: [],
    progress: {
        currentTopic: '',
        currentProblem: '',
        completedProblems: 0,
        totalProblems: 0,
        isRunning: false
    },
    sidebarOpen: true
}

function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_TOPICS':
            return { ...state, topics: action.payload }
        case 'SET_PROGRESS':
            return { ...state, progress: { ...state.progress, ...action.payload } }
        case 'TOGGLE_SIDEBAR':
            return { ...state, sidebarOpen: !state.sidebarOpen }
        case 'RESET_PROGRESS':
            return { ...state, progress: initialState.progress }
        default:
            return state
    }
}

const AppContext = createContext<{
    state: AppState
    dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState)

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
} 