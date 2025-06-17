import React, { useState, useEffect } from 'react'
import { AppProvider } from '../contexts/AppContext'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import {
  Download,
  FileText,
  Settings,
  Activity,
  Play,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Globe,
  Archive
} from 'lucide-react'
import BrowserStatus from '../components/BrowserStatus'
import { useApp } from '../contexts/AppContext'

function HomePage() {
  const router = useRouter()
  const { state } = useApp()
  const [recentActivities] = useState([
    { id: 1, action: 'Scraped Python Basics', time: '2 phút trước', status: 'success' },
    { id: 2, action: 'Exported 15 exercises', time: '5 phút trước', status: 'success' },
    { id: 3, action: 'AI Processing completed', time: '10 phút trước', status: 'success' },
    { id: 4, action: 'Updated scraper settings', time: '1 giờ trước', status: 'info' }
  ])

  const [browserReady, setBrowserReady] = useState(false)

  const tools = [
    {
      name: 'Thu thập dữ liệu',
      description: 'Scrape bài tập từ Sanfoundry',
      icon: Download,
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/scraper',
      status: 'ready'
    },
    {
      name: 'Quản lý nội dung',
      description: 'Xem và chỉnh sửa nội dung',
      icon: FileText,
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/content',
      status: 'ready'
    },
    {
      name: 'Theo dõi tiến độ',
      description: 'Xem báo cáo và thống kê',
      icon: Activity,
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      path: '/progress',
      status: 'ready'
    },
    {
      name: 'Cài đặt',
      description: 'Cấu hình ứng dụng',
      icon: Settings,
      gradient: 'from-gray-500 to-gray-600',
      hoverGradient: 'hover:from-gray-600 hover:to-gray-700',
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      path: '/settings',
      status: 'ready'
    }
  ]

  const handleToolClick = (path: string) => {
    router.push(path)
  }

  const handleBrowserStatusChange = (status: { browserExists: boolean; isInstalling: boolean }) => {
    setBrowserReady(status.browserExists && !status.isInstalling)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Content Creator Dashboard
        </h1>
        <p className="text-gray-600 text-xl">
          Chọn công cụ để bắt đầu tạo nội dung bài tập lập trình
        </p>
      </div>

      {/* Browser Status - Hiển thị ngay đầu trang */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2 text-blue-600" />
          Trạng thái hệ thống
        </h2>
        <BrowserStatus onStatusChange={handleBrowserStatusChange} />
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 text-white mb-12 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-white/20 rounded-2xl mr-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Bắt đầu nhanh</h2>
                <p className="text-blue-100 text-lg">
                  Thu thập dữ liệu bài tập Python từ Sanfoundry ngay bây giờ
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleToolClick('/scraper')}
            className={`bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${browserReady ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!browserReady}
          >
            <Play className="w-5 h-5" />
            <span>Thu thập ngay</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {tools.map((tool, index) => (
          <div
            key={index}
            onClick={() => handleToolClick(tool.path)}
            className={`bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:scale-105 ${tool.bgColor} hover:${tool.bgColor.replace('50', '100')}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl ${tool.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className={`w-8 h-8 ${tool.iconColor}`} />
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {tool.name}
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {tool.description}
            </p>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-3 py-2 rounded-full font-medium ${tool.status === 'ready'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
                }`}>
                {tool.status === 'ready' ? '✅ Sẵn sàng' : '🚧 Đang phát triển'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{state.progress.totalProblems || 0}</p>
              <p className="text-blue-600 font-medium">bài tập</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Tổng bài tập</h3>
          <p className="text-sm text-gray-500">Đã phát hiện từ các nguồn</p>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 shadow-lg border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{state.progress.completedProblems || 0}</p>
              <p className="text-green-600 font-medium">hoàn thành</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Đã xử lý</h3>
          <p className="text-sm text-gray-500">Bài tập đã được scrape</p>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-8 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-2xl">
              <Archive className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-purple-600 font-medium">file MD</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Đã xuất</h3>
          <p className="text-sm text-gray-500">File markdown đã tạo</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Hoạt động gần đây
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-xl">
                <div className={`p-2 rounded-lg mr-3 ${activity.status === 'success' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                  {activity.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Overview */}
        {state.progress.isRunning && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <h2 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Tiến độ hiện tại
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-purple-700">Tổng tiến độ</span>
                  <span className="text-purple-900 font-semibold">
                    {state.progress.completedProblems}/{state.progress.totalProblems}
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${state.progress.totalProblems > 0
                        ? (state.progress.completedProblems / state.progress.totalProblems) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>
              {state.progress.currentTopic && (
                <p className="text-purple-800">
                  <strong>Chủ đề hiện tại:</strong> {state.progress.currentTopic}
                </p>
              )}
              {state.progress.currentProblem && (
                <p className="text-purple-800">
                  <strong>Bài tập:</strong> {state.progress.currentProblem}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <Layout>
        <HomePage />
      </Layout>
    </AppProvider>
  )
}
