import { BRAND_INFO } from '../info-const'
import type { ProblemContent } from '../../scraper'

export const LESSON_TEMPLATE = `
Bạn là chuyên gia dạy lập trình Python. Hãy chuyển đổi nội dung sau thành bài học tiếng Việt:

Nội dung gốc:
Title: {title}
Description: {description}
Code: {code}

Yêu cầu chuyển đổi:
- Dịch TOÀN BỘ sang tiếng Việt (bao gồm cả title)
- Ngôn ngữ đơn giản, dễ hiểu cho người mới
- Cấu trúc bài học rõ ràng
- Thêm ví dụ minh họa
- Format markdown chuẩn

Format output bắt buộc:
# [Tên bài học tiếng Việt]

## 📚 Giới thiệu
[Giới thiệu chủ đề bằng tiếng Việt]

## 🎯 Mục tiêu
- [Mục tiêu học tập cụ thể]

## 📖 Nội dung

### [Khái niệm chính]
[Giải thích khái niệm chi tiết]

\`\`\`python
[Code với comment tiếng Việt]
\`\`\`

## 🛠️ Thực hành
[Hướng dẫn thực hành cụ thể]

${BRAND_INFO}
`

export class LessonTemplate {
    static generatePrompt(content: ProblemContent): string {
        const code = content.methods.map(m => m.sourceCode).join('\n\n')

        return LESSON_TEMPLATE
            .replace('{title}', content.title)
            .replace('{description}', content.description)
            .replace('{code}', code)
    }
} 