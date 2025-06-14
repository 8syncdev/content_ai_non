import * as path from 'path'
import * as fs from 'fs-extra'

// Base paths
export const BASE_TEMP_DIR = path.join(process.cwd(), 'temp')
export const BROWSER_DIR = path.join(BASE_TEMP_DIR, 'browser')
export const EXPORT_DIR = path.join(BASE_TEMP_DIR, 'export')
export const USER_DATA_DIR = path.join(BASE_TEMP_DIR, 'user-data')
export const SCREENSHOTS_DIR = path.join(BASE_TEMP_DIR, 'screenshots')
export const LOGS_DIR = path.join(BASE_TEMP_DIR, 'logs')

// File paths
export const LOG_FILE_PATH = path.join(LOGS_DIR, 'scraper.log')
export const CONFIG_FILE_PATH = path.join(BASE_TEMP_DIR, 'config.json')

// Browser settings
export const BROWSER_SETTINGS = {
    executablePath: path.join(BROWSER_DIR, 'chromium', 'chrome.exe'), // Windows
    userDataDir: USER_DATA_DIR,
    headless: false,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions-except=',
        '--disable-extensions',
        '--no-first-run',
        '--disable-default-apps'
    ]
}

// Scraper settings
export const SCRAPER_SETTINGS = {
    defaultTimeout: 30000,
    navigationTimeout: 60000,
    delayBetweenRequests: 1000,
    maxRetries: 3,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

// URLs
export const DEFAULT_URLS = {
    sanfoundry: 'https://www.sanfoundry.com/python-problems-solutions/',
    devTo: 'https://dev.to/'
}

// Ensure all directories exist
export async function ensureDirectories(): Promise<void> {
    const directories = [
        BASE_TEMP_DIR,
        BROWSER_DIR,
        EXPORT_DIR,
        USER_DATA_DIR,
        SCREENSHOTS_DIR,
        LOGS_DIR
    ]

    for (const dir of directories) {
        await fs.ensureDir(dir)
    }
}

// Get platform-specific executable path
export function getBrowserExecutablePath(): string {
    const platform = process.platform

    switch (platform) {
        case 'win32':
            return path.join(BROWSER_DIR, 'chromium-1178', 'chrome-win', 'chrome.exe')
        case 'darwin':
            return path.join(BROWSER_DIR, 'chromium-1178', 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium')
        case 'linux':
            return path.join(BROWSER_DIR, 'chromium-1178', 'chrome-linux', 'chrome')
        default:
            throw new Error(`Unsupported platform: ${platform}`)
    }
}

// Check if browser exists
export async function checkBrowserExists(): Promise<boolean> {
    try {
        const executablePath = getBrowserExecutablePath()
        return await fs.pathExists(executablePath)
    } catch {
        return false
    }
}

// Log function
export function log(message: string): void {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}\n`

    console.log(message)

    // Async write to file (fire and forget)
    fs.appendFile(LOG_FILE_PATH, logMessage).catch(console.error)
} 