import React from 'react'
import { cn } from '../lib/utils'
import { useApp } from '../contexts/AppContext'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const { state } = useApp()

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <Sidebar />
            <div className={cn(
                "flex-1 flex flex-col transition-all duration-300",
                state.sidebarOpen ? "ml-64" : "ml-16"
            )}>
                <Header />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
} 