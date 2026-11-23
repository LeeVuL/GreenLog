# GreenLog – Hướng dẫn nối dữ liệu thật (anh Vũ làm một lần, khoảng 20 phút)

Tất cả làm bằng Gmail của anh. Trước khi bắt đầu, anh điền Gmail của Thìn và Trường vào trang **NguoiDung** của file GreenLog_DuLieuNen.

## Bước 1. Tạo dự án Apps Script
1. Mở https://script.google.com → **Dự án mới**. Đặt tên **GreenLog**.
2. Xóa nội dung có sẵn, tạo 3 tệp và dán đúng nội dung các tệp trong thư mục `apps-script/` của kho GreenLog:
   - `KhoiTao.gs`
   - `Code.gs`
   - `Nhac.gs`
3. Bấm **Lưu** (biểu tượng đĩa).

## Bước 2. Chạy khởi tạo
1. Chọn hàm **khoiTao** ở thanh trên → **Chạy**.
2. Google hỏi quyền → **Xem xét quyền** → chọn Gmail của anh → **Nâng cao** → **Đi tới GreenLog** → **Cho phép**.
3. Đợi khoảng 1 phút. Nhật ký hiện "Dữ liệu vận hành: … trang" là xong. Trong thư mục 01_DuLieu sẽ có thêm file **GreenLog_DuLieuVanHanh**.

## Bước 3. Tạo mã đăng nhập Gmail (Client ID)
1. Mở https://console.cloud.google.com → tạo dự án **GreenLog**.
2. **API và dịch vụ → Màn hình xin phép OAuth**: chọn **Bên ngoài**, tên ứng dụng GreenLog, email hỗ trợ là Gmail của anh → Lưu. Ở mục **Đối tượng thử nghiệm** thêm Gmail của 6 người dùng (hoặc bấm **Xuất bản ứng dụng**).
3. **Thông tin xác thực → Tạo thông tin xác thực → Mã ứng dụng khách OAuth** → loại **Ứng dụng web**.
   - **Nguồn gốc JavaScript được phép**: `https://leevul.github.io`
4. Bấm Tạo → sao chép **Client ID** (dạng `....apps.googleusercontent.com`).

## Bước 4. Điền mã và triển khai
1. Trong Apps Script, mở `Code.gs`, kéo xuống cuối, hàm **caiDat**: dán Client ID vào `CLIENT_ID`, dán token Bot Zalo vào `ZALO_BOT_TOKEN`. Các mã khác để trống được.
2. Chọn hàm **caiDat** → **Chạy**.
3. **Triển khai → Tùy chọn triển khai mới** → loại **Ứng dụng web**:
   - Thực thi bằng: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
4. Bấm **Triển khai** → sao chép **URL ứng dụng web** (kết thúc bằng `/exec`).
5. Gửi Claude: **URL /exec** và **Client ID**. Claude điền vào app và đưa lên lại.

## Bước 5. Nhắc việc qua Zalo
1. Chọn hàm **caiTrigger** → **Chạy** (app tự nhắc mỗi ngày).
2. Mỗi người mở Bot GreenLog trên Zalo, nhắn **Gmail của mình**.
3. Anh chạy hàm **layChatId**. Sau đó chạy **thuGuiTin** để thử.

## Mã thêm (khi cần)
| Mã | Dùng cho | Lấy ở đâu |
|---|---|---|
| OPENWEATHER_KEY | Thời tiết có % mưa | openweathermap.org → đăng ký miễn phí → API keys |
| PLANTNET_KEY | AI nhận diện cây | my.plantnet.org → đăng ký → API key |
| GEMINI_KEY | AI phân tích triệu chứng | aistudio.google.com → Get API key |

Điền vào hàm **caiDat**, chạy lại **caiDat**. Không cần triển khai lại.

## Khi sửa mã sau này
Dán mã mới → **Triển khai → Quản lý triển khai → ✏️ → Phiên bản: Mới → Triển khai**. Đường link /exec giữ nguyên.
