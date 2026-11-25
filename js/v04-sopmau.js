/* GreenLog · SOP mẫu để thử chức năng Đào tạo (chỉ nạp ở chế độ chạy thử, một lần) */
(function () {
  const API = window.GL_API; const G = window.GL; const LS = API.LS;
  const MA = 'SOP-PHUN-01';
  const ND = `## 1. Mục đích và phạm vi
- Giúp người pha và phun thuốc bảo vệ thực vật (BVTV) làm đúng liều, an toàn cho bản thân, cho khách và cho môi trường resort.
- Áp dụng cho mọi lần phun thuốc, phun phân bón lá bằng bình điện 16 lít trong toàn khu nghỉ dưỡng.
- Người thực hiện: tổ Bón phân + phun thuốc (Đội cơ động). Người kiểm tra: tổ trưởng. Người duyệt thuốc mới: Trưởng bộ phận.

## 2. Nguyên tắc 4 ĐÚNG
- Đúng thuốc: chỉ dùng thuốc có trong Danh mục thuốc, phân của app. Thuốc lạ phải đề xuất, chờ Trưởng bộ phận duyệt.
- Đúng liều: theo liều cho bình 16 lít ghi trong app. Không tự tăng liều "cho chắc".
- Đúng lúc: khi dịch hại mới chớm, sáng sớm (trước 9h) hoặc chiều mát (sau 16h), trời không mưa, gió nhẹ.
- Đúng cách: phun ướt đều tán, cả mặt dưới lá, không để thuốc chảy thành giọt xuống đất.

## 3. Trước khi pha
- Đọc nhãn chai/gói: tên thuốc, hoạt chất, liều, thời gian cách ly, cảnh báo. Không đọc được nhãn thì không dùng.
- Mặc đủ bảo hộ: khẩu trang, găng tay cao su, kính, áo dài tay, ủng. App sẽ hỏi bảo hộ đã dùng khi ghi lần phun.
- Kiểm tra bình: không rò rỉ, béc phun thông, pin đủ.
- Kiểm tra khu vực: có khách ở gần không, có hồ cá, hồ thủy sinh không, Vị Garden có ở gần không.
- Mở app → Phun thuốc → chọn vị trí → chọn loại cây → chọn dịch hại. App gợi ý công thức an toàn và báo ngay nếu có thuốc pha kỵ.

## 4. Pha thuốc đúng thứ tự
- Đổ khoảng nửa bình nước sạch.
- Thuốc dạng bột, hạt (WG, WP) pha trước, khuấy tan.
- Sau đó đến thuốc dạng nước, dầu (SC, OD, EC).
- Tiếp theo là phân bón lá (nếu có trong công thức).
- Chất bám dính (Thần Hổ) cho vào sau cùng.
- Thêm nước cho đủ 16 lít, khuấy đều. Dùng cốc đong riêng, không dùng chung với đồ ăn uống.
- Không pha chung những thuốc app báo "pha kỵ", ví dụ Movento không pha với phân bón lá và chlorothalonil.

## 5. Khi phun
- Đặt biển "Đang phun thuốc" ở lối đi khu vực đang phun.
- Đứng đầu gió, phun từ trên xuống, đi lùi để không đi vào chỗ vừa phun.
- Dừng ngay khi có khách đi tới, khi gió mạnh hoặc trời bắt đầu mưa.
- Không ăn, uống, hút thuốc khi đang pha hoặc đang phun.
- Decis không dùng gần hồ cá, hồ thủy sinh vì rất độc với cá.
- Gần Vị Garden: báo Trưởng bộ phận trước. App tự khóa thu hoạch đến hết ngày cách ly.

## 6. Sau khi phun
- Rửa bình 3 lần, nước rửa phun lại lên chính khu vừa phun. Không đổ xuống cống, hồ, bãi biển.
- Vỏ chai, gói thuốc bỏ vào thùng chứa bao bì thuốc BVTV ở kho. Không đốt, không vứt vào thùng rác chung.
- Tắm, thay đồ, giặt riêng quần áo phun thuốc.
- Ghi lần phun trên app ngay: số bình, vị trí, ảnh sau khi phun. Nếu trời mưa sau khi phun, bấm "☔ Bị mưa rửa trôi" để tạo phiếu phun lại.

## 7. Xử lý khi bị nhiễm thuốc
- Dính da: cởi bỏ quần áo dính thuốc, rửa da bằng xà phòng và thật nhiều nước.
- Văng vào mắt: rửa bằng nước sạch liên tục ít nhất 15 phút.
- Hít phải, thấy chóng mặt, buồn nôn: ra ngay chỗ thoáng khí, ngồi nghỉ, báo tổ trưởng.
- Nuốt phải: không tự gây nôn nếu nhãn không hướng dẫn. Gọi 115, mang theo chai/gói thuốc hoặc ảnh nhãn đến cơ sở y tế.
- Mọi trường hợp đều báo tổ trưởng và Trưởng bộ phận ngay, ghi vào app bằng nút ⚠ Báo khó khăn.

## 8. Kiểm tra sau khóa học
- Người học tự pha đúng 1 bình theo công thức app gợi ý, có tổ trưởng kiểm tra.
- 7 ngày sau lớp học, tổ trưởng chấm điểm hiện trường theo SOP này.`;

  const ND_EN = `## 1. Purpose and scope
- Help staff mix and spray plant protection products at the correct dose, safely for themselves, guests and the resort environment.
- Applies to every pesticide and foliar fertiliser spray with the 16-litre electric sprayer across the resort.
- Done by: the Fertilising + spraying crew (Mobile Team). Checked by: the team leader. New products approved by: Mr Vu.

## 2. The 4 RIGHTS
- Right product: only products in the app's Product catalogue. Anything new must be proposed and approved by Mr Vu.
- Right dose: the 16-litre tank dose shown in the app. Never add "a bit more to be sure".
- Right time: when pests first appear, early morning (before 9:00) or late afternoon (after 16:00), no rain, light wind.
- Right way: wet the whole canopy evenly, including leaf undersides, without dripping onto the ground.

## 3. Before mixing
- Read the label: product name, active ingredient, dose, re-entry period, warnings. If the label cannot be read, do not use it.
- Wear full protection: mask, rubber gloves, glasses, long sleeves, boots. The app asks which gear was used.
- Check the sprayer: no leaks, nozzle clear, battery charged.
- Check the area: guests nearby, fish or aquatic ponds, Vị Garden close by.
- Open the app → Spray pesticide → choose position → plant type → pest. The app suggests a safe formula and warns of any incompatible mix.

## 4. Mixing order
- Fill the tank half way with clean water.
- Powders and granules (WG, WP) first, stir until dissolved.
- Then liquids and oils (SC, OD, EC).
- Then foliar fertiliser (if in the formula).
- Sticker/spreader (Than Ho) goes in last.
- Top up to 16 litres and stir. Use a dedicated measuring cup, never shared with food or drinks.
- Never mix products the app flags as incompatible, e.g. Movento must not be mixed with foliar fertiliser or chlorothalonil.

## 5. While spraying
- Put a "Spraying in progress" sign on paths in the area.
- Stand upwind, spray from top to bottom, walk backwards so you never walk into the sprayed area.
- Stop immediately if guests approach, the wind picks up or rain starts.
- No eating, drinking or smoking while mixing or spraying.
- Never use Decis near fish or aquatic ponds — it is highly toxic to fish.
- Near Vị Garden: tell Mr Vu first. The app blocks harvesting until the re-entry period ends.

## 6. After spraying
- Rinse the tank 3 times and spray the rinse water back onto the area just treated. Never pour it into drains, ponds or the beach.
- Put empty bottles and sachets into the pesticide packaging bin in the store. Never burn them or put them in general waste.
- Shower, change, and wash spraying clothes separately.
- Record the spray in the app right away: tanks, positions, photo after spraying. If it rains afterwards, tap "☔ Washed off by rain" to create a re-spray ticket.

## 7. If contaminated
- On skin: remove contaminated clothing, wash skin with soap and plenty of water.
- In the eyes: rinse with clean running water for at least 15 minutes.
- Inhaled, dizzy or nauseous: move to fresh air, sit down, tell the team leader.
- Swallowed: do not induce vomiting unless the label says so. Call 115 and take the bottle/sachet or a photo of the label to the medical facility.
- Always tell the team leader and Mr Vu straight away and record it with the ⚠ Report challenge button.

## 8. After the course
- Each trainee mixes one tank using the app's suggested formula, checked by the team leader.
- 7 days after the class, the team leader scores the site against this SOP.`;

  const CH = [
    ['Trước khi pha thuốc, việc đầu tiên phải làm là gì?', 'Đọc nhãn chai/gói thuốc', 'Đổ đầy 16 lít nước', 'Cho chất bám dính vào trước', 'Lắc mạnh chai thuốc'],
    ['Liều pha cho bình 16 lít lấy ở đâu?', 'Theo liều ghi trong app (từ nhãn thuốc)', 'Ước lượng bằng mắt', 'Pha gấp đôi cho chắc', 'Hỏi người đi ngang qua'],
    ['Thời điểm phun tốt nhất trong ngày là khi nào?', 'Sáng sớm trước 9h hoặc chiều mát sau 16h', 'Giữa trưa nắng gắt', 'Ngay trước khi trời mưa', 'Lúc khách đông nhất'],
    ['Thuốc dạng bột, hạt (WG, WP) cho vào bình lúc nào?', 'Đầu tiên, sau khi đổ nửa bình nước', 'Sau cùng', 'Trước khi đổ nước', 'Cùng lúc với chất bám dính'],
    ['Chất bám dính Thần Hổ cho vào lúc nào?', 'Sau cùng', 'Đầu tiên', 'Không bao giờ dùng', 'Trước thuốc dạng bột'],
    ['App báo hai thuốc "pha kỵ" thì phải làm gì?', 'Không pha chung, chọn công thức khác hoặc phun riêng', 'Vẫn pha chung nhưng giảm liều', 'Pha chung rồi phun nhanh', 'Bỏ qua cảnh báo'],
    ['Bảo hộ tối thiểu khi pha và phun gồm những gì?', 'Khẩu trang, găng tay, kính, áo dài tay, ủng', 'Chỉ cần khẩu trang', 'Chỉ cần găng tay', 'Không cần nếu phun nhanh'],
    ['Khi phun, người phun nên đứng ở đâu so với hướng gió?', 'Đầu gió', 'Cuối gió', 'Ngược nắng', 'Đứng đâu cũng được'],
    ['Đang phun thì có khách đi tới, phải làm gì?', 'Dừng phun ngay, chờ khách đi qua', 'Phun nhanh cho xong', 'Phun tránh sang bên', 'Nhắc khách đi đường khác rồi phun tiếp'],
    ['Thuốc nào không được dùng gần hồ cá, hồ thủy sinh?', 'Decis', 'Atonik', 'Vitamin B1', 'Phân NPK'],
    ['Nước rửa bình sau khi phun xử lý thế nào?', 'Phun lại lên chính khu vừa phun', 'Đổ xuống cống', 'Đổ ra bãi biển', 'Đổ vào hồ cảnh quan'],
    ['Vỏ chai, gói thuốc đã dùng bỏ ở đâu?', 'Thùng chứa bao bì thuốc BVTV ở kho', 'Thùng rác chung', 'Đốt ngay tại chỗ', 'Chôn dưới gốc cây'],
    ['Thuốc văng vào mắt thì xử lý thế nào?', 'Rửa nước sạch liên tục ít nhất 15 phút', 'Dụi mắt cho hết', 'Nhỏ thuốc nhỏ mắt rồi làm tiếp', 'Chờ hết cay'],
    ['Lỡ nuốt phải thuốc thì làm gì?', 'Gọi 115, mang theo chai thuốc hoặc ảnh nhãn đến cơ sở y tế', 'Tự móc họng cho nôn', 'Uống sữa rồi làm tiếp', 'Nằm nghỉ, không báo ai'],
    ['Phun xong thì trời mưa, cần làm gì trên app?', 'Bấm "☔ Bị mưa rửa trôi" để tạo phiếu phun lại', 'Không làm gì', 'Xóa lần phun đã ghi', 'Phun lại ngay trong mưa'],
  ];
  const CH_EN = [
    ['What is the first thing to do before mixing?', 'Read the product label', 'Fill the tank with 16 litres', 'Add the sticker first', 'Shake the bottle hard'],
    ['Where does the 16-litre dose come from?', 'The dose shown in the app (taken from the label)', 'Guess by eye', 'Double it to be sure', 'Ask a passer-by'],
    ['When is the best time of day to spray?', 'Early morning before 9:00 or late afternoon after 16:00', 'At midday in full sun', 'Just before it rains', 'When most guests are around'],
    ['When do powders and granules (WG, WP) go into the tank?', 'First, after filling the tank half way', 'Last', 'Before adding any water', 'Together with the sticker'],
    ['When does the Than Ho sticker go in?', 'Last', 'First', 'Never', 'Before the powders'],
    ['The app flags two products as incompatible. What do you do?', 'Do not mix them; choose another formula or spray separately', 'Mix them at a lower dose', 'Mix and spray quickly', 'Ignore the warning'],
    ['What is the minimum protective gear?', 'Mask, gloves, glasses, long sleeves, boots', 'Mask only', 'Gloves only', 'None if spraying quickly'],
    ['Where should the sprayer stand relative to the wind?', 'Upwind', 'Downwind', 'Facing the sun', 'Anywhere'],
    ['A guest approaches while you are spraying. What do you do?', 'Stop immediately and wait until they pass', 'Spray faster to finish', 'Spray to the side', 'Ask the guest to go around and keep spraying'],
    ['Which product must not be used near fish or aquatic ponds?', 'Decis', 'Atonik', 'Vitamin B1', 'NPK fertiliser'],
    ['What do you do with the tank rinse water?', 'Spray it back onto the area just treated', 'Pour it down the drain', 'Pour it on the beach', 'Pour it into a landscape pond'],
    ['Where do empty bottles and sachets go?', 'The pesticide packaging bin in the store', 'General waste', 'Burn them on site', 'Bury them under a tree'],
    ['Product splashes into your eyes. What do you do?', 'Rinse with clean running water for at least 15 minutes', 'Rub your eyes', 'Use eye drops and carry on', 'Wait for the stinging to stop'],
    ['Someone swallows the product. What do you do?', 'Call 115 and take the bottle or a label photo to the medical facility', 'Make them vomit', 'Drink milk and carry on', 'Lie down and tell no one'],
    ['It rains after spraying. What do you do in the app?', 'Tap "☔ Washed off by rain" to create a re-spray ticket', 'Nothing', 'Delete the spray record', 'Spray again in the rain'],
  ];
  const ch = (ds) => JSON.stringify(ds.map((p) => ({ c: p[0], d: p.slice(1), dung: 0 })));
  const BUOI = JSON.stringify([{ ten: 'Chuẩn bị và pha thuốc (mục 1–4)', phut: '50' }, { ten: 'Phun, sau khi phun, xử lý sự cố (mục 5–8)', phut: '50' }]);
  const BUOI_EN = JSON.stringify([{ ten: 'Preparing and mixing (sections 1–4)', phut: '50' }, { ten: 'Spraying, after spraying, incidents (sections 5–8)', phut: '50' }]);

  function nap() {
    if (!API.thu() || LS.get('mau_sop1')) return;
    LS.set('mau_sop1', 1);
    const tb = (k) => LS.get('tb_' + k, []); const luu = (k, v) => LS.set('tb_' + k, v);
    const hn = API.ngay(); const mai = API.ngay(new Date(Date.now() + 864e5)); const gio = API.bayGio();
    luu('ThuVienSOP', tb('ThuVienSOP').filter((x) => x['Mã SOP'] !== MA).concat([{
      'Mã SOP': MA, 'Tên tài liệu': 'Pha và phun thuốc BVTV an toàn bằng bình điện 16 lít', 'Chủ đề': 'Phun thuốc, an toàn', 'Phiên bản': '1', 'Ngày hiệu lực': hn, 'Trạng thái': 'Hiệu lực',
      'Buổi': BUOI, 'Buổi EN': BUOI_EN, 'Nội dung': ND, 'Nội dung EN': ND_EN, 'Slide': new URL('slides/sop-phun-01.html', location.href).href.split('#')[0], 'Video giải thích': '', 'Video tóm tắt': '',
      'Câu hỏi': ch(CH), 'Câu hỏi EN': ch(CH_EN), 'Link': '', 'Người thêm': 'Lê Vũ', 'Giờ thêm': gio,
    }]));
    const thu = (d) => G.thu(d);
    luu('DaoTao', tb('DaoTao').concat([
      { 'Mã ĐT': 'DT-MAU-01', 'Loại': 'Có kế hoạch', 'Lý do đột xuất': '', 'Nội dung': 'Pha và phun thuốc an toàn · buổi 1', 'Ngày KH': hn, 'Giờ KH': '14:00', 'Địa điểm': 'Văn phòng cảnh quan', 'Giảng viên': 'Phan Văn Thìn',
        'Tài liệu': MA, 'Học viên dự kiến': 'Tổ Bón phân + phun thuốc', 'Trạng thái': 'Đã duyệt kế hoạch', 'Ngày': hn, 'Thứ': thu(hn), 'Bắt đầu': '', 'Người lập': 'Phan Văn Thìn', 'Giờ ghi': gio },
      { 'Mã ĐT': 'DT-MAU-02', 'Loại': 'Có kế hoạch', 'Lý do đột xuất': '', 'Nội dung': 'Pha và phun thuốc an toàn · buổi 2', 'Ngày KH': mai, 'Giờ KH': '14:00', 'Địa điểm': 'Văn phòng cảnh quan', 'Giảng viên': 'Phan Văn Thìn',
        'Tài liệu': MA, 'Học viên dự kiến': 'Tổ Bón phân + phun thuốc', 'Trạng thái': 'Chờ duyệt kế hoạch', 'Ngày': mai, 'Thứ': thu(mai), 'Bắt đầu': '', 'Người lập': 'Phan Văn Thìn', 'Giờ ghi': gio },
    ]));
  }
  const cu = G.khung;
  G.khung = function () { try { nap(); } catch (e) { console.error(e); } return cu.apply(this, arguments); };
})();
