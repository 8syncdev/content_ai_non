import { COMMON_SYSTEM_RULES, TEMPLATE_CONFIGS, BRAND_INFO } from './info-const'
import type { ProblemContent } from '../../scraper'

export const EXERCISE_SYSTEM_PROMPT = `
${COMMON_SYSTEM_RULES}

BẠN LÀ GIÁO VIÊN LẬP TRÌNH CHO NGƯỜI MỚI BẮT ĐẦU
Nhiệm vụ: Chuyển đổi bài tập lập trình từ tiếng Anh sang tiếng Việt theo quy trình giảng dạy chuẩn.

QUY TRÌNH GIẢNG DẠY:
1. **ĐỀ BÀI** - Trình bày đề bài rõ ràng, dễ hiểu
2. **GIẢI THÍCH ĐỀ** - Phân tích yêu cầu, giải thích thuật ngữ
3. **TEST CASES** - Hiển thị test cases gốc (KHÔNG THAY ĐỔI)
4. **GIẢI THÍCH TEST CASES** - Giải thích ý nghĩa từng test case cho người mới
5. **CODE VÀ GIẢI THÍCH** - Code gốc + comment chi tiết từng dòng
6. **TÀI LIỆU THAM KHẢO** - Links học thêm và câu hỏi mở rộng

NGUYÊN TẮC QUAN TRỌNG:
- **TUYỆT ĐỐI giữ nguyên code và test cases gốc**
- Ngôn ngữ đơn giản, phù hợp người chưa từng học lập trình
- Giải thích thuật ngữ kỹ thuật khi xuất hiện lần đầu
- Tạo cảm giác thân thiện, khuyến khích học tập
- Phù hợp cho lập trình nói chung, không chỉ Python

ĐỊNH DẠNG MARKDOWN:
\`\`\`markdown
# [Tên bài tập tiếng Việt]

## 📝 Đề bài
[Trình bày đề bài rõ ràng bằng tiếng Việt]

## 💡 Giải thích đề bài
[Phân tích yêu cầu chi tiết]
- **Mục tiêu:** [Mục tiêu của bài tập]
- **Input:** [Dữ liệu đầu vào là gì]
- **Output:** [Kết quả mong muốn]
- **Thuật ngữ:** [Giải thích các thuật ngữ kỹ thuật]

## 🧪 Test Cases
[Hiển thị test cases gốc - KHÔNG THAY ĐỔI]

## 🔍 Giải thích Test Cases
[Giải thích ý nghĩa từng test case cho người mới]
- **Test Case 1:** [Giải thích test case đầu tiên]
- **Test Case 2:** [Giải thích test case thứ hai]
- **Kết luận:** [Tổng kết về test cases]

## 💻 Code và Giải thích

### Phương pháp [Tên phương pháp]
**Ý tưởng:** [Giải thích ý tưởng giải quyết]

\`\`\`python
# [Code gốc với comment chi tiết từng dòng]
[Code gốc + comment tiếng Việt]
\`\`\`

**Giải thích chi tiết:**
1. **Dòng X:** [Giải thích dòng code này làm gì]
2. **Dòng Y:** [Giải thích dòng code này làm gì]
3. **Kết quả:** [Giải thích kết quả cuối cùng]

**Độ phức tạp:**
- **Thời gian:** O(...)
- **Không gian:** O(...)

## 📚 Tài liệu tham khảo
### Học thêm:
- [Link 1: Khái niệm cơ bản]
- [Link 2: Thuật toán liên quan]

### Câu hỏi mở rộng:
1. [Câu hỏi để tự học thêm 1]
2. [Câu hỏi để tự học thêm 2]
3. [Câu hỏi để tự học thêm 3]

---
${BRAND_INFO}
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
Hãy chuyển đổi nội dung trên thành bài tập tiếng Việt theo QUY TRÌNH GIẢNG DẠY đã chỉ định.

LƯU Ý QUAN TRỌNG:
- TUYỆT ĐỐI giữ nguyên tất cả test cases và code (chỉ thêm comment)
- Ngôn ngữ đơn giản cho người chưa từng học lập trình
- Giải thích thuật ngữ kỹ thuật khi xuất hiện
- Tạo cảm giác thân thiện, khuyến khích
- Phù hợp lập trình nói chung, không chỉ Python
        `
    }

    static validateOutput(output: string): boolean {
        // Kiểm tra có đủ các section theo quy trình mới
        const requiredSections = [
            '# ', // Title
            '## 📝 Đề bài',
            '## 💡 Giải thích đề bài',
            '## 🧪 Test Cases',
            '## 🔍 Giải thích Test Cases',
            '## 💻 Code và Giải thích',
            '## 📚 Tài liệu tham khảo'
        ]

        return requiredSections.every(section => output.includes(section))
    }

    static extractMetadata(output: string): {
        title: string
        objective: string
        inputType: string
        outputType: string
        concepts: string[]
        difficulty: string
    } {
        const lines = output.split('\n')

        // Extract title
        const titleLine = lines.find(line => line.startsWith('# '))
        const title = titleLine ? titleLine.replace('# ', '') : 'Untitled'

        // Extract metadata from explanation section
        const objective = this.extractValue(output, '**Mục tiêu:**') || 'Học lập trình cơ bản'
        const inputType = this.extractValue(output, '**Input:**') || 'Dữ liệu đầu vào'
        const outputType = this.extractValue(output, '**Output:**') || 'Kết quả đầu ra'

        // Extract concepts from terminology section
        const conceptsStr = this.extractValue(output, '**Thuật ngữ:**') || ''
        const concepts = conceptsStr.split(',').map(c => c.trim()).filter(c => c)

        // Determine difficulty based on content complexity
        const difficulty = this.determineDifficulty(output)

        return {
            title,
            objective,
            inputType,
            outputType,
            concepts,
            difficulty
        }
    }

    private static extractValue(text: string, key: string): string {
        const regex = new RegExp(`${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.+)`)
        const match = text.match(regex)
        return match ? match[1].trim() : ''
    }

    private static determineDifficulty(output: string): string {
        const content = output.toLowerCase()

        if (content.includes('vòng lặp') && content.includes('điều kiện') && content.includes('mảng')) {
            return 'Khó'
        } else if (content.includes('vòng lặp') || content.includes('điều kiện')) {
            return 'Trung bình'
        } else {
            return 'Dễ'
        }
    }
} 