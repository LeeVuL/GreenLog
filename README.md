# GreenLog

App quản lý công việc bộ phận Cảnh quan – Mövenpick Phú Quốc.

- Giao diện (thư mục gốc): chạy trên GitHub Pages, cài được lên màn hình điện thoại.
- `apps-script/`: phần chạy ngầm trên Google Apps Script, đọc ghi Google Sheets và lưu ảnh vào Google Drive của anh Vũ.
- Chưa điền `js/config.js` thì app chạy ở **chế độ chạy thử** với dữ liệu mẫu, lưu ngay trên máy.

Phiên bản 0.2.0 (23/11/2026): đủ các phân hệ theo bản thiết kế. Cài dữ liệu thật: xem HUONG_DAN_CAI_DAT.md.

## Bản 0.4 (24/11/2026)

- Giao diện mới: thanh menu bên trái trên máy tính, thanh dưới có nút ＋ Tạo, chuông thông báo, 📌 đưa vào họp, ⚠ báo khó khăn.
- Tổng quan cho anh Vũ: 8 chỉ số, khối Phát triển bền vững (hôm nay / từ đầu tháng / từ đầu năm) và trang chi tiết từng chỉ số.
- Ngày làm việc: Bắt đầu ngày (hạn 07:30), Chốt ngày (hạn 17:30), "Hôm nay toàn bộ phận", nhật ký thi công tự tạo.
- Họp thứ Hai: báo cáo tuần, đăng ký kế hoạch, lưu ý tự gom, biên bản PDF. Hồ sơ cuối kỳ (nhật ký, YCNT, BBNT, phụ lục, bảng công).
- Đào tạo: đăng ký → duyệt → bắt đầu → kết thúc → điểm danh → ảnh → duyệt; thư viện SOP có phiên bản, đọc to, đề thi nhanh.
- Báo cáo tháng gửi GM (PDF, ảnh email, khóa số) và slide họp tuần GM + HODs điền đúng file mẫu (.pptx).
- Phun bón 3 luồng, phác đồ khép kín, mưa rửa trôi → phun lại; túi thuốc họ dừa; giờ máy và bảo trì Kubota / Sand Man.
- Bắt buộc ảnh ở mọi việc hiện trường (máy chủ cũng chặn). Phân quyền theo đầu việc.
- Tiếng Anh: dịch toàn bộ giao diện, chỉ giữ họ tên người; hồ sơ pháp lý luôn xuất tiếng Việt, YCNT song ngữ.
- Máy chủ: chạy `khoiTao04()` (hoặc `khoiTao()`) để thêm các trang dữ liệu mới; file `Code04.gs` thêm quyền, kiểm ảnh, `thayNhom`, `mauHOD` và các nhắc 07:20, 17:30, 19:00, thứ Hai 08:00 / 15:00.
