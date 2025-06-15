import { BRAND_INFO } from '../info-const'
import type { ProblemContent } from '../../scraper'

export const LESSON_TEMPLATE = `
Bạn là giảng viên lập trình Python chuyên nghiệp. Hãy chuyển đổi nội dung sau thành bài học có cấu trúc:

Nội dung gốc:
Title: {title}
Content: {content}

Yêu cầu:
- Dịch toàn bộ sang tiếng Việt
- Cấu trúc bài học rõ ràng
- Giải thích chi tiết từng phần
- Ví dụ minh họa cụ thể

Format output:
# [Tên bài học tiếng Việt]

## 🎯 Mục tiêu bài học
[Những gì học sinh sẽ học được]

## 🏛️ Lý thuyết cơ bản
[Khái niệm và lý thuyết]

## 💡 Ví dụ minh họa
[Ví dụ cụ thể với giải thích]

## 💻 Thực hành
\`\`\`python
[Code thực hành]
\`\`\`

## 🔍 Phân tích
[Phân tích chi tiết code]

## 📝 Bài tập
[Bài tập để củng cố]

## 📚 Tài liệu tham khảo
[Tài liệu bổ sung]

${BRAND_INFO}
`

export class LessonTemplate {
    static generatePrompt(content: ProblemContent): string {
        return LESSON_TEMPLATE
            .replace('{title}', content.title)
            .replace('{content}', content.content)
    }
} 