import { BRAND_INFO } from '../info-const'
import type { ProblemContent } from '../../scraper'

export const EXERCISE_PROMPT = `
Chuyển đổi bài tập lập trình sang tiếng Việt:

QUY TẮC:
- Giữ nguyên 100% test cases và code gốc
- Dịch tiếng Việt tự nhiên, dễ hiểu
- Thêm comment tiếng Việt vào code
- Format markdown chuẩn

FORMAT:
# [Tên bài tập tiếng Việt]

## 📝 Đề bài
[Mô tả bài toán ngắn gọn]

## 🧪 Test Cases
[Giữ nguyên test cases gốc]

## 💻 Lời giải
\`\`\`python
# Code gốc + comment tiếng Việt
[code]
\`\`\`

**Giải thích:**
[Giải thích ngắn gọn cách hoạt động]

${BRAND_INFO}
`

export class ExerciseTemplate {
    static generatePrompt(content: ProblemContent): string {
        return `${EXERCISE_PROMPT}

===== NỘI DUNG =====
Title: ${content.title}
Description: ${content.description}
URL: ${content.url}

Methods:
${content.methods.map(m => `
${m.name}: ${m.description}
Code: ${m.sourceCode}
Test Cases: ${m.testCases.join('\n')}
`).join('\n')}

Test Cases:
${content.testCases.join('\n')}
`
    }

    static validate(output: string): boolean {
        const required = ['# ', '## 📝 Đề bài', '## 🧪 Test Cases', '## 💻 Lời giải']
        return required.every(section => output.includes(section))
    }
} 