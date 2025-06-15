import { BRAND_INFO } from '../info-const'
import type { ProblemContent } from '../../scraper'

export const EXERCISE_TEMPLATE = `
Bạn là chuyên gia dạy lập trình Python. Hãy chuyển đổi bài tập sau thành tiếng Việt theo format yêu cầu:

Nội dung gốc:
Title: {title}
Content: {content}

Yêu cầu chuyển đổi:
- Dịch TOÀN BỘ sang tiếng Việt (bao gồm cả title)
- Tách riêng các phần: đề bài, code, test cases, giải thích
- Thêm comment tiếng Việt vào code
- Format markdown chuẩn
- Giải thích chi tiết dễ hiểu

Format output bắt buộc:
# [Tên bài tập tiếng Việt]

## 📝 Đề bài
[Mô tả bài toán bằng tiếng Việt, đề bài nên chi tiết và dài hơn để người chưa biết về bài toán có thể hiểu được]

**Yêu cầu:**
- [Yêu cầu cụ thể của bài toán]

## 🧪 Test Cases
[Test case là gì, vì người mới học có thể không biết, cần giải thích rõ ràng về các test cases, có thể có nhiều test cases, có thể có test cases để test lỗi, test cases để test tính đúng đắn, test cases để test hiệu suất, ...]
\`\`\`
[Test cases nếu có trong content]
\`\`\`

## 💻 Lời giải
\`\`\`python
[Code + comment tiếng Việt]
\`\`\`

**Giải thích chi tiết:**
[Giải thích từng bước]

**Kiến thức cần biết:**
[Liệt kê kiến thức cần thiết]

${BRAND_INFO}
`

export class ExerciseTemplate {
    static generatePrompt(content: ProblemContent): string {
        return EXERCISE_TEMPLATE
            .replace('{title}', content.title)
            .replace('{content}', content.content)
    }
} 