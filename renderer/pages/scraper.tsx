import React, { useState, useEffect, useRef } from 'react'
import { AppProvider, useApp } from '../contexts/AppContext'
import Layout from '../components/Layout'
import {
  Play,
  Pause,
  Square,
  Download,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader,
  FileText,
  Folder,
  RefreshCw,
  ChevronRight,
  Globe,
  Database,
  Archive,
  Activity,
  Zap,
  Target,
  TrendingUp,
  BookOpen,
  Package,
  Clock,
  CheckSquare
} from 'lucide-react'
import { Topic, ProblemContent } from '../types/electron'

function ScraperPage() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('scraper')
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState('https://www.sanfoundry.com/python-problems-solutions/')
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [currentTopic, setCurrentTopic] = useState('')
  const [currentProblem, setCurrentProblem] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [logs, setLogs] = useState<string[]>([])
  const [exportPath, setExportPath] = useState('./temp/export')
  const [isScrapingActive, setIsScrapingActive] = useState(false)
  const [stats, setStats] = useState({
    totalProblems: 0,
    completedProblems: 0,
    successRate: 0,
    exportedFiles: 0
  })

  // Ref để control scraping từ bên ngoài
  const scrapingControlRef = useRef({ shouldStop: false })

  const tabs = [
    {
      id: 'scraper',
      name: 'Thu thập dữ liệu',
      icon: Download,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      id: 'topics',
      name: 'Quản lý chủ đề',
      icon: Database,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      id: 'export',
      name: 'Xuất dữ liệu',
      icon: Archive,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-violet-50'
    },
    {
      id: 'settings',
      name: 'Cài đặt',
      icon: Settings,
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-slate-50'
    }
  ]

  useEffect(() => {
    initializeScraper()
    return () => {
      if (window.electron) {
        window.electron.scraper.close()
      }
    }
  }, [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const initializeScraper = async () => {
    if (!window.electron) {
      addLog('❌ Electron API không khả dụng')
      return
    }

    setIsLoading(true)
    addLog('🔄 Khởi tạo scraper...')

    try {
      const result = await window.electron.scraper.initialize()
      if (result.success) {
        setIsInitialized(true)
        addLog('✅ Scraper đã sẵn sàng')
      } else {
        addLog(`❌ Lỗi khởi tạo: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Lỗi khởi tạo: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTopics = async () => {
    if (!isInitialized) {
      addLog('❌ Scraper chưa được khởi tạo')
      return
    }

    setIsLoading(true)
    addLog(`🔄 Đang tải danh sách chủ đề từ: ${url}`)

    try {
      const result = await window.electron.scraper.getTopics(url)
      if (result.success && result.data) {
        setTopics(result.data)
        const totalProblems = result.data.reduce((sum, topic) => sum + topic.links.length, 0)
        setStats(prev => ({ ...prev, totalProblems }))
        addLog(`✅ Đã tải ${result.data.length} chủ đề với ${totalProblems} bài tập`)
        setActiveTab('topics')
      } else {
        addLog(`❌ Lỗi tải chủ đề: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Lỗi tải chủ đề: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const startScraping = async () => {
    if (selectedTopics.length === 0) {
      addLog('❌ Vui lòng chọn ít nhất một chủ đề')
      return
    }

    setIsScrapingActive(true)
    scrapingControlRef.current.shouldStop = false // Reset control flag

    const selectedTopicData = topics.filter(t => selectedTopics.includes(t.id))
    const totalProblems = selectedTopicData.reduce((sum, topic) => sum + topic.links.length, 0)

    setProgress({ current: 0, total: totalProblems })
    addLog(`🚀 Bắt đầu scraping ${totalProblems} bài tập từ ${selectedTopicData.length} chủ đề`)
    addLog(`📋 Các chủ đề được chọn: ${selectedTopicData.map(t => t.name).join(', ')}`)

    dispatch({
      type: 'SET_PROGRESS',
      payload: {
        isRunning: true,
        totalProblems,
        completedProblems: 0
      }
    })

    let completed = 0
    let exported = 0
    let errors = 0

    for (let topicIndex = 0; topicIndex < selectedTopicData.length; topicIndex++) {
      const topic = selectedTopicData[topicIndex]

      if (scrapingControlRef.current.shouldStop) {
        addLog('⏹️ Scraping bị dừng bởi người dùng')
        break
      }

      setCurrentTopic(topic.name)
      addLog(`📚 Đang xử lý chủ đề: ${topic.name} (${topic.links.length} bài)`)

      for (let problemIndex = 0; problemIndex < topic.links.length; problemIndex++) {
        const problem = topic.links[problemIndex]

        if (scrapingControlRef.current.shouldStop) {
          addLog('⏹️ Scraping bị dừng bởi người dùng')
          break
        }

        setCurrentProblem(problem.title)
        addLog(`📄 [${completed + 1}/${totalProblems}] Đang scrape: ${problem.title}`)

        try {
          const result = await window.electron.scraper.getProblemContent(problem.url)
          if (result.success && result.data) {
            const exportResult = await window.electron.scraper.exportContent(
              result.data,
              topic.name,
              topicIndex,
              problemIndex
            )
            if (exportResult.success) {
              exported++
              addLog(`✅ [${exported}] Đã xuất: ${problem.title}`)
            } else {
              errors++
              addLog(`❌ Lỗi xuất: ${problem.title} - ${exportResult.error}`)
            }
          } else {
            errors++
            addLog(`❌ Lỗi scrape: ${problem.title} - ${result.error || 'Không có dữ liệu'}`)
          }
        } catch (error) {
          errors++
          addLog(`❌ Lỗi exception: ${problem.title} - ${error.message}`)
        }

        completed++
        setProgress({ current: completed, total: totalProblems })
        setStats(prev => ({
          ...prev,
          completedProblems: completed,
          exportedFiles: exported,
          successRate: completed > 0 ? Math.round((exported / completed) * 100) : 0
        }))

        dispatch({
          type: 'SET_PROGRESS',
          payload: {
            completedProblems: completed,
            currentTopic: topic.name,
            currentProblem: problem.title
          }
        })

        // Delay để tránh spam server
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    setIsScrapingActive(false)
    setCurrentTopic('')
    setCurrentProblem('')
    addLog(`🎉 Hoàn thành scraping!`)
    addLog(`📊 Tổng kết: ${completed}/${totalProblems} bài đã xử lý`)
    addLog(`✅ Thành công: ${exported} bài`)
    addLog(`❌ Lỗi: ${errors} bài`)

    dispatch({
      type: 'SET_PROGRESS',
      payload: {
        isRunning: false
      }
    })
  }

  const exportAllTopics = async () => {
    if (topics.length === 0) {
      addLog('❌ Chưa có chủ đề nào để xuất')
      return
    }

    // Chọn tất cả topics
    setSelectedTopics(topics.map(t => t.id))
    addLog(`📦 Đã chọn tất cả ${topics.length} chủ đề để xuất`)

    // Delay một chút để UI cập nhật
    await new Promise(resolve => setTimeout(resolve, 500))

    // Bắt đầu scraping
    await startScraping()
  }

  const stopScraping = () => {
    scrapingControlRef.current.shouldStop = true
    setIsScrapingActive(false)
    addLog('⏹️ Đã dừng scraping')
    dispatch({
      type: 'SET_PROGRESS',
      payload: {
        isRunning: false
      }
    })
  }

  const selectAllTopics = () => {
    setSelectedTopics(topics.map(t => t.id))
  }

  const deselectAllTopics = () => {
    setSelectedTopics([])
  }

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testScrapeOne = async () => {
    if (topics.length === 0) {
      addLog('❌ Chưa có topics nào được tải')
      return
    }

    const firstTopic = topics[0]
    const firstProblem = firstTopic.links[0]

    if (!firstProblem) {
      addLog('❌ Không tìm thấy bài tập nào')
      return
    }

    addLog(`🧪 Test scrape bài đầu tiên: ${firstProblem.title}`)
    addLog(`🔗 URL: ${firstProblem.url}`)

    try {
      const result = await window.electron.scraper.getProblemContent(firstProblem.url)
      if (result.success && result.data) {
        addLog(`✅ Scrape thành công!`)
        addLog(`📝 Title: ${result.data.title}`)
        addLog(`📄 Description: ${result.data.description?.substring(0, 100)}...`)
        addLog(`🔧 Methods: ${result.data.methods.length}`)
        addLog(`💻 Solutions: ${result.data.solutions.length}`)
        addLog(`🧪 Test cases: ${result.data.testCases.length}`)

        // Test export với index
        const exportResult = await window.electron.scraper.exportContent(result.data, firstTopic.name, 0, 0)
        if (exportResult.success) {
          addLog(`✅ Export thành công!`)
        } else {
          addLog(`❌ Lỗi export: ${exportResult.error}`)
        }
      } else {
        addLog(`❌ Lỗi scrape: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Lỗi exception: ${error.message}`)
    }
  }

  const renderQuickStart = () => (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white mb-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white/20 rounded-xl mr-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Bắt đầu nhanh</h2>
              <p className="text-blue-100 text-base">
                Thu thập tất cả bài tập Python từ Sanfoundry chỉ với một cú click
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadTopics}
            disabled={isLoading || !isInitialized}
            className="bg-white/20 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Tải chủ đề</span>
          </button>
          <button
            onClick={exportAllTopics}
            disabled={!isInitialized || isScrapingActive || topics.length === 0}
            className="bg-white text-blue-600 px-6 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            <span>Xuất tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
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
            <p className="text-xl font-bold text-gray-900">{stats.totalProblems}</p>
            <p className="text-blue-600 font-medium text-xs">bài tập</p>
          </div>
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Tổng bài tập</h3>
        <p className="text-xs text-gray-500">Đã phát hiện từ {topics.length} chủ đề</p>
      </div>

      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-4 shadow-lg border border-green-100">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-green-100 rounded-xl">
            <CheckSquare className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{stats.completedProblems}</p>
            <p className="text-green-600 font-medium text-xs">hoàn thành</p>
          </div>
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Đã xử lý</h3>
        <p className="text-xs text-gray-500">Bài tập đã được scrape</p>
      </div>

      <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-4 shadow-lg border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Archive className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{stats.exportedFiles}</p>
            <p className="text-purple-600 font-medium text-xs">file MD</p>
          </div>
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Đã xuất</h3>
        <p className="text-xs text-gray-500">File markdown đã tạo</p>
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
        <p className="text-xs text-gray-500">Hiệu suất scraping</p>
      </div>
    </div>
  )

  const renderScraperTab = () => (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
          <div className="p-2 bg-blue-100 rounded-xl mr-3">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          Nguồn dữ liệu
        </h3>
        <div className="flex space-x-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL trang chủ Sanfoundry"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 text-base shadow-sm"
          />
          <button
            onClick={loadTopics}
            disabled={isLoading || !isInitialized}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>Tải chủ đề</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
          <div className="p-2 bg-gray-100 rounded-xl mr-3">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
          Điều khiển
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={startScraping}
            disabled={!isInitialized || isScrapingActive || selectedTopics.length === 0}
            className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Play className="w-4 h-4" />
            <span>Bắt đầu</span>
          </button>
          <button
            onClick={stopScraping}
            disabled={!isScrapingActive}
            className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Square className="w-4 h-4" />
            <span>Dừng</span>
          </button>
          <button
            onClick={testScrapeOne}
            disabled={!isInitialized || isScrapingActive || topics.length === 0}
            className="px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Test 1 bài</span>
          </button>
          <button
            onClick={initializeScraper}
            disabled={isLoading}
            className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Khởi tạo lại</span>
          </button>
        </div>
      </div>

      {/* Progress */}
      {(progress.total > 0 || isScrapingActive) && (
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border border-purple-100 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <div className="p-2 bg-purple-100 rounded-xl mr-3">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            Tiến độ thực thi
            {isScrapingActive && (
              <div className="ml-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium text-base">Đang chạy</span>
              </div>
            )}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-base mb-2 font-semibold text-gray-700">
                <span>Tổng tiến độ</span>
                <span className="text-purple-600">{progress.current}/{progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {progress.total > 0 && `${Math.round((progress.current / progress.total) * 100)}% hoàn thành`}
              </div>
            </div>
            {currentTopic && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <p className="text-base font-semibold text-blue-800 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <strong>Chủ đề:</strong> {currentTopic}
                </p>
              </div>
            )}
            {currentProblem && (
              <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                <p className="text-base font-semibold text-green-800 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <strong>Bài tập:</strong> {currentProblem}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderTopicsTab = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 border border-green-100 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold flex items-center text-gray-800">
            <div className="p-3 bg-green-100 rounded-2xl mr-4">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            Chủ đề ({topics.length})
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={selectAllTopics}
              className="px-6 py-3 text-sm bg-blue-100 text-blue-700 rounded-2xl hover:bg-blue-200 font-semibold transition-colors shadow-sm"
            >
              Chọn tất cả
            </button>
            <button
              onClick={deselectAllTopics}
              className="px-6 py-3 text-sm bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 font-semibold transition-colors shadow-sm"
            >
              Bỏ chọn
            </button>
            <button
              onClick={() => setSelectedTopics([topics[0]?.id].filter(Boolean))}
              disabled={topics.length === 0}
              className="px-6 py-3 text-sm bg-yellow-100 text-yellow-700 rounded-2xl hover:bg-yellow-200 font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              Chọn 1 đầu tiên
            </button>
          </div>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Database className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold mb-2">Chưa có chủ đề nào</p>
            <p className="text-lg">Vui lòng tải danh sách chủ đề trước.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedTopics.includes(topic.id)
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
                  }`}
                onClick={() => toggleTopicSelection(topic.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg leading-tight">{topic.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                        {topic.links.length} bài tập
                      </span>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedTopics.includes(topic.id)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                    }`}>
                    {selectedTopics.includes(topic.id) && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTopics.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200 shadow-lg">
          <h4 className="font-bold text-blue-900 mb-3 text-xl">Đã chọn</h4>
          <p className="text-blue-800 text-lg">
            <span className="font-bold">{selectedTopics.length}</span> chủ đề, tổng cộng{' '}
            <span className="font-bold text-indigo-700">
              {topics
                .filter(t => selectedTopics.includes(t.id))
                .reduce((sum, topic) => sum + topic.links.length, 0)}
            </span>{' '}
            bài tập
          </p>
        </div>
      )}
    </div>
  )

  const renderExportTab = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-8 border border-purple-100 shadow-lg">
        <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
          <div className="p-3 bg-purple-100 rounded-2xl mr-4">
            <Archive className="w-6 h-6 text-purple-600" />
          </div>
          Cài đặt xuất file
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-3">
              Thư mục xuất
            </label>
            <input
              type="text"
              value={exportPath}
              onChange={(e) => setExportPath(e.target.value)}
              className="w-full px-6 py-4 border border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 text-lg shadow-sm"
            />
            <div className="text-sm text-gray-500 mt-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <p className="flex items-center">
                <Folder className="w-4 h-4 mr-2" />
                💡 File sẽ được lưu vào thư mục con theo tên chủ đề
              </p>
              <p className="mt-2 text-gray-600">
                Ví dụ: <code className="bg-gray-200 px-2 py-1 rounded">./temp/export/Simple Python Programs/bai-tap-1.md</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-100 shadow-lg">
        <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
          <div className="p-3 bg-gray-100 rounded-2xl mr-4">
            <Settings className="w-6 h-6 text-gray-600" />
          </div>
          Cài đặt scraper
        </h3>
        <div className="space-y-8">
          <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">Trạng thái scraper</h4>
              <p className="text-gray-600 text-lg">
                {isInitialized ? 'Đã sẵn sàng để sử dụng' : 'Chưa được khởi tạo'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-lg font-semibold ${isInitialized ? 'text-green-700' : 'text-red-700'}`}>
                {isInitialized ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Thu thập dữ liệu Sanfoundry
        </h1>
        <p className="text-gray-600 text-lg">
          Scrape bài tập lập trình Python từ website Sanfoundry với UI/UX hiện đại
        </p>
      </div>

      {/* Quick Start */}
      {renderQuickStart()}

      {/* Stats */}
      {renderStats()}

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 font-semibold text-base flex items-center justify-center space-x-2 rounded-xl transition-all duration-300 transform ${activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'scraper' && renderScraperTab()}
          {activeTab === 'topics' && renderTopicsTab()}
          {activeTab === 'export' && renderExportTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>

        {/* Logs Panel */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="p-2 bg-yellow-100 rounded-xl mr-3">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              Nhật ký hoạt động
            </h3>
            <button
              onClick={clearLogs}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-xl hover:bg-gray-100 transition-colors font-medium"
            >
              Xóa
            </button>
          </div>
          <div className="h-80 overflow-y-auto bg-gray-900 rounded-xl p-4 text-sm font-mono shadow-inner">
            {logs.length === 0 ? (
              <div className="text-center py-6">
                <div className="p-3 bg-gray-800 rounded-xl w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-400 italic text-base">Chưa có nhật ký nào...</p>
                <p className="text-gray-500 text-xs mt-1">Hoạt động sẽ được ghi lại ở đây</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 text-gray-100 leading-relaxed">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Scraper() {
  return (
    <AppProvider>
      <Layout>
        <ScraperPage />
      </Layout>
    </AppProvider>
  )
} 