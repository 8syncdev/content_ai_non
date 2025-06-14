import { BRAND_INFO } from '../info-const'
import type { ProblemContent } from '../../scraper'

export const EXERCISE_TEMPLATE = `
Bạn là chuyên gia dạy lập trình Python. Hãy chuyển đổi bài tập sau thành tiếng Việt theo format yêu cầu:

Nội dung gốc:
Title: {title}
Description: {description}
Code: {code}
Test Cases: {testCases}

Yêu cầu chuyển đổi:
- Dịch TOÀN BỘ sang tiếng Việt (bao gồm cả title)
- Giữ nguyên 100% test cases và code gốc
- Thêm comment tiếng Việt vào code
- Format markdown chuẩn
- Giải thích chi tiết dễ hiểu

Format output bắt buộc:
# [Tên bài tập tiếng Việt]

## 📝 Đề bài
[Mô tả bài toán bằng tiếng Việt]

**Yêu cầu:**
- [Yêu cầu cụ thể của bài toán]

## 🧪 Test Cases
\`\`\`
[Giữ nguyên test cases gốc]
\`\`\`

## 💻 Lời giải
\`\`\`python
[Code gốc + comment tiếng Việt]
\`\`\`

**Giải thích chi tiết:**
[Giải thích từng bước]

**Kiến thức cần biết:**
[Liệt kê kiến thức cần thiết]

${BRAND_INFO}
`

export class ExerciseTemplate {
    static generatePrompt(content: ProblemContent): string {
        const code = content.methods.map(m => m.sourceCode).join('\n\n')
        const testCases = content.testCases.join('\n')

        return EXERCISE_TEMPLATE
            .replace('{title}', content.title)
            .replace('{description}', content.description)
            .replace('{code}', code)
            .replace('{testCases}', testCases)
    }
} 