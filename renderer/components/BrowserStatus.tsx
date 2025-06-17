import React, { useState, useEffect } from 'react'
import { Download, CheckCircle, AlertCircle, Loader2, Globe, HardDrive, Settings } from 'lucide-react'
import type { BrowserStatus } from '../types/electron'

interface BrowserStatusProps {
    onStatusChange?: (status: { browserExists: boolean; isInstalling: boolean }) => void
}

export default function BrowserStatus({ onStatusChange }: BrowserStatusProps) {
    const [browserStatus, setBrowserStatus] = useState<BrowserStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isInstalling, setIsInstalling] = useState(false)
    const [error, setError] = useState<string>('')
    const [installProgress, setInstallProgress] = useState<string>('')

    useEffect(() => {
        checkBrowserStatus()
    }, [])

    useEffect(() => {
        if (onStatusChange && browserStatus) {
            onStatusChange({
                browserExists: browserStatus.browserExists,
                isInstalling
            })
        }
    }, [browserStatus, isInstalling, onStatusChange])

    const checkBrowserStatus = async () => {
        try {
            setIsLoading(true)
            setError('')

            const result = await window.electron.browser.check()

            if (result.success && result.data) {
                setBrowserStatus(result.data)
            } else {
                setError(result.error || 'Không thể kiểm tra trạng thái browser')
            }
        } catch (error) {
            setError(error.message || 'Lỗi khi kiểm tra browser')
        } finally {
            setIsLoading(false)
        }
    }

    const installBrowser = async () => {
        try {
            setIsInstalling(true)
            setError('')
            setInstallProgress('Đang chuẩn bị cài đặt...')

            const result = await window.electron.browser.install()

            if (result.success) {
                setInstallProgress('Cài đặt thành công! Đang kiểm tra...')
                // Re-check status after installation
                await checkBrowserStatus()
                setInstallProgress('')
            } else {
                throw new Error(result.error || 'Cài đặt thất bại')
            }
        } catch (error) {
            setError(error.message || 'Lỗi khi cài đặt browser')
            setInstallProgress('')
        } finally {
            setIsInstalling(false)
        }
    }

    const autoInstall = async () => {
        try {
            setIsInstalling(true)
            setError('')
            setInstallProgress('Đang kiểm tra và cài đặt tự động...')

            const result = await window.electron.browser.checkAndInstall()

            if (result.success) {
                setInstallProgress('Hoàn tất! Đang cập nhật trạng thái...')
                await checkBrowserStatus()
                setInstallProgress('')
            } else {
                throw new Error(result.error || 'Auto-install thất bại')
            }
        } catch (error) {
            setError(error.message || 'Lỗi khi auto-install browser')
            setInstallProgress('')
        } finally {
            setIsInstalling(false)
        }
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div>
                        <h3 className="font-medium text-gray-900">Đang kiểm tra browser...</h3>
                        <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-medium text-red-900">Lỗi kiểm tra browser</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <button
                            onClick={checkBrowserStatus}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!browserStatus) return null

    const { browserExists, executablePath, browserDir } = browserStatus

    if (browserExists) {
        return (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-medium text-green-900">Browser đã sẵn sàng</h3>
                        <p className="text-sm text-green-700 mt-1">
                            Chromium browser đã được cài đặt và sẵn sàng sử dụng
                        </p>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs text-green-600">
                                <HardDrive className="h-3 w-3 mr-1" />
                                <span className="font-mono">{executablePath}</span>
                            </div>
                            <div className="flex items-center text-xs text-green-600">
                                <Settings className="h-3 w-3 mr-1" />
                                <span>Thư mục: {browserDir}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
            <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="font-medium text-yellow-900">Browser chưa được cài đặt</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                        Cần cài đặt Chromium browser để sử dụng tính năng scraping
                    </p>

                    {installProgress && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                <span className="text-sm text-blue-700 font-medium">{installProgress}</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-3 flex space-x-2">
                        <button
                            onClick={autoInstall}
                            disabled={isInstalling}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                            {isInstalling ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            <span>Cài đặt tự động</span>
                        </button>

                        <button
                            onClick={installBrowser}
                            disabled={isInstalling}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                            <Globe className="h-4 w-4" />
                            <span>Cài đặt thủ công</span>
                        </button>
                    </div>

                    <div className="mt-2 text-xs text-yellow-600">
                        💡 Browser sẽ được cài đặt vào thư mục: {browserDir}
                    </div>
                </div>
            </div>
        </div>
    )
} 