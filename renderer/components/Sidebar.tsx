import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
    Home,
    FileText,
    Settings,
    Download,
    ChevronLeft,
    ChevronRight,
    Activity,
    Code2,
    Sparkles
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useApp } from '../contexts/AppContext'

const navigationItems = [
    {
        name: 'Trang chủ',
        href: '/home',
        icon: Home,
        color: 'text-blue-600',
        hoverColor: 'hover:bg-blue-50'
    },
    {
        name: 'Thu thập dữ liệu',
        href: '/scraper',
        icon: Download,
        color: 'text-green-600',
        hoverColor: 'hover:bg-green-50'
    },
    {
        name: 'Quản lý nội dung',
        href: '/next',
        icon: FileText,
        color: 'text-indigo-600',
        hoverColor: 'hover:bg-indigo-50'
    },
    {
        name: 'Sinh nội dung AI',
        href: '/ai-content',
        icon: Sparkles,
        color: 'text-purple-600',
        hoverColor: 'hover:bg-purple-50'
    },
    {
        name: 'Theo dõi tiến độ',
        href: '/progress',
        icon: Activity,
        color: 'text-orange-600',
        hoverColor: 'hover:bg-orange-50'
    },
    {
        name: 'Cài đặt',
        href: '/settings',
        icon: Settings,
        color: 'text-gray-600',
        hoverColor: 'hover:bg-gray-50'
    }
]

export default function Sidebar() {
    const { state, dispatch } = useApp()
    const router = useRouter()

    const toggleSidebar = () => {
        dispatch({ type: 'TOGGLE_SIDEBAR' })
    }

    return (
        <div className={cn(
            "fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 z-50",
            state.sidebarOpen ? "w-64" : "w-16"
        )}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="flex items-center justify-between">
                    {state.sidebarOpen && (
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Code2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg">Content Creator</h2>
                                <p className="text-blue-100 text-xs">v1.0.0</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                        {state.sidebarOpen ? (
                            <ChevronLeft className="w-5 h-5" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {navigationItems.map((item) => {
                    const isActive = router.pathname === item.href
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "flex items-center p-3 rounded-xl transition-all duration-200 group cursor-pointer",
                                isActive
                                    ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105`
                                    : `text-gray-700 ${item.hoverColor} hover:shadow-md`,
                                state.sidebarOpen ? "justify-start" : "justify-center"
                            )}>
                                <div className={cn(
                                    "p-2 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-white/20"
                                        : "group-hover:scale-110"
                                )}>
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-white" : item.color
                                    )} />
                                </div>
                                {state.sidebarOpen && (
                                    <span className={cn(
                                        "ml-3 font-medium transition-colors text-sm",
                                        isActive ? "text-white" : "text-gray-700"
                                    )}>
                                        {item.name}
                                    </span>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            {state.sidebarOpen && (
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">Trạng thái</p>
                                <p className="text-xs text-gray-600">
                                    {state.progress.isRunning ? '🟢 Đang chạy' : '🔴 Dừng'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 