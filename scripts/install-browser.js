const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs-extra')

async function installBrowser() {
    try {
        console.log('🚀 Installing Playwright browser to temp/browser...')

        // Ensure temp/browser directory exists
        const browserDir = path.join(process.cwd(), 'temp', 'browser')
        await fs.ensureDir(browserDir)

        // Set environment variable to install browsers in custom location
        process.env.PLAYWRIGHT_BROWSERS_PATH = browserDir

        console.log(`📁 Browser installation directory: ${browserDir}`)

        // Install chromium browser
        execSync('npx playwright install chromium', {
            stdio: 'inherit',
            cwd: process.cwd(),
            env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browserDir }
        })

        console.log('✅ Browser installation completed successfully!')
        console.log(`📍 Browser installed at: ${browserDir}`)

    } catch (error) {
        console.error('❌ Browser installation failed:', error.message)
        process.exit(1)
    }
}

// Run if called directly
if (require.main === module) {
    installBrowser()
}

module.exports = { installBrowser } 