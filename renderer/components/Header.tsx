import React from 'react'
import { useApp } from '../contexts/AppContext'
import { Bell, Search, User, Settings } from 'lucide-react'

export default function Header() {
    const { state } = useApp()

    return (
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">
                        Trình tạo nội dung bài tập lập trình
                    </h2>
                    <p className="text-sm text-gray-600">
                        Thu thập và quản lý bài tập từ Sanfoundry
                    </p>
                </div>

                {/* Progress Info */}
                {state.progress.isRunning && (
                    <div className="flex items-center space-x-4 mr-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-2 border border-blue-200">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                <div className="text-sm">
                                    <div className="font-semibold text-blue-700">
                                        Đang xử lý...
                                    </div>
                                    <div className="text-blue-600 text-xs">
                                        {state.progress.completedProblems}/{state.progress.totalProblems} bài tập
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                    <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors relative">
                        <Bell className="w-5 h-5" />
                        {state.progress.isRunning && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        )}
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="pl-3 border-l border-gray-200">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-sm">
                                <div className="font-medium text-gray-800">Admin</div>
                                <div className="text-gray-500 text-xs">Quản trị viên</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
} 