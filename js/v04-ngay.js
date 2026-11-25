/* GreenLog 0.4 – báo cáo hằng ngày: Bắt đầu ngày (07:30) → trong ngày → Chốt ngày (17:30), Hôm nay mới (lời chào, thẻ tiến độ, lọc
   Chưa làm/Đang làm/Xong), Hôm nay toàn bộ phận (anh), cách tính công 31/20 + ngày lễ, chấm điểm Đạt/Không đạt có ảnh + 🎙 */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hop = (...a) => G.hop(...a);
  const hn = () => API.ngay();
  const gioNay = () => API.bayGio().slice(11, 16);
  const DOI2 = ['Đội cơ động', 'Đội khu vực'];
  const TT_DD = 'Trạng thái (Có mặt/Vắng/Về sớm)';

  /* ---------- gợi ý việc trong ngày cho một đội ---------- */
  G.goiYNgay = async (doi, ngay) => {
    ngay = ngay || hn(); const t2 = G.thu2(ngay);
    const d = await G.docNhieu([{ bang: 'KeHoachTuan', loc: { 'Tuần': t2 } }, { bang: 'TickDinhKy', loc: { 'Trạng thái': 'Đang làm' } }, { bang: 'HoanViec', gioiHan: 500 }, { bang: 'Phieu', gioiHan: 600 },
      { bang: 'DuAn', gioiHan: 100 }, { bang: 'NhacNho', gioiHan: 300 }, { bang: 'SuKien', gioiHan: 100 }, { bang: 'Phieu', ten: 'x', gioiHan: 1 }]);
    const out = []; const them = (nguon, nd, ma, vt) => out.push({ nguon, nd, ma: ma || G.ma('GV'), vt: vt || '' });
    (d.KeHoachTuan || []).filter((x) => x['Đội/Người'] === doi && /Đăng ký|Đã giao|Đang triển khai/.test(x['Trạng thái'])).forEach((x) => them('Kế hoạch tuần', x['Nội dung'], 'KHT:' + x['Mã KHT'], x['Cụm'] || x['Mã vị trí']));
    const dang = {}; (d.TickDinhKy || []).forEach((x) => { const k = x['Mã việc']; (dang[k] = dang[k] || []).push(x['Mã vị trí']); });
    Object.keys(dang).forEach((k) => { if (G.qv(k) >= 2) them('Định kỳ đang dở', G.dvTen(k) + ' · ' + dang[k].length + ' vị trí đang làm', 'DK:' + k, G.tenVT(dang[k].join('|'))); });
    (d.HoanViec || []).filter((x) => x['Đội'] === doi && (x['Làm bù'] === ngay || (x['Yêu cầu làm bù'] === 'Có' && x['Làm bù'] === 'Tuần sau'))).forEach((x) => them('Làm bù', x['Nội dung'] + ' (hoãn: ' + x['Lý do'] + ')', 'HV:' + x['Mã']));
    (d.Phieu || []).filter((x) => !/Đã duyệt|Báo xong/.test(x['Trạng thái']) && x['Giao cho'] === doi).forEach((x) => them('Phiếu ' + (x['Mức độ'] || ''), (x['Mô tả'] || x['Loại lỗi']), 'P:' + x['Mã phiếu'], G.tenVT(x['Mã vị trí'], x['Vị trí khác'])));
    (d.DuAn || []).filter((x) => x['Trạng thái'] === 'Đang làm' && (!x['Đội'] || x['Đội'] === doi)).forEach((x) => them('Dự án', x['Tên'], 'DA:' + x['Mã DA']));
    (d.NhacNho || []).filter((x) => x['Giao đội'] === doi && !/Đã xong|Bỏ/.test(x['Trạng thái'])).forEach((x) => them('Nhắc nhở ' + x['Nguồn'], x['Nội dung'], 'NN:' + x['Mã']));
    (d.SuKien || []).filter((x) => [ngay, G.congNgay(ngay, 1)].includes(String(x['Bắt đầu']).slice(0, 10)) && (!x['Đội phụ trách'] || x['Đội phụ trách'] === doi)).forEach((x) => them('Sự kiện', 'Chuẩn bị ' + x['Tên'] + ' · ' + G.gioVN(x['Bắt đầu']), 'SK:' + x['Mã SK']));
    return out;
  };
  const coMatHom = async (doi, buoi) => (await G.doc('DiemDanh', { 'Ngày': hn(), 'Buổi': buoi || 'Sáng' })).filter((r) => (!doi || r['Đội'] === doi) && /Có mặt/.test(r[TT_DD]));

  /* ---------- BẮT ĐẦU NGÀY (tổ trưởng, hạn 07:30) ---------- */
  G.man.batdaungay = { an: true, fn: async () => {
    const doi = S.u.doi || 'Đội khu vực'; const m = G.khung('Bắt đầu ngày · ' + doi, `${G.thu()} ${G.ngayVN(hn())} · hạn gửi 07:30`, '#/');
    const [cm, dc, gv, goiY] = await Promise.all([coMatHom(doi), G.doc('DuyetCong', { 'Ngày': hn(), 'Buổi': 'Sáng' }), G.doc('GiaoViecNgay', { 'Ngày': hn(), 'Đội': doi }), G.goiYNgay(doi)]);
    const daDD = dc.some((x) => x['Đội'] === doi);
    const st = G.man.batdaungay.st && G.man.batdaungay.st.ngay === hn() ? G.man.batdaungay.st : (G.man.batdaungay.st = { ngay: hn(), chon: {}, them: [] });
    const ds = goiY.concat(st.them).filter((x) => !gv.some((g) => g['Mã nguồn'] === x.ma));
    m.innerHTML = `<div class="the ${daDD ? 'the-xanh' : 'the-do'}"><div class="buoc"><span>1</span>Điểm danh sáng + ảnh tập thể</div>${daDD ? `<p style="margin:0">✓ Đã gửi · ${cm.length} người có mặt</p>` : '<a class="nut chinh rong" href="#/diemdanh">Điểm danh ngay</a>'}</div>
      <div class="the"><div class="buoc"><span>2</span>Việc hôm nay app gợi ý</div><p class="mo" style="margin-top:0">App rà kế hoạch tuần, định kỳ dở, việc hoãn làm bù, phiếu, dự án, nhắc nhở, sự kiện. Tick việc làm hôm nay, chạm chọn người.</p>
        ${ds.map((x, i) => { const c = st.chon[x.ma]; return `<div class="dong-cham" style="display:block"><label class="hang" style="cursor:pointer"><input type="checkbox" data-tick="${i}" ${c ? 'checked' : ''}><div class="gian"><b>${esc(x.nd)}</b><div class="mo">${esc(x.nguon)}${x.vt ? ' · ' + esc(x.vt) : ''}</div></div></label>
          ${c ? `<div class="chon boc" style="margin:6px 0 0 26px">${cm.map((r) => `<button data-ng="${i}" data-ten="${esc(r['Họ tên'])}" class="${c.has(r['Họ tên']) ? 'dang' : ''}">${esc(r['Họ tên'].split(' ').slice(-2).join(' '))}</button>`).join('') || '<span class="mo">Chưa có người điểm danh</span>'}</div>` : ''}</div>`; }).join('') || '<p class="mo">Không có gợi ý.</p>'}
        <button class="nut nho" id="themViec" style="margin-top:8px">＋ Thêm việc khác</button></div>
      ${gv.length ? `<div class="the the-xanh"><b>Đã gửi kế hoạch ${esc(String(gv[0]['Giờ giao']).slice(11, 16))}</b>${gv.map((g) => `<div class="mo">• ${esc(g['Nội dung'])} → ${esc(g['Người'])}</div>`).join('')}</div>` : ''}
      <button class="nut chinh rong" id="gui" style="margin-bottom:30px">Gửi kế hoạch${gioNay() > '07:30' && !gv.length ? ' (đã quá 07:30)' : ''}</button>`;
    m.querySelectorAll('[data-tick]').forEach((i) => { i.onchange = () => { const x = ds[+i.dataset.tick]; if (i.checked) st.chon[x.ma] = new Set(); else delete st.chon[x.ma]; G.taiLai(); }; });
    m.querySelectorAll('[data-ng]').forEach((b) => { b.onclick = () => { const s = st.chon[ds[+b.dataset.ng].ma]; if (s.has(b.dataset.ten)) s.delete(b.dataset.ten); else s.add(b.dataset.ten); b.classList.toggle('dang'); }; });
    m.querySelector('#themViec').onclick = async () => { const t = await G.hoi('Việc thêm hôm nay'); if (t) { const x = { nguon: 'Tổ trưởng thêm', nd: t, ma: G.ma('GV') }; st.them.push(x); st.chon[x.ma] = new Set(); G.taiLai(); } };
    m.querySelector('#gui').onclick = (e) => chay(async () => {
      const chon = ds.filter((x) => st.chon[x.ma]); if (!chon.length) throw new Error('Chưa tick việc nào');
      if (chon.some((x) => !st.chon[x.ma].size)) throw new Error('Chọn người cho từng việc đã tick');
      const gio = API.bayGio();
      await API.goi('ghiNhieu', { bang: 'GiaoViecNgay', dong: chon.map((x) => ({ 'Mã': G.ma('GV'), 'Ngày': hn(), 'Đội': doi, 'Nguồn': x.nguon, 'Mã nguồn': x.ma, 'Nội dung': x.nd, 'Vị trí': x.vt, 'Người': [...st.chon[x.ma]].join(', '), 'Trạng thái': 'Chưa làm', 'Giờ giao': gio, 'Người giao': S.u.ten })) });
      await API.goi('ghiNhieu', { bang: 'NgayLamViec', thay: ['Ngày', 'Đội', 'Loại'], dong: [{ 'Ngày': hn(), 'Đội': doi, 'Loại': 'Bắt đầu ngày', 'Giờ': gio, 'Đúng hạn': gioNay() <= '07:30' ? 'Có' : 'Trễ', 'Số người': cm.length, 'Trạng thái': 'Đã gửi', 'Người ghi': S.u.ten }] });
      st.chon = {}; st.them = [];
      bao('Đã gửi kế hoạch ngày'); await G.guiZalo(`🌅 KẾ HOẠCH ${doi.toUpperCase()} ${G.ngayVN(hn())}\nCó mặt: ${cm.length}\n${chon.map((x, i) => `${i + 1}. ${x.nd}${x.vt ? ' (' + x.vt + ')' : ''} → ${[...(st.chon[x.ma] || [])].join(', ')}`).join('\n')}`, '').catch(() => {});
      G.taiLai();
    }, e.target);
  } };

  /* ---------- CHỐT NGÀY (tổ trưởng, hạn 17:30) ---------- */
  G.man.chotngay = { an: true, fn: async () => {
    const doi = S.u.doi || 'Đội khu vực'; const m = G.khung('Chốt ngày · ' + doi, `${G.thu()} ${G.ngayVN(hn())} · hạn 17:30`, '#/');
    const [gv, dc, dh, vc, tuoi, nlv] = await Promise.all([G.doc('GiaoViecNgay', { 'Ngày': hn(), 'Đội': doi }), G.doc('DuyetCong', { 'Ngày': hn(), 'Buổi': 'Chiều' }), G.doc('DongHoNuoc', { 'Ngày': hn() }), G.doc('VanChuyen', { 'Ngày': hn(), 'Đội': doi }), G.doc('Tuoi', { 'Ngày': hn() }), G.doc('NgayLamViec', { 'Ngày': hn(), 'Đội': doi })]);
    const chot = nlv.find((x) => x['Loại'] === 'Chốt ngày');
    const thieu = []; if (!dc.some((x) => x['Đội'] === doi)) thieu.push(['Điểm danh chiều', 'diemdanh']); if (!vc.length) thieu.push(['Số chuyến vận chuyển', 'vanchuyen']);
    if (doi === 'Đội khu vực' && new Set(dh.map((x) => x['Mã đồng hồ'])).size < 2) thieu.push(['Chỉ số 2 đồng hồ nước', 'donghonuoc']);
    if (tuoi.length < S.dm.vitri.filter((v) => v.ap === 'Có').length && doi === 'Đội khu vực') thieu.push([`Tưới: còn ${S.dm.vitri.filter((v) => v.ap === 'Có').length - tuoi.length} vị trí chưa ghi`, 'tuoi']);
    const st = {}; gv.forEach((g) => { st[g['Mã']] = g['Trạng thái'] === 'Xong' ? 'Xong' : ''; });
    if (chot) { m.innerHTML = `<div class="the the-xanh"><b>Đã chốt ngày ${esc(String(chot['Giờ']).slice(11, 16))}</b><div class="mo">${esc(chot['Trạng thái'])} · ${esc(chot['Tóm tắt'] || '')}</div></div><a class="nut rong" href="#/nhatky/${hn()}">Xem trang nhật ký thi công hôm nay</a>`; return; }
    m.innerHTML = `${thieu.length ? `<div class="the the-do"><b>Còn thiếu số liệu</b>${thieu.map((x) => `<a class="the-viec" href="#/${x[1]}" style="margin:6px 0 0"><span class="gian">${esc(x[0])}</span>›</a>`).join('')}</div>` : ''}
      <div class="the"><h2>Kết quả từng việc</h2>${gv.map((g) => `<div class="dong-cham" style="display:block"><b>${esc(g['Nội dung'])}</b><div class="mo">${esc(g['Người'])}${g['Vị trí'] ? ' · ' + esc(g['Vị trí']) : ''}</div>
        <div class="chon boc" style="margin-top:6px">${['Xong', 'Làm một phần', 'Chưa làm'].map((k) => `<button data-kq="${esc(g['Mã'])}" data-k="${k}" class="${st[g['Mã']] === k ? 'dang' : ''}">${k}</button>`).join('')}</div></div>`).join('') || '<p class="mo">Sáng chưa gửi kế hoạch ngày.</p>'}</div>
      <div class="the"><div id="f"></div></div>
      <button class="nut chinh rong" id="chot" style="margin-bottom:30px">Chốt ngày, khóa và tạo trang nhật ký</button>`;
    m.querySelectorAll('[data-kq]').forEach((b) => { b.onclick = async () => { const ma = b.dataset.kq; const k = b.dataset.k; st[ma] = k;
      m.querySelectorAll(`[data-kq="${ma}"]`).forEach((x) => x.classList.toggle('dang', x === b));
      if (k === 'Chưa làm' || k === 'Làm một phần') { const g = gv.find((x) => x['Mã'] === ma); const ly = await G.chonDS('Lý do', ['☔ Mưa', 'Thiếu vật tư', 'Máy hỏng', 'Thiếu người', 'Ưu tiên việc khác', 'Khác']); if (ly) g._ly = ly.ten; } }; });
    const lay = G.form(m.querySelector('#f'), [{ k: 'gc', nhan: 'Ghi chú cuối ngày', loai: 'mota' }]);
    m.querySelector('#chot').onclick = (e) => chay(async () => {
      if (gv.some((g) => !st[g['Mã']])) throw new Error('Chọn kết quả cho từng việc');
      if (thieu.length && !(await G.xacNhan(`Còn thiếu: ${thieu.map((x) => x[0]).join(', ')}. Vẫn chốt?`, 'Vẫn chốt'))) return;
      const v = lay();
      for (const g of gv) {
        await API.goi('sua', { bang: 'GiaoViecNgay', khoa: { 'Mã': g['Mã'] }, doi: { 'Trạng thái': st[g['Mã']], 'Lý do': g._ly || '', 'Giờ cập nhật': API.bayGio() } });
        const [loai, maN] = String(g['Mã nguồn']).split(':');
        if (loai === 'KHT' && st[g['Mã']] === 'Xong') await API.goi('sua', { bang: 'KeHoachTuan', khoa: { 'Mã KHT': maN }, doi: { 'Trạng thái': 'Hoàn thành', 'Ngày xong': hn() } }).catch(() => {});
        if (loai === 'KHT' && st[g['Mã']] === 'Chưa làm') await API.goi('ghi', { bang: 'HoanViec', dong: { 'Mã': G.ma('HV'), 'Ngày': '', 'Tuần': G.thu2(), 'Mã KHT': maN, 'Nội dung': g['Nội dung'], 'Đội': doi, 'Lý do': g._ly || 'Khác', 'Làm bù': G.congNgay(hn(), 1), 'Ghi chú': 'Từ chốt ngày', 'Người ghi': '' } }).catch(() => {});
        if (loai === 'NN' && st[g['Mã']] === 'Xong') await API.goi('sua', { bang: 'NhacNho', khoa: { 'Mã': maN }, doi: { 'Trạng thái': 'Đã xong', 'Xử lý': 'Xong trong ngày ' + G.ngayVN(hn()) } }).catch(() => {});
      }
      const tt = `${gv.filter((g) => st[g['Mã']] === 'Xong').length}/${gv.length} việc xong`;
      await API.goi('ghiNhieu', { bang: 'NgayLamViec', thay: ['Ngày', 'Đội', 'Loại'], dong: [{ 'Ngày': hn(), 'Đội': doi, 'Loại': 'Chốt ngày', 'Giờ': API.bayGio(), 'Đúng hạn': gioNay() <= '17:30' ? 'Có' : 'Trễ', 'Tóm tắt': tt, 'Ghi chú': v.gc, 'Trạng thái': 'Chờ anh chốt', 'Người ghi': S.u.ten }] });
      bao('Đã chốt ngày · Trưởng bộ phận duyệt lần cuối');
      await G.guiZalo(`🌇 KẾT QUẢ ${doi.toUpperCase()} ${G.ngayVN(hn())}: ${tt}\n${gv.map((g) => `• ${g['Nội dung']}: ${st[g['Mã']]}${g._ly ? ' (' + g._ly + ')' : ''}`).join('\n')}${v.gc ? '\nGhi chú: ' + v.gc : ''}`, '').catch(() => {});
      G.taiLai();
    }, e.target);
  } };

  /* ---------- HÔM NAY mới (mọi người trừ anh): lời chào, thẻ tiến độ, lọc Chưa làm/Đang làm/Xong ---------- */
  G.manHomNayMoi = async () => {
    const m = G.khung('Hôm nay', `${G.thu()}, ${G.ngayVN(hn())}`);
    const laTT = S.u.nhom === 'Tổ trưởng'; const doi = S.u.doi;
    const [gv, nlv, tt, d] = await Promise.all([laTT ? G.doc('GiaoViecNgay', { 'Ngày': hn(), 'Đội': doi }) : Promise.resolve([]), laTT ? G.doc('NgayLamViec', { 'Ngày': hn(), 'Đội': doi }) : Promise.resolve([]), G.trangThaiHomNay().catch(() => ({})),
      G.docNhieu([{ bang: 'NhacNho', gioiHan: 300 }, { bang: 'BatThuong', gioiHan: 300 }, { bang: 'Phieu', gioiHan: 500 }])]);
    const st = G.manHomNayMoi.loc || 'chua';
    // danh sách việc: tổ trưởng = việc giao trong ngày; nội bộ = việc nội bộ theo lịch; Pháp = xem
    let viec = [];
    if (laTT) viec = G.viecTT ? await G.viecTT(gv) : gv.map((g) => ({ ten: g['Nội dung'], phu: g['Người'], tt: g['Trạng thái'] === 'Xong' ? 'xong' : g['Trạng thái'] === 'Đang làm' ? 'dang' : 'chua', ma: g['Mã'] })); // mục 93/95: trạng thái theo dữ liệu thật
    const laNB = S.u.nhom === 'Nhân viên nội bộ'; let kca = null;
    if (laNB) { viec = await G.viecNoiBo(hn(), tt); kca = (await G.doc('NgayLamViec', { 'Ngày': hn(), 'Loại': 'Kết thúc ca' })).find((x) => x['Người'] === S.u.ten); }
    const n = { chua: viec.filter((x) => x.tt === 'chua').length, dang: viec.filter((x) => x.tt === 'dang').length, xong: viec.filter((x) => x.tt === 'xong').length };
    const p = viec.length ? Math.round(n.xong / viec.length * 100) : 0;
    const nn = (d.NhacNho || []).filter((x) => !/Đã xong|Bỏ/.test(x['Trạng thái']) && (x['Giao đội'] === doi || x['Giao đội'] === S.u.ten || (S.u.nhom === 'Nhân viên nội bộ' && x['Giao đội'] === 'Nội bộ') || (S.u.nhom === 'Quản lý nhà thầu' && !/Nội bộ|Hiệp|Nghị/.test(x['Giao đội'] || ''))));
    const bt = []; // mục 88: cây bất thường xử lý qua phiếu, không treo việc
    const su = S.u.nhom === 'Nhân viên nội bộ' ? (d.Phieu || []).filter((x) => x['Loại'] === 'Setup cây nội thất' && !/Đã duyệt|Báo xong/.test(x['Trạng thái'])) : [];
    const bd = nlv.find((x) => x['Loại'] === 'Bắt đầu ngày'); const ch = nlv.find((x) => x['Loại'] === 'Chốt ngày');
    let html = `<div class="chao"><div style="opacity:.8">${G.thu()}, ${G.ngayVN(hn())}</div><h1>Chào ${esc(G.laAnhVu() ? 'Trưởng bộ phận' : S.u.ten.split(' ').slice(-1)[0])},<em>${laTT ? 'việc ' + esc(doi.toLowerCase()) + ' hôm nay' : 'việc hôm nay'}</em></h1>
      <div class="hang" style="font-size:14px"><span class="gian">${viec.length ? `${n.xong}/${viec.length} việc xong` : S.u.nhom === 'Quản lý nhà thầu' ? 'Anh Pháp xem tình hình, không cần xác nhận' : 'Chưa có việc'}</span><b style="color:var(--chanh)">${p}%</b></div><div class="thanh" style="margin-top:8px"><i style="width:${p}%"></i></div></div>`;
    if (laTT) html += `<div class="luoi2" style="margin-bottom:12px"><a class="the ${bd ? 'the-xanh' : gioNay() > '07:30' ? 'the-do' : 'the-mo'}" href="#/batdaungay" style="color:inherit;margin:0"><b>🌅 Bắt đầu ngày</b><div class="mo">${bd ? 'Đã gửi ' + String(bd['Giờ']).slice(11, 16) : 'Hạn 07:30'}</div></a>
      <a class="the ${ch ? 'the-xanh' : gioNay() > '17:30' ? 'the-do' : ''}" href="#/chotngay" style="color:inherit;margin:0"><b>🌇 Chốt ngày</b><div class="mo">${ch ? esc(ch['Trạng thái']) : 'Hạn 17:30'}</div></a></div>`;
    if (laNB) html += `<a class="the ${kca ? 'the-xanh' : gioNay() > '17:30' ? 'the-do' : 'the-mo'}" href="#/ketthucca" style="display:block;color:inherit"><b>🌇 Kết thúc ca</b><div class="mo">${kca ? 'Đã kết thúc lúc ' + esc(String(kca['Giờ']).slice(11, 16)) + (kca['Trạng thái'] === 'Đã xem' ? ' · Trưởng bộ phận đã xem' : '') : 'Ca kết thúc 17:30 · bấm để xem đã làm gì, còn sót gì'}</div></a>`;
    if (S.u.nhom === 'Quản lý nhà thầu') html += `<div class="the"><h2>Tự điểm danh</h2><div class="nhom-nut"><button class="nut chinh" data-buoi="Sáng">Có mặt sáng</button><button class="nut chinh" data-buoi="Chiều">Có mặt chiều</button></div></div><a class="the-viec" href="#/homnay"><span class="gian"><b>Xem tình hình toàn bộ phận hôm nay</b></span>›</a>`;
    html += nn.map((x) => `<a class="the the-mo" href="#/nhacnho" style="display:block;color:inherit">📣 <b>${esc(x['Nội dung'])}</b><div class="mo">${esc(x['Nguồn'])} · hạn ${G.ngayVN(x['Hạn']).slice(0, 5)}</div></a>`).join('');
    html += bt.map((x) => `<a class="the the-do" href="#/batthuong/${encodeURIComponent(G.maBT(x))}" style="display:block;color:inherit">🥀 <b>${esc(x['Tên cây'])} · ${esc(x['Tình trạng'])}</b><div class="mo">Việc trao đổi với Trưởng bộ phận đang mở</div></a>`).join('');
    html += su.map((x) => `<a class="the the-mo" href="#/nb/noithat" style="display:block;color:inherit">🪴 <b>${esc(x['Mô tả'])}</b><div class="mo">Phiếu setup · hạn ${esc(G.gioVN(x['Hạn']))}</div></a>`).join('');
    if (viec.length) {
      html += `<div class="loc-tt">${[['chua', 'Chưa làm'], ['dang', 'Đang làm'], ['xong', 'Xong']].map(([k, t]) => `<button data-loc="${k}" class="${st === k ? 'dang' : ''}">${t} (${n[k]})</button>`).join('')}</div>`;
      html += viec.filter((x) => x.tt === st).map((x) => (x.tt2 ? G.dongTT(x) : x.link ? `<div class="the-viec"><a href="#/${x.link}" style="display:flex;gap:10px;align-items:center;flex:1;color:inherit;text-decoration:none"><span class="bt">${x.tt === 'xong' ? '✅' : x.tt === 'dang' ? '◐' : '⬜'}</span><span class="gian"><b>${esc(x.ten)}</b><span class="mo">${esc(x.phu)}</span></span></a>${laNB && x.tt === 'chua' ? `<button class="nut nho" data-bd="${esc(x.link)}" data-ten="${esc(x.ten)}">▶ Bắt đầu</button>` : '›'}</div>`
        : `<div class="the-viec"><button class="tick-gv" data-gv="${esc(x.ma)}" style="background:none;border:0;font-size:24px">${x.tt === 'xong' ? '✅' : x.tt === 'dang' ? '◐' : '⬜'}</button><span class="gian" data-ctgv="${esc(x.ma)}" style="cursor:pointer"><b>${esc(x.ten)}</b><span class="mo">${esc(x.phu)}</span></span><button class="nut nho" data-ps="1">＋ Phát sinh</button></div>`)).join('') || G.trong('Không có việc ở mục này.');
    }
    m.innerHTML = html;
    m.querySelectorAll('[data-loc]').forEach((b) => { b.onclick = () => { G.manHomNayMoi.loc = b.dataset.loc; G.taiLai(); }; });
    m.querySelectorAll('[data-bd]').forEach((b) => { b.onclick = () => chay(async () => { await G.batDauViecNB(b.dataset.bd, b.dataset.ten); G.taiLai(); }, b); });
    if (laTT && G.ganTT) G.ganTT(m, gv, viec);
    if (!G.ganTT) m.querySelectorAll('[data-gv]').forEach((b) => { b.onclick = () => chay(async () => { const g = gv.find((x) => x['Mã'] === b.dataset.gv); const moi = g['Trạng thái'] === 'Xong' ? 'Chưa làm' : g['Trạng thái'] === 'Đang làm' ? 'Xong' : 'Đang làm';
      await API.goi('sua', { bang: 'GiaoViecNgay', khoa: { 'Mã': g['Mã'] }, doi: { 'Trạng thái': moi, 'Giờ cập nhật': API.bayGio() } }); G.taiLai(); }); });
    m.querySelectorAll('[data-ps]').forEach((b) => { b.onclick = () => { location.hash = '#/phatsinh'; }; });
    m.querySelectorAll('[data-ctgv]').forEach((b) => { b.onclick = () => { const g = gv.find((x) => x['Mã'] === b.dataset.ctgv); if (!g) return; const ng = String(g['Người'] || '').split(', ').filter(Boolean); // mục 85: chạm để xem chi tiết
      hop(g['Nội dung'], `<div class="mo">${esc(g['Nguồn'] || '')} · ${esc(g['Trạng thái'] || '')}</div>${g['Vị trí'] ? `<p><b>📍 Vị trí:</b> ${esc(g['Vị trí'])}</p>` : ''}<p><b>👥 Người (${ng.length}):</b></p><div class="chon boc">${ng.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`); }; });
    m.querySelectorAll('[data-buoi]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('diemDanh.tuDiem', { buoi: b.dataset.buoi }); bao('Đã ghi có mặt buổi ' + b.dataset.buoi.toLowerCase()); }, b); });
  };

  /* ---------- HÔM NAY TOÀN BỘ PHẬN (Trưởng bộ phận; anh Pháp chỉ xem) ---------- */
  G.man.homnay = { an: true, thay: true, fn: async (ngayMai) => {
    if (!G.laAnhVu() && S.u.nhom !== 'Quản lý nhà thầu') return G.manHomNayMoi();
    const mai = ngayMai === 'mai'; const ngay = mai ? G.congNgay(hn(), 1) : hn();
    const m = G.khung(mai ? 'Ngày mai toàn bộ phận' : 'Hôm nay toàn bộ phận', `${G.thu(ngay)}, ${G.ngayVN(ngay)}`, G.laAnhVu() ? '#/' : '#/');
    if (mai) { const html = await Promise.all(DOI2.map(async (doi) => { const g = await G.goiYNgay(doi, ngay); return `<div class="the"><h2>${esc(doi)}</h2>${g.map((x) => `<div class="mo">• ${esc(x.nd)} <span class="chip">${esc(x.nguon)}</span></div>`).join('') || '<p class="mo">Chưa có</p>'}</div>`; }));
      m.innerHTML = `<div class="nhom-nut" style="margin-bottom:10px"><a class="nut" href="#/homnay">‹ Hôm nay</a></div><div class="luoi-tq">${html.join('')}</div>`; return; }
    const d = await G.docNhieu([{ bang: 'GiaoViecNgay', loc: { 'Ngày': ngay } }, { bang: 'NgayLamViec', loc: { 'Ngày': ngay } }, { bang: 'DiemDanh', loc: { 'Ngày': ngay } }, { bang: 'Phieu', gioiHan: 500 }, { bang: 'ViecPhatSinh', loc: { 'Ngày': ngay } }]);
    Object.keys(d).forEach((x) => { d[x] = d[x] || []; });
    const tt = await G.trangThaiHomNay().catch(() => ({}));
    const sang = d.DiemDanh.filter((r) => r['Buổi'] === 'Sáng'); const coMat = new Set(sang.filter((r) => /Có mặt/.test(r[TT_DD])).map((r) => r['Mã CN']));
    const db = G.thieuDinhBien(sang.length ? coMat : null, S.dm.khu);
    const canh = []; const g = gioNay();
    DOI2.forEach((doi) => { const bd = d.NgayLamViec.find((x) => x['Đội'] === doi && x['Loại'] === 'Bắt đầu ngày'); const ch = d.NgayLamViec.find((x) => x['Đội'] === doi && x['Loại'] === 'Chốt ngày');
      if (!bd && g > '07:30') canh.push(doi + ' chưa gửi kế hoạch ngày (quá 07:30)'); if (!ch && g > '17:30') canh.push(doi + ' chưa chốt ngày (quá 17:30)'); });
    db.trong.forEach((c) => canh.push('Khu trống người: ' + c));
    d.Phieu.filter((x) => x['Trạng thái'] !== 'Đã duyệt' && x['Hạn'] && x['Hạn'] < API.bayGio() && x['Trạng thái'] !== 'Báo xong').forEach((x) => canh.push('Phiếu quá hạn: ' + x['Mã phiếu'] + ' · ' + (x['Mô tả'] || '')));
    const cot = (doi) => { const gv = d.GiaoViecNgay.filter((x) => x['Đội'] === doi); const ch = d.NgayLamViec.find((x) => x['Đội'] === doi && x['Loại'] === 'Chốt ngày'); const bd = d.NgayLamViec.find((x) => x['Đội'] === doi && x['Loại'] === 'Bắt đầu ngày');
      return `<div class="the"><div class="hang"><h2 class="gian" style="margin:0">${esc(doi)}</h2><span class="chip">${sang.filter((r) => r['Đội'] === doi && /Có mặt/.test(r[TT_DD])).length} có mặt</span></div>
        <div class="mo" style="margin:4px 0 8px">Kế hoạch: ${bd ? '✓ ' + String(bd['Giờ']).slice(11, 16) + (bd['Đúng hạn'] === 'Trễ' ? ' (trễ)' : '') : '—'} · Chốt: ${ch ? esc(ch['Trạng thái']) + ' ' + String(ch['Giờ']).slice(11, 16) : '—'}</div>
        <table class="bang-tq"><tr><th>Người</th><th>Làm gì · ở đâu</th><th></th></tr>${gv.map((x) => `<tr><td data-ctgv="${esc(x['Mã'])}" style="cursor:pointer;white-space:nowrap">👥 ${String(x['Người'] || '').split(', ').filter(Boolean).length}</td><td>${esc(x['Nội dung'])}${x['Vị trí'] ? '<div class="mo">' + esc(x['Vị trí']) + '</div>' : ''}</td><td><span class="chip ${x['Trạng thái'] === 'Xong' ? 'xanh' : x['Trạng thái'] === 'Chưa làm' ? '' : 'cam'}">${esc(x['Trạng thái'])}</span></td></tr>`).join('') || '<tr><td colspan="3" class="mo">Chưa có kế hoạch</td></tr>'}</table>
        ${ch && ch['Trạng thái'] === 'Chờ anh chốt' && G.laAnhVu() ? `<button class="nut chinh rong" data-chot="${esc(doi)}" style="margin-top:8px">Chốt ngày ${esc(doi)}</button>` : ''}</div>`; };
    const nbCot = `<div class="the"><h2 style="margin:0 0 8px">Nội bộ (Hiệp, Nghị)</h2>${[['nb/bien', 'Vệ sinh bãi biển'], ['nb/ktbien', 'Kiểm tra bãi biển'], ['nb/vuonrau', 'Vị Garden'], ['nb/noithat', 'Cây nội thất'], ['nb/may', 'Máy sàng cát'], ['nb/rac', 'Thu gom rác hữu cơ'], ['nb/vuonuomnt', 'Vườn ươm nội thất']].map(([l, t]) => `<div class="hang" style="padding:4px 0"><span class="gian">${t}</span>${tt[l] ? `<span class="chip xanh">✓ ${esc(tt[l].gio)} ${esc(tt[l].ai)}</span>` : '<span class="chip">chưa</span>'}</div>`).join('')}</div>`;
    const cums = Object.keys(G.DINH_BIEN_KHU); const khu = S.dm.khu || [];
    const mau = (c) => { const ng = khu.filter((r) => r['Cụm'] === c).map((r) => r['Mã CN']); if (!G.DINH_BIEN_KHU[c]) return '#EEF1EC'; const co = ng.filter((x) => coMat.has(x)).length; return !sang.length ? '#EEF1EC' : !co ? '#FBE3E2' : co < G.DINH_BIEN_KHU[c] ? '#F9EEDA' : '#E5F4E4'; };
    const pct = Math.max(0, Math.min(100, ((+g.slice(0, 2) * 60 + +g.slice(3)) - 360) / (720) * 100));
    m.innerHTML = `<div class="nhom-nut" style="margin-bottom:10px"><a class="nut" href="#/homnay/mai">Ngày mai ›</a></div>
      <div class="the"><b>Thanh thời gian</b><div style="position:relative;height:26px;margin-top:8px;background:var(--vien2);border-radius:13px"><div style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:var(--chanh);border-radius:13px"></div>
        <span style="position:absolute;left:${(90 / 720) * 100}%;top:-2px;font-size:11px">│07:30 kế hoạch</span><span style="position:absolute;left:${(690 / 720) * 100 - 14}%;top:-2px;font-size:11px">17:30 chốt│</span></div><div class="bd-nhan"><span>06:00</span><span>bây giờ ${g}</span><span>18:00</span></div></div>
      ${canh.length ? `<div class="the the-do"><b>⚠ Cảnh báo</b>${canh.map((x) => `<div>• ${esc(x)}</div>`).join('')}</div>` : ''}
      <div class="the"><b>Sơ đồ cụm</b> <span class="mo">· xanh đủ người · vàng thiếu · đỏ trống</span><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin-top:8px">${cums.map((c) => `<div style="background:${mau(c)};border-radius:10px;padding:8px;font-size:13px"><b>${esc(c)}</b><div class="mo">${khu.filter((r) => r['Cụm'] === c && coMat.has(r['Mã CN'])).length}/${G.DINH_BIEN_KHU[c] || '–'} người</div></div>`).join('')}</div></div>
      <div class="luoi-tq">${DOI2.map(cot).join('')}${nbCot}</div>
      ${d.ViecPhatSinh.length ? `<div class="the"><h2>Phát sinh</h2>${d.ViecPhatSinh.map((x) => `<div class="mo">• ${esc(x['Mô tả'])} · ${esc(x['Trạng thái'])}</div>`).join('')}</div>` : ''}`;
    m.querySelectorAll('[data-ctgv]').forEach((b) => { b.onclick = () => { const g = d.GiaoViecNgay.find((x) => x['Mã'] === b.dataset.ctgv); if (!g) return; const ng = String(g['Người'] || '').split(', ').filter(Boolean);
      hop(g['Nội dung'], `<div class="mo">${esc(g['Đội'])} · ${esc(g['Trạng thái'] || '')}</div>${g['Vị trí'] ? `<p><b>📍 Vị trí:</b> ${esc(g['Vị trí'])}</p>` : ''}<p><b>👥 Người (${ng.length}):</b></p><div class="chon boc">${ng.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`); }; });
    m.querySelectorAll('[data-chot]').forEach((b) => { b.onclick = () => hop('Chốt ngày ' + b.dataset.chot, '<div id="f"></div><button class="nut chinh rong" id="l">Chốt, tạo trang nhật ký</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'yk', nhan: 'Ý kiến giám sát (vào nhật ký thi công)', loai: 'mota' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('sua', { bang: 'NgayLamViec', khoa: { 'Ngày': ngay, 'Đội': b.dataset.chot, 'Loại': 'Chốt ngày' }, doi: { 'Trạng thái': 'Đã chốt', 'Ý kiến giám sát': v.yk, 'Người duyệt': S.u.ten, 'Giờ duyệt': API.bayGio() } }); dong(); bao('Đã chốt ngày · trang nhật ký đã tạo'); G.taiLai(); }, e.target);
    }); });
  } };

  /* ---------- CÁCH TÍNH CÔNG (mục 36) ---------- */
  G.tinhCong = async (tu, den) => {
    const dd = await G.doc('DiemDanh', { 'Ngày': { tu, den } }); const ngay = []; for (let n = tu; n <= den; n = G.congNgay(n, 1)) ngay.push(n);
    const cn = S.dm.congnhan || []; const cong = {}; dd.forEach((r) => { const k = r['Mã CN'] + '|' + r['Ngày']; cong[k] = (cong[k] || 0) + (+r['Công'] || 0); });
    const ngTT = ngay.map((n) => dd.filter((r) => r['Ngày'] === n).reduce((a, r) => a + (+r['Công'] || 0), 0));
    const ngHD = ngay.map((n) => G.congHD(n));
    const tt = ngTT.reduce((a, b) => a + b, 0), hd = ngHD.reduce((a, b) => a + b, 0);
    return { ngay, cn, cong, ngTT, ngHD, tt, hd, giamSat: 12, chenh: tt - hd, chenhThang: tt - hd - 12, le: ngay.filter((n) => G.laLe(n)).map((n) => [n, G.laLe(n)]), chuaDuyet: dd.filter((r) => r['Trạng thái duyệt'] !== 'Đã duyệt').length };
  };
  const bcFn = G.man.baocao.fn;
  G.man.baocao = Object.assign(G.man.baocao, { fn: async (loai) => {
    if (loai !== 'cong') { await bcFn(loai); if (!loai) { const m = document.getElementById('noiDung'); if (m && G.laAnhVu()) m.insertAdjacentHTML('beforeend', `<a class="the-viec" href="#/baocaogm"><span class="gian"><b>📈 Báo cáo tháng gửi GM</b></span>›</a><a class="the-viec" href="#/slidetuan"><span class="gian"><b>🖥️ Slide họp tuần GM + HODs</b></span>›</a><a class="the-viec" href="#/hoso"><span class="gian"><b>📁 Hồ sơ cuối kỳ (nhật ký, nghiệm thu, bảng công)</b></span>›</a><a class="the-viec" href="#/ngayle"><span class="gian"><b>📅 Ngày lễ (công 20)</b></span>›</a>`); } return; }
    const st = G.man.baocao.st || {}; const k = st.ky && st.ky !== S.dm.ky.ten ? (() => { const [mm, yy] = st.ky.slice(1).split('.').map(Number); return API.ky(`${yy}-${String(mm).padStart(2, '0')}-01`); })() : S.dm.ky;
    const m = G.khung('Bảng công', `Kỳ ${k.ten} · ${G.ngayVN(k.tu)}–${G.ngayVN(k.den)}`, '#/baocao');
    const den = k.den < hn() ? k.den : hn(); const c = await G.tinhCong(k.tu, den);
    const h = ['Mã', 'Họ tên', 'Đội'].concat(c.ngay.map((n) => n.slice(8) + (new Date(n).getDay() === 0 ? ' CN' : G.laLe(n) ? ' lễ' : ''))).concat(['Tổng']);
    const rows = c.cn.map((x) => { let t = 0; const cc = c.ngay.map((n) => { const v = c.cong[x.ma + '|' + n] || 0; t += v; return v ? (v === 1 ? '1' : v === 0.5 ? '½' : G.so(v)) : ''; }); return [x.ma, x.ten, x.doi || ''].concat(cc).concat([G.so(t)]); }).filter((r) => r[r.length - 1] !== '0');
    const sdCu = -275.5;
    m.innerHTML = `<div class="the"><div class="luoi2"><div><div class="so-lon">${G.so(c.tt)}</div><div class="mo">công thực tế (gồm quản lý nhà thầu)</div></div><div><div class="so-lon">${G.so(c.hd)}</div><div class="mo">công hợp đồng: T2–T7 31/ngày · CN, lễ 20/ngày</div></div></div>
      <p style="margin:10px 0 0">Chênh lệch (cộng dồn cả kỳ, ngày dư bù ngày thiếu): <b style="color:${c.chenh < 0 ? 'var(--do)' : 'var(--xanh)'}">${G.so(c.chenh)}</b></p>
      <p style="margin:4px 0 0">Bảng công tháng: hợp đồng ${G.so(c.hd)} + 12 công giám sát = <b>${G.so(c.hd + 12)}</b> → chênh lệch <b style="color:${c.chenhThang < 0 ? 'var(--do)' : 'var(--xanh)'}">${G.so(c.chenhThang)}</b> · lũy kế ${G.so(sdCu)} → <b>${G.so(sdCu + c.chenhThang)}</b></p>
      ${c.le.length ? `<p class="mo" style="margin:6px 0 0">Ngày lễ trong kỳ: ${c.le.map(([n, t]) => `${G.ngayVN(n)} (${esc(t)})`).join(' · ')}</p>` : ''}${c.chuaDuyet ? `<p style="color:var(--do);margin:6px 0 0">${c.chuaDuyet} dòng điểm danh chưa duyệt.</p>` : ''}</div>
      <div class="the cuon-ngang"><table class="bang"><tr><th></th>${c.ngay.map((n) => `<th style="${new Date(n).getDay() === 0 || G.laLe(n) ? 'background:#EFE3BE' : ''}">${n.slice(8)}</th>`).join('')}<th>Tổng</th></tr>
        <tr><td>Thực tế</td>${c.ngTT.map((x) => `<td>${G.so(x)}</td>`).join('')}<td><b>${G.so(c.tt)}</b></td></tr><tr><td>Hợp đồng</td>${c.ngHD.map((x) => `<td>${x}</td>`).join('')}<td><b>${c.hd}</b></td></tr>
        <tr><td>Chênh lệch</td>${c.ngTT.map((x, i) => `<td style="color:${x - c.ngHD[i] < 0 ? 'var(--do)' : 'var(--xanh)'}">${G.so(x - c.ngHD[i])}</td>`).join('')}<td><b>${G.so(c.chenh)}</b></td></tr></table></div>
      <button class="nut nho" id="tai" style="margin-bottom:8px">⬇ Tải Excel</button><div class="the cuon-ngang"><table class="bang"><tr>${h.map((x) => `<th>${esc(x)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div>`;
    m.querySelector('#tai').onclick = () => G.taiCSV('BangCong_' + k.ten, [h].concat(rows).concat([[], ['', 'Thực tế', ''].concat(c.ngTT).concat([c.tt]), ['', 'Hợp đồng', ''].concat(c.ngHD).concat([c.hd]), ['', '12 công giám sát', ''].concat(c.ngay.map(() => '')).concat([12]), ['', 'Chênh lệch', ''].concat(c.ngTT.map((x, i) => x - c.ngHD[i])).concat([c.chenhThang])]));
  } });
  /* ngày lễ: anh chỉnh danh sách theo năm (dương + âm lịch đã đổi ngày) */
  G.man.ngayle = { ten: 'Ngày lễ', ic: 'lich', bt: '📅', nhom: 'Quản trị', ph: 'homnay', cap: 3, an: true, fn: async () => {
    const m = G.khung('Ngày lễ Việt Nam', 'CN và ngày lễ tính 20 công · lễ âm lịch đã đổi ra dương lịch', '#/baocao');
    const le = G.ngayLe(); const nam = [...new Set(Object.keys(le).map((d) => d.slice(0, 4)))];
    m.innerHTML = `<button class="nut chinh rong" id="them" style="margin-bottom:10px">＋ Thêm / sửa ngày lễ</button>${nam.map((y) => `<div class="the"><h2>Năm ${y}</h2><table class="bang">${Object.keys(le).filter((d) => d.startsWith(y)).sort().map((d) => `<tr><td>${G.ngayVN(d)}</td><td>${G.thu(d)}</td><td>${esc(le[d])}</td><td><button class="nut nho" data-bo="${d}">Bỏ</button></td></tr>`).join('')}</table></div>`).join('')}`;
    m.querySelector('#them').onclick = () => hop('Ngày lễ', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ngay', nhan: 'Ngày (dương lịch)', loai: 'ngay', bb: true }, { k: 'ten', nhan: 'Tên ngày lễ (ghi rõ âm lịch nếu có, vd: Giỗ Tổ 10/3 âm lịch)', loai: 'chu', bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghiNhieu', { bang: 'NgayLe', thay: ['Ngày'], dong: [{ 'Ngày': v.ngay, 'Tên': v.ten, 'Bỏ': '', 'Người sửa': S.u.ten }] }); await G.boSungDM(); dong(); G.taiLai(); }, e.target);
    });
    m.querySelectorAll('[data-bo]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('ghiNhieu', { bang: 'NgayLe', thay: ['Ngày'], dong: [{ 'Ngày': b.dataset.bo, 'Tên': '', 'Bỏ': 'Có', 'Người sửa': S.u.ten }] }); await G.boSungDM(); G.taiLai(); }); });
  } };

  /* ---------- CHẤM ĐIỂM (mục 37): Đạt / Không đạt, ảnh không bắt buộc (Đạt ≤1, Không đạt ≤3, ghi chú chung ≤5), 🎙 ---------- */
  G.man.chamdiem = Object.assign(G.man.chamdiem, { fn: async () => {
    const k = S.dm.ky; const m = G.khung('Chấm điểm chất lượng', `Kỳ ${k.ten} · Đạt / Không đạt từng tiêu chí`);
    const ds = await G.doc('ChamDiem', { 'Ngày': { tu: k.tu } }); const luot = [...new Set(ds.map((r) => r['Mã lượt'] || r['Ngày'] + r['Mã vị trí']))];
    const dat = ds.filter((r) => (r['Kết quả'] || (+r['Điểm (1–5)'] >= 4 ? 'Đạt' : 'Không đạt')) === 'Đạt').length;
    m.innerHTML = `<div class="the"><div class="so-lon">${ds.length ? Math.round(dat / ds.length * 100) + '%' : '—'}</div><div class="mo">tiêu chí đạt · ${luot.length} lượt chấm trong kỳ</div></div>
      <div class="nhom-nut" style="margin-bottom:12px"><button class="nut chinh" id="boc">🎲 Bốc ngẫu nhiên vị trí</button><button class="nut" id="chon">Chọn vị trí</button></div>
      <div class="ds">${ds.slice().reverse().slice(0, 80).map((r) => `<div class="muc"><div class="gian">${esc(G.tenVT(r['Mã vị trí']))}<div class="mo">${G.ngayVN(r['Ngày'])} · ${esc(r['Tiêu chí'])}${r['Ghi chú'] ? ' · ' + esc(r['Ghi chú']) : ''}</div>${r['Ảnh'] ? G.xemAnh(r['Ảnh']) : ''}</div><span class="chip ${(r['Kết quả'] || '') === 'Không đạt' ? 'do' : 'xanh'}">${esc(r['Kết quả'] || r['Điểm (1–5)'])}</span></div>`).join('') || '<div class="muc mo">Chưa có</div>'}</div>`;
    const cham = (vts) => {
      const maL = G.ma('CD'); const kq = {}; const anh = {}; const gc = {};
      hop('Chấm ' + vts.length + ' vị trí', `${vts.map((v, i) => `<div class="the" style="padding:10px"><b>${i + 1}. ${esc(v.ten)}</b> <span class="mo">${esc(v.kv || '')}</span>${S.dm.tieuChi.map((t, j) => `<div class="dong-cham" style="display:block"><div class="hang"><span class="gian">${esc(t.ten)}</span>
        <span class="hai-nut" style="margin:0"><button type="button" data-kq="${i}|${j}" data-v="Đạt">Đạt</button><button type="button" data-kq="${i}|${j}" data-v="Không đạt">Không đạt</button></span></div>
        <div class="an" data-chi="${i}|${j}"><textarea data-gc="${i}|${j}" placeholder="Ghi chú tiêu chí" style="min-height:44px;margin-top:6px"></textarea><button type="button" class="nut nho mic" data-mic2="${i}|${j}">🎙 Nói</button><div data-anh="${i}|${j}"></div>
        <div class="nhom-nut an" data-kd="${i}|${j}" style="margin-top:6px"><button type="button" class="nut nho" data-ghim="${i}|${j}">📌 Đưa vào họp</button><button type="button" class="nut nho" data-phieu="${i}|${j}">🎫 Tạo phiếu kèm ảnh</button><button type="button" class="nut nho" data-dtl="${i}|${j}">🎓 Đào tạo lại</button></div></div></div>`).join('')}</div>`).join('')}
        <div class="the"><b>Ghi chú chung lượt chấm</b><textarea id="gcChung"></textarea><button type="button" class="nut nho mic" id="micChung">🎙 Nói</button><div id="anhChung"></div></div><button class="nut chinh rong" id="l">Lưu lượt chấm</button>`, (o, dong) => {
        G.mic(o.querySelector('#micChung'), o.querySelector('#gcChung')); const anhChung = G.oAnh(o.querySelector('#anhChung'), { tuyChon: true, batBuoc: false, toiDa: 5 });
        o.querySelectorAll('[data-mic2]').forEach((b) => G.mic(b, o.querySelector(`[data-gc="${b.dataset.mic2}"]`)));
        o.querySelectorAll('[data-kq]').forEach((b) => { b.onclick = () => { const key = b.dataset.kq; kq[key] = b.dataset.v; o.querySelectorAll(`[data-kq="${key}"]`).forEach((x) => x.classList.toggle('dang', x === b)); o.querySelectorAll(`[data-kq="${key}"]`).forEach((x) => x.classList.toggle(x.dataset.v === 'Đạt' ? 'xanh' : 'vang', x === b));
          o.querySelector(`[data-chi="${key}"]`).classList.remove('an'); o.querySelector(`[data-kd="${key}"]`).classList.toggle('an', b.dataset.v !== 'Không đạt');
          const el = o.querySelector(`[data-anh="${key}"]`); el.innerHTML = ''; anh[key] = G.oAnh(el, { tuyChon: true, batBuoc: false, toiDa: b.dataset.v === 'Đạt' ? 1 : 3 }); }; });
        const tc = (key) => { const [i, j] = key.split('|').map(Number); return { v: vts[i], t: S.dm.tieuChi[j], anh: anh[key] ? anh[key].ds() : [], gc: o.querySelector(`[data-gc="${key}"]`).value }; };
        o.querySelectorAll('[data-ghim]').forEach((b) => { b.onclick = () => { const x = tc(b.dataset.ghim); G.ghimHop({ loai: 'Chấm điểm', tieuDe: `${x.v.ten}: ${x.t.ten} không đạt`, goiY: x.gc, anh: x.anh }); }; });
        o.querySelectorAll('[data-phieu]').forEach((b) => { b.onclick = () => chay(async () => { const x = tc(b.dataset.phieu); const p = await API.goi('phieu.tao', { loaiPhieu: 'Lỗi', nguon: 'Chấm điểm chất lượng', nhom: 'Chấm điểm', loai: x.t.ten + ' không đạt', muc: 'Trung bình', vt: x.v.ma, moTa: x.gc || x.t.ten + ' không đạt', anh: x.anh, giao: /Villa|Hotel|Residences|Aura|Public|Islander/.test(x.v.cum) ? 'Đội khu vực' : 'Đội cơ động' }); bao('Đã tạo phiếu ' + p.ma); b.disabled = true; }); });
        o.querySelectorAll('[data-dtl]').forEach((b) => { b.onclick = () => { const x = tc(b.dataset.dtl); G._daoTaoLai = { nd: 'Đào tạo lại: ' + x.t.ten, lyDo: `Chấm điểm không đạt tại ${x.v.ten}` }; dong(); location.hash = '#/daotao/moi'; }; });
        o.querySelector('#l').onclick = (e) => chay(async () => { const keys = Object.keys(kq); if (!keys.length) throw new Error('Chưa chấm tiêu chí nào');
          const rows = keys.map((key) => { const x = tc(key); return { 'Mã lượt': maL, 'Ngày': '', 'Mã vị trí': x.v.ma, 'Tiêu chí': x.t.ten, 'Kết quả': kq[key], 'Điểm (1–5)': kq[key] === 'Đạt' ? 5 : 1, 'Ảnh': x.anh, 'Ghi chú': x.gc, 'Người chấm': '' }; });
          rows[0]['Ghi chú chung'] = o.querySelector('#gcChung').value; rows[0]['Ảnh chung'] = anhChung.ds();
          await API.goi('ghiNhieu', { bang: 'ChamDiem', dong: rows }); dong(); bao(`Đã lưu ${rows.length} tiêu chí`); G.taiLai(); }, e.target);
      }, true);
    };
    m.querySelector('#boc').onclick = () => cham(S.dm.vitri.filter((v) => v.ap === 'Có').sort(() => Math.random() - 0.5).slice(0, 5));
    m.querySelector('#chon').onclick = async () => { const v = await G.chonViTri({ chiApDung: true }); if (v) cham((v.nhieu || [v.ma]).map((x) => G.vt(x)).filter(Boolean)); };
  } });
})();
