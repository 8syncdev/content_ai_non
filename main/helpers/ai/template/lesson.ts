import { BRAND_INFO } from '../info-const'
import type { ProblemContent } from '../../scraper'

export const LESSON_PROMPT = `
Chuyển đổi nội dung thành bài học tiếng Việt:

QUY TẮC:
- Ngôn ngữ đơn giản, dễ hiểu
- Cấu trúc bài học rõ ràng
- Thêm ví dụ minh họa
- Format markdown chuẩn

FORMAT:
# [Tên bài học]

## 📚 Giới thiệu
[Giới thiệu chủ đề ngắn gọn]

## 🎯 Mục tiêu
- [Mục tiêu 1]
- [Mục tiêu 2]

## 📖 Nội dung

### [Khái niệm chính]
[Giải thích khái niệm]

\`\`\`python
# Ví dụ code với comment
[code]
\`\`\`

## 🛠️ Thực hành
[Bài tập thực hành]

${BRAND_INFO}
`

export class LessonTemplate {
    static generatePrompt(content: ProblemContent): string {
        return `${LESSON_PROMPT}

===== NỘI DUNG =====
Title: ${content.title}
Description: ${content.description}

Methods:
${content.methods.map(m => `
${m.name}: ${m.description}
Code: ${m.sourceCode}
`).join('\n')}
`
    }

    static validate(output: string): boolean {
        const required = ['# ', '## 📚 Giới thiệu', '## 🎯 Mục tiêu', '## 📖 Nội dung']
        return required.every(section => output.includes(section))
    }
} 