/* GreenLog 0.4 – cây nội thất bất thường (trao đổi đến khi anh đóng), phiếu setup cây nội thất, danh mục cây trồng,
   liên kết dự án + báo cáo dự án 1 trang, kỳ định kỳ tự tạo ngày 20 + duyệt kết thúc + giai đoạn làm quen */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hop = (...a) => G.hop(...a);
  const hn = () => API.ngay();
  const diem = (l) => S.dm.diemkhac.filter((x) => x.loai === l);
  const vai = () => (G.laAnhVu() ? 'Trưởng bộ phận' : S.u.nhom);

  /* ================= CÂY NỘI THẤT BẤT THƯỜNG = một việc có trao đổi qua lại (mục 24) ================= */
  const CAU_MAU = ['Tưới ít lại, để khô mặt đất 2–3 cm rồi tưới', 'Chuyển chậu ra chỗ có ánh sáng tán xạ', 'Cắt bỏ lá vàng, chụp lại ảnh sau 3 ngày', 'Lau lá, kiểm tra mặt dưới lá có rệp không', 'Đưa cây về vườn ươm, thay cây khác', 'Bón phân tan chậm, theo dõi 7 ngày'];
  const khoaBT = (x) => (x['Mã BT'] ? { 'Mã BT': x['Mã BT'] } : { 'Ngày': x['Ngày'], 'Mã điểm': x['Mã điểm'], 'Tên cây': x['Tên cây'] });
  G.man.batthuong = { ten: 'Cây nội thất bất thường', ic: 'bat_thuong', bt: '🥀', nhom: 'Cây xanh', ph: () => q('noibo') >= 1 || G.laAnhVu(), fn: async (ma) => {
    const d = await G.docNhieu([{ bang: 'BatThuong', gioiHan: 500 }, { bang: 'TraoDoi', gioiHan: 2000 }]);
    const ds = (d.BatThuong || []).filter((x) => x['Mã điểm'] || /^NT/.test(x['Mã vị trí'] || '')).reverse(); const td = d.TraoDoi || [];
    if (ma) return luong(ds.find((x) => G.maBT(x) === ma), td.filter((t) => t['Mã'] === ma));
    const m = G.khung('Cây nội thất bất thường', 'Mỗi báo cáo là một việc trao đổi đến khi anh Vũ đóng', '#/nb/noithat');
    const mo = ds.filter((x) => x['Trạng thái'] !== 'Đã đóng'); const dong = ds.filter((x) => x['Trạng thái'] === 'Đã đóng');
    const dong1 = (x) => { const t = td.filter((y) => y['Mã'] === G.maBT(x)); const c = t[t.length - 1]; const luot = !c ? 'Chờ anh Vũ hướng dẫn' : /Trưởng bộ phận/.test(c['Vai']) ? 'Chờ nhân viên làm và trả lời' : 'Chờ anh Vũ xem';
      return `<a class="muc" href="#/batthuong/${encodeURIComponent(G.maBT(x))}" style="color:inherit"><div class="gian"><b>${esc(x['Tên cây'])} · ${esc(x['Tình trạng'])}</b><div class="mo">${esc((diem('Cây nội thất').find((p) => p.ma === x['Mã điểm']) || {}).ten || G.tenVT(x['Mã vị trí']))} · ${G.ngayVN(x['Ngày'])} · ${t.length} lượt</div></div><span class="chip ${x['Trạng thái'] === 'Đã đóng' ? 'xanh' : 'cam'}">${esc(x['Trạng thái'] === 'Đã đóng' ? 'Đã đóng' : luot)}</span></a>`; };
    m.innerHTML = `<h3 class="tieu-nhom">Đang mở (${mo.length})</h3><div class="ds">${mo.map(dong1).join('') || '<div class="muc mo">Không có việc đang mở</div>'}</div>` + (dong.length ? `<h3 class="tieu-nhom">Đã đóng</h3><div class="ds">${dong.slice(0, 40).map(dong1).join('')}</div>` : '');
  } };
  function luong(x, td) {
    if (!x) { location.hash = '#/batthuong'; return; }
    const ma = G.maBT(x); const anh = G.laAnhVu(); const dong = x['Trạng thái'] === 'Đã đóng'; const ghi = anh || q('noibo') >= 2;
    const m = G.khung(x['Tên cây'] + ' · ' + x['Tình trạng'], (diem('Cây nội thất').find((p) => p.ma === x['Mã điểm']) || {}).ten || '', '#/batthuong');
    m.innerHTML = `<div class="the ${dong ? 'the-xanh' : 'the-mo'}"><b>Báo cáo lúc ${G.ngayVN(x['Ngày'])} · ${esc(x['Người báo'])}</b><p style="margin:6px 0">${esc(x['Ghi chú'] || '')}</p>${G.xemAnh(x['Ảnh'])}
        ${x['Trả lời của anh Vũ'] ? `<p class="mo">Trả lời cũ: ${esc(x['Trả lời của anh Vũ'])}</p>` : ''}</div>
      <div class="luong">${td.map((t) => `<div class="tn ${/Trưởng bộ phận/.test(t['Vai']) ? 'anh-vu' : ''}"><b>${esc(t['Người'])}</b> <span class="mo">${esc(G.gioVN(t['Thời điểm']))}</span><div>${esc(t['Nội dung'])}</div>${G.xemAnh(t['Ảnh'])}</div>`).join('') || '<p class="mo">Chưa có trao đổi.</p>'}</div>
      ${dong ? `<div class="chip xanh">Đã đóng ${esc(x['Ngày đóng'] ? G.ngayVN(x['Ngày đóng']) : '')}</div>` : ghi ? `<div class="the"><div id="f"></div><button class="nut chinh rong" id="gui">${anh ? 'Gửi hướng dẫn' : 'Gửi trả lời'}</button>
        ${anh ? `<div class="nhom-nut" style="margin-top:8px"><button class="nut" id="dh">→ Hồ sơ dịch hại</button><button class="nut" id="vu">→ Đưa về vườn ươm</button></div><button class="nut do rong" id="dongV" style="margin-top:8px">Đóng việc</button>` : ''}</div>` : ''}`;
    if (dong || !ghi) return;
    const lay = G.form(m.querySelector('#f'), anh ? [{ k: 'mau', nhan: 'Câu mẫu', loai: 'chips', ds: CAU_MAU, doi: (v) => { const t = m.querySelector('textarea'); if (t) t.value = v; } }, { k: 'nd', nhan: 'Hướng dẫn (gõ hoặc bấm 🎤 nói)', loai: 'mota', bb: true }, { k: 'anh', nhan: 'Ảnh minh họa', loai: 'anh', toiDa: 3, tuyChon: true }]
      : [{ k: 'nd', nhan: 'Đã làm gì, cây hiện thế nào', loai: 'mota', bb: true }, { k: 'anh', nhan: 'Ảnh sau khi làm', loai: 'anh', toiDa: 3 }]);
    const gui = (nd, anh_) => API.goi('ghi', { bang: 'TraoDoi', dong: { 'Mã': ma, 'Loại': 'Cây nội thất bất thường', 'Người': S.u.ten, 'Vai': vai(), 'Nội dung': nd, 'Ảnh': anh_ || [], 'Thời điểm': '' } });
    m.querySelector('#gui').onclick = (e) => chay(async () => { const v = lay(); await gui(v.nd, v.anh); if (anh) await API.goi('sua', { bang: 'BatThuong', khoa: khoaBT(x), doi: { 'Trả lời của anh Vũ': v.nd, 'Giờ trả lời': API.bayGio(), 'Trạng thái': 'Đang mở' } }); bao(anh ? 'Đã gửi · nhân viên nhận thông báo' : 'Đã gửi · anh Vũ nhận thông báo'); G.taiLai(); }, e.target);
    if (!anh) return;
    m.querySelector('#dongV').onclick = async (e) => { if (!(await G.xacNhan('Đóng việc này? Sau khi đóng không trao đổi thêm.', 'Đóng việc'))) return; chay(async () => { await API.goi('sua', { bang: 'BatThuong', khoa: khoaBT(x), doi: { 'Trạng thái': 'Đã đóng', 'Ngày đóng': hn() } }); await gui('Đã đóng việc'); bao('Đã đóng việc'); location.hash = '#/batthuong'; }, e.target); };
    m.querySelector('#dh').onclick = (e) => chay(async () => { const r = await API.goi('ghi', { bang: 'DichHai', dong: { 'Mã DH': '', 'Ngày phát hiện': hn(), 'Cụm': 'Cây nội thất', 'Mã vị trí': x['Mã điểm'] || '', 'Vị trí chi tiết': (diem('Cây nội thất').find((p) => p.ma === x['Mã điểm']) || {}).ten || '', 'Phạm vi (Vài cây/Một mảng/Cả khu vực)': 'Vài cây', 'Nhóm cây': 'Cây nội thất', 'Tên cây': x['Tên cây'], 'Loại dịch hại': 'Chưa rõ', 'Mức độ': 'Nhẹ', 'Mô tả': 'Từ việc cây nội thất bất thường: ' + x['Tình trạng'], 'Ảnh': x['Ảnh'], 'Người phát hiện': '', 'Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)': 'Phát hiện', 'Số lần trả lại': '0' } }); await gui('Đã chuyển thành hồ sơ dịch hại ' + r['Mã DH']); bao('Đã tạo hồ sơ ' + r['Mã DH']); G.taiLai(); }, e.target);
    m.querySelector('#vu').onclick = (e) => chay(async () => { await gui('Đưa cây về vườn ươm nội thất để phục hồi, thay cây khác tại điểm'); await API.goi('ghi', { bang: 'VuonUom', dong: { 'Ngày': '', 'Vườn ươm': 'Vườn ươm cây nội thất', 'Loại ghi': 'Ươm vào', 'Việc': 'Nhận cây phục hồi', 'Tên cây': x['Tên cây'], 'Số lượng': 1, 'ĐVT': 'Chậu', 'Mô tả': 'Từ ' + ((diem('Cây nội thất').find((p) => p.ma === x['Mã điểm']) || {}).ten || ''), 'Ảnh': x['Ảnh'], 'Người ghi': '' } }); bao('Đã ghi đưa về vườn ươm'); G.taiLai(); }, e.target);
  }

  /* ================= PHIẾU "SETUP CÂY NỘI THẤT" (mục 25) ================= */
  const cayNT = () => S.dm.cay.filter((c) => /nội thất/i.test(c.nhom)).map((c) => c.ten);
  G.taoSetupNT = () => hop('🪴 Phiếu setup cây nội thất', '<div id="f"></div><button class="nut chinh rong" id="l">Tạo phiếu, giao nội bộ</button>', (o, dong) => {
    const lay = G.form(o.querySelector('#f'), [{ k: 'cay', nhan: 'Loại cây', loai: 'chonds', ds: ['Tùy chọn (nhân viên tự chọn)'].concat(cayNT()), bb: true }, { k: 'sl', nhan: 'Số lượng chậu', loai: 'so', bb: true }, { k: 'ly', nhan: 'Lý do', loai: 'chips', ds: ['Sự kiện', 'Thay cây hư', 'Yêu cầu bộ phận', 'Trang trí mới', 'Khác'], bb: true },
      { k: 'kv', nhan: 'Mô tả khu vực setup', loai: 'mota', bb: true }, { k: 'han', nhan: 'Hạn', loai: 'ngaygio', bb: true }]);
    o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const cay = v.cay.ten || v.cay;
      const p = await API.goi('phieu.tao', { loaiPhieu: 'Setup cây nội thất', nguon: 'Anh Vũ giao', nhom: 'Cây nội thất', loai: 'Setup cây nội thất', muc: 'Trung bình', vtKhac: v.kv, moTa: `Setup ${v.sl} chậu ${cay}. Lý do: ${v.ly}. Khu vực: ${v.kv}`, giao: 'Nhân viên nội bộ' });
      await API.goi('sua', { bang: 'Phieu', khoa: { 'Mã phiếu': p.ma }, doi: { 'Hạn': v.han, 'Chi tiết setup': JSON.stringify({ cay, sl: v.sl, ly: v.ly, kv: v.kv }) } });
      dong(); bao('Đã tạo phiếu ' + p.ma + ' · Hiệp, Nghị nhận thông báo'); }, e.target);
  });
  G.baoXongSetup = (p) => { const ct = JSON.parse(p['Chi tiết setup'] || '{}');
    hop('Báo xong setup · ' + p['Mã phiếu'], `<p class="mo">Yêu cầu: ${esc(ct.sl)} chậu ${esc(ct.cay)} · ${esc(ct.kv)}</p><div id="f"></div><button class="nut chinh rong" id="l">Báo xong</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'cay', nhan: 'Tên cây thực tế', loai: 'chonds', ds: cayNT(), bb: true }, { k: 'sl', nhan: 'Số lượng thực tế', loai: 'so', bb: true, gt: ct.sl }, { k: 'vt', nhan: 'Mô tả vị trí đặt', loai: 'mota', bb: true },
        { k: 'tuVU', nhan: 'Cây lấy từ vườn ươm nội thất?', loai: 'chips', ds: ['Có', 'Không'], gt: 'Có', bb: true }, { k: 'anh', nhan: 'Ảnh sau setup', loai: 'anh', toiDa: 4 }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const cay = v.cay.ten || v.cay;
        await API.goi('phieu.chuyen', { ma: p['Mã phiếu'], hd: 'xong', anh: v.anh, ghiChu: `${v.sl} chậu ${cay} · ${v.vt}` });
        await API.goi('sua', { bang: 'Phieu', khoa: { 'Mã phiếu': p['Mã phiếu'] }, doi: { 'Kết quả setup': JSON.stringify({ cay, sl: v.sl, vt: v.vt, tuVU: v.tuVU }) } });
        if (v.tuVU === 'Có') await API.goi('ghi', { bang: 'VuonUom', dong: { 'Ngày': '', 'Vườn ươm': 'Vườn ươm cây nội thất', 'Loại ghi': 'Xuất vườn', 'Việc': 'Xuất vườn', 'Tên cây': cay, 'Số lượng': v.sl, 'ĐVT': 'Chậu', 'Xuất đi': 'Setup ' + p['Mã phiếu'] + ' · ' + v.vt, 'Ảnh': v.anh, 'Người ghi': '' } });
        dong(); bao('Đã báo xong · chờ anh Vũ duyệt đóng phiếu' + (v.tuVU === 'Có' ? ' · đã trừ tồn vườn ươm' : '')); G.taiLai(); }, e.target);
    }); };
  // màn cây nội thất: link trao đổi + phiếu setup đang mở
  const nbFn = G.man.nb.fn;
  G.man.nb = Object.assign(G.man.nb, { fn: async (loai) => {
    await nbFn(loai); if (loai !== 'noithat') return; const m = document.getElementById('noiDung'); if (!m) return;
    m.querySelectorAll('[data-tl]').forEach((b) => b.remove());
    const d = await G.docNhieu([{ bang: 'Phieu', gioiHan: 500 }, { bang: 'BatThuong', gioiHan: 300 }]);
    const su = (d.Phieu || []).filter((p) => p['Loại'] === 'Setup cây nội thất' && !/Đã duyệt|Báo xong/.test(p['Trạng thái']));
    const bt = (d.BatThuong || []).filter((x) => x['Trạng thái'] !== 'Đã đóng' && (x['Mã điểm'] || /^NT/.test(x['Mã vị trí'] || '')));
    m.insertAdjacentHTML('afterbegin', `${bt.length ? `<a class="the the-do" href="#/batthuong" style="display:block;color:inherit"><b>🥀 ${bt.length} việc cây bất thường đang mở</b><div class="mo">Bấm để xem trao đổi với anh Vũ</div></a>` : ''}
      ${su.map((p) => { const ct = JSON.parse(p['Chi tiết setup'] || '{}'); return `<div class="the the-mo"><b>🪴 Setup ${esc(ct.sl)} chậu ${esc(ct.cay)}</b><div class="mo">${esc(ct.kv)} · hạn ${esc(G.gioVN(p['Hạn']))} · ${esc(p['Mã phiếu'])}</div>${q('noibo') >= 2 ? `<button class="nut nho chinh" data-su="${esc(p['Mã phiếu'])}" style="margin-top:6px">Báo xong setup</button>` : ''}</div>`; }).join('')}`);
    m.querySelectorAll('[data-su]').forEach((b) => { b.onclick = () => G.baoXongSetup(su.find((p) => p['Mã phiếu'] === b.dataset.su)); });
    // thêm Mã BT khi báo bất thường mới (để mở luồng trao đổi)
  } });
  const goiGoc = API.goi;
  API.goi = function (action, body) {
    if (action === 'ghi' && body && body.bang === 'BatThuong' && body.dong && !body.dong['Mã BT']) body.dong = Object.assign({ 'Mã BT': G.ma('BT'), 'Trạng thái': 'Đang mở' }, body.dong);
    if (action === 'vanChuyen.gui' && G._daVC) body = Object.assign({ maDA: G._daVC }, body);
    return goiGoc.call(API, action, body);
  };

  /* ================= DANH MỤC CÂY TRỒNG (mục 26) ================= */
  G.man.danhmuccay = { ten: 'Danh mục cây trồng', ic: 'trong_cay', bt: '🌿', nhom: 'Cây xanh', ph: 'homnay', fn: async (ma) => {
    const st = G.man.danhmuccay.st || (G.man.danhmuccay.st = { tim: '', nhom: '' });
    if (ma) return chiTietCay(ma);
    const m = G.khung('Danh mục cây trồng', `${S.dm.cay.length} loại · tên Việt, Anh, khoa học`);
    const nhoms = [...new Set(S.dm.cay.map((c) => c.nhom))];
    const ve = () => { const t = st.tim.toLowerCase(); const ds = S.dm.cay.filter((c) => (!st.nhom || c.nhom === st.nhom) && (!t || (c.ten + ' ' + (c.en || '') + ' ' + (c.kh || '')).toLowerCase().includes(t)));
      m.querySelector('#ds').innerHTML = ds.map((c) => `<a class="muc" href="#/danhmuccay/${encodeURIComponent(c.ma)}" style="color:inherit">${c.anh ? `<img src="${esc(API.anhUrl(API.dsAnh(c.anh)[0]))}" style="width:44px;height:44px;border-radius:10px;object-fit:cover">` : G.ic('trong_cay', 40)}<div class="gian"><b>${esc(c.ten)}</b><div class="mo">${esc(c.en || '')} · <i>${esc(c.kh || '')}</i></div><div class="mo">${esc(c.nhom)}${c.dh ? ' · ' + esc(c.dh) : ''}</div></div>›</a>`).join('') || '<div class="muc mo">Không thấy</div>'; };
    m.innerHTML = `<input type="search" id="tim" placeholder="Tìm tên Việt, Anh hoặc khoa học" value="${esc(st.tim)}"><div class="chon" style="margin-top:8px"><button data-n="" class="${!st.nhom ? 'dang' : ''}">Tất cả</button>${nhoms.map((n) => `<button data-n="${esc(n)}" class="${st.nhom === n ? 'dang' : ''}">${esc(n)}</button>`).join('')}</div>
      ${G.laAnhVu() ? '<button class="nut chinh rong" id="them" style="margin-bottom:10px">＋ Thêm cây</button>' : '<button class="nut rong" id="dx" style="margin-bottom:10px">＋ Đề xuất cây mới (anh Vũ duyệt)</button>'}
      ${G.laAnhVu() ? '<div id="choDX"></div>' : ''}<div class="ds" id="ds"></div>`;
    m.querySelector('#tim').oninput = (e) => { st.tim = e.target.value; ve(); };
    m.querySelectorAll('[data-n]').forEach((b) => { b.onclick = () => { st.nhom = b.dataset.n; G.taiLai(); }; });
    ve();
    const th = m.querySelector('#them'); if (th) th.onclick = () => suaCay(null);
    const dx = m.querySelector('#dx'); if (dx) dx.onclick = () => hop('Đề xuất cây mới', '<div id="f"></div><button class="nut chinh rong" id="l">Gửi đề xuất</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Tên Việt', loai: 'chu', bb: true }, { k: 'nhom', nhan: 'Nhóm', loai: 'chips', ds: nhoms, bb: true }, { k: 'gc', nhan: 'Ghi chú (trồng ở đâu)', loai: 'mota' }, { k: 'anh', nhan: 'Ảnh cây', loai: 'anh', toiDa: 2 }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'DeXuatCay', dong: { 'Mã': G.ma('DXC'), 'Tên Việt': v.ten, 'Nhóm': v.nhom, 'Ghi chú': v.gc, 'Ảnh': v.anh, 'Trạng thái': 'Chờ duyệt', 'Người đề xuất': '', 'Giờ ghi': '' } }); dong(); bao('Đã gửi đề xuất'); }, e.target);
    });
    if (G.laAnhVu()) { const dxs = (await G.doc('DeXuatCay', { 'Trạng thái': 'Chờ duyệt' })); const el = m.querySelector('#choDX');
      el.innerHTML = dxs.map((x) => `<div class="the the-mo"><b>Đề xuất: ${esc(x['Tên Việt'])}</b> <span class="mo">${esc(x['Nhóm'])} · ${esc(x['Người đề xuất'])}</span><div>${G.xemAnh(x['Ảnh'])}</div><div class="nhom-nut" style="margin-top:6px"><button class="nut nho" data-tc="${esc(x['Mã'])}">Từ chối</button><button class="nut nho chinh" data-dy="${esc(x['Mã'])}">Duyệt, thêm vào danh mục</button></div></div>`).join('');
      el.querySelectorAll('[data-tc]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('sua', { bang: 'DeXuatCay', khoa: { 'Mã': b.dataset.tc }, doi: { 'Trạng thái': 'Từ chối' } }); G.taiLai(); }); });
      el.querySelectorAll('[data-dy]').forEach((b) => { b.onclick = () => { const x = dxs.find((y) => y['Mã'] === b.dataset.dy); suaCay(null, { ten: x['Tên Việt'], nhom: x['Nhóm'], anh: x['Ảnh'] }, x['Mã']); }; }); }
  } };
  function suaCay(c, mau, maDX) {
    c = c || {}; mau = mau || {};
    hop(c.ma ? 'Sửa ' + c.ten : 'Thêm cây', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Tên Việt', loai: 'chu', bb: true, gt: c.ten || mau.ten }, { k: 'en', nhan: 'Tên tiếng Anh', loai: 'chu', gt: c.en }, { k: 'kh', nhan: 'Tên khoa học', loai: 'chu', gt: c.kh },
        { k: 'nhom', nhan: 'Nhóm', loai: 'chips', ds: [...new Set(S.dm.cay.map((x) => x.nhom))], bb: true, gt: c.nhom || mau.nhom }, { k: 'dh', nhan: 'Dịch hại thường gặp (cách nhau dấu phẩy)', loai: 'chu', gt: c.dh }, { k: 'anh', nhan: 'Ảnh', loai: 'anh', toiDa: 2, tuyChon: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); const ma = c.ma || 'CY' + String(S.dm.cay.length + 1).padStart(3, '0');
        await API.goi('ghiNhieu', { bang: 'CayDanhMuc', thay: ['Mã'], dong: [{ 'Mã': ma, 'Tên Việt': v.ten, 'Tên Anh': v.en, 'Tên khoa học': v.kh, 'Nhóm': v.nhom, 'Dịch hại thường gặp': v.dh, 'Ảnh': (v.anh || []).length ? v.anh : (c.anh || mau.anh || ''), 'Người sửa': '', 'Giờ sửa': API.bayGio() }] });
        if (maDX) await API.goi('sua', { bang: 'DeXuatCay', khoa: { 'Mã': maDX }, doi: { 'Trạng thái': 'Đã duyệt' } });
        await G.boSungDM(); dong(); bao('Đã lưu ' + v.ten); G.taiLai(); }, e.target);
    });
  }
  async function chiTietCay(ma) {
    const c = S.dm.cay.find((x) => x.ma === ma); if (!c) { location.hash = '#/danhmuccay'; return; }
    const m = G.khung(c.ten, c.kh || '', '#/danhmuccay');
    const d = await G.docNhieu([{ bang: 'SoTrongCay', gioiHan: 3000 }, { bang: 'DichHai', gioiHan: 1000 }, { bang: 'TuiThuocDua', gioiHan: 2000 }]);
    const ten0 = c.ten.split(' (')[0].toLowerCase(); const khop = (s) => String(s || '').toLowerCase().includes(ten0);
    const trong = (d.SoTrongCay || []).filter((r) => khop(r['Tên cây'])); const dh = (d.DichHai || []).filter((r) => khop(r['Tên cây']));
    const noi = [...new Set([].concat((S.dm.hangrao || []).filter((h) => khop(h.cay)).map((h) => h.kv), (d.TuiThuocDua || []).filter((r) => r['Loại dòng'] === 'Cây' && khop(r['Loại cây'])).map((r) => G.tenVT(r['Mã vị trí'], r['Vị trí khác'])), trong.map((r) => r['Khu vực'] || G.tenVT(r['Mã vị trí'], r['Vị trí khác']))))].filter(Boolean);
    const thuoc = String(c.dh || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => { const g = (S.dm.dhThuoc || []).find((y) => y.dh === x); return `<li><b>${esc(x)}</b>${g ? ` → ${esc(g.chinh)}${g.luan ? ' / luân phiên ' + esc(g.luan) : ''}` : ''}</li>`; }).join('');
    m.innerHTML = `<div class="the">${c.anh ? G.xemAnh(c.anh) : ''}<div class="luoi2"><div><div class="mo">Tên Việt</div><b>${esc(c.ten)}</b></div><div><div class="mo">Tên Anh</div><b>${esc(c.en || '—')}</b></div><div><div class="mo">Tên khoa học</div><i>${esc(c.kh || '—')}</i></div><div><div class="mo">Nhóm</div>${esc(c.nhom)}</div></div>
      ${G.laAnhVu() ? '<button class="nut nho" id="sua" style="margin-top:10px">Sửa</button>' : ''}</div>
      <div class="the"><h2>Dịch hại thường gặp + thuốc đề xuất</h2><ul style="margin:0;padding-left:18px">${thuoc || '<li class="mo">Chưa có</li>'}</ul></div>
      <div class="the"><h2>Nơi đang trồng</h2>${noi.length ? noi.map((x) => `<span class="chip" style="margin:2px">${esc(x)}</span>`).join('') : '<p class="mo">Chưa có ghi nhận</p>'}</div>
      <div class="the"><h2>Lịch sử trồng (${trong.length})</h2>${trong.slice(-20).reverse().map((r) => `<div class="mo">${G.ngayVN(String(r['Thời gian']).slice(0, 10))} · ${esc(r['Hình thức'])} ${esc(r['Số lượng'])} ${esc(r['ĐVT'])} · ${esc(r['Khu vực'] || G.tenVT(r['Mã vị trí'], r['Vị trí khác']))}</div>`).join('') || '<p class="mo">Chưa có</p>'}</div>
      <div class="the"><h2>Lịch sử dịch hại (${dh.length})</h2>${dh.slice(-20).reverse().map((r) => `<div class="mo">${G.ngayVN(r['Ngày phát hiện'])} · ${esc(r['Loại dịch hại'])} · ${esc(r['Mức độ'])} · ${esc(r['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)'])}</div>`).join('') || '<p class="mo">Chưa có</p>'}</div>`;
    const s = m.querySelector('#sua'); if (s) s.onclick = () => suaCay(c);
  }

  /* ================= DỰ ÁN: tổng hợp + báo cáo 1 trang (mục 27) ================= */
  const daFn = G.man.duan.fn;
  G.man.duan = Object.assign(G.man.duan, { fn: async (ma) => {
    await daFn(ma); if (!ma) return; const m = document.getElementById('noiDung'); if (!m) return;
    const th = await G.tongHopDA(ma); m.insertAdjacentHTML('beforeend', th.html + '<button class="nut chinh rong" id="bcDA" style="margin:10px 0 30px">⬇ Báo cáo dự án 1 trang (PDF)</button>');
    m.querySelector('#bcDA').onclick = () => chay(async () => G.inTrang('Báo cáo dự án ' + th.da['Tên'], th.trang));
  } });
  G.tongHopDA = async (ma) => {
    const d = await G.docNhieu([{ bang: 'DuAn' }, { bang: 'SoTrongCay', gioiHan: 3000 }, { bang: 'NhatKyPhunBon', gioiHan: 2000 }, { bang: 'NhatKyPhunBonChiTiet', gioiHan: 5000 }, { bang: 'ViecPhatSinh', gioiHan: 2000 }, { bang: 'VanChuyen', gioiHan: 3000 }, { bang: 'DuAnTienDo', gioiHan: 3000 }]);
    const da = (d.DuAn || []).find((x) => x['Mã DA'] === ma) || {}; const cua = (r) => r['Mã DA'] === ma;
    const tc = (d.SoTrongCay || []).filter(cua); const pb = (d.NhatKyPhunBon || []).filter(cua); const ps = (d.ViecPhatSinh || []).filter(cua); const vc = (d.VanChuyen || []).filter(cua); const td = (d.DuAnTienDo || []).filter(cua);
    const cay = {}; tc.filter((r) => !/m²|m2/i.test(r['ĐVT'])).forEach((r) => { cay[r['Tên cây']] = (cay[r['Tên cây']] || 0) + (+r['Số lượng'] || 0); });
    const m2 = tc.filter((r) => /m²|m2/i.test(r['ĐVT'])).reduce((a, r) => a + (+r['Số lượng'] || 0), 0);
    const bao_ = tc.reduce((a, r) => a + (+r['Chất cải tạo đất hữu cơ (bao)'] || 0), 0) + td.reduce((a, r) => a + (+r['Mùn cưa (bao)'] || 0), 0);
    const sp = {}; (d.NhatKyPhunBonChiTiet || []).filter((x) => pb.some((p) => p['Mã NK'] === x['Mã NK'])).forEach((x) => { const k = x['Sản phẩm'] + ' (' + x['ĐVT'] + ')'; sp[k] = (sp[k] || 0) + (+x['Tổng lượng'] || 0); });
    const ngGio = ps.reduce((a, r) => a + (+r['Số người'] || 1) * (+r['Số giờ'] || 0), 0);
    const ngay = [...new Set([].concat(tc.map((r) => String(r['Thời gian']).slice(0, 10)), pb.map((r) => String(r['Ngày giờ']).slice(0, 10)), ps.map((r) => r['Ngày']), td.map((r) => r['Ngày'])))].filter(Boolean).sort();
    const truoc = tc.flatMap((r) => API.dsAnh(r['Ảnh trước'])).slice(0, 3); const sau = tc.flatMap((r) => API.dsAnh(r['Ảnh sau'])).slice(0, 3);
    const noi = `<div class="luoi2"><div><div class="mo">Cây đã trồng</div><b>${Object.keys(cay).map((k) => `${esc(k)} ${G.so(cay[k])}`).join(' · ') || '—'}</b></div><div><div class="mo">Cỏ</div><b>${G.so(m2)} m²</b></div>
      <div><div class="mo">Mùn cưa (chất cải tạo đất)</div><b>${G.so(bao_)} bao = ${G.so(bao_ * 25)} kg</b></div><div><div class="mo">Người-giờ phát sinh</div><b>${G.so(ngGio)}</b></div>
      <div><div class="mo">Phân / thuốc</div><b>${Object.keys(sp).map((k) => `${esc(k)} ${G.so(sp[k], 2)}`).join(' · ') || '—'}</b></div><div><div class="mo">Vận chuyển</div><b>${G.so(vc.reduce((a, r) => a + (+r['Số chuyến'] || 0), 0))} chuyến</b></div>
      <div><div class="mo">Ngày thực hiện</div><b>${ngay.length} ngày${ngay.length ? ' · ' + G.ngayVN(ngay[0]) + ' → ' + G.ngayVN(ngay[ngay.length - 1]) : ''}</b></div></div>
      ${truoc.length || sau.length ? `<div class="luoi2" style="margin-top:8px"><div><div class="mo">Trước</div>${truoc.map((a) => G.xemAnh(a)).join('')}</div><div><div class="mo">Sau</div>${sau.map((a) => G.xemAnh(a)).join('')}</div></div>` : ''}`;
    const html = `<div class="the"><h2>Tổng hợp dự án</h2><p class="mo" style="margin-top:0">Gộp từ sổ trồng cây, phun bón, việc phát sinh, vận chuyển có ô "Thuộc dự án". Xuất vườn ươm không tính; cây chỉ tính khi đã trồng (nguồn "Tự ươm").</p>${noi}</div>`;
    const trang = `<h1 style="font-size:20px;color:#123524">${esc(da['Tên'] || ma)}</h1><p>Mövenpick Resort Waverly Phu Quoc · Bộ phận Cảnh Quan · ${esc(da['Loại'] || '')} · ${G.ngayVN(da['Bắt đầu'])} → ${G.ngayVN(da['Kết thúc'])} · ${esc(da['Trạng thái'] || '')}</p>${noi}<p style="margin-top:30px">Lê Vũ – Trưởng bộ phận Cảnh Quan</p>`;
    return { da, html, trang };
  };
  // vận chuyển: ô "Thuộc dự án"
  const vcFn = G.man.vanchuyen.fn;
  G.man.vanchuyen = Object.assign(G.man.vanchuyen, { fn: async () => {
    await vcFn(); if (!S.dm._duAn) await G.taiDuAn(); const g = document.getElementById('gui'); if (!g || !(S.dm._duAn || []).length) return;
    g.insertAdjacentHTML('beforebegin', `<label class="o"><span>Thuộc dự án (nếu có)</span><select id="daVC"><option value="">— Không —</option>${S.dm._duAn.map((a) => `<option value="${esc(a['Mã DA'])}">${esc(a['Mã DA'] + ' · ' + a['Tên'])}</option>`).join('')}</select></label>`);
    G._daVC = ''; document.getElementById('daVC').onchange = (e) => { G._daVC = e.target.value; };
  } });

  /* ================= KỲ ĐỊNH KỲ: tự tạo ngày 20, kỳ cũ chờ anh duyệt kết thúc, giai đoạn làm quen (mục 28) ================= */
  const kyTruoc = () => API.ky(G.congNgay(S.dm.ky.tu, -1));
  const DV_KY = () => S.dm.dauviec.filter((v) => /^DV0[1-8]$/.test(v.ma) || v.ma === 'DV37' || v.ma === 'DV38');
  G.kiemKy = async () => { // gọi khi mở app: nếu đã sang kỳ mới mà kỳ cũ chưa có dòng → tạo dòng "Chờ anh duyệt kết thúc"
    if (!G.laAnhVu()) return; const kt = kyTruoc(); const ds = await G.doc('KyDinhKy');
    if (!ds.some((r) => r['Kỳ'] === S.dm.ky.ten)) await API.goi('ghi', { bang: 'KyDinhKy', dong: { 'Kỳ': S.dm.ky.ten, 'Từ': S.dm.ky.tu, 'Đến': S.dm.ky.den, 'Trạng thái': 'Đang chạy', 'Tạo lúc': API.bayGio(), 'Ghi chú': 'Tự tạo ngày 20 đủ việc định kỳ và vị trí' } }).catch(() => {});
    if (!ds.some((r) => r['Kỳ'] === kt.ten)) await API.goi('ghi', { bang: 'KyDinhKy', dong: { 'Kỳ': kt.ten, 'Từ': kt.tu, 'Đến': kt.den, 'Trạng thái': 'Chờ anh duyệt kết thúc', 'Tạo lúc': API.bayGio() } }).catch(() => {});
    else { const r = ds.find((x) => x['Kỳ'] === kt.ten); if (r['Trạng thái'] === 'Đang chạy') await API.goi('sua', { bang: 'KyDinhKy', khoa: { 'Kỳ': kt.ten }, doi: { 'Trạng thái': 'Chờ anh duyệt kết thúc' } }).catch(() => {}); }
  };
  G.lamQuen = () => G.caiDat('Giai đoạn làm quen', 'Bật') === 'Bật';
  G.man.kydinhky = { ten: 'Kỳ định kỳ', ic: 'ke_hoach', bt: '📆', nhom: 'Kế hoạch', ph: 'homnay', cap: 3, fn: async () => {
    await G.kiemKy();
    const m = G.khung('Kỳ định kỳ (20 → 19)', 'Ngày 20 app tự tạo kỳ mới · kỳ cũ chờ anh duyệt kết thúc', '#/');
    const kt = kyTruoc(); const [ds, tk] = await Promise.all([G.doc('KyDinhKy'), G.doc('TickDinhKy', { 'Kỳ': kt.ten })]);
    const r = ds.find((x) => x['Kỳ'] === kt.ten) || {}; const khoa = r['Trạng thái'] === 'Đã khóa';
    const kq = DV_KY().map((v) => { const vt = G.dsVT(v.ma); const xong = new Set(tk.filter((t) => t['Mã việc'] === v.ma && (t['Trạng thái'] || 'Xong') === 'Xong').map((t) => t['Mã vị trí'])); return { v, tong: vt.length, xong: vt.filter((x) => xong.has(x.ma)).length, thieu: vt.filter((x) => !xong.has(x.ma)) }; });
    m.innerHTML = `<div class="the"><div class="hang"><div class="gian"><b>Giai đoạn làm quen</b><div class="mo">Bật: cho phép bỏ việc sót của kỳ cũ, bắt đầu mới ở kỳ mới. Tắt: bắt buộc làm dồn (việc thiếu hiện ở cả 2 kỳ, làm xong tính cho kỳ cũ trước).</div></div>
        <div class="chon" style="margin:0">${['Bật', 'Tắt'].map((x) => `<button data-lq="${x}" class="${(G.lamQuen() ? 'Bật' : 'Tắt') === x ? 'dang' : ''}">${x}</button>`).join('')}</div></div></div>
      <div class="the ${khoa ? 'the-xanh' : 'the-mo'}"><div class="hang"><h2 class="gian" style="margin:0">Kỳ ${esc(kt.ten)} · ${G.ngayVN(kt.tu)} → ${G.ngayVN(kt.den)}</h2><span class="chip ${khoa ? 'xanh' : 'cam'}">${esc(r['Trạng thái'] || 'Chờ anh duyệt kết thúc')}</span></div>
        <table class="bang" style="margin-top:8px"><tr><th>Việc</th><th>Xong</th><th>Không hoàn thành</th></tr>${kq.map((x) => `<tr><td>${esc(x.v.ten)}</td><td>${x.xong}/${x.tong}</td><td style="color:${x.thieu.length ? 'var(--do)' : 'inherit'}">${x.thieu.length}</td></tr>`).join('')}</table>
        ${khoa ? `<p class="mo">Đã khóa lúc ${esc(G.gioVN(r['Giờ duyệt']))}. Kết quả đã vào báo cáo, chỗ chưa làm ghi "Không hoàn thành".</p>` : '<button class="nut chinh rong" id="duyet" style="margin-top:10px">Duyệt kết thúc kỳ, khóa hẳn</button>'}</div>
      <div class="the"><h2>Kỳ ${esc(S.dm.ky.ten)} đang chạy</h2><p class="mo" style="margin:0">Đã tự tạo đủ ${DV_KY().length} việc định kỳ × vị trí. Màn "Kế hoạch định kỳ tháng" chỉ để xem, chỉnh ngày và đội.</p><a class="nut nho" href="#/khthang" style="margin-top:8px">Mở kế hoạch định kỳ tháng</a></div>`;
    m.querySelectorAll('[data-lq]').forEach((b) => { b.onclick = () => chay(async () => { await G.datCaiDat('Giai đoạn làm quen', b.dataset.lq); bao(b.dataset.lq === 'Bật' ? 'Đang ở giai đoạn làm quen' : 'Đã tắt: bắt buộc làm dồn việc kỳ cũ'); G.taiLai(); }); });
    const d = m.querySelector('#duyet'); if (d) d.onclick = async (e) => { if (!(await G.xacNhan(`Khóa kỳ ${kt.ten}? Sau khi khóa không ghi thêm cho kỳ này, ${kq.reduce((a, x) => a + x.thieu.length, 0)} vị trí ghi "Không hoàn thành".`, 'Duyệt, khóa'))) return;
      chay(async () => { await API.goi('ghiNhieu', { bang: 'KyDinhKy', thay: ['Kỳ'], dong: [Object.assign({}, r, { 'Kỳ': kt.ten, 'Từ': kt.tu, 'Đến': kt.den, 'Trạng thái': 'Đã khóa', 'Người duyệt': S.u.ten, 'Giờ duyệt': API.bayGio(), 'Kết quả': JSON.stringify(kq.map((x) => ({ ma: x.v.ma, xong: x.xong, tong: x.tong, khongHT: x.thieu.map((y) => y.ma) }))) })] }); bao('Đã khóa kỳ ' + kt.ten); G.taiLai(); }, e.target); };
  } };
  /* làm dồn: khi tắt làm quen và kỳ cũ chưa khóa, vị trí thiếu của kỳ cũ tính cho kỳ cũ trước */
  const dkFn = G.man.dinhky.fn;
  G.man.dinhky = Object.assign(G.man.dinhky, { fn: async (maViec) => {
    await dkFn(maViec); if (!maViec || G.lamQuen()) { G._kyBu = null; return; } const m = document.getElementById('noiDung'); if (!m) return;
    const kt = kyTruoc(); const [ky, tk] = await Promise.all([G.doc('KyDinhKy', { 'Kỳ': kt.ten }), G.doc('TickDinhKy', { 'Kỳ': kt.ten, 'Mã việc': maViec })]);
    if ((ky[0] || {})['Trạng thái'] === 'Đã khóa') { G._kyBu = null; return; }
    const xong = new Set(tk.filter((t) => (t['Trạng thái'] || 'Xong') === 'Xong').map((t) => t['Mã vị trí'])); const thieu = G.dsVT(maViec).filter((v) => !xong.has(v.ma)).map((v) => v.ma);
    G._kyBu = thieu.length ? { ten: kt.ten, ds: thieu } : null;
    if (thieu.length) m.insertAdjacentHTML('afterbegin', `<div class="canh-bao">⚠️ Kỳ ${esc(kt.ten)} còn ${thieu.length} vị trí chưa làm. Làm dồn: các vị trí này làm xong tính cho kỳ cũ trước.</div>`);
  } });
  const goi2 = API.goi;
  API.goi = function (action, body) { if (action === 'dinhKy.luu' && G._kyBu && location.hash.startsWith('#/dinhky/')) body = Object.assign({ kyBu: G._kyBu }, body); return goi2.call(API, action, body); };
})();
