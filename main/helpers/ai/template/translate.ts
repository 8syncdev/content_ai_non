import { BRAND_INFO } from '../info-const'
import type { ProblemContent } from '../../scraper'

export const TRANSLATE_TEMPLATE = `
Bạn là chuyên gia lập trình đa ngôn ngữ. Hãy chuyển đổi bài tập lập trình từ {in_lang} sang {out_lang} theo yêu cầu:

Nội dung gốc ({in_lang}):
Title: {title}
Content: {content}

Yêu cầu chuyển đổi:
- Chuyển đổi TOÀN BỘ code từ {in_lang} sang {out_lang}
- Tất cả mô tả, giải thích phải viết bằng tiếng Việt
- KHÔNG được nhắc đến {in_lang} trong nội dung đầu ra
- Chỉ nói về {out_lang} như thể đây là bài tập gốc
- Test cases phải được giữ nguyên logic và kết quả
- Code phải chạy đúng và cho kết quả giống hệt test cases
- Syntax và convention phải chuẩn {out_lang}
- Comment trong code bằng tiếng Việt

Format output bắt buộc:
# [Tên bài tập tiếng Việt - {out_lang}]

## 📝 Đề bài
[Mô tả bài toán bằng tiếng Việt, tập trung vào {out_lang}, không nhắc đến {in_lang}]

**Yêu cầu:**
- [Yêu cầu cụ thể của bài toán cho {out_lang}]

## 🧪 Test Cases
[Giải thích test cases bằng tiếng Việt, test cases phải giữ nguyên logic]
\`\`\`
[Test cases với format phù hợp {out_lang}]
\`\`\`

## 💻 Lời giải ({out_lang})
\`\`\`{out_lang_code_block}
[Code {out_lang} + comment tiếng Việt]
\`\`\`

**Giải thích chi tiết:**
[Giải thích từng bước bằng tiếng Việt, tập trung vào {out_lang}]

**Kiến thức {out_lang} cần biết:**
[Liệt kê kiến thức {out_lang} cần thiết]

**So sánh với các ngôn ngữ khác:**
[Nêu điểm mạnh/đặc trưng của {out_lang} trong bài này]

${BRAND_INFO}
`

export interface TranslateOptions {
    inLang: string
    outLang: string
    inLangCodeBlock: string
    outLangCodeBlock: string
}

export class TranslateTemplate {
    static generatePrompt(content: ProblemContent, options: TranslateOptions): string {
        return TRANSLATE_TEMPLATE
            .replace(/{title}/g, content.title)
            .replace(/{content}/g, content.content)
            .replace(/{in_lang}/g, options.inLang)
            .replace(/{out_lang}/g, options.outLang)
            .replace(/{out_lang_code_block}/g, options.outLangCodeBlock)
    }
} 