import { BRAND_INFO } from '../info-const'
import type { ProblemContent } from '../../scraper'

export const LESSON_TEMPLATE = `
Bạn là giảng viên lập trình Python chuyên nghiệp, chuyên dạy cho người mới bắt đầu. Hãy chuyển đổi nội dung sau thành bài học chi tiết, dễ hiểu:

Nội dung gốc:
Title: {title}
Content: {content}

Yêu cầu:
- Dịch toàn bộ sang tiếng Việt đơn giản, dễ hiểu
- Giải thích từ những khái niệm cơ bản nhất
- Sử dụng ngôn ngữ thân thiện, không quá kỹ thuật
- Đưa ra nhiều ví dụ thực tế trong cuộc sống
- Giải thích từng dòng code chi tiết
- Hướng dẫn từng bước cụ thể

Format output:
# [Tên bài học tiếng Việt - dễ hiểu]

## 🎯 Bạn sẽ học được gì?
[Mô tả đơn giản những gì người học sẽ biết sau bài này, dùng ngôn ngữ thân thiện]

## 🤔 Tại sao cần học điều này?
[Giải thích tại sao kiến thức này quan trọng, ứng dụng trong thực tế như thế nào]

## 📚 Kiến thức cơ bản cần biết
[Giải thích các khái niệm cơ bản một cách đơn giản nhất, như giải thích cho trẻ em]

## 🌟 Ví dụ thực tế
[Đưa ra ví dụ trong cuộc sống hàng ngày để người học dễ hình dung]

## 💻 Viết code từng bước
### Bước 1: [Tên bước]
[Giải thích bước này làm gì]
\`\`\`python
[Code của bước này]
\`\`\`
**Giải thích:** [Giải thích từng dòng code bằng tiếng Việt đơn giản]

### Bước 2: [Tên bước]
[Tiếp tục các bước...]

## 🔍 Phân tích chi tiết
[Giải thích tại sao code hoạt động như vậy, dùng ngôn ngữ đơn giản]

## ⚠️ Những lỗi thường gặp
[Liệt kê các lỗi người mới thường mắc phải và cách khắc phục]

## 🏃‍♂️ Thực hành ngay
[Bài tập đơn giản để người học thực hành ngay]

## 🎉 Tóm tắt
[Tóm tắt những điểm quan trọng nhất bằng ngôn ngữ đơn giản]

## 📖 Đọc thêm
[Gợi ý tài liệu hoặc chủ đề liên quan để học tiếp]

${BRAND_INFO}
`

export class LessonTemplate {
    static generatePrompt(content: ProblemContent): string {
        return LESSON_TEMPLATE
            .replace('{title}', content.title)
            .replace('{content}', content.content)
    }
} 