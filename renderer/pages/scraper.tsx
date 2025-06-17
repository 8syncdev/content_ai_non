import React, { useState, useEffect, useRef } from 'react'
import { AppProvider, useApp } from '../contexts/AppContext'
import Layout from '../components/Layout'
import BrowserStatus from '../components/BrowserStatus'
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
  CheckSquare,
  Bot,
  Sparkles,
  Brain,
  Wand2,
  Languages,
  ArrowRight
} from 'lucide-react'
import { Topic, ProblemContent, AIProcessingOptions } from '../types/electron'

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
  const [browserReady, setBrowserReady] = useState(false)

  // AI Processing Options
  const [useAI, setUseAI] = useState(false)
  const [aiOptions, setAiOptions] = useState<AIProcessingOptions>({
    templateType: 'exercise',
    useAI: false
  })
  const [aiApiKey, setAiApiKey] = useState('')

  // Translate Options
  const [translateOptions, setTranslateOptions] = useState({
    sourceLang: 'python',
    targetLang: 'javascript'
  })
  const [programmingLanguages, setProgrammingLanguages] = useState<Record<string, any>>({})
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true)

  // Ref để control scraping từ bên ngoài
  const scrapingControlRef = useRef({ shouldStop: false })

  const handleBrowserStatusChange = (status: { browserExists: boolean; isInstalling: boolean }) => {
    setBrowserReady(status.browserExists && !status.isInstalling)
  }

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
      id: 'ai',
      name: 'AI Processing',
      icon: Bot,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      id: 'export',
      name: 'Xuất dữ liệu',
      icon: Archive,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-yellow-50'
    },
    {
      id: 'settings',
      name: 'Cài đặt',
      icon: Settings,
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-slate-50'
    }
  ]

  // Template configurations (simplified)
  const templateConfigs = {
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

  useEffect(() => {
    initializeScraper()
    loadProgrammingLanguages()
    return () => {
      if (window.electron) {
        window.electron.scraper.close()
      }
    }
  }, [])

  // Load programming languages
  const loadProgrammingLanguages = async () => {
    try {
      const result = await window.electron.app.getProgrammingLanguages()
      if (result.success && result.data) {
        setProgrammingLanguages(result.data)
        setIsLoadingLanguages(false)
      } else {
        addLog(`❌ Lỗi tải ngôn ngữ: ${result.error}`)
        setIsLoadingLanguages(false)
      }
    } catch (error) {
      addLog(`❌ Lỗi tải ngôn ngữ: ${error.message}`)
      setIsLoadingLanguages(false)
    }
  }

  // Update AI config when API key changes
  useEffect(() => {
    if (aiApiKey && window.electron?.ai) {
      window.electron.ai.setApiKey(aiApiKey)
        .then(result => {
          if (result.success) {
            addLog(`🔧 Đã cập nhật AI API key`)
          }
        })
        .catch(error => {
          addLog(`❌ Lỗi cập nhật AI config: ${error.message}`)
        })
    }
  }, [aiApiKey])

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

    // Validate translate options if translate template is selected
    if (useAI && aiOptions.templateType === 'translate') {
      if (translateOptions.sourceLang === translateOptions.targetLang) {
        addLog('❌ Ngôn ngữ nguồn và đích không được giống nhau')
        return
      }
      if (!programmingLanguages[translateOptions.sourceLang] || !programmingLanguages[translateOptions.targetLang]) {
        addLog('❌ Ngôn ngữ được chọn không hợp lệ')
        return
      }
    }

    setIsScrapingActive(true)
    scrapingControlRef.current.shouldStop = false // Reset control flag

    const selectedTopicData = topics.filter(t => selectedTopics.includes(t.id))
    const totalProblems = selectedTopicData.reduce((sum, topic) => sum + topic.links.length, 0)

    setProgress({ current: 0, total: totalProblems })
    addLog(`🚀 Bắt đầu scraping ${totalProblems} bài tập từ ${selectedTopicData.length} chủ đề`)
    addLog(`📋 Các chủ đề được chọn: ${selectedTopicData.map(t => t.name).join(', ')}`)

    // Log AI settings
    if (useAI) {
      addLog(`🤖 AI Processing: ${templateConfigs[aiOptions.templateType]?.name || aiOptions.templateType}`)
      if (aiOptions.templateType === 'translate') {
        const sourceLangName = programmingLanguages[translateOptions.sourceLang]?.displayName || translateOptions.sourceLang
        const targetLangName = programmingLanguages[translateOptions.targetLang]?.displayName || translateOptions.targetLang
        addLog(`🔄 Translate: ${sourceLangName} → ${targetLangName}`)
      }
    } else {
      addLog(`📝 Sử dụng nội dung gốc (không AI)`)
    }

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
            // Prepare AI options if enabled
            const finalAiOptions = useAI ? {
              ...aiOptions,
              useAI: true,
              apiKey: aiApiKey,
              translateOptions: aiOptions.templateType === 'translate' ? {
                inLang: programmingLanguages[translateOptions.sourceLang]?.displayName || 'Python',
                outLang: programmingLanguages[translateOptions.targetLang]?.displayName || 'JavaScript',
                inLangCodeBlock: programmingLanguages[translateOptions.sourceLang]?.codeBlock || 'python',
                outLangCodeBlock: programmingLanguages[translateOptions.targetLang]?.codeBlock || 'javascript'
              } : undefined
            } : undefined

            // Debug logs for AI processing
            if (useAI) {
              addLog(`🤖 AI enabled - Template: ${aiOptions.templateType}`)
              if (aiOptions.templateType === 'translate') {
                addLog(`🔄 Translate settings: ${programmingLanguages[translateOptions.sourceLang]?.displayName} → ${programmingLanguages[translateOptions.targetLang]?.displayName}`)
              }
              addLog(`🔧 AI Options: ${JSON.stringify(finalAiOptions)}`)
            } else {
              addLog(`📝 Using original content (AI disabled)`)
            }

            const exportResult = await window.electron.scraper.exportContent(
              result.data,
              topic.name,
              topicIndex,
              problemIndex,
              finalAiOptions
            )
            if (exportResult.success) {
              exported++
              const aiStatus = useAI ? ' (AI enhanced)' : ''
              addLog(`✅ [${exported}] Đã xuất: ${problem.title}${aiStatus}`)
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

        // Delay để tránh spam server (thêm thời gian nếu dùng AI)
        const delay = useAI ? 2500 : 1500
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    setIsScrapingActive(false)
    setCurrentTopic('')
    setCurrentProblem('')
    addLog(`🎉 Hoàn thành scraping!`)
    addLog(`📊 Tổng kết: ${completed}/${totalProblems} bài đã xử lý`)
    addLog(`✅ Thành công: ${exported} bài`)
    addLog(`❌ Lỗi: ${errors} bài`)
    if (useAI) {
      addLog(`🤖 AI đã xử lý ${exported} bài thành công`)
    }

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
        addLog(`📄 Content length: ${result.data.content?.length || 0} characters`)

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
    <div className="bg-gradient-blue rounded-2xl p-6 text-white mb-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white/20 rounded-xl mr-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1 text-white">Bắt đầu nhanh</h2>
              <p className="text-blue-100 text-base">
                Thu thập tất cả bài tập Python từ Sanfoundry chỉ với một cú click
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadTopics}
            disabled={isLoading || !isInitialized || !browserReady}
            className="bg-white/20 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Tải chủ đề</span>
          </button>
          <button
            onClick={exportAllTopics}
            disabled={!isInitialized || isScrapingActive || topics.length === 0 || !browserReady}
            className="bg-white text-blue-600 px-6 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            <span>Xuất tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Browser Status Warning */}
      {!browserReady && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center text-yellow-200">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              ⚠️ Browser chưa sẵn sàng. Vui lòng cài đặt browser trước khi sử dụng.
            </span>
          </div>
        </div>
      )}

      {/* AI Status Indicator */}
      {useAI && browserReady && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center text-blue-100">
            <Bot className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              🤖 AI Enhancement: {templateConfigs[aiOptions.templateType]?.name}
              {aiOptions.templateType === 'translate' && programmingLanguages[translateOptions.sourceLang] && programmingLanguages[translateOptions.targetLang] && (
                <span className="ml-2">
                  ({programmingLanguages[translateOptions.sourceLang].displayName} → {programmingLanguages[translateOptions.targetLang].displayName})
                </span>
              )}
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
      <div className="card-gradient">
        <h3 className="text-xl font-bold mb-4 flex items-center text-primary">
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
            className="input-primary flex-1"
          />
          <button
            onClick={loadTopics}
            disabled={isLoading || !isInitialized || !browserReady}
            className="btn-primary flex items-center space-x-2"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>Tải chủ đề</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card-gradient">
        <h3 className="text-xl font-bold mb-4 flex items-center text-primary">
          <div className="p-2 bg-gray-100 rounded-xl mr-3">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
          Điều khiển
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={startScraping}
            disabled={!isInitialized || isScrapingActive || selectedTopics.length === 0 || !browserReady}
            className="btn-success flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Bắt đầu</span>
          </button>
          <button
            onClick={stopScraping}
            disabled={!isScrapingActive}
            className="btn-danger flex items-center justify-center space-x-2"
          >
            <Square className="w-4 h-4" />
            <span>Dừng</span>
          </button>
          <button
            onClick={testScrapeOne}
            disabled={!isInitialized || isScrapingActive || topics.length === 0 || !browserReady}
            className="btn-warning flex items-center justify-center space-x-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Test 1 bài</span>
          </button>
          <button
            onClick={initializeScraper}
            disabled={isLoading || !browserReady}
            className="btn-secondary flex items-center justify-center space-x-2"
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

  const renderAITab = () => (
    <div className="space-y-8">
      {/* AI Toggle */}
      <div className="card-gradient">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center text-primary">
            <div className="p-3 bg-purple-100 rounded-2xl mr-4">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            AI Processing
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-primary font-medium">Sử dụng AI</span>
            <button
              onClick={() => {
                setUseAI(!useAI)
                setAiOptions(prev => ({ ...prev, useAI: !useAI }))
              }}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${useAI ? 'ai-toggle-on' : 'ai-toggle-off'}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${useAI ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {!useAI && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-900">Nội dung gốc</h4>
                <p className="text-blue-700">Sử dụng nội dung crawl gốc từ website, không qua xử lý AI</p>
              </div>
            </div>
          </div>
        )}

        {useAI && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-purple-900">AI Enhancement</h4>
                  <p className="text-purple-700">Chuyển đổi nội dung crawl thành tiếng Việt với cấu trúc chuẩn</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/70 rounded-xl p-4 border border-purple-100">
                  <h5 className="font-medium text-purple-800 mb-2">✨ Tính năng chính</h5>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Dịch sang tiếng Việt tự nhiên</li>
                    <li>• Cấu trúc markdown chuẩn</li>
                    <li>• Giữ nguyên 100% test cases</li>
                  </ul>
                </div>
                <div className="bg-white/70 rounded-xl p-4 border border-purple-100">
                  <h5 className="font-medium text-purple-800 mb-2">🎯 Phù hợp cho</h5>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Người mới học lập trình</li>
                    <li>• Tài liệu giảng dạy</li>
                    <li>• Nội dung tiếng Việt chất lượng</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <h4 className="text-lg font-bold text-primary mb-4">Chọn Template</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(templateConfigs).map(([key, config]) => (
                  <div
                    key={key}
                    onClick={() => setAiOptions(prev => ({ ...prev, templateType: key as any }))}
                    className={`cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${aiOptions.templateType === key ? 'ai-template-selected' : 'ai-template-unselected'}`}
                  >
                    <div className="text-center">
                      <span className="text-3xl mb-3 block">{config.icon}</span>
                      <h5 className="font-bold text-primary mb-2">{config.name}</h5>
                      <p className="text-secondary text-sm">{config.description}</p>
                      <div className={`w-6 h-6 rounded-full border-2 mx-auto mt-3 flex items-center justify-center transition-all ${aiOptions.templateType === key
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                        }`}>
                        {aiOptions.templateType === key && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Translate Options - Show only when translate template is selected */}
            {aiOptions.templateType === 'translate' && (
              <div>
                <h4 className="text-lg font-bold text-primary mb-4 flex items-center">
                  <Languages className="w-5 h-5 mr-2" />
                  Cài đặt chuyển đổi ngôn ngữ
                </h4>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                  {isLoadingLanguages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-purple-600 mr-3" />
                      <span className="text-purple-700 font-medium">Đang tải danh sách ngôn ngữ...</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Source Language */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-purple-800">
                            Từ ngôn ngữ (nguồn):
                          </label>
                          <select
                            value={translateOptions.sourceLang}
                            onChange={(e) => setTranslateOptions(prev => ({ ...prev, sourceLang: e.target.value }))}
                            className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                          >
                            {Object.values(programmingLanguages).map((lang: any) => (
                              <option key={lang.name} value={lang.name}>
                                {lang.icon} {lang.displayName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Target Language */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-purple-800">
                            Sang ngôn ngữ (đích):
                          </label>
                          <select
                            value={translateOptions.targetLang}
                            onChange={(e) => setTranslateOptions(prev => ({ ...prev, targetLang: e.target.value }))}
                            className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                          >
                            {Object.values(programmingLanguages).map((lang: any) => (
                              <option key={lang.name} value={lang.name}>
                                {lang.icon} {lang.displayName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Language Preview */}
                      <div className="bg-white/70 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center justify-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{programmingLanguages[translateOptions.sourceLang]?.icon}</span>
                            <span className="font-bold text-purple-900">
                              {programmingLanguages[translateOptions.sourceLang]?.displayName}
                            </span>
                          </div>
                          <div className="text-purple-600">
                            <ArrowRight className="w-6 h-6" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{programmingLanguages[translateOptions.targetLang]?.icon}</span>
                            <span className="font-bold text-purple-900">
                              {programmingLanguages[translateOptions.targetLang]?.displayName}
                            </span>
                          </div>
                        </div>
                        <p className="text-center text-purple-700 text-sm mt-2">
                          AI sẽ chuyển đổi toàn bộ code và giữ nguyên logic test cases
                        </p>
                      </div>

                      {/* Warning for same language */}
                      {translateOptions.sourceLang === translateOptions.targetLang && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-yellow-800">Cảnh báo</p>
                            <p className="text-yellow-700 text-sm">
                              Ngôn ngữ nguồn và đích giống nhau. Vui lòng chọn ngôn ngữ khác nhau để chuyển đổi.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* API Key */}
            <div>
              <h4 className="text-lg font-bold text-primary mb-4">API Configuration</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">Mistral API Key</span>
                </div>
                <input
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder="Nhập Mistral API key của bạn (bắt buộc để sử dụng AI)"
                  className="input-primary"
                />
                <p className="text-yellow-700 text-sm mt-2">
                  💡 Cần API key để sử dụng AI. Không có key sẽ chỉ dùng template đơn giản.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderExportTab = () => (
    <div className="space-y-8">
      <div className="card-gradient">
        <h3 className="text-2xl font-bold mb-6 flex items-center text-primary">
          <div className="p-3 bg-purple-100 rounded-2xl mr-4">
            <Archive className="w-6 h-6 text-purple-600" />
          </div>
          Cài đặt xuất file
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-primary mb-3">
              Thư mục xuất
            </label>
            <input
              type="text"
              value={exportPath}
              onChange={(e) => setExportPath(e.target.value)}
              className="input-primary"
            />
            <div className="text-sm text-muted mt-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <p className="flex items-center">
                <Folder className="w-4 h-4 mr-2" />
                💡 File sẽ được lưu vào thư mục con theo tên chủ đề
              </p>
              <p className="mt-2 text-secondary">
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

      {/* Browser Status */}
      <div className="mb-6">
        <BrowserStatus onStatusChange={handleBrowserStatusChange} />
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
                  ? `bg-gradient-to-r ${tab.gradient} tab-active`
                  : 'tab-inactive'
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
          {activeTab === 'ai' && renderAITab()}
          {activeTab === 'export' && renderExportTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>

        {/* Logs Panel */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-primary flex items-center">
              <div className="p-2 bg-yellow-100 rounded-xl mr-3">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              Nhật ký hoạt động
            </h3>
            <button
              onClick={clearLogs}
              className="btn-secondary text-sm px-3 py-1"
            >
              Xóa
            </button>
          </div>
          <div className="h-80 overflow-y-auto log-panel">
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
                <div key={index} className="log-entry">
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