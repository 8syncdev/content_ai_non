import { COMMON_SYSTEM_RULES, TEMPLATE_CONFIGS } from './info-const'
import type { ProblemContent } from '../../scraper'

export const LESSON_SYSTEM_PROMPT = `
${COMMON_SYSTEM_RULES}

BẠN LÀ GIÁO VIÊN LẬP TRÌNH PYTHON GIÀU KINH NGHIỆM
Nhiệm vụ: Chuyển đổi nội dung crawl thành bài học có cấu trúc cho người mới học lập trình.

CÁCH THỨC CHUYỂN ĐỔI:

1. **PHÂN TÍCH VÀ TỔ CHỨC:**
   - Xác định kiến thức chính cần truyền đạt
   - Sắp xếp nội dung theo trình tự logic
   - Xác định mức độ phù hợp cho người mới

2. **GIẢNG DẠY HIỆU QUẢ:**
   - Bắt đầu từ khái niệm cơ bản
   - Giải thích "tại sao" trước "làm thế nào"
   - Sử dụng ví dụ thực tế dễ hiểu
   - Kết nối với kiến thức đã học

3. **CẤU TRÚC BÀI HỌC CHUẨN:**
   - Mục tiêu học tập rõ ràng
   - Kiến thức cần có trước
   - Giới thiệu khái niệm
   - Lý thuyết với ví dụ
   - Thực hành có hướng dẫn
   - Tổng kết và bước tiếp theo

4. **ĐỊNH DẠNG MARKDOWN:**
\`\`\`markdown
# [Tên bài học tiếng Việt]

## 📚 Thông tin bài học
- **Chương:** [Tên chương]
- **Bài:** [Số thứ tự]
- **Thời gian:** [Thời gian học]
- **Độ khó:** [Dễ/Trung bình/Khó]

## 🎯 Mục tiêu bài học
Sau khi học xong bài này, bạn sẽ:
- [Mục tiêu 1]
- [Mục tiêu 2]
- [Mục tiêu 3]

## 📋 Kiến thức cần có
- [Kiến thức 1]
- [Kiến thức 2]

## 🌟 Giới thiệu
[Giới thiệu hấp dẫn về chủ đề]

## 📖 Lý thuyết

### [Khái niệm 1]
[Giải thích khái niệm]

**Ví dụ minh họa:**
\`\`\`python
# Code ví dụ với comment chi tiết
[Code + comment tiếng Việt]
\`\`\`

**Giải thích:**
[Giải thích từng bước]

### [Khái niệm 2]
[Tiếp tục các khái niệm khác]

## 🛠️ Thực hành

### Bài tập 1: [Tên bài tập]
**Yêu cầu:** [Mô tả yêu cầu]

**Hướng dẫn:**
1. [Bước 1]
2. [Bước 2]
3. [Bước 3]

**Lời giải:**
\`\`\`python
# Lời giải với comment
[Code + giải thích]
\`\`\`

## 🧪 Test Cases
[Giữ nguyên test cases gốc]

## 💡 Tips và Tricks
- [Tip 1]
- [Tip 2]

## ⚠️ Lỗi thường gặp
- **Lỗi:** [Mô tả lỗi]
  **Cách khắc phục:** [Hướng dẫn sửa]

## 📝 Tóm tắt
[Tóm tắt những điểm chính]

## 🚀 Bước tiếp theo
- [Gợi ý học tiếp]
- [Bài tập về nhà]

## 📚 Tài liệu tham khảo
- [Link 1]
- [Link 2]
\`\`\`

OUTPUT: Trả về nội dung markdown hoàn chỉnh theo format trên.
`

export class LessonTemplateProcessor {
    static generatePrompt(content: ProblemContent): string {
        return `
${LESSON_SYSTEM_PROMPT}

===== NỘI DUNG CẦN CHUYỂN ĐỔI THÀNH BÀI HỌC =====

**Tiêu đề gốc:** ${content.title}
**Mô tả gốc:** ${content.description}
**URL gốc:** ${content.url}

**Các kỹ thuật được trình bày (${content.methods.length}):**
${content.methods.map((method, index) => `
--- Kỹ thuật ${index + 1}: ${method.name} ---
Mô tả: ${method.description}
Code minh họa:
\`\`\`python
${method.sourceCode}
\`\`\`
Giải thích: ${method.explanation}
Phân tích độ phức tạp: ${method.complexity}
Ví dụ test:
${method.testCases.map((tc, i) => `Ví dụ ${i + 1}: ${tc}`).join('\n')}
`).join('\n')}

**Các ví dụ code khác (${content.solutions.length}):**
${content.solutions.map((solution, index) => `
--- Ví dụ ${index + 1} ---
\`\`\`python
${solution}
\`\`\`
`).join('\n')}

**Các test cases mẫu (${content.testCases.length}):**
${content.testCases.map((testCase, index) => `
Test Case ${index + 1}:
${testCase}
`).join('\n')}

===== YÊU CẦU =====
Hãy chuyển đổi nội dung trên thành bài học tiếng Việt hoàn chỉnh theo format markdown đã chỉ định.

TRỌNG TÂM:
- Tập trung vào việc GIẢNG DẠY các khái niệm và kỹ thuật
- Giải thích TẠI SAO sử dụng kỹ thuật này
- Hướng dẫn CÁCH ÁP DỤNG vào thực tế
- Tạo cảm giác THÂN THIỆN và KHUYẾN KHÍCH học tập

LƯU Ý QUAN TRỌNG:
- TUYỆT ĐỐI giữ nguyên tất cả test cases (input/output)
- Chỉ thêm comment tiếng Việt vào code, không sửa logic
- Ngôn ngữ phù hợp cho người mới học
- Thêm nhiều ví dụ thực tế
        `
    }

    static validateOutput(output: string): boolean {
        // Kiểm tra có đủ các section cần thiết cho bài học
        const requiredSections = [
            '# ', // Title
            '## 📚 Thông tin bài học',
            '## 🎯 Mục tiêu bài học',
            '## 📖 Lý thuyết',
            '## 🛠️ Thực hành'
        ]

        return requiredSections.every(section => output.includes(section))
    }

    static extractMetadata(output: string): {
        title: string
        chapter: string
        lessonNumber: number
        difficulty: string
        estimatedTime: string
        objectives: string[]
        prerequisites: string[]
    } {
        const lines = output.split('\n')

        // Extract title
        const titleLine = lines.find(line => line.startsWith('# '))
        const title = titleLine ? titleLine.replace('# ', '') : 'Untitled Lesson'

        // Extract metadata from info section
        const chapter = this.extractValue(output, '**Chương:**') || 'Python Basics'
        const lessonStr = this.extractValue(output, '**Bài:**') || '1'
        const lessonNumber = parseInt(lessonStr) || 1
        const difficulty = this.extractValue(output, '**Độ khó:**') || 'Trung bình'
        const estimatedTime = this.extractValue(output, '**Thời gian:**') || '45 phút'

        // Extract objectives
        const objectivesSection = this.extractSection(output, '## 🎯 Mục tiêu bài học', '##')
        const objectives = this.extractListItems(objectivesSection)

        // Extract prerequisites
        const prerequisitesSection = this.extractSection(output, '## 📋 Kiến thức cần có', '##')
        const prerequisites = this.extractListItems(prerequisitesSection)

        return {
            title,
            chapter,
            lessonNumber,
            difficulty,
            estimatedTime,
            objectives,
            prerequisites
        }
    }

    private static extractValue(text: string, key: string): string {
        const regex = new RegExp(`${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.+)`)
        const match = text.match(regex)
        return match ? match[1].trim() : ''
    }

    private static extractSection(text: string, startMarker: string, endMarker: string): string {
        const startIndex = text.indexOf(startMarker)
        if (startIndex === -1) return ''

        const searchStart = startIndex + startMarker.length
        const endIndex = text.indexOf(endMarker, searchStart)

        if (endIndex === -1) {
            return text.substring(searchStart)
        }

        return text.substring(searchStart, endIndex)
    }

    private static extractListItems(section: string): string[] {
        const lines = section.split('\n')
        return lines
            .filter(line => line.trim().startsWith('- '))
            .map(line => line.trim().substring(2))
            .filter(item => item.length > 0)
    }
} 