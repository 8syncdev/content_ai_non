import { COMMON_SYSTEM_RULES, TEMPLATE_CONFIGS } from './info-const'
import type { ProblemContent } from '../../scraper'

export const EXERCISE_SYSTEM_PROMPT = `
${COMMON_SYSTEM_RULES}

BẠN LÀ CHUYÊN GIA GIÁO DỤC LẬP TRÌNH PYTHON
Nhiệm vụ: Chuyển đổi nội dung bài tập crawl từ tiếng Anh sang tiếng Việt với format bài tập chuẩn.

CÁCH THỨC CHUYỂN ĐỔI:

1. **PHÂN TÍCH NỘI DUNG GỐC:**
   - Đọc hiểu đầy đủ bài toán
   - Xác định độ khó và kiến thức cần thiết
   - Phân loại các phương pháp giải

2. **DỊCH VÀ CẢI THIỆN:**
   - Dịch title thành tiếng Việt tự nhiên
   - Viết lại mô tả bài toán dễ hiểu hơn
   - Giải thích từng bước logic của code
   - Thêm comment tiếng Việt vào code

3. **CẤU TRÚC BÀI TẬP CHUẨN:**
   - Header với thông tin bài tập
   - Mô tả bài toán rõ ràng
   - Phân tích các phương pháp giải
   - Code với comment chi tiết
   - Test cases gốc (KHÔNG THAY ĐỔI)
   - Giải thích kết quả
   - Bài tập mở rộng
   - Tài liệu tham khảo

4. **ĐỊNH DẠNG MARKDOWN:**
\`\`\`markdown
# [Tên bài tập tiếng Việt]

## 📋 Thông tin bài tập
- **Độ khó:** [Dễ/Trung bình/Khó]
- **Thời gian:** [Ước tính]
- **Kiến thức:** [Các concept cần biết]
- **Tags:** [python, algorithm, ...]

## 🎯 Mô tả bài toán
[Mô tả bằng tiếng Việt dễ hiểu]

## 💡 Phân tích
[Phân tích cách tiếp cận bài toán]

## 🔧 Các phương pháp giải

### Phương pháp 1: [Tên phương pháp]
**Ý tưởng:** [Giải thích ý tưởng]

**Code:**
\`\`\`python
# Code với comment tiếng Việt chi tiết
[Code gốc + comment]
\`\`\`

**Giải thích:**
[Giải thích từng bước]

**Độ phức tạp:**
- Thời gian: O(...)
- Không gian: O(...)

## 🧪 Test Cases
[Giữ nguyên test cases gốc]

## 🤔 Bài tập mở rộng
[Câu hỏi thêm để rèn luyện]

## 📚 Tài liệu tham khảo
[Links học thêm]
\`\`\`

OUTPUT: Trả về nội dung markdown hoàn chỉnh theo format trên.
`

export class ExerciseTemplateProcessor {
    static generatePrompt(content: ProblemContent): string {
        return `
${EXERCISE_SYSTEM_PROMPT}

===== NỘI DUNG CẦN CHUYỂN ĐỔI =====

**Tiêu đề gốc:** ${content.title}
**Mô tả gốc:** ${content.description}
**URL gốc:** ${content.url}

**Các phương pháp giải (${content.methods.length}):**
${content.methods.map((method, index) => `
--- Phương pháp ${index + 1}: ${method.name} ---
Mô tả: ${method.description}
Code:
\`\`\`python
${method.sourceCode}
\`\`\`
Giải thích: ${method.explanation}
Complexity: ${method.complexity}
Test Cases của phương pháp:
${method.testCases.map((tc, i) => `Test ${i + 1}: ${tc}`).join('\n')}
`).join('\n')}

**Solutions khác (${content.solutions.length}):**
${content.solutions.map((solution, index) => `
--- Solution ${index + 1} ---
\`\`\`python
${solution}
\`\`\`
`).join('\n')}

**Test Cases tổng hợp (${content.testCases.length}):**
${content.testCases.map((testCase, index) => `
Test Case ${index + 1}:
${testCase}
`).join('\n')}

===== YÊU CẦU =====
Hãy chuyển đổi nội dung trên thành bài tập tiếng Việt hoàn chỉnh theo format markdown đã chỉ định.

LƯU Ý QUAN TRỌNG:
- TUYỆT ĐỐI giữ nguyên tất cả test cases (input/output)
- Chỉ thêm comment tiếng Việt vào code, không sửa logic
- Dịch tự nhiên, không dịch máy
- Thêm giá trị cho người học
        `
    }

    static validateOutput(output: string): boolean {
        // Kiểm tra có đủ các section cần thiết
        const requiredSections = [
            '# ', // Title
            '## 📋 Thông tin bài tập',
            '## 🎯 Mô tả bài toán',
            '## 🔧 Các phương pháp giải',
            '## 🧪 Test Cases'
        ]

        return requiredSections.every(section => output.includes(section))
    }

    static extractMetadata(output: string): {
        title: string
        difficulty: string
        estimatedTime: string
        concepts: string[]
        tags: string[]
    } {
        const lines = output.split('\n')

        // Extract title
        const titleLine = lines.find(line => line.startsWith('# '))
        const title = titleLine ? titleLine.replace('# ', '') : 'Untitled'

        // Extract metadata from info section
        const difficulty = this.extractValue(output, '**Độ khó:**') || 'Trung bình'
        const estimatedTime = this.extractValue(output, '**Thời gian:**') || '30 phút'
        const conceptsStr = this.extractValue(output, '**Kiến thức:**') || ''
        const tagsStr = this.extractValue(output, '**Tags:**') || ''

        const concepts = conceptsStr.split(',').map(c => c.trim()).filter(c => c)
        const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t)

        return {
            title,
            difficulty,
            estimatedTime,
            concepts,
            tags
        }
    }

    private static extractValue(text: string, key: string): string {
        const regex = new RegExp(`${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.+)`)
        const match = text.match(regex)
        return match ? match[1].trim() : ''
    }
} 