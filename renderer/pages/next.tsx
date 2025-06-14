import React, { useState } from 'react'
import { AppProvider } from '../contexts/AppContext'
import Layout from '../components/Layout'
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  Folder,
  Calendar,
  User,
  Tag,
  MoreVertical,
  ChevronDown
} from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  topic: string
  createdAt: string
  status: 'completed' | 'processing' | 'failed'
  size: string
  type: 'python' | 'javascript' | 'java'
}

function ContentPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const mockContent: ContentItem[] = [
    {
      id: '1',
      title: 'Python Program to Check if a Number is Odd or Even',
      topic: 'Simple Python Programs',
      createdAt: '2024-01-15',
      status: 'completed',
      size: '2.5 KB',
      type: 'python'
    },
    {
      id: '2',
      title: 'Python Program to Check if a Number is Prime',
      topic: 'Simple Python Programs',
      createdAt: '2024-01-14',
      status: 'processing',
      size: '3.2 KB',
      type: 'python'
    },
    {
      id: '3',
      title: 'Python Program to Find the Factorial of a Number',
      topic: 'Simple Python Programs',
      createdAt: '2024-01-13',
      status: 'failed',
      size: '2.8 KB',
      type: 'python'
    }
  ]

  const statusConfig = {
    completed: {
      label: 'Hoàn thành',
      color: 'bg-green-100 text-green-800',
      icon: '✅'
    },
    processing: {
      label: 'Đang xử lý',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳'
    },
    failed: {
      label: 'Thất bại',
      color: 'bg-red-100 text-red-800',
      icon: '❌'
    }
  }

  const typeConfig = {
    python: {
      label: 'Python',
      color: 'bg-blue-100 text-blue-800',
      icon: '🐍'
    },
    javascript: {
      label: 'JavaScript',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '🟨'
    },
    java: {
      label: 'Java',
      color: 'bg-orange-100 text-orange-800',
      icon: '☕'
    }
  }

  const filteredContent = mockContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const selectAllItems = () => {
    setSelectedItems(filteredContent.map(item => item.id))
  }

  const deselectAllItems = () => {
    setSelectedItems([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý nội dung
        </h1>
        <p className="text-gray-600 text-lg">
          Xem và quản lý các bài tập đã thu thập
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài tập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Filter */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="processing">Đang xử lý</option>
                <option value="failed">Thất bại</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} đã chọn
                </span>
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                  Xuất
                </button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-lg ${selectedItems.includes(item.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 hover:border-gray-200'
              }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[item.status].color}`}>
                      {statusConfig[item.status].icon} {statusConfig[item.status].label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[item.type].color}`}>
                      {typeConfig[item.type].icon} {typeConfig[item.type].label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                {item.title}
              </h3>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Folder className="w-3 h-3" />
                  <span>{item.topic}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{item.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">{item.size}</span>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy nội dung
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có nội dung nào được tạo'}
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg">
            Bắt đầu thu thập
          </button>
        </div>
      )}

      {/* Selection Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-4 shadow-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedItems.length} mục đã chọn
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={selectAllItems}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Chọn tất cả
              </button>
              <button
                onClick={deselectAllItems}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Content() {
  return (
    <AppProvider>
      <Layout>
        <ContentPage />
      </Layout>
    </AppProvider>
  )
}
