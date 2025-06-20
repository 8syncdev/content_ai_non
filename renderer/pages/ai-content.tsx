import React, { useState, useEffect } from 'react'
import { AppProvider, useApp } from '../contexts/AppContext'
import Layout from '../components/Layout'
import BrowserStatus from '../components/BrowserStatus'
import {
    Sparkles,
    Bot,
    Settings,
    Download,
    Search,
    Globe,
    Database,
    Archive,
    Activity,
    Zap,
    Target,
    TrendingUp,
    CheckSquare,
    Brain,
    Wand2,
    RefreshCw,
    Play,
    Square,
    FileText,
    AlertCircle,
    CheckCircle,
    Loader,
    Clock,
    Image,
    ArrowRight
} from 'lucide-react'

type SourceType = 'upvoted' | 'discussed' | 'latest' | 'tags'

function AiContentPage() {
    const { state, dispatch } = useApp()
    const [isInitialized, setIsInitialized] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [source, setSource] = useState<SourceType>('upvoted')
    const [tag, setTag] = useState('')
    const [articleCount, setArticleCount] = useState(10)
    const [template, setTemplate] = useState(
        'Viết lại bài viết sau theo phong cách content marketing chuyên nghiệp, tập trung vào việc thu hút khách hàng cho thương hiệu [TÊN THƯƠNG HIỆU CỦA BẠN]. Nội dung cần:\n\n1. 100% tiếng Việt tự nhiên và dễ hiểu\n2. Chuẩn SEO với từ khóa phù hợp\n3. Có call-to-action hấp dẫn\n4. Tone giọng chuyên nghiệp nhưng thân thiện\n5. Tạo giá trị thực sự cho người đọc\n\nHãy tạo ra một bài viết hoàn chỉnh với tiêu đề, nội dung chính và kết luận.'
    )
    const [apiKey, setApiKey] = useState('')
    const [progress, setProgress] = useState<string[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [browserReady, setBrowserReady] = useState(false)
    const [stats, setStats] = useState({
        totalArticles: 0,
        processedArticles: 0,
        successRate: 0,
        exportedFiles: 0
    })
    const [currentStatus, setCurrentStatus] = useState({
        currentArticle: '',
        progress: { current: 0, total: 0 }
    })

    const sourceOptions = [
        {
            value: 'upvoted',
            label: 'Bài viết nhiều votes nhất',
            description: 'Những bài viết được cộng đồng vote cao nhất',
            icon: '👍',
            url: 'https://app.daily.dev/posts/upvoted'
        },
        {
            value: 'discussed',
            label: 'Bài viết nhiều bình luận nhất',
            description: 'Những bài viết có nhiều thảo luận và tương tác',
            icon: '💬',
            url: 'https://app.daily.dev/posts/discussed'
        },
        {
            value: 'latest',
            label: 'Bài viết mới nhất',
            description: 'Những bài viết được đăng gần đây nhất',
            icon: '🆕',
            url: 'https://app.daily.dev/posts/latest'
        },
        {
            value: 'tags',
            label: 'Theo tags cụ thể',
            description: 'Chọn bài viết theo chủ đề quan tâm',
            icon: '🏷️',
            url: 'https://app.daily.dev/tags'
        }
    ]

    const handleBrowserStatusChange = (status: { browserExists: boolean; isInstalling: boolean }) => {
        setBrowserReady(status.browserExists && !status.isInstalling)
    }

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString()
        setProgress(prev => [...prev, `[${timestamp}] ${message}`])
    }

    const initializeScraper = async () => {
        if (!window.electron) {
            addLog('❌ Electron API không khả dụng')
            return
        }

        setIsLoading(true)
        addLog('🔄 Khởi tạo AI Content Generator...')

        try {
            // First check if browser exists, if not auto-install
            addLog('🔍 Kiểm tra browser...')
            const browserCheck = await window.electron.browser.check()

            if (!browserCheck.success || !browserCheck.data?.browserExists) {
                addLog('📦 Browser chưa có, bắt đầu cài đặt tự động...')
                const installResult = await window.electron.browser.checkAndInstall()

                if (!installResult.success) {
                    addLog(`❌ Lỗi cài đặt browser: ${installResult.error}`)
                    return
                }
                addLog('✅ Browser đã được cài đặt thành công!')
            } else {
                addLog('✅ Browser đã sẵn sàng')
            }

            // Now initialize AI Content Generator
            const result = await window.electron.aiContent.initialize()
            if (result.success) {
                setIsInitialized(true)
                addLog('✅ AI Content Generator đã sẵn sàng')
            } else {
                addLog(`❌ Lỗi khởi tạo: ${result.error}`)
            }
        } catch (error) {
            addLog(`❌ Lỗi khởi tạo: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleStart = async () => {
        if (!isInitialized) {
            addLog('❌ Vui lòng khởi tạo AI Content Generator trước khi bắt đầu')
            return
        }

        if (source === 'tags' && !tag.trim()) {
            addLog('❌ Vui lòng nhập tag khi chọn nguồn "Theo tags"')
            return
        }

        setIsRunning(true)
        setCurrentStatus({
            currentArticle: '',
            progress: { current: 0, total: articleCount }
        })
        setStats({
            totalArticles: articleCount,
            processedArticles: 0,
            successRate: 0,
            exportedFiles: 0
        })

        const selectedSource = sourceOptions.find(s => s.value === source)
        addLog(`🚀 Bắt đầu thu thập ${articleCount} bài viết từ: ${selectedSource?.label}`)

        if (source === 'tags') {
            addLog(`🏷️ Tag được chọn: ${tag}`)
        }

        addLog(`🤖 Template AI: ${template.substring(0, 100)}...`)

        try {
            // Gọi API backend để xử lý
            const result = await window.electron.aiContent.start({
                source,
                tag: source === 'tags' ? tag : undefined,
                articleCount,
                template,
                apiKey
            })

            if (result.success) {
                addLog('✅ Bắt đầu xử lý thành công')
            } else {
                addLog(`❌ Lỗi bắt đầu xử lý: ${result.error}`)
                setIsRunning(false)
            }
        } catch (error) {
            addLog(`❌ Lỗi: ${error.message}`)
            setIsRunning(false)
        }
    }

    const stopProcessing = () => {
        setIsRunning(false)
        addLog('⏹️ Đã dừng xử lý')
    }

    const clearLogs = () => {
        setProgress([])
    }

    useEffect(() => {
        initializeScraper()

        // Lắng nghe progress events
        const handleProgress = (message: string) => {
            addLog(message)

            // Update stats nếu có pattern match
            if (message.includes('[') && message.includes('/')) {
                const match = message.match(/\[(\d+)\/(\d+)\]/)
                if (match) {
                    const current = parseInt(match[1])
                    const total = parseInt(match[2])
                    setCurrentStatus(prev => ({
                        ...prev,
                        progress: { current, total }
                    }))
                    setStats(prev => ({
                        ...prev,
                        processedArticles: current
                    }))
                }
            }

            if (message.includes('Đang xử lý:')) {
                const articleMatch = message.match(/Đang xử lý: (.+)/)
                if (articleMatch) {
                    setCurrentStatus(prev => ({
                        ...prev,
                        currentArticle: articleMatch[1]
                    }))
                }
            }

            if (message.includes('✅') && message.includes('Đã lưu')) {
                setStats(prev => ({
                    ...prev,
                    exportedFiles: prev.exportedFiles + 1,
                    successRate: Math.round(((prev.exportedFiles + 1) / Math.max(prev.processedArticles, 1)) * 100)
                }))
            }
        }

        const handleDone = (message: string) => {
            addLog(message)
            setIsRunning(false)
            addLog('🎉 Hoàn thành tạo nội dung AI!')
        }

        const cleanupProgress = window.electron?.ipcRenderer?.on('ai-content:progress', handleProgress)
        const cleanupDone = window.electron?.ipcRenderer?.on('ai-content:done', handleDone)

        return () => {
            if (cleanupProgress) cleanupProgress()
            if (cleanupDone) cleanupDone()
            // Cleanup AI Content Generator when component unmounts
            if (window.electron) {
                window.electron.aiContent.close()
            }
        }
    }, [])

    const renderQuickStart = () => (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6 shadow-xl">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center mb-3">
                        <div className="p-2 bg-white/20 rounded-xl mr-3">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Sinh Content AI</h2>
                            <p className="text-purple-100 text-base">
                                Tự động tạo content marketing từ bài viết hot trên Daily.dev
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={initializeScraper}
                        disabled={isLoading}
                        className="bg-white/20 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                    >
                        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        <span>{isLoading ? 'Đang khởi tạo...' : 'Khởi tạo'}</span>
                    </button>
                    <button
                        onClick={handleStart}
                        disabled={!isInitialized || isRunning}
                        className="bg-white text-purple-600 px-6 py-2 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                    >
                        <Play className="w-4 h-4" />
                        <span>Bắt đầu</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Browser Status Warning */}
            {!browserReady && (
                <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center text-yellow-200">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                            ℹ️ Browser sẽ được cài đặt tự động khi khởi tạo lần đầu tiên.
                        </span>
                    </div>
                </div>
            )}
        </div>
    )

    const renderStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{stats.totalArticles}</p>
                        <p className="text-blue-600 font-medium text-xs">bài viết</p>
                    </div>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Tổng mục tiêu</h3>
                <p className="text-xs text-gray-500">Số bài viết cần xử lý</p>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-4 shadow-lg border border-green-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                        <CheckSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{stats.processedArticles}</p>
                        <p className="text-green-600 font-medium text-xs">đã xử lý</p>
                    </div>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Tiến độ</h3>
                <p className="text-xs text-gray-500">Bài viết đã crawl</p>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-4 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                        <Archive className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{stats.exportedFiles}</p>
                        <p className="text-purple-600 font-medium text-xs">file AI</p>
                    </div>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Đã tạo</h3>
                <p className="text-xs text-gray-500">Content AI đã sinh</p>
            </div>

            <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-4 shadow-lg border border-orange-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-orange-100 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{stats.successRate}<span className="text-lg text-orange-600">%</span></p>
                        <p className="text-orange-600 font-medium text-xs">thành công</p>
                    </div>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">Tỷ lệ thành công</h3>
                <p className="text-xs text-gray-500">Hiệu suất AI processing</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 p-4">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Sinh nội dung AI
                </h1>
                <p className="text-gray-600 text-lg">
                    Tự động tạo content marketing từ bài viết hot trên Daily.dev
                </p>
            </div>

            {/* Browser Status */}
            <div className="mb-6">
                <BrowserStatus onStatusChange={handleBrowserStatusChange} />
            </div>

            {/* Quick Start */}
            {renderQuickStart()}

            {/* Stats */}
            {renderStats()}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-purple-100 rounded-2xl">
                            <Settings className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Cấu hình</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Source Selection */}
                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-4">
                                Nguồn bài viết
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sourceOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => setSource(option.value as SourceType)}
                                        className={`cursor-pointer border-2 rounded-2xl p-4 transition-all duration-300 transform hover:scale-105 ${source === option.value
                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg scale-105'
                                            : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <span className="text-2xl mr-3">{option.icon}</span>
                                                    <h4 className="font-bold text-gray-900">{option.label}</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{option.url}</code>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${source === option.value
                                                ? 'border-purple-500 bg-purple-500'
                                                : 'border-gray-300'
                                                }`}>
                                                {source === option.value && (
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tag Input (Conditional) */}
                        {source === 'tags' && (
                            <div>
                                <label className="block text-lg font-bold text-gray-700 mb-3">
                                    Nhập Tag
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={tag}
                                        onChange={(e) => setTag(e.target.value)}
                                        placeholder="ví dụ: javascript, react, ai, webdev..."
                                        className="w-full pl-10 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-lg"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    💡 Nhập tên tag để lấy bài viết theo chủ đề cụ thể
                                </p>
                            </div>
                        )}

                        {/* Article Count */}
                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-3">
                                Số lượng bài viết cần quét
                            </label>
                            <input
                                type="number"
                                value={articleCount}
                                onChange={(e) => setArticleCount(parseInt(e.target.value) || 1)}
                                min="1"
                                max="100"
                                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-lg"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                📊 Giới hạn từ 1-100 bài viết để đảm bảo hiệu suất
                            </p>
                        </div>

                        {/* AI Template */}
                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-3">
                                Template cho AI
                            </label>
                            <textarea
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                rows={8}
                                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-base"
                                placeholder="Nhập hướng dẫn chi tiết cho AI về cách viết lại content..."
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                🤖 Template này sẽ được gửi cùng nội dung bài viết để AI xử lý
                            </p>
                        </div>

                        {/* API Key */}
                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-3">
                                API Key
                            </label>
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-lg"
                                placeholder="Nhập API key của bạn"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                🔑 API key giúp tăng tốc độ và độ chính xác của AI
                            </p>
                        </div>
                    </div>
                </div>

                {/* Control & Progress Panel */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-green-100 rounded-2xl">
                            <Bot className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Điều khiển & Tiến trình</h2>
                    </div>

                    {/* Control Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={handleStart}
                            disabled={isRunning || !isInitialized || !browserReady}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play className="w-5 h-5" />
                            <span>{isRunning ? 'Đang xử lý...' : 'Bắt đầu tạo content'}</span>
                        </button>

                        <button
                            onClick={stopProcessing}
                            disabled={!isRunning}
                            className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Square className="w-5 h-5" />
                            <span>Dừng xử lý</span>
                        </button>
                    </div>

                    {/* Progress */}
                    {(currentStatus.progress.total > 0 || isRunning) && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border border-purple-200">
                            <h3 className="font-bold text-purple-800 mb-3 flex items-center">
                                <Activity className="w-4 h-4 mr-2" />
                                Tiến độ xử lý
                                {isRunning && (
                                    <div className="ml-3 flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-green-600 font-medium text-sm">Đang chạy</span>
                                    </div>
                                )}
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-2 font-semibold text-purple-700">
                                        <span>Tổng tiến độ</span>
                                        <span>{currentStatus.progress.current}/{currentStatus.progress.total}</span>
                                    </div>
                                    <div className="w-full bg-purple-200 rounded-full h-2 shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                                            style={{
                                                width: `${currentStatus.progress.total > 0 ? (currentStatus.progress.current / currentStatus.progress.total) * 100 : 0}%`
                                            }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-purple-600 mt-1">
                                        {currentStatus.progress.total > 0 && `${Math.round((currentStatus.progress.current / currentStatus.progress.total) * 100)}% hoàn thành`}
                                    </div>
                                </div>
                                {currentStatus.currentArticle && (
                                    <div className="bg-white/70 p-3 rounded-xl border border-purple-200">
                                        <p className="text-sm font-semibold text-purple-800 flex items-center">
                                            <FileText className="w-4 h-4 mr-2" />
                                            <strong>Đang xử lý:</strong> {currentStatus.currentArticle}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Logs */}
                    <div className="bg-gray-900 rounded-xl p-4 flex-grow min-h-[300px] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-bold flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Nhật ký hoạt động
                            </h3>
                            <button
                                onClick={clearLogs}
                                className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded transition"
                            >
                                Xóa
                            </button>
                        </div>
                        <div className="text-sm font-mono text-gray-300 space-y-1">
                            {progress.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-500 italic">Chưa có hoạt động nào...</p>
                                </div>
                            ) : (
                                progress.map((line, index) => (
                                    <p key={index} className="whitespace-pre-wrap">
                                        <span className="text-green-400 mr-2">›</span>
                                        {line}
                                    </p>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AiContent() {
    return (
        <AppProvider>
            <Layout>
                <AiContentPage />
            </Layout>
        </AppProvider>
    )
} 