
## Lộ Trình Phát Triển Backend Node.js

### Phần 1: Các Khái Niệm Cơ Bản của Node.js (Buổi 1-10)

**Buổi 1: Ôn tập JavaScript Căn bản (2 giờ)**
* **Mục tiêu:** Củng cố kiến thức nền tảng JavaScript ES6+ cần thiết cho Node.js.
* **Nội dung:**
    * Giới thiệu về JavaScript ES6+ và tầm quan trọng của nó trong Node.js.
    * Ôn tập `let`, `const` và sự khác biệt so với `var`.
    * Hàm mũi tên (Arrow Functions): cú pháp, `this` context.
    * Chuỗi mẫu (Template Literals) để tạo chuỗi dễ đọc hơn.
    * Cấu trúc phân giải (Destructuring) cho mảng và đối tượng.
    * Toán tử trải rộng/phần còn lại (Spread/Rest Operators).

**Buổi 2: Cài đặt Môi trường Node.js & Hello World (2 giờ)**
* **Mục tiêu:** Thiết lập môi trường phát triển Node.js và chạy ứng dụng đầu tiên.
* **Nội dung:**
    * Hướng dẫn chi tiết cài đặt **Node.js** từ trang web chính thức.
    * Giới thiệu **npm** (Node Package Manager) và **Yarn** (tùy chọn) - công cụ quản lý gói.
    * Tạo ứng dụng Node.js đầu tiên với script "Hello, World!" đơn giản.
    * Cách chạy ứng dụng từ dòng lệnh.
    * Khởi tạo tệp `package.json` bằng `npm init -y` và ý nghĩa của nó.
    * Tìm hiểu về ngữ cảnh `this`, closures và phạm vi biến trong JavaScript.
    * Giới thiệu cơ bản về Lập trình Hướng đối tượng (OOP) trong JavaScript: đối tượng, lớp và kế thừa.

**Buổi 3: Lập trình Bất Đồng Bộ & Vòng lặp Sự kiện (2 giờ)**
* **Mục tiêu:** Hiểu sâu về lập trình bất đồng bộ và cơ chế Event Loop - trái tim của Node.js.
* **Nội dung:**
    * Giải thích tại sao Node.js cần lập trình bất đồng bộ (I/O không chặn, hiệu suất cao).
    * Tìm hiểu về **Vòng lặp Sự kiện (Event Loop)**: cơ chế hoạt động, tại sao Node.js đơn luồng nhưng vẫn hiệu quả.
    * Giải thích các pha của Vòng lặp Sự kiện: Timers, Pending Callbacks, Poll, Check, Close Callbacks.
    * Thực hành các ví dụ đơn giản để minh họa Event Loop.

**Buổi 4: Callbacks & Vấn đề "Callback Hell" (2 giờ)**
* **Mục tiêu:** Nắm vững Callbacks và nhận diện các vấn đề tiềm ẩn của chúng.
* **Nội dung:**
    * Khái niệm Callback: Hàm được truyền làm đối số và được gọi lại sau.
    * Thực hành các thao tác bất đồng bộ dựa trên callback, ví dụ: đọc tệp bằng `fs.readFile()`.
    * Phân tích vấn đề **"Callback Hell"** hay "Pyramid of Doom" khi sử dụng quá nhiều callback lồng nhau.
    * Thảo luận về nhược điểm của Callbacks trong việc quản lý luồng code và xử lý lỗi.

**Buổi 5: Promises & Async/Await (2 giờ)**
* **Mục tiêu:** Học cách xử lý bất đồng bộ một cách thanh lịch hơn bằng Promises và Async/Await.
* **Nội dung:**
    * **Promises:** Khái niệm, các trạng thái (Pending, Fulfilled, Rejected).
    * Sử dụng `.then()` để xử lý kết quả thành công, `.catch()` để bắt lỗi, và `.finally()`.
    * Cách xâu chuỗi Promise để xử lý các chuỗi thao tác bất đồng bộ.
    * `Promise.all()` và `Promise.race()` để quản lý nhiều Promise cùng lúc.
    * **Async/Await:** Cú pháp hiện đại, cách sử dụng `async` và `await`.
    * Xử lý lỗi với khối `try...catch` trong Async/Await.
    * So sánh Callbacks, Promises, và Async/Await về tính dễ đọc và quản lý code.

**Buổi 6: Module HTTP: Xây dựng Máy chủ Cơ bản (2 giờ)**
* **Mục tiêu:** Học cách sử dụng module HTTP tích hợp để tạo máy chủ web đơn giản.
* **Nội dung:**
    * Giới thiệu module `http` của Node.js.
    * Tạo một máy chủ web đơn giản bằng `http.createServer()`.
    * Xử lý các yêu cầu đến (`req`) và gửi phản hồi (`res`).
    * Hiểu các phương thức HTTP cơ bản (GET, POST, PUT, DELETE).
    * Ý nghĩa của các mã trạng thái HTTP (200 OK, 404 Not Found, 500 Internal Server Error, v.v.).
    * Thực hành xây dựng một API đơn giản không dùng framework để thực hiện thao tác CRUD cơ bản trên dữ liệu tạm thời.

**Buổi 7: Module Hệ thống Tệp (fs) (2 giờ)**
* **Mục tiêu:** Tìm hiểu cách tương tác với hệ thống tệp bằng module `fs`.
* **Nội dung:**
    * Giới thiệu module `fs` (File System) tích hợp sẵn.
    * Phân biệt các thao tác tệp đồng bộ và bất đồng bộ, khi nào nên sử dụng từng loại.
    * Thực hành đọc tệp bằng `fs.readFile()` (bất đồng bộ) và `fs.readFileSync()` (đồng bộ).
    * Thực hành ghi tệp bằng `fs.writeFile()` và `fs.appendFile()`.
    * Các thao tác khác: mở tệp, đóng tệp, đổi tên tệp.

**Buổi 8: Module Path & Sự kiện (EventEmitter) (2 giờ)**
* **Mục tiêu:** Nắm vững cách làm việc với đường dẫn tệp và lập trình hướng sự kiện.
* **Nội dung:**
    * **Module Path:**
        * Giới thiệu module `path` để xử lý đường dẫn tệp và thư mục.
        * Các phương thức chính: `path.join()`, `path.resolve()`, `path.basename()`, `path.dirname()`, `path.extname()`, `path.parse()`.
    * **Module Sự kiện (EventEmitter):**
        * Node.js và cách tiếp cận hướng sự kiện.
        * Lớp `EventEmitter`: cách phát ra và lắng nghe các sự kiện tùy chỉnh.
        * Sử dụng các phương thức: `on`, `emit`, `once`, `removeListener`.
        * Quan trọng của việc xử lý sự kiện 'error'.

**Buổi 9: Streams: Xử lý Dữ liệu Hiệu quả (2 giờ)**
* **Mục tiêu:** Hiểu và áp dụng Streams để xử lý dữ liệu lớn một cách hiệu quả.
* **Nội dung:**
    * Khái niệm Streams: cách xử lý dữ liệu tăng dần và tối ưu hóa bộ nhớ.
    * Khi nào nên sử dụng Streams (ví dụ: đọc/ghi tệp lớn, yêu cầu mạng).
    * Các loại Streams chính:
        * Readable Streams (để đọc dữ liệu).
        * Writable Streams (để ghi dữ liệu).
        * Duplex Streams (cả đọc và ghi).
        * Transform Streams (biến đổi dữ liệu).
    * Phương thức `.pipe()`: nối các stream để luân chuyển dữ liệu mượt mà.
    * Thực hành với ví dụ về đọc/ghi tệp lớn sử dụng Streams.

**Buổi 10: Buffers & Hệ thống Module (2 giờ)**
* **Mục tiêu:** Làm việc với dữ liệu nhị phân và hiểu sự khác biệt giữa các hệ thống module.
* **Nội dung:**
    * **Buffers:**
        * Khái niệm Buffer: làm việc với dữ liệu nhị phân thô (tệp, giao thức mạng, hình ảnh).
        * Tạo Buffer: `Buffer.alloc()`, `Buffer.from()`.
        * Ghi và đọc dữ liệu từ Buffer: `write()`, `toString()`.
    * **Hệ thống Module:**
        * So sánh **CommonJS** (`require()`, `module.exports`) và **ES Modules** (`import`/`export`).
        * Các điểm khác biệt chính: cú pháp, cơ chế tải, biến toàn cục (`__dirname`, `__filename`), phần mở rộng tệp, Tree-shaking.
        * Khi nào nên sử dụng CommonJS và khi nào nên ưu tiên ES Modules cho các dự án mới.

---

### Phần 2: Xây dựng API Mạnh Mẽ với Express.js (Buổi 11-20)

**Buổi 11: Giới thiệu về Express.js (2 giờ)**
* **Mục tiêu:** Bắt đầu với Express.js, framework backend phổ biến nhất của Node.js.
* **Nội dung:**
    * Tại sao nên sử dụng **Express.js** (tối giản, linh hoạt, cộng đồng lớn).
    * Cài đặt dự án Express: `npm init -y` và `npm install express`.
    * Tạo một máy chủ Express cơ bản bằng `app.listen()`.
    * Tìm hiểu về đối tượng `Request` (`req`) và `Response` (`res`) trong Express.

**Buổi 12: Định tuyến Cơ bản với Express.js (2 giờ)**
* **Mục tiêu:** Định nghĩa các tuyến đường (routes) để xử lý các yêu cầu HTTP khác nhau.
* **Nội dung:**
    * Khái niệm Định tuyến: cách ứng dụng phản hồi các yêu cầu đến.
    * Định nghĩa các tuyến đường bằng các phương thức HTTP:
        * `app.get()` cho yêu cầu đọc dữ liệu.
        * `app.post()` cho yêu cầu tạo dữ liệu.
        * `app.put()` cho yêu cầu cập nhật dữ liệu.
        * `app.delete()` cho yêu cầu xóa dữ liệu.
    * Thực hành tạo các tuyến đường đơn giản và gửi các phản hồi cơ bản (ví dụ: gửi chuỗi, JSON).

**Buổi 13: Express.js Middleware (2 giờ)**
* **Mục tiêu:** Hiểu và sử dụng các hàm Middleware trong Express.js.
* **Nội dung:**
    * Khái niệm **Middleware**: các hàm có quyền truy cập vào `req`, `res`, và `next()`.
    * Các tác vụ mà Middleware có thể thực hiện (thực thi mã, thay đổi đối tượng, kết thúc chu kỳ, gọi `next()`).
    * Tầm quan trọng của thứ tự tải Middleware.
    * Giới thiệu các Middleware tích hợp sẵn: `express.json()` (phân tích JSON), `express.urlencoded()` (phân tích URL-encoded data), `express.static()` (phục vụ tệp tĩnh).

**Buổi 14: Xây dựng Middleware Tùy chỉnh (2 giờ)**
* **Mục tiêu:** Tạo và sử dụng các Middleware tùy chỉnh để thêm chức năng riêng.
* **Nội dung:**
    * Hướng dẫn từng bước tạo một Middleware ghi nhật ký đơn giản (ví dụ: ghi lại phương thức và URL của mỗi yêu cầu).
    * Tạo một Middleware xác thực cơ bản (ví dụ: kiểm tra header `Authorization`).
    * Cách áp dụng Middleware cho tất cả các tuyến đường (`app.use()`) hoặc cho các tuyến đường cụ thể.

**Buổi 15: Xử lý Request Body, Parameters, và Queries (2 giờ)**
* **Mục tiêu:** Truy cập và sử dụng dữ liệu từ các phần khác nhau của yêu cầu HTTP.
* **Nội dung:**
    * Truy cập dữ liệu từ **Request Body** (`req.body`) sau khi sử dụng middleware `express.json()` hoặc `express.urlencoded()`.
    * Trích xuất **tham số tuyến đường** (`req.params`) từ các URL động (ví dụ: `/users/:id`).
    * Làm việc với **tham số truy vấn** (`req.query`) từ chuỗi truy vấn (ví dụ: `/users?name=John&age=30`).
    * Thực hành xây dựng các tuyến đường xử lý dữ liệu từ cả ba nguồn này.

**Buổi 16: Nguyên tắc Thiết kế API RESTful (2 giờ)**
* **Mục tiêu:** Hiểu các nguyên tắc cơ bản để thiết kế API theo chuẩn RESTful.
* **Nội dung:**
    * Giới thiệu về **REST (Representational State Transfer)** và API RESTful.
    * Các nguyên tắc thiết kế chính:
        * **Client-Server:** Tách biệt ứng dụng khách và máy chủ.
        * **Statelessness (Không trạng thái):** Mỗi yêu cầu độc lập, máy chủ không lưu trạng thái phiên.
        * **Cacheability (Có thể lưu vào bộ nhớ đệm):** Tối ưu hóa hiệu suất.
        * **Uniform Interface (Giao diện Đồng nhất):** Tài nguyên, URL, phương thức HTTP.
        * **Layered System (Hệ thống Phân lớp):** Thêm các máy chủ trung gian.
    * Tài nguyên (Resources) là khái niệm chính trong REST và cách chúng được xác định bằng URIs.

**Buổi 17: Triển khai các Thao tác CRUD RESTful (2 giờ)**
* **Mục tiêu:** Áp dụng các nguyên tắc RESTful để xây dựng các điểm cuối API CRUD.
* **Nội dung:**
    * Ánh xạ các phương thức HTTP (GET, POST, PUT, DELETE) tới các thao tác CRUD (Create, Read, Update, Delete).
    * Thực hành triển khai các điểm cuối API cho một tài nguyên đơn giản (ví dụ: "sản phẩm" hoặc "người dùng").
    * Xử lý yêu cầu và phản hồi cho POST/PUT.
    * Thiết lập các mã trạng thái HTTP thích hợp: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`.

**Buổi 18: Cấu trúc Dự án Express.js với MVC (2 giờ)**
* **Mục tiêu:** Áp dụng mô hình MVC để tổ chức mã nguồn dự án Express.js một cách rõ ràng và dễ bảo trì.
* **Nội dung:**
    * Giới thiệu mô hình **Model-View-Controller (MVC)** cho backend Node.js.
    * Phân tách các mối quan tâm thành:
        * **Models:** Tương tác với cơ sở dữ liệu và logic dữ liệu.
        * **Controllers:** Xử lý yêu cầu/phản hồi, chứa logic nghiệp vụ.
        * **Routes:** Định nghĩa điểm cuối API và ánh xạ đến Controller.
    * Hướng dẫn tạo cấu trúc thư mục dự án theo MVC (`controllers/`, `models/`, `routes/`).

**Buổi 19: Biến Môi trường, Cấu hình & Lớp Service (2 giờ)**
* **Mục tiêu:** Quản lý cấu hình ứng dụng và tách biệt logic nghiệp vụ.
* **Nội dung:**
    * Quan trọng của việc không mã hóa cứng thông tin nhạy cảm.
    * Sử dụng biến môi trường với gói **`dotenv`** để quản lý thông tin cấu hình (`.env`).
    * Tập trung cấu hình vào thư mục `config/` cho các môi trường khác nhau.
    * Giới thiệu **lớp Service** (Service Layer) để tách logic nghiệp vụ khỏi Controller.
    * Tổ chức tuyến đường theo loại tài nguyên bằng `express.Router()`.

**Buổi 20: Xử lý Lỗi Tập trung trong Express.js (2 giờ)**
* **Mục tiêu:** Triển khai cơ chế xử lý lỗi mạnh mẽ và tập trung.
* **Nội dung:**
    * Tầm quan trọng của xử lý lỗi đúng cách cho API đáng tin cậy.
    * Triển khai **middleware xử lý lỗi toàn cục** trong Express.js.
    * Cách bắt lỗi và truyền lỗi xuống chuỗi middleware bằng `next(error)`.
    * Phân biệt **lỗi nghiệp vụ (operational errors)** (ví dụ: lỗi xác thực) và **lỗi lập trình (programmer errors)** (ví dụ: lỗi cú pháp).
    * Chiến lược xử lý cho từng loại lỗi để đảm bảo ứng dụng vẫn phản hồi.

---

### Phần 3: Lưu trữ Dữ liệu & Tích hợp Cơ sở dữ liệu (Buổi 21-30)

**Buổi 21: Các Khái Niệm Cơ bản về Cơ sở dữ liệu: SQL vs NoSQL (2 giờ)**
* **Mục tiêu:** Hiểu sự khác biệt cơ bản giữa cơ sở dữ liệu SQL và NoSQL.
* **Nội dung:**
    * Giới thiệu hai loại cơ sở dữ liệu chính: **SQL (Quan hệ)** và **NoSQL (Phi quan hệ)**.
    * So sánh chi tiết về:
        * **Loại:** RDBMS vs Phi quan hệ/Phân tán.
        * **Cấu trúc dữ liệu:** Bảng vs Tài liệu/Key-value/Graph.
        * **Schema:** Cố định vs Linh hoạt.
        * **Khả năng mở rộng:** Chiều dọc vs Chiều ngang.
        * **Tính toàn vẹn dữ liệu:** ACID vs BASE.
        * **Ngôn ngữ truy vấn:** SQL vs Đa dạng.
        * **Hiệu suất:** Truy vấn phức tạp vs Khối lượng lớn.
    * Các ví dụ điển hình cho từng loại (MySQL, PostgreSQL vs MongoDB).

**Buổi 22: Chọn Cơ sở dữ liệu Phù hợp (2 giờ)**
* **Mục tiêu:** Đưa ra quyết định thông minh về việc chọn loại cơ sở dữ liệu cho dự án.
* **Nội dung:**
    * Các yếu tố cần xem xét khi lựa chọn giữa SQL và NoSQL: cấu trúc dữ liệu, nhu cầu mở rộng, yêu cầu về tính nhất quán, độ phức tạp của truy vấn, loại dự án.
    * Thực hành phân tích các kịch bản dự án khác nhau và thảo luận về lựa chọn cơ sở dữ liệu tối ưu.
    * Tổng kết các ưu và nhược điểm của từng loại cơ sở dữ liệu trong các tình huống thực tế.

**Buổi 23: Mô hình hóa Dữ liệu: Khái niệm & Logic (2 giờ)**
* **Mục tiêu:** Bắt đầu quá trình mô hình hóa dữ liệu để thiết kế cơ sở dữ liệu hiệu quả.
* **Nội dung:**
    * Tầm quan trọng của mô hình hóa dữ liệu trong thiết kế backend.
    * **Mô hình dữ liệu khái niệm (Conceptual Data Model):** tập trung vào khái niệm nghiệp vụ và mối quan hệ.
    * **Mô hình dữ liệu logic (Logical Data Model - LDM):** mô tả các thực thể logic, thuộc tính và mối quan hệ giữa chúng (ERD - Entity Relationship Diagram).
    * Thực hành vẽ các lược đồ ERD đơn giản cho một dự án mẫu.

**Buổi 24: Mô hình hóa Dữ liệu: Vật lý & Chuẩn hóa (2 giờ)**
* **Mục tiêu:** Chuyển đổi mô hình logic sang vật lý và áp dụng chuẩn hóa.
* **Nội dung:**
    * **Mô hình dữ liệu vật lý (Physical Data Model - PDM):** thiết kế schema nội bộ của cơ sở dữ liệu (bảng, cột, kiểu dữ liệu, ràng buộc).
    * **Chuẩn hóa (Normalization):** Quy trình giảm dư thừa dữ liệu và cải thiện tính toàn vẹn.
    * Giới thiệu các dạng chuẩn: 1NF, 2NF, 3NF.
    * Thực hành áp dụng các quy tắc chuẩn hóa cho một bảng dữ liệu.

**Buổi 25: Phi chuẩn hóa & Thực hành Tốt nhất Mô hình hóa (2 giờ)**
* **Mục tiêu:** Cân bằng giữa chuẩn hóa và hiệu suất, áp dụng các thực hành tốt nhất.
* **Nội dung:**
    * **Phi chuẩn hóa (Denormalization):** Cố ý giới thiệu dư thừa để cải thiện hiệu suất đọc.
    * Khi nào nên phi chuẩn hóa và đánh đổi của nó.
    * Các Thực hành Tốt nhất về Mô hình hóa Dữ liệu:
        * Bắt đầu với yêu cầu nghiệp vụ.
        * Cộng tác giữa các nhóm.
        * Sử dụng quy ước đặt tên nhất quán.
        * Tài liệu hóa mô hình dữ liệu.
        * Tối ưu hóa hiệu suất (lập chỉ mục).
        * Lập kế hoạch cho khả năng mở rộng và bảo mật.

**Buổi 26: Tích hợp Node.js với PostgreSQL (2 giờ)**
* **Mục tiêu:** Bắt đầu kết nối Node.js với cơ sở dữ liệu quan hệ PostgreSQL.
* **Nội dung:**
    * Giới thiệu tổng quan về **PostgreSQL** và tại sao nó phổ biến.
    * Hướng dẫn cài đặt một phiên bản PostgreSQL cục bộ (ví dụ: dùng Docker hoặc cài đặt trực tiếp).
    * Sử dụng module **`node-postgres`** để thiết lập kết nối cơ bản.
    * Thực thi các truy vấn SQL thô (ví dụ: `SELECT`, `INSERT`).
    * Quan trọng của **connection pooling** để tối ưu hiệu suất.

**Buổi 27: Sử dụng ORM: Sequelize hoặc TypeORM (2 giờ)**
* **Mục tiêu:** Giới thiệu ORM (Object-Relational Mapper) và bắt đầu sử dụng một ORM phổ biến.
* **Nội dung:**
    * Khái niệm **ORM**: Ánh xạ đối tượng JavaScript sang bảng cơ sở dữ liệu.
    * Lợi ích của ORM (tăng năng suất, giảm mã boilerplate).
    * Giới thiệu **Sequelize** (dựa trên Promise) hoặc **TypeORM** (TypeScript-first).
    * Hướng dẫn cài đặt và cấu hình cơ bản của ORM đã chọn.
    * Định nghĩa các models (entities) và các thuộc tính của chúng, ánh xạ tới bảng cơ sở dữ liệu.

**Buổi 28: Thao tác CRUD với ORM (2 giờ)**
* **Mục tiêu:** Thực hiện các thao tác CRUD sử dụng API của ORM.
* **Nội dung:**
    * Thực hành tạo dữ liệu mới (Create) thông qua ORM.
    * Thực hành đọc dữ liệu (Read) với các điều kiện truy vấn khác nhau.
    * Thực hành cập nhật dữ liệu (Update).
    * Thực hành xóa dữ liệu (Delete).
    * Giới thiệu cơ bản về mối quan hệ trong ORM (One-to-One, One-to-Many, Many-to-Many).

**Buổi 29: Tích hợp với MongoDB (NoSQL) (2 giờ)**
* **Mục tiêu:** Giới thiệu MongoDB và cách kết nối Node.js với nó.
* **Nội dung:**
    * Giới thiệu tổng quan về **MongoDB**, cơ sở dữ liệu tài liệu NoSQL.
    * Dữ liệu được lưu trữ dưới dạng BSON (Binary JSON).
    * Hướng dẫn cài đặt một phiên bản MongoDB cục bộ (ví dụ: MongoDB Community Server hoặc Docker).
    * Giới thiệu **Mongoose ODM** (Object Document Mapper) cho MongoDB.
    * Cài đặt Mongoose và thiết lập kết nối đến MongoDB bằng `mongoose.connect()`.

**Buổi 30: Thao tác CRUD với Mongoose (2 giờ)**
* **Mục tiêu:** Thực hiện các thao tác CRUD với MongoDB sử dụng Mongoose ODM.
* **Nội dung:**
    * Định nghĩa **Schemas** và **Models** trong Mongoose để áp dụng cấu trúc và xác thực dữ liệu ở lớp ứng dụng.
    * Thực hành tạo tài liệu mới (Create) trong MongoDB qua Mongoose.
    * Thực hành truy vấn (Read) tài liệu với các điều kiện khác nhau.
    * Thực hành cập nhật (Update) tài liệu.
    * Thực hành xóa (Delete) tài liệu.
    * Thảo luận về lợi ích của việc sử dụng Schema/Model trong Mongoose cho cơ sở dữ liệu NoSQL linh hoạt.

---

### Phần 4: Bảo mật, Kiểm thử & Triển khai (Buổi 31-40)

**Buổi 31: Xác thực (Authentication) với JWT (2 giờ)**
* **Mục tiêu:** Triển khai cơ chế xác thực dựa trên JSON Web Tokens (JWT).
* **Nội dung:**
    * Khái niệm **Authentication** (xác minh danh tính) và **Authorization** (xác định quyền truy cập).
    * Giới thiệu về **JWT (JSON Web Tokens)**: tiêu chuẩn mở, tự chứa, được ký điện tử.
    * Cấu trúc của một JWT: Header, Payload, Signature.
    * Cách tạo và xác minh JWT trong Node.js bằng thư viện `jsonwebtoken`.
    * Thực hành sử dụng JWT để xác thực dựa trên token trong các API không trạng thái (stateless).

**Buổi 32: Ủy quyền (Authorization) & OAuth 2.0 (2 giờ)**
* **Mục tiêu:** Thực hiện cơ chế ủy quyền và giới thiệu về OAuth 2.0.
* **Nội dung:**
    * Triển khai Middleware ủy quyền để kiểm tra quyền của người dùng dựa trên JWT.
    * Giới thiệu về **OAuth 2.0**: framework ủy quyền, không phải giao thức xác thực.
    * Các khái niệm chính của OAuth 2.0: Authorization Server, Resource Server, Client Application, Resource Owner.
    * Các loại cấp quyền phổ biến (ví dụ: Authorization Code flow cho ứng dụng web).
    * Tổng quan cách đăng ký ứng dụng khách (ví dụ: Google Cloud Console) để có `client ID` và `client secret`.

**Buổi 33: Ghi nhật ký (Logging) Hiệu quả (2 giờ)**
* **Mục tiêu:** Hiểu tầm quan trọng và triển khai ghi nhật ký hiệu quả.
* **Nội dung:**
    * Tầm quan trọng của ghi nhật ký: gỡ lỗi, giám sát sức khỏe ứng dụng, kiểm toán, phân tích hiệu suất, xác định vấn đề sản xuất.
    * Các thư viện ghi nhật ký phổ biến: **Winston** (linh hoạt), **Morgan** (ghi nhật ký yêu cầu HTTP cho Express), **Pino** (hiệu suất cao).
    * Cấu hình Morgan để tạo các log định dạng JSON tùy chỉnh.
    * Tích hợp các log với các transport của Winston (console, tệp).

**Buổi 34: Giám sát (Monitoring) & Chiến lược Logging Tập trung (2 giờ)**
* **Mục tiêu:** Nâng cao khả năng giám sát và quản lý log.
* **Nội dung:**
    * Các cấp độ log (debug, info, warn, error, fatal) và khi nào sử dụng chúng.
    * Chiến lược ghi nhật ký tập trung: tại sao cần tập trung log từ nhiều nguồn.
    * Giới thiệu ngắn gọn về các công cụ tổng hợp và trực quan hóa log như **ELK stack** (Elasticsearch, Logstash, Kibana) hoặc Grafana/Prometheus.
    * Thực hành cấu hình một logger cơ bản với Winston để ghi log vào tệp và console.

**Buổi 35: Kiểm thử Đơn vị (Unit Testing) với Jest/Mocha & Chai (2 giờ)**
* **Mục tiêu:** Bắt đầu viết các bài kiểm thử đơn vị cho các thành phần mã nhỏ.
* **Nội dung:**
    * Tầm quan trọng của kiểm thử trong phát triển phần mềm (chất lượng mã, phát hiện lỗi sớm).
    * Giới thiệu **Kiểm thử Đơn vị (Unit Testing)**: kiểm thử các thành phần nhỏ nhất (hàm, module).
    * Giới thiệu các framework kiểm thử: **Jest** (tất cả trong một) hoặc **Mocha** (linh hoạt).
    * Giới thiệu thư viện khẳng định (assertion library): **Chai** (expect, should, assert).
    * Thực hành viết các bài kiểm thử đơn vị cơ bản cho các hàm hoặc module Node.js.

**Buổi 36: Kiểm thử Tích hợp (Integration Testing) với Supertest (2 giờ)**
* **Mục tiêu:** Kiểm thử sự tương tác giữa các thành phần khác nhau của ứng dụng.
* **Nội dung:**
    * Giới thiệu **Kiểm thử Tích hợp (Integration Testing)**: kiểm thử tương tác giữa các module hoặc dịch vụ.
    * Sử dụng thư viện **Supertest** để kiểm thử các điểm cuối HTTP của ứng dụng Express.js.
    * Thực hành viết các bài kiểm thử tích hợp: mô phỏng yêu cầu HTTP (GET, POST), khẳng định mã trạng thái và nội dung phản hồi.
    * Thiết lập môi trường kiểm thử cho Integration Testing.

**Buổi 37: Kiểm thử Đầu cuối (End-to-End Testing) & Tổng quan Framework (2 giờ)**
* **Mục tiêu:** Hiểu về kiểm thử E2E và tổng quan các framework kiểm thử.
* **Nội dung:**
    * Giới thiệu **Kiểm thử Đầu cuối (End-to-End Testing - E2E)**: mô phỏng tương tác người dùng trên toàn bộ hệ thống.
    * Vai trò của E2E trong quy trình đảm bảo chất lượng.
    * Giới thiệu các công cụ E2E phổ biến: **Cypress** (chạy trong trình duyệt) và **Playwright** (đa trình duyệt, đa ngôn ngữ).
    * Khi nào nên sử dụng kiểm thử E2E và sự khác biệt với Unit/Integration Test.
    * Tổng quan so sánh các framework kiểm thử đã học (Jest, Mocha, Chai, Supertest, Cypress, Playwright).

**Buổi 38: Quản lý Phụ thuộc: npm vs Yarn & SemVer (2 giờ)**
* **Mục tiêu:** Hiểu sâu hơn về quản lý phụ thuộc và phiên bản.
* **Nội dung:**
    * So sánh chi tiết **npm** và **Yarn**: tốc độ, bảo mật, hỗ trợ ngoại tuyến, giao diện người dùng.
    * Các thực hành tốt nhất khi sử dụng npm/Yarn, tránh sử dụng cả hai cùng lúc.
    * Quản lý phụ thuộc: `npm install <package-name>`, thêm `devDependencies` (`--save-dev`) và `dependencies`.
    * Cập nhật gói: `npm update`, `npm update <package-name>`.
    * Tìm hiểu về **Semantic Versioning (SemVer)**: cách đọc và hiểu các số phiên bản (Major.Minor.Patch) để quản lý phụ thuộc một cách có hệ thống.

**Buổi 39: Chất lượng Mã: Linting & Formatting (2 giờ)**
* **Mục tiêu:** Duy trì chất lượng và phong cách mã nguồn nhất quán.
* **Nội dung:**
    * Tầm quan trọng của chất lượng mã cao và phong cách mã nhất quán.
    * Công cụ **Linting:** Giới thiệu **ESLint** để xác định các mẫu mã có vấn đề, lỗi tiềm ẩn và vi phạm quy tắc phong cách.
    * Công cụ **Formatting:** Giới thiệu **Prettier** để tự động định dạng mã, đảm bảo phong cách nhất quán.
    * Hướng dẫn tích hợp ESLint và Prettier vào môi trường phát triển (ví dụ: VS Code) và quy trình CI/CD cơ bản.
    * Thực hành cấu hình một bộ quy tắc linting/formatting đơn giản.

**Buổi 40: Triển khai & Các Bước Tiếp theo (2 giờ)**
* **Mục tiêu:** Giới thiệu các khái niệm cơ bản về triển khai ứng dụng và định hướng học tập liên tục.
* **Nội dung:**
    * Các khái niệm triển khai cơ bản: đưa ứng dụng từ môi trường phát triển lên sản xuất.
    * Giới thiệu pipeline triển khai: Phát triển cục bộ -> Kiểm soát phiên bản (Git) -> CI/CD -> Nền tảng lưu trữ.
    * Các nền tảng lưu trữ phổ biến cho Node.js: Heroku, Vercel, AWS EC2, DigitalOcean.
    * Khái niệm **container hóa** bằng **Docker** như một chiến lược triển khai mạnh mẽ.
    * Định hướng các chủ đề nâng cao cho việc học tập liên tục:
        * Kiến trúc Microservices.
        * API GraphQL.
        * Ứng dụng thời gian thực với WebSockets (Socket.io).
        * Serverless Functions (FaaS).
        * Tối ưu hóa hiệu suất và chiến lược mở rộng.
        * Cập nhật liên tục với hệ sinh thái Node.js.

