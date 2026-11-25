/* GreenLog 0.3 – nền: biểu tượng, cỡ chữ, tiếng Anh, mất sóng vẫn lưu, hoàn tác 10 giây, quay lại đúng chỗ, nút quay lại đóng cửa sổ */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const esc = G.esc;
  const LS = API.LS;

  /* ---------- biểu tượng ---------- */
  G.IC = window.GL_IC || {};
  G.ic = (k, s) => (G.IC[k] || G.IC.viec || '').replace('<svg ', `<svg width="${s || 44}" height="${s || 44}" aria-hidden="true" `);

  /* ---------- vị trí mở rộng: hàng rào, hồ thủy sinh ---------- */
  const vtGoc = G.vt;
  G.vt = (ma) => {
    const v = vtGoc(ma); if (v) return v;
    const hr = (S.dm.hangrao || []).find((x) => x.ma === ma); if (hr) return { ma, cum: 'Hàng rào, hàng viền', kv: hr.kv, ten: hr.ten + (hr.cay ? ' · ' + hr.cay : '') };
    const ht = (S.dm.hothuysinh || []).find((x) => x.ma === ma); if (ht) return { ma, cum: 'Hồ thủy sinh Villa 1–24', kv: ht.kv, ten: ht.ten };
    return null;
  };
  G.tenVT = (ma, khac) => {
    const ds = String(ma || '').split('|').map((x) => x.trim()).filter(Boolean);
    if (ds.length > 1) return ds.slice(0, 4).map((x) => { const v = G.vt(x); return v ? `${v.kv} ${G.matNgan(v.ten)}`.trim() : x; }).join(', ') + (ds.length > 4 ? ` +${ds.length - 4}` : '');
    const v = G.vt(ds[0]); return v ? `${v.ten} · ${v.kv}` : (khac || ma || '');
  };
  G.laVilla = (v) => /^Villa \d+$/.test(v.kv);
  G.mat = (ten) => (/trước/i.test(ten) ? 'Trước' : /hông/i.test(ten) ? 'Hông' : /sau/i.test(ten) ? 'Sau' : '');
  G.matNgan = (ten) => { const m = G.mat(ten); return m ? 'mặt ' + m.toLowerCase() : ''; };
  G.soVilla = (kv) => +String(kv).replace(/\D/g, '') || 0;

  /* ---------- cỡ chữ ---------- */
  const datChu = (c) => { document.documentElement.dataset.chu = c || ''; };
  datChu(LS.get('chu', ''));
  G.datChu = (c) => { LS.set('chu', c); datChu(c); };

  /* ---------- tiếng Anh: dịch chữ giao diện, giữ nguyên tên vị trí, tên người ---------- */
  const EN = {
    'Hôm nay': 'Today', 'Việc': 'Tasks', 'Phiếu': 'Tickets', 'Điểm danh': 'Attendance', 'Thêm': 'More', 'Tất cả chức năng': 'All features',
    'Việc hôm nay': 'Today\'s tasks', 'Tình hình việc hằng ngày': 'Daily status', 'Chờ duyệt': 'Waiting for approval', 'Không có việc chờ duyệt.': 'Nothing to approve.',
    'Tưới nước': 'Watering', 'Tưới nước sân vườn': 'Garden watering', 'Vệ sinh': 'Cleaning', 'Nhổ cỏ': 'Weeding', 'Nhổ cỏ dại': 'Weeding', 'Vận chuyển': 'Hauling', 'Phát sinh': 'Extra job', 'Việc phát sinh': 'Extra jobs',
    'Bãi biển': 'Beach', 'Cắt cỏ thảm': 'Lawn mowing', 'Bón phân cỏ': 'Lawn fertilizing', 'Bón phân cây bụi': 'Shrub fertilizing', 'Phun thuốc cỏ': 'Lawn spraying', 'Phun thuốc cây bụi': 'Shrub spraying',
    'Phun thuốc cây bóng mát': 'Shade-tree spraying', 'Cắt tỉa cây bóng mát': 'Shade-tree pruning', 'Cắt tỉa cây bụi': 'Shrub pruning', 'Cắt tỉa cây hàng viền, hàng rào': 'Hedge and border trimming', 'Bón phân cây thủy sinh': 'Aquatic plant fertilizing',
    'Thảm cỏ': 'Lawn', 'Cây bụi': 'Shrubs', 'Hàng rào': 'Hedges', 'Cây bóng mát': 'Shade trees', 'Thủy sinh': 'Aquatic', 'Cắt / Tỉa': 'Cut / Prune', 'Bón phân': 'Fertilize', 'Phun thuốc': 'Spray', 'Cắt': 'Mow', 'Cắt tỉa': 'Prune', 'Phun': 'Spray',
    'A. Hằng ngày': 'A. Daily', 'B. Định kỳ': 'B. Periodic', 'C. Ghi chép khi có việc': 'C. Records', 'Trồng cây': 'Planting', 'Dịch hại': 'Pests', 'Vườn ươm': 'Nursery', 'Cây nội thất': 'Indoor plants', 'Phun, bón': 'Spray, fertilize',
    'Trạng thái': 'Status', 'Hoàn thành': 'Completed', 'Đang triển khai': 'In progress', 'Chưa làm': 'Not done', 'Chọn cụm': 'Choose zone', 'Chọn vị trí': 'Choose positions', 'Chụp ảnh': 'Photos', 'Tất cả': 'All',
    'Lưu': 'Save', 'Hủy': 'Cancel', 'Xong': 'Done', 'Đồng ý': 'OK', 'Không': 'No', 'Xác nhận': 'Confirm', 'Đang tải…': 'Loading…', 'Đang lưu…': 'Saving…', 'Đã lưu': 'Saved', 'Ghi chú': 'Note', 'Mô tả thêm': 'Description',
    'Chụp ảnh': 'Take photo', 'Chọn từ máy': 'From gallery', 'Dán ảnh': 'Paste', 'Đổi việc': 'Change task', 'Đang cập nhật': 'Updating', 'Gửi Zalo': 'Send via Zalo', '📤 Gửi Zalo': '📤 Send via Zalo',
    'Sáng': 'Morning', 'Chiều': 'Afternoon', 'Có': 'Present', 'Vắng': 'Absent', 'Về sớm': 'Left early', 'Có mặt': 'Present', 'Gửi Trưởng bộ phận duyệt': 'Send for approval', 'Ảnh tập thể sáng': 'Morning group photo', 'Ảnh tập thể chiều': 'Afternoon group photo',
    'Đã tưới': 'Watered', 'Mưa': 'Rain', 'Chưa': 'Not yet', 'Trước': 'Front', 'Hông': 'Side', 'Sau': 'Back', '☔ Hôm nay mưa': '☔ Raining today',
    'Đang mở': 'Open', 'Chờ duyệt': 'Pending', 'Đã xong': 'Closed', 'Nhận việc': 'Accept', 'Báo xong': 'Report done', 'Duyệt': 'Approve', 'Trả lại': 'Return', 'Khẩn cấp': 'Urgent', 'Cao': 'High', 'Trung bình': 'Medium', 'Thấp': 'Low',
    'Mới': 'New', 'Đang xử lý': 'In progress', 'Bị trả lại': 'Returned', 'Đã duyệt': 'Approved', '＋ Tạo phiếu giao việc': '＋ New work ticket', 'Phiếu giao việc': 'Work tickets', 'Tạo phiếu': 'Create ticket',
    'Báo cáo': 'Reports', 'Lịch': 'Calendar', 'Kế hoạch tuần': 'Weekly plan', 'Dự án': 'Projects', 'Sự kiện, tiệc': 'Events', 'Họp': 'Meetings', 'Đào tạo': 'Training', 'Thư viện SOP': 'SOP library', 'Công nhân': 'Workers', 'Phân quyền': 'Permissions',
    'Hồ sơ dịch hại': 'Pest records', 'Nhật ký phun, bón': 'Spray & fertilizer log', 'Danh mục thuốc, phân': 'Chemicals & fertilizers', 'Sổ trồng cây': 'Planting log', 'Cây bất thường': 'Plant issues', 'AI nhận diện': 'AI identify',
    'Tuần tra': 'Patrol', 'Chấm điểm chất lượng': 'Quality scoring', 'Mùa mưa bão': 'Storm season', 'Việc lặp lại': 'Recurring tasks', 'Kế hoạch định kỳ tháng': 'Monthly periodic plan', 'Đồng hồ nước': 'Water meters', 'Vườn ươm cây bụi': 'Garden nursery',
    'Việc hằng ngày': 'Daily tasks', 'Cây xanh': 'Plants', 'Kế hoạch': 'Planning', 'Kiểm tra': 'Inspection', 'Nhân sự': 'People', 'Quản trị': 'Admin', 'Cài đặt': 'Settings', 'Cỡ chữ': 'Text size', 'Ngôn ngữ': 'Language', 'Thường': 'Normal', 'To': 'Large', 'Rất to': 'Extra large',
    'Đăng xuất': 'Sign out', 'Đổi vai / thoát chạy thử': 'Switch role / leave demo', 'Xóa dữ liệu chạy thử': 'Clear demo data', 'Quyền của tôi': 'My permissions',
    'Số chuyến hôm nay': 'Trips today', 'Ảnh minh chứng': 'Evidence photos', 'Gửi số liệu hôm nay': 'Submit today\'s figures', 'Rác cắt tỉa': 'Pruning waste', 'Khác': 'Other',
    '▶ Bắt đầu ngay lúc này': '▶ Start now', '■ Kết thúc ngay lúc này': '■ Finish now', 'Đang làm': 'In progress', 'Hoàn tác': 'Undo', '↶ Hoàn tác': '↶ Undo', 'Đã hoàn tác': 'Undone',
    'Chưa có dữ liệu': 'No data yet', 'Không có phiếu': 'No tickets', 'Vị trí': 'Position', 'Mức độ': 'Severity', 'Giao cho': 'Assign to', 'Nguồn': 'Source', 'Số bình': 'Tanks', 'Thuốc đề xuất': 'Suggested products',
    'Điểm danh sáng': 'Morning attendance', 'Định kỳ': 'Periodic', 'Hằng ngày': 'Daily', 'Ghi chép': 'Records', 'Cần anh xử lý': 'Needs your action', 'Tìm việc, vị trí, cây…': 'Search task, position, plant…',
  };
  const LAT = new Map(Object.entries(EN));
  const CUM = [[/^(\d+)\/(\d+) vị trí$/, '$1/$2 positions'], [/^(\d+)\/(\d+) cụm$/, '$1/$2 zones'], [/^Chào (.+) 👋$/, 'Hello $1 👋'], [/^Lưu (\d+) vị trí$/, 'Save $1 positions'], [/^kỳ (T\d+\.\d+)$/, 'period $1']];
  G.lang = () => LS.get('lang', 'vi');
  const dich = (s) => {
    const t = s.trim(); if (!t) return null;
    if (LAT.has(t)) return s.replace(t, LAT.get(t));
    for (const [re, rp] of CUM) if (re.test(t)) return s.replace(t, t.replace(re, rp));
    return null;
  };
  const dichCay = (goc) => {
    const w = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT); const ds = []; let n;
    while ((n = w.nextNode())) ds.push(n);
    ds.forEach((x) => { const m = dich(x.nodeValue); if (m != null && m !== x.nodeValue) x.nodeValue = m; });
    goc.querySelectorAll && goc.querySelectorAll('[placeholder]').forEach((x) => { const m = dich(x.placeholder); if (m) x.placeholder = m; });
  };
  let obs = null;
  G.datLang = (l) => {
    LS.set('lang', l); document.documentElement.lang = l === 'en' ? 'en' : 'vi';
    if (obs) { obs.disconnect(); obs = null; }
    if (l === 'en') { dichCay(document.body); obs = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) dichCay(x); else if (x.nodeType === 3) { const t = dich(x.nodeValue); if (t) x.nodeValue = t; } }))); obs.observe(document.body, { childList: true, subtree: true }); }
  };
  if (G.lang() === 'en') document.addEventListener('DOMContentLoaded', () => G.datLang('en'));
  setTimeout(() => { if (G.lang() === 'en') G.datLang('en'); }, 0);

  /* ---------- nút quay lại đóng cửa sổ trước, quay lại đúng chỗ đang xem ---------- */
  const hopGoc = G.hop;
  G.hop = function (tieuDe, html, onMo, rong) {
    let dongRoi = false;
    history.pushState({ glHop: 1 }, '');
    const dongGoc = hopGoc(tieuDe, html, (o, d) => { if (onMo) onMo(o, dongMoi); }, rong);
    const lop = [...document.querySelectorAll('.lop-phu')].pop();
    function dongMoi() { if (dongRoi) return; dongRoi = true; dongGoc(); if (history.state && history.state.glHop) history.replaceState({ glBo: 1 }, ''); }
    if (lop) { lop._dong = () => { dongRoi = true; dongGoc(); }; lop.querySelector('.x').onclick = dongMoi; lop.addEventListener('click', (e) => { if (e.target === lop) dongMoi(); }); }
    return dongMoi;
  };
  let trangTruoc = history.state;
  window.addEventListener('popstate', (e) => {
    const lops = [...document.querySelectorAll('.lop-phu')];
    const tuBo = trangTruoc && trangTruoc.glBo; trangTruoc = e.state;
    if (lops.length && !(e.state && e.state.glHop && lops.length > 1)) { const l = lops.pop(); if (l._dong) l._dong(); else l.remove(); return; }
    if ((e.state && e.state.glBo) || tuBo) { history.back(); }
  });
  /* vị trí cuộn theo từng màn */
  const CUON = {}; let hashCu = location.hash; const lichSu = [];
  window.addEventListener('hashchange', () => { CUON[hashCu] = window.scrollY; const quay = lichSu.length > 1 && lichSu[lichSu.length - 2] === location.hash; if (quay) lichSu.pop(); else lichSu.push(location.hash); G._quayLai = quay; hashCu = location.hash; }, true);
  G.sauVe = () => { if (G._quayLai && CUON[location.hash]) setTimeout(() => window.scrollTo(0, CUON[location.hash]), 30); G._quayLai = false; };

  /* ---------- hoàn tác 10 giây ---------- */
  window.addEventListener('gl-hoan', (e) => {
    document.querySelectorAll('.bao-hoan').forEach((x) => x.remove());
    const b = G.h(`<div class="bao bao-hoan">Đã lưu <button type="button">↶ Hoàn tác</button><i></i></div>`);
    document.body.appendChild(b); const t = setTimeout(() => b.remove(), 10000);
    b.querySelector('button').onclick = () => G.chay(async () => { clearTimeout(t); b.remove(); await API.goi('hoanTac', { ma: e.detail }); G.bao('Đã hoàn tác'); if (G.taiLai) G.taiLai(); });
  });

  /* ---------- mất sóng ---------- */
  window.addEventListener('online', () => API.guiHang());
  setInterval(() => { if (API.soHang() && navigator.onLine) API.guiHang(); }, 30000);
  window.addEventListener('gl-hang', () => G.bao('Mất sóng: đã lưu trên máy, tự gửi khi có mạng'));
  G._ganKhung = () => { const khungGoc = G.khung;
  G.khung = function (tieuDe, phu, lui) {
    const m = khungGoc(tieuDe, phu, lui);
    m.insertAdjacentHTML('beforebegin', '<div class="bang-hang" style="display:none"></div>');
    API.baoHang();
    const nav = document.querySelector('nav.duoi');
    if (nav) { const IC = { '': 'hom_nay', viec: 'viec', phieu: 'phieu', diemdanh: 'diem_danh', them: 'lap_lai' }; nav.querySelectorAll('a').forEach((a) => { const k = a.getAttribute('href').replace('#/', ''); const bt = a.querySelector('.bt'); if (bt && IC[k] && k !== 'them') bt.innerHTML = G.ic(IC[k], 28); }); }
    if (G.lang() === 'en') setTimeout(() => dichCay(document.getElementById('app')), 0);
    return m;
  }; };

  /* ---------- chọn nhiều vị trí: cụm → villa (mặt) / vị trí ---------- */
  G.dsVT = (maViec) => {
    // chưa có danh sách hàng rào riêng thì dùng chung vị trí cảnh quan (cụm → khu vực → vị trí)
    const hr = (S.dm.hangrao || []).filter((x) => x.ma && !/\(mẫu\)/.test(x.ten || ''));
    if (maViec === 'DV37' && hr.length) return hr.map((x) => ({ ma: x.ma, cum: x.kv || 'Hàng rào', kv: x.ten, ten: x.cay || x.ten }));
    if (maViec === 'DV38') return (S.dm.hothuysinh || []).map((x) => ({ ma: x.ma, cum: 'Hồ thủy sinh Villa 1–24', kv: x.kv, ten: x.ten }));
    return S.dm.vitri.filter((v) => v.ap === 'Có');
  };
  /* bảng chọn: trả về danh sách mã vị trí */
  G.luoiVT = function (goc, opt) {
    // opt: ds (vị trí), trangThai(ma) → {cls, sub}, chon (Set), matChon, coMat, doi()
    const st = opt.st;
    const ve = () => {
      const ds = opt.ds; const cums = [...new Set(ds.map((v) => v.cum))];
      if (!st.cum || !cums.includes(st.cum)) st.cum = cums[0];
      const trong = ds.filter((v) => v.cum === st.cum);
      const villa = trong.length && trong.every((v) => G.laVilla(v));
      let html = `<div class="chon boc">${cums.map((c) => `<button type="button" data-cum="${esc(c)}" class="${st.cum === c ? 'dang' : ''}">${esc(c)}</button>`).join('')}</div>`;
      const nhieuMat = villa && trong.length > new Set(trong.map((v) => v.kv)).size;
      if (opt.coMat !== false && nhieuMat) html += `<div class="buoc-nho">Chọn mặt nhanh cho cả cụm</div><div class="chon">${['Cả 3', 'Trước', 'Hông', 'Sau'].map((x) => `<button type="button" data-mat="${x}" class="${(st.mat || 'Cả 3') === x ? 'dang' : ''}">${x}</button>`).join('')}</div>`;
      html += `<div class="nhom-nut" style="margin:4px 0 8px"><button type="button" class="nut nho" id="caCum">Chọn cả cụm</button><button type="button" class="nut nho" id="boCum">Bỏ chọn cụm</button></div>`;
      if (villa) {
        const nhom = {}; trong.forEach((v) => { (nhom[v.kv] = nhom[v.kv] || []).push(v); });
        const mat = st.mat && st.mat !== 'Cả 3' ? st.mat : '';
        html += `<div class="luoi-villa">${Object.keys(nhom).map((kv) => {
          const vs = nhom[kv]; const tts = vs.map((v) => opt.trangThai(v.ma)); const nChon = vs.filter((v) => st.chon.has(v.ma)).length;
          const xong = tts.filter((t) => t.cls === 'xong').length; const dang = tts.filter((t) => t.cls === 'dang').length;
          const cls = nChon ? 'chon' : xong === vs.length ? 'xong' : dang ? 'dang' : xong ? 'motphan' : '';
          const sub = nChon ? `chọn ${nChon}/${vs.length}` : dang ? (tts.find((t) => t.cls === 'dang').sub || 'đang làm') : `${xong}/${vs.length}`;
          return `<button type="button" class="o-villa ${cls}" data-kv="${esc(kv)}"><b>V${G.soVilla(kv)}</b><small>${esc(sub)}</small>${mat ? '' : `<span class="mat3">${vs.map((v) => `<i class="${st.chon.has(v.ma) ? 'c' : opt.trangThai(v.ma).cls}" title="${esc(G.mat(v.ten))}"></i>`).join('')}</span>`}</button>`;
        }).join('')}</div>`;
        st._nhom = nhom; st._mat = mat;
      } else {
        html += `<div class="ds">${trong.map((v) => { const t = opt.trangThai(v.ma); const c = st.chon.has(v.ma); return `<div class="muc ${c ? 'da-chon' : t.cls === 'xong' ? 'da-lam' : t.cls === 'dang' ? 'dang-lam' : ''}" data-vt="${v.ma}" style="cursor:pointer"><span class="chon-vt">${c || t.cls === 'xong' ? '✓' : t.cls === 'dang' ? '◐' : ''}</span><div class="gian">${esc(v.ten)}${v.kv && v.kv !== v.cum ? `<div class="mo">${esc(v.kv)}</div>` : ''}${t.sub ? `<div class="mo">${esc(t.sub)}</div>` : ''}</div></div>`; }).join('')}</div>`;
      }
      goc.innerHTML = html;
      goc.querySelectorAll('[data-cum]').forEach((b) => { b.onclick = () => { st.cum = b.dataset.cum; ve(); }; });
      goc.querySelectorAll('[data-mat]').forEach((b) => { b.onclick = () => { st.mat = b.dataset.mat; ve(); }; });
      const hopLe = (v) => !st._mat || !villa || G.mat(v.ten) === st._mat;
      goc.querySelector('#caCum').onclick = async () => { const them = trong.filter(hopLe).filter((v) => !st.chon.has(v.ma)); if (await chonCo(them)) ve(); };
      goc.querySelector('#boCum').onclick = () => { trong.forEach((v) => st.chon.delete(v.ma)); doi(); ve(); };
      goc.querySelectorAll('[data-kv]').forEach((b) => { b.onclick = async () => { const vs = st._nhom[b.dataset.kv].filter(hopLe); if (vs.length && vs.every((v) => st.chon.has(v.ma))) { vs.forEach((v) => st.chon.delete(v.ma)); doi(); return ve(); } if (await chonCo(vs.filter((v) => !st.chon.has(v.ma)))) ve(); }; });
      goc.querySelectorAll('[data-vt]').forEach((b) => { b.onclick = async () => { const ma = b.dataset.vt; if (st.chon.has(ma)) { st.chon.delete(ma); doi(); return ve(); } if (await chonCo([trong.find((v) => v.ma === ma)])) ve(); }; });
    };
    const doi = () => { if (opt.doi) opt.doi(); };
    async function chonCo(vs) { // vị trí đã xong trong kỳ: hỏi lý do làm thêm (nếu có)
      if (!vs.length) return false;
      const lai = opt.hoiLyDo ? vs.filter((v) => opt.trangThai(v.ma).cls === 'xong') : [];
      let ly = '';
      if (lai.length) { const l = await G.chonDS(`${lai.length} vị trí đã làm trong kỳ. Làm thêm vì:`, ['Làm lại vì chưa đạt', 'Theo yêu cầu', 'Khác']); if (!l) { vs = vs.filter((v) => !lai.includes(v)); } else ly = l.ten; }
      vs.forEach((v) => { st.chon.add(v.ma); if (lai.includes(v)) (st.lyDo = st.lyDo || {})[v.ma] = ly; });
      doi(); return true;
    }
    ve(); return { ve };
  };

  /* ---------- cài đặt trong mục Thêm ---------- */
  G.theCaiDat = () => `<div class="the"><h2>Cài đặt</h2>
    <div class="mo" style="margin-bottom:4px">Cỡ chữ</div><div class="chon" id="cdChu">${[['', 'Thường'], ['to', 'To'], ['rat-to', 'Rất to']].map((x) => `<button type="button" data-c="${x[0]}" class="${LS.get('chu', '') === x[0] ? 'dang' : ''}">${x[1]}</button>`).join('')}</div>
    <div class="mo" style="margin:8px 0 4px">Ngôn ngữ</div><div class="chon" id="cdLang">${[['vi', 'Tiếng Việt'], ['en', 'English']].map((x) => `<button type="button" data-l="${x[0]}" class="${G.lang() === x[0] ? 'dang' : ''}">${x[1]}</button>`).join('')}</div></div>`;
  G.ganCaiDat = (m) => {
    m.querySelectorAll('#cdChu [data-c]').forEach((b) => { b.onclick = () => { G.datChu(b.dataset.c); G.taiLai(); }; });
    m.querySelectorAll('#cdLang [data-l]').forEach((b) => { b.onclick = () => { G.datLang(b.dataset.l); location.reload(); }; });
  };
})();
