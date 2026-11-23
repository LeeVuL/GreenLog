/* GreenLog – lịch, kế hoạch tuần/tháng, sự kiện, dự án, việc lặp lại, tuần tra, chấm điểm, mùa bão */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, hop, bao } = G;
  const ngayCua = (s) => String(s || '').slice(0, 10);

  /* ================= VIỆC LẶP LẠI ================= */
  const CHU_KY = ['Hằng ngày', 'Mỗi N ngày', 'Thứ trong tuần', 'Ngày trong tháng', 'Theo kỳ 20→19'];
  G.denHanLapLai = function (r, d) {
    const n = API.ngay(d); if (r['Đang chạy'] !== 'Có' || (r['Từ ngày'] && n < r['Từ ngày']) || (r['Đến ngày'] && n > r['Đến ngày'])) return false;
    const ts = String(r['Tham số'] || ''); const ck = r['Chu kỳ'];
    if (ck === 'Hằng ngày') return true;
    if (ck === 'Mỗi N ngày') { const k = Math.round((new Date(n) - new Date(r['Từ ngày'] || n)) / 864e5); return k % (+ts || 1) === 0; }
    if (ck === 'Thứ trong tuần') return ts.split(',').map((x) => x.trim()).includes(['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]);
    if (ck === 'Ngày trong tháng') return ts.split(',').map((x) => +x).includes(d.getDate());
    if (ck === 'Theo kỳ 20→19') return d.getDate() === 20;
    return false;
  };
  function formLapLai(goc) {
    G.hop('Việc lặp lại', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'nd', nhan: 'Nội dung', loai: 'chu', bb: true, gt: goc ? goc['Loại lỗi'] : '' }, { k: 'vt', nhan: 'Vị trí', loai: 'vitri', gt: goc && goc['Mã vị trí'] ? { ma: goc['Mã vị trí'], ten: G.tenVT(goc['Mã vị trí']) } : null },
        { k: 'ck', nhan: 'Chu kỳ', loai: 'chips', ds: CHU_KY, bb: true }, { k: 'ts', nhan: 'Tham số', loai: 'chu', goiY: 'Mỗi N ngày: 3 · Thứ: T2, T5 · Ngày: 1, 15' },
        { k: 'tu', nhan: 'Từ ngày', loai: 'ngay', bb: true }, { k: 'den', nhan: 'Đến ngày (để trống = không hết hạn)', loai: 'ngay', gt: ' ' }, { k: 'ng', nhan: 'Người / đội phụ trách', loai: 'chips', ds: G.GIAO_CHO(), bb: true, gt: goc ? goc['Giao cho'] : '' },
        { k: 'muc', nhan: 'Mức độ', loai: 'chips', ds: G.MUC, gt: goc ? goc['Mức độ'] : 'Trung bình' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'ViecLapLai', dong: { 'Mã LL': '', 'Nội dung': v.nd, 'Mã vị trí': v.vt ? v.vt.ma || v.vt.ten : '', 'Chu kỳ': v.ck, 'Tham số': v.ts, 'Từ ngày': v.tu, 'Đến ngày': v.den.trim(), 'Người phụ trách': v.ng, 'Mức độ': v.muc, 'Đang chạy': 'Có' } }); dong(); bao('Đã lưu. Mỗi sáng app tự tạo phiếu khi đến hạn.'); location.hash = '#/laplai'; G.taiLai(); }, e.target);
    });
  }
  G.lapLaiTu = formLapLai;
  G.man.laplai = { ten: 'Việc lặp lại', bt: '🔁', nhom: 'Kế hoạch', ph: 'homnay', cap: 3, fn: () => G.manSo({ tieuDe: 'Việc lặp lại', phu: 'Tự tạo phiếu khi đến hạn', bang: 'ViecLapLai', nutMoi: 'Thêm việc lặp lại',
    dau: () => '<p class="mo">Mỗi sáng 6h app tự tạo phiếu cho các việc đến hạn và nhắc người phụ trách. Bấm vào một việc để dừng / chạy lại.</p>',
    truong: [], dong: (r) => `<div class="gian"><b>${esc(r['Nội dung'])}</b><div class="mo">${esc(r['Chu kỳ'])} ${esc(r['Tham số'])} · ${esc(r['Người phụ trách'])} · ${esc(G.tenVT(r['Mã vị trí']))}</div></div><span class="chip ${r['Đang chạy'] === 'Có' ? 'xanh' : ''}">${r['Đang chạy'] === 'Có' ? 'Đang chạy' : 'Đã dừng'}</span>`,
    chiTiet: (r) => chay(async () => { const dung = r['Đang chạy'] === 'Có'; if (await G.xacNhan((dung ? 'Dừng' : 'Chạy lại') + ' việc "' + r['Nội dung'] + '"?', dung ? 'Dừng' : 'Chạy lại')) { await API.goi('sua', { bang: 'ViecLapLai', khoa: { 'Mã LL': r['Mã LL'] }, doi: { 'Đang chạy': dung ? 'Không' : 'Có' } }); G.taiLai(); } }),
    sau: (m) => { const b = m.querySelector('#moi'); if (b) b.onclick = () => formLapLai(); } }) };

  /* ================= SỰ KIỆN ================= */
  G.man.sukien = { ten: 'Sự kiện, tiệc', bt: '🎉', nhom: 'Kế hoạch', ph: 'sukien', fn: async () => {
    const m = G.khung('Sự kiện, tiệc', 'Ảnh trước tiệc và sau tiệc');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'SuKien', gioiHan: 200 }] })).SuKien.sort((a, b) => (a['Bắt đầu'] < b['Bắt đầu'] ? 1 : -1));
    const hn = API.ngay();
    const viec = (s) => { const d = ngayCua(s['Bắt đầu']); return [[G.congNgay(d, -3), 'T–3 chỉnh trang khu vực'], [G.congNgay(d, -1), 'T–1 nhắc chuẩn bị'], [d, 'Trước tiệc 2 giờ: ảnh đã vệ sinh'], [G.congNgay(ngayCua(s['Kết thúc'] || d), 1), 'Sáng hôm sau trước 9h: ảnh sau tiệc']]; };
    m.innerHTML = (q('sukien') >= 3 ? '<button class="nut chinh rong" id="moi" style="margin-bottom:12px">＋ Tạo sự kiện</button>' : '')
      + `<div class="ds">${ds.map((s, i) => { const sap = ngayCua(s['Bắt đầu']) >= hn; const tre = sap && !s['Ảnh trước tiệc'] && (new Date(s['Bắt đầu'].replace(' ', 'T')) - Date.now()) < 36e5;
        return `<div class="muc" data-i="${i}" style="cursor:pointer;${sap ? '' : 'opacity:.7'}"><div class="gian"><b>${esc(s['Tên'])}</b> <span class="chip">${esc(s['Loại'])}</span>
          <div class="mo">${esc(G.gioVN(s['Bắt đầu']))}–${esc(String(s['Kết thúc']).slice(11, 16))} · ${esc(G.tenVT(s['Mã vị trí'], s['Vị trí khác']))} · ${esc(s['Số khách'])} khách</div></div>
          <div style="text-align:right">${s['Ảnh trước tiệc'] ? '<span class="chip xanh">Ảnh trước ✓</span>' : `<span class="chip ${tre ? 'do' : 'cam'}">${tre ? 'Khẩn: thiếu ảnh' : 'Chưa ảnh trước'}</span>`}<br>${s['Ảnh sau tiệc'] ? '<span class="chip xanh" style="margin-top:4px">Ảnh sau ✓</span>' : ''}</div></div>`; }).join('') || '<div class="muc mo">Chưa có sự kiện</div>'}</div>`;
    m.querySelectorAll('[data-i]').forEach((d) => { d.onclick = () => { const s = ds[+d.dataset.i];
      hop(s['Tên'], `<p class="mo" style="margin-top:0">${esc(s['Loại'])} · ${esc(G.gioVN(s['Bắt đầu']))} → ${esc(G.gioVN(s['Kết thúc']))}<br>📍 ${esc(G.tenVT(s['Mã vị trí'], s['Vị trí khác']))} · ${esc(s['Số khách'])} khách · ${esc(s['Đội phụ trách'])}<br>Nguồn: ${esc(s['Nguồn tin'])}</p>${s['Yêu cầu'] ? `<p>${esc(s['Yêu cầu'])}</p>` : ''}
        <div class="the" style="padding:10px"><b>Việc tự sinh</b>${viec(s).map((v) => `<div class="mo">${G.ngayVN(v[0])}: ${esc(v[1])}</div>`).join('')}</div>
        <h3 style="font-size:14px">Ảnh đã vệ sinh trước tiệc</h3><div>${G.xemAnh(s['Ảnh trước tiệc'])}</div>${q('sukien') >= 2 ? '<div id="a1"></div><button class="nut chinh rong" id="l1" style="margin:8px 0">Lưu ảnh trước tiệc</button>' : ''}
        <h3 style="font-size:14px">Ảnh sau tiệc (sáng hôm sau trước 9h)</h3><div>${G.xemAnh(s['Ảnh sau tiệc'])}</div>${q('sukien') >= 2 ? '<div id="a2"></div><button class="nut chinh rong" id="l2" style="margin-top:8px">Lưu ảnh sau tiệc</button>' : ''}`, (o, dong) => {
        if (q('sukien') < 2) return;
        const a1 = G.oAnh(o.querySelector('#a1'), { toiDa: 6 }); const a2 = G.oAnh(o.querySelector('#a2'), { toiDa: 6 });
        const luu = (cot, a) => (e) => chay(async () => { if (!a.ds().length) throw new Error('Chọn ảnh'); const cu = API.dsAnh(s[cot]); await API.goi('sua', { bang: 'SuKien', khoa: { 'Mã SK': s['Mã SK'] }, doi: { [cot]: cu.concat(a.ds()).join(' | '), 'Trạng thái': cot === 'Ảnh sau tiệc' ? 'Đã xong' : 'Đã chuẩn bị' } }); dong(); bao('Đã lưu ảnh'); G.taiLai(); }, e.target);
        o.querySelector('#l1').onclick = luu('Ảnh trước tiệc', a1); o.querySelector('#l2').onclick = luu('Ảnh sau tiệc', a2);
      }, true); }; });
    const b = m.querySelector('#moi');
    if (b) b.onclick = () => hop('Tạo sự kiện', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Tên sự kiện', loai: 'chu', bb: true }, { k: 'loai', nhan: 'Loại', loai: 'chips', ds: S.dm.loaiSuKien, bb: true },
        { k: 'bd', nhan: 'Bắt đầu', loai: 'ngaygio', bb: true }, { k: 'kt', nhan: 'Kết thúc', loai: 'ngaygio', bb: true }, { k: 'vt', nhan: 'Vị trí', loai: 'vitri', bb: true }, { k: 'sk', nhan: 'Số khách', loai: 'so' },
        { k: 'yc', nhan: 'Yêu cầu', loai: 'mota' }, { k: 'ng', nhan: 'Nguồn tin', loai: 'chips', ds: ['Sales', 'Marketing', 'F&B', 'Khác'] }, { k: 'doi', nhan: 'Đội phụ trách', loai: 'chips', ds: ['Đội cơ động', 'Đội khu vực', 'Nhân viên nội bộ'], bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (v.kt < v.bd) throw new Error('Giờ kết thúc trước giờ bắt đầu'); await API.goi('ghi', { bang: 'SuKien', dong: { 'Mã SK': '', 'Tên': v.ten, 'Loại': v.loai, 'Bắt đầu': v.bd, 'Kết thúc': v.kt, 'Mã vị trí': v.vt.ma || '', 'Vị trí khác': v.vt.ma ? '' : v.vt.ten, 'Số khách': v.sk, 'Yêu cầu': v.yc, 'Nguồn tin': v.ng, 'Đội phụ trách': v.doi, 'Trạng thái': 'Sắp diễn ra' } }); dong(); bao('Đã tạo sự kiện. App tự nhắc T–3, T–1, ảnh trước và sau tiệc.'); G.taiLai(); }, e.target);
    });
  } };

  /* ================= DỰ ÁN ================= */
  G.man.duan = { ten: 'Dự án', bt: '🏗️', nhom: 'Kế hoạch', ph: 'duan', fn: async (ma) => {
    const d = await API.goi('docNhieu', { ds: [{ bang: 'DuAn' }, { bang: 'DuAnGiaiDoan' }, { bang: 'DuAnVatTu' }, { bang: 'DuAnTienDo' }, { bang: 'SoTrongCay', gioiHan: 2000 }] });
    if (ma) return chiTietDA(d, ma);
    const m = G.khung('Dự án', 'Kế hoạch theo giai đoạn, tiến độ, vật tư');
    m.innerHTML = (q('duan') >= 3 ? '<button class="nut chinh rong" id="moi" style="margin-bottom:12px">＋ Tạo dự án</button>' : '')
      + `<div class="ds">${d.DuAn.slice().reverse().map((a) => { const t = tienDoDA(d, a['Mã DA']); return `<a class="muc" href="#/duan/${encodeURIComponent(a['Mã DA'])}" style="color:inherit;text-decoration:none"><div class="gian"><b>${esc(a['Tên'])}</b><div class="mo">${G.ngayVN(a['Bắt đầu'])} → ${G.ngayVN(a['Kết thúc'])} · ${esc(G.tenVT(a['Mã vị trí']))}</div><div class="thanh ${t.cham ? 'do' : ''}" style="margin-top:6px"><i style="width:${Math.round(t.thucTe * 100)}%"></i></div><div class="mo">${Math.round(t.thucTe * 100)}% (kế hoạch ${Math.round(t.keHoach * 100)}%)${t.cham ? ' · <b style="color:var(--do)">chậm hơn 15%</b>' : ''}</div></div>›</a>`; }).join('') || '<div class="muc mo">Chưa có dự án</div>'}</div>`;
    const b = m.querySelector('#moi'); if (b) b.onclick = taoDA;
  } };
  function tienDoDA(d, ma) {
    const gd = d.DuAnGiaiDoan.filter((x) => x['Mã DA'] === ma); if (!gd.length) return { thucTe: 0, keHoach: 0, cham: false, gd: [] };
    const hn = API.ngay(); let tt = 0, kh = 0;
    const out = gd.map((g) => {
      const lam = d.DuAnTienDo.filter((x) => x['Mã DA'] === ma && x['STT giai đoạn'] === g['STT']).reduce((a, x) => a + (+x['Khối lượng hôm nay'] || 0), 0)
        + (/trồng/i.test(g['Nội dung']) ? d.SoTrongCay.filter((x) => x['Mã DA'] === ma).reduce((a, x) => a + (+x['Số lượng'] || 0), 0) : 0);
      const p = Math.min(1, lam / (+g['Khối lượng'] || 1));
      const tong = Math.max(1, (new Date(g['Hoàn thành']) - new Date(g['Bắt đầu'])) / 864e5 + 1);
      const k = hn < g['Bắt đầu'] ? 0 : hn > g['Hoàn thành'] ? 1 : ((new Date(hn) - new Date(g['Bắt đầu'])) / 864e5 + 1) / tong;
      tt += p; kh += k; return Object.assign({}, g, { lam, p, k, soNgay: Math.round(tong) });
    });
    return { thucTe: tt / gd.length, keHoach: kh / gd.length, cham: kh / gd.length - tt / gd.length > 0.15, gd: out };
  }
  function taoDA() {
    const gd = []; const vt = [];
    hop('Tạo dự án', `<div id="f"></div><h3 style="font-size:14px">Giai đoạn</h3><div id="gd"></div><button class="nut rong" id="tg">＋ Thêm giai đoạn</button>
      <h3 style="font-size:14px;margin-top:14px">Vật tư kế hoạch</h3><div id="vt"></div><button class="nut rong" id="tv">＋ Thêm vật tư</button>
      <button class="nut chinh rong" id="l" style="margin-top:14px">Lưu dự án</button>`, (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'ten', nhan: 'Tên dự án', loai: 'chu', bb: true }, { k: 'loai', nhan: 'Loại', loai: 'chips', ds: ['Cải tạo cảnh quan', 'Trồng mới', 'Mùa mưa bão', 'Vườn ươm', 'Khác'], bb: true },
        { k: 'vt', nhan: 'Vị trí', loai: 'vitri', bb: true }, { k: 'bd', nhan: 'Bắt đầu', loai: 'ngay', bb: true }, { k: 'kt', nhan: 'Kết thúc', loai: 'ngay', bb: true }, { k: 'gc', nhan: 'Ghi chú', loai: 'mota' }]);
      const veGD = () => { o.querySelector('#gd').innerHTML = gd.map((g, i) => `<div class="the" style="padding:10px;margin-bottom:6px"><b>${i + 1}. ${esc(g.nd)}</b><div class="mo">${esc(g.kl)} ${esc(g.dvt)} · ${G.ngayVN(g.bd)} → ${G.ngayVN(g.ht)}</div></div>`).join(''); };
      const veVT = () => { o.querySelector('#vt').innerHTML = vt.map((v) => `<div class="mo">• GĐ ${esc(v.gd)}: ${esc(v.ten)} ${esc(v.kh)} ${esc(v.dvt)}</div>`).join(''); };
      o.querySelector('#tg').onclick = () => hop('Giai đoạn ' + (gd.length + 1), '<div id="f2"></div><button class="nut chinh rong" id="ok">Thêm</button>', (o2, d2) => {
        const l2 = G.form(o2.querySelector('#f2'), [{ k: 'nd', nhan: 'Nội dung', loai: 'chu', bb: true, goiY: 'Ví dụ: Dọn mặt bằng, Trồng dứa vàng' }, { k: 'kl', nhan: 'Khối lượng', loai: 'so', bb: true }, { k: 'dvt', nhan: 'ĐVT', loai: 'chips', ds: S.dm.dvt, bb: true }, { k: 'bd', nhan: 'Bắt đầu', loai: 'ngay', bb: true }, { k: 'ht', nhan: 'Hoàn thành', loai: 'ngay', bb: true }]);
        o2.querySelector('#ok').onclick = () => chay(async () => { const v = l2(); if (v.ht < v.bd) throw new Error('Ngày hoàn thành trước ngày bắt đầu'); gd.push(v); d2(); veGD(); });
      });
      o.querySelector('#tv').onclick = () => hop('Vật tư', '<div id="f2"></div><button class="nut chinh rong" id="ok">Thêm</button>', (o2, d2) => {
        const l2 = G.form(o2.querySelector('#f2'), [{ k: 'gd', nhan: 'Giai đoạn số', loai: 'chips', ds: gd.map((_, i) => String(i + 1)), bb: true }, { k: 'ten', nhan: 'Vật tư', loai: 'chu', bb: true, gt: 'Chất cải tạo đất hữu cơ' }, { k: 'dvt', nhan: 'ĐVT', loai: 'chips', ds: ['Bao', 'kg', 'Cây', 'Bụi', 'm²', 'm³', 'Khác'], bb: true }, { k: 'kh', nhan: 'Số lượng kế hoạch', loai: 'so', bb: true }]);
        o2.querySelector('#ok').onclick = () => chay(async () => { vt.push(l2()); d2(); veVT(); });
      });
      o.querySelector('#l').onclick = (e) => chay(async () => {
        const v = lay(); if (!gd.length) throw new Error('Thêm ít nhất 1 giai đoạn');
        const a = await API.goi('ghi', { bang: 'DuAn', dong: { 'Mã DA': '', 'Tên': v.ten, 'Loại': v.loai, 'Mã vị trí': v.vt.ma || v.vt.ten, 'Bắt đầu': v.bd, 'Kết thúc': v.kt, 'Trạng thái': 'Đang làm', 'Ghi chú': v.gc } });
        await API.goi('ghiNhieu', { bang: 'DuAnGiaiDoan', dong: gd.map((g, i) => ({ 'Mã DA': a['Mã DA'], 'STT': i + 1, 'Nội dung': g.nd, 'Khối lượng': g.kl, 'ĐVT': g.dvt, 'Bắt đầu': g.bd, 'Hoàn thành': g.ht })) });
        if (vt.length) await API.goi('ghiNhieu', { bang: 'DuAnVatTu', dong: vt.map((x) => ({ 'Mã DA': a['Mã DA'], 'STT giai đoạn': x.gd, 'Vật tư': x.ten, 'ĐVT': x.dvt, 'Kế hoạch': x.kh, 'Thực tế': '' })) });
        dong(); bao('Đã tạo dự án ' + a['Mã DA']); location.hash = '#/duan/' + a['Mã DA'];
      }, e.target);
    });
  }
  function chiTietDA(d, ma) {
    const a = d.DuAn.find((x) => x['Mã DA'] === ma); const m = G.khung(a ? a['Tên'] : 'Dự án', ma, '#/duan');
    if (!a) { m.innerHTML = G.trong('Không tìm thấy'); return; }
    const t = tienDoDA(d, ma); const vt = d.DuAnVatTu.filter((x) => x['Mã DA'] === ma); const td = d.DuAnTienDo.filter((x) => x['Mã DA'] === ma);
    const thucTeVT = (ten) => td.reduce((s, x) => { const mm = String(x['Vật tư dùng'] || '').split(';').map((y) => y.split(':')); const f = mm.find((y) => y[0] && y[0].trim() === ten); return s + (f ? +f[1] || 0 : 0); }, 0)
      + (/cải tạo/i.test(ten) ? d.SoTrongCay.filter((x) => x['Mã DA'] === ma).reduce((s, x) => s + (+x['Chất cải tạo đất hữu cơ (bao)'] || 0), 0) : 0);
    m.innerHTML = `<div class="the"><p class="mo" style="margin-top:0">${esc(a['Loại'])} · ${esc(G.tenVT(a['Mã vị trí']))} · ${G.ngayVN(a['Bắt đầu'])} → ${G.ngayVN(a['Kết thúc'])}</p>
      <div class="hang"><span class="gian">Thực tế <b>${Math.round(t.thucTe * 100)}%</b> · kế hoạch ${Math.round(t.keHoach * 100)}%</span>${t.cham ? '<span class="chip do">Chậm hơn 15%</span>' : '<span class="chip xanh">Đúng tiến độ</span>'}</div>
      <div class="thanh ${t.cham ? 'do' : ''}" style="margin-top:6px"><i style="width:${Math.round(t.thucTe * 100)}%"></i></div></div>
      <h3 style="font-size:14px">Giai đoạn</h3><div class="cuon"><table class="bang"><tr><th>STT</th><th>Nội dung</th><th>KL</th><th>Đã làm</th><th>Bắt đầu</th><th>Xong</th><th>Ngày</th></tr>${t.gd.map((g) => `<tr><td>${esc(g['STT'])}</td><td>${esc(g['Nội dung'])}</td><td>${G.so(g['Khối lượng'])} ${esc(g['ĐVT'])}</td><td style="color:${g.k - g.p > 0.15 ? 'var(--do)' : 'inherit'}">${G.so(g.lam)} (${Math.round(g.p * 100)}%)</td><td>${G.ngayVN(g['Bắt đầu']).slice(0, 5)}</td><td>${G.ngayVN(g['Hoàn thành']).slice(0, 5)}</td><td>${g.soNgay}</td></tr>`).join('')}</table></div>
      ${vt.length ? `<h3 style="font-size:14px">Vật tư</h3><div class="cuon"><table class="bang"><tr><th>GĐ</th><th>Vật tư</th><th>Kế hoạch</th><th>Thực tế</th></tr>${vt.map((v) => { const tt = thucTeVT(v['Vật tư']); return `<tr><td>${esc(v['STT giai đoạn'])}</td><td>${esc(v['Vật tư'])}</td><td>${G.so(v['Kế hoạch'])} ${esc(v['ĐVT'])}${/bao/i.test(v['ĐVT']) ? ` = ${G.so(v['Kế hoạch'] * 25)} kg` : ''}</td><td>${G.so(tt)} ${esc(v['ĐVT'])}</td></tr>`; }).join('')}</table></div>` : ''}
      ${q('duan') >= 2 ? '<button class="nut chinh rong" id="cn" style="margin-bottom:12px">＋ Cập nhật tiến độ hôm nay</button>' : ''}
      ${q('duan') >= 3 && a['Trạng thái'] !== 'Hoàn thành' ? '<button class="nut rong" id="ht" style="margin-bottom:12px">Đánh dấu hoàn thành dự án</button>' : ''}
      <h3 style="font-size:14px">Nhật ký tiến độ</h3>${td.slice().reverse().map((x) => `<div class="the" style="padding:10px"><b>${G.ngayVN(x['Ngày'])}</b> · GĐ ${esc(x['STT giai đoạn'])} · +${G.so(x['Khối lượng hôm nay'])} · ${esc(x['Người ghi'])}<div class="mo">${esc(x['Vật tư dùng'])}</div>${G.xemAnh(x['Ảnh'])}</div>`).join('') || '<p class="mo">Chưa cập nhật.</p>'}`;
    const cn = m.querySelector('#cn');
    if (cn) cn.onclick = () => hop('Cập nhật tiến độ', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'gd', nhan: 'Giai đoạn', loai: 'chips', ds: t.gd.map((g) => g['STT'] + '. ' + g['Nội dung']), bb: true }, { k: 'kl', nhan: 'Khối lượng làm hôm nay', loai: 'so', bb: true }]
        .concat(vt.map((v, i) => ({ k: 'v' + i, nhan: `${v['Vật tư']} dùng hôm nay (${v['ĐVT']})`, loai: 'so' }))).concat([{ k: 'anh', nhan: 'Ảnh', loai: 'anh', bb: true, toiDa: 6 }]));
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'DuAnTienDo', dong: { 'Mã DA': ma, 'STT giai đoạn': v.gd.split('.')[0], 'Ngày': '', 'Khối lượng hôm nay': v.kl, 'Vật tư dùng': vt.map((x, i) => (v['v' + i] ? `${x['Vật tư']}: ${v['v' + i]}` : '')).filter(Boolean).join('; '), 'Ảnh': v.anh, 'Người ghi': '' } }); dong(); bao('Đã cập nhật'); G.taiLai(); }, e.target);
    });
    const ht = m.querySelector('#ht'); if (ht) ht.onclick = () => chay(async () => { if (await G.xacNhan('Đánh dấu dự án hoàn thành?')) { await API.goi('sua', { bang: 'DuAn', khoa: { 'Mã DA': ma }, doi: { 'Trạng thái': 'Hoàn thành' } }); G.taiLai(); } });
  }

  /* ================= KẾ HOẠCH TUẦN ================= */
  G.man.kehoach = { ten: 'Kế hoạch tuần', bt: '🗒️', nhom: 'Kế hoạch', ph: 'kehoach', fn: async () => {
    const st = G.man.kehoach.st || (G.man.kehoach.st = { tu: G.dauTuan() });
    const tuan = G.tuan(st.tu); const den = G.congNgay(st.tu, 6);
    const m = G.khung('Kế hoạch tuần', `${tuan} · ${G.ngayVN(st.tu).slice(0, 5)}–${G.ngayVN(den).slice(0, 5)}`);
    const can = (b) => q(API.BANG[b][0]) >= 1;
    const d = await API.goi('docNhieu', { ds: [{ bang: 'KeHoachTuan', loc: { 'Tuần': tuan } }].concat(can('Phieu') ? [{ bang: 'Phieu', gioiHan: 300 }] : []).concat(can('SuKien') ? [{ bang: 'SuKien', gioiHan: 100 }] : []).concat(can('DuAnGiaiDoan') ? [{ bang: 'DuAnGiaiDoan' }] : []) });
    const goiY = [];
    (d.Phieu || []).filter((p) => p['Trạng thái'] !== 'Đã duyệt').forEach((p) => goiY.push({ nd: p['Loại lỗi'], vt: p['Mã vị trí'], han: ngayCua(p['Hạn']), muc: p['Mức độ'], nguon: 'Phiếu ' + p['Mã phiếu'] }));
    (d.SuKien || []).filter((s) => ngayCua(s['Bắt đầu']) >= st.tu && ngayCua(s['Bắt đầu']) <= den).forEach((s) => goiY.push({ nd: 'Chuẩn bị sự kiện: ' + s['Tên'], vt: s['Mã vị trí'], han: ngayCua(s['Bắt đầu']), muc: 'Cao', nguon: 'Sự kiện' }));
    (d.DuAnGiaiDoan || []).filter((g) => g['Bắt đầu'] <= den && g['Hoàn thành'] >= st.tu).forEach((g) => goiY.push({ nd: 'Dự án ' + g['Mã DA'] + ': ' + g['Nội dung'], vt: '', han: g['Hoàn thành'], muc: 'Trung bình', nguon: 'Dự án' }));
    const kh = d.KeHoachTuan; const duyet = q('kehoach') >= 3;
    const MAU = { 'Đăng ký': 'cam', 'Đã giao': '', 'Xong': 'xanh', 'Trễ': 'do' };
    m.innerHTML = `<div class="nhom-nut" style="margin-bottom:10px"><button class="nut nho" id="truoc">‹ Tuần trước</button><button class="nut nho" id="sau">Tuần sau ›</button></div>
      ${q('kehoach') >= 2 ? '<button class="nut chinh rong" id="moi" style="margin-bottom:10px">＋ Đăng ký việc trong tuần</button>' : ''}
      ${duyet && kh.some((x) => x['Trạng thái'] === 'Đăng ký') ? '<button class="nut rong" id="giaoHet" style="margin-bottom:10px">Giao việc: chốt tất cả mục đã đăng ký</button>' : ''}
      <div class="ds">${kh.map((x, i) => `<div class="muc" data-i="${i}" style="cursor:pointer"><div class="gian"><b>${esc(x['Nội dung'])}</b><div class="mo">${esc(x['Đội/Người'])} · ${esc(G.tenVT(x['Mã vị trí']))} · hạn ${G.ngayVN(x['Hạn']).slice(0, 5)}${x['Lý do trễ'] ? ' · trễ: ' + esc(x['Lý do trễ']) : ''}</div></div><span class="chip ${MAU[x['Trạng thái']] || ''}">${esc(x['Trạng thái'])}</span></div>`).join('') || '<div class="muc mo">Chưa có việc đăng ký</div>'}</div>
      ${kh.length ? `<div class="the"><b>Kế hoạch so với thực tế:</b> ${Math.round(kh.filter((x) => x['Trạng thái'] === 'Xong').length / kh.length * 100)}% xong · ${kh.filter((x) => x['Trạng thái'] === 'Trễ').length} trễ <button class="nut nho" id="tai" style="margin-left:8px">⬇ Tải</button></div>` : ''}
      ${goiY.length ? `<h3 style="font-size:14px">Gợi ý điền sẵn (${goiY.length})</h3><div class="ds">${goiY.slice(0, 40).map((g, i) => `<div class="muc"><div class="gian">${esc(g.nd)}<div class="mo">${esc(g.nguon)} · hạn ${G.ngayVN(g.han).slice(0, 5)}</div></div>${q('kehoach') >= 2 ? `<button class="nut nho" data-g="${i}">Đăng ký</button>` : ''}</div>`).join('')}</div>` : ''}`;
    m.querySelector('#truoc').onclick = () => { st.tu = G.congNgay(st.tu, -7); G.taiLai(); };
    m.querySelector('#sau').onclick = () => { st.tu = G.congNgay(st.tu, 7); G.taiLai(); };
    const dangKy = (gt) => hop('Đăng ký việc', '<div id="f"></div><button class="nut chinh rong" id="l">Đăng ký</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'nd', nhan: 'Nội dung', loai: 'chu', bb: true, gt: gt && gt.nd }, { k: 'vt', nhan: 'Vị trí', loai: 'vitri', gt: gt && gt.vt ? { ma: gt.vt, ten: G.tenVT(gt.vt) } : null },
        { k: 'ng', nhan: 'Đội / người làm', loai: 'chips', ds: G.GIAO_CHO(), bb: true, gt: S.u.doi || '' }, { k: 'han', nhan: 'Hạn', loai: 'ngay', bb: true, gt: gt && gt.han && gt.han <= den ? gt.han : den }, { k: 'muc', nhan: 'Mức độ', loai: 'chips', ds: G.MUC, gt: gt ? gt.muc : 'Trung bình' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'KeHoachTuan', dong: { 'Mã KHT': '', 'Tuần': tuan, 'Nội dung': v.nd, 'Mã vị trí': v.vt ? v.vt.ma || v.vt.ten : '', 'Đội/Người': v.ng, 'Từ ngày': st.tu, 'Hạn': v.han, 'Mức độ': v.muc, 'Nguồn': gt ? gt.nguon : 'Đăng ký', 'Trạng thái': 'Đăng ký' } }); dong(); bao('Đã đăng ký'); G.taiLai(); }, e.target);
    });
    const moi = m.querySelector('#moi'); if (moi) moi.onclick = () => dangKy();
    m.querySelectorAll('[data-g]').forEach((b) => { b.onclick = () => dangKy(goiY[+b.dataset.g]); });
    const gh = m.querySelector('#giaoHet'); if (gh) gh.onclick = () => chay(async () => { await API.goi('sua', { bang: 'KeHoachTuan', khoa: { 'Tuần': tuan, 'Trạng thái': 'Đăng ký' }, doi: { 'Trạng thái': 'Đã giao' } }); bao('Đã giao việc'); G.taiLai(); }, gh);
    m.querySelectorAll('[data-i]').forEach((r) => { r.onclick = async () => { const x = kh[+r.dataset.i]; if (q('kehoach') < 2) return;
      const c = await G.chonDS('Cập nhật: ' + x['Nội dung'], ['Xong', 'Trễ'].concat(duyet ? ['Đã giao', 'Xóa khỏi kế hoạch'] : [])); if (!c) return;
      chay(async () => { if (c.ten === 'Xóa khỏi kế hoạch') await API.goi('xoa', { bang: 'KeHoachTuan', khoa: { 'Mã KHT': x['Mã KHT'] } }); else { const ly = c.ten === 'Trễ' ? await G.hoi('Lý do trễ') : ''; await API.goi('sua', { bang: 'KeHoachTuan', khoa: { 'Mã KHT': x['Mã KHT'] }, doi: { 'Trạng thái': c.ten, 'Lý do trễ': ly || '' } }); } G.taiLai(); }); }; });
    const tai = m.querySelector('#tai'); if (tai) tai.onclick = () => G.taiCSV('KeHoachTuan_' + tuan, [['Nội dung', 'Vị trí', 'Đội/Người', 'Hạn', 'Mức độ', 'Trạng thái', 'Lý do trễ']].concat(kh.map((x) => [x['Nội dung'], G.tenVT(x['Mã vị trí']), x['Đội/Người'], x['Hạn'], x['Mức độ'], x['Trạng thái'], x['Lý do trễ']])));
  } };

  /* ================= KẾ HOẠCH ĐỊNH KỲ THÁNG (anh Pháp lập, anh Vũ duyệt) ================= */
  G.man.khthang = { ten: 'Kế hoạch định kỳ tháng', bt: '📆', nhom: 'Kế hoạch', ph: 'kehoach', fn: async () => {
    const k = S.dm.ky; const m = G.khung('Kế hoạch định kỳ tháng', `Kỳ ${k.ten} · ${G.ngayVN(k.tu)}–${G.ngayVN(k.den)}`);
    const d = await API.goi('docNhieu', { ds: [{ bang: 'KeHoachDinhKy', gioiHan: 2000 }] });
    const ds = d.KeHoachDinhKy.filter((x) => x['Kỳ'] === k.ten); const duyet = q('kehoach') >= 3;
    const kyTruoc = (() => { const p = k.tu.split('-'); return API.ky(G.congNgay(k.tu, -1)).ten; })();
    m.innerHTML = (q('kehoach') >= 2 ? `<div class="nhom-nut" style="margin-bottom:10px"><button class="nut chinh" id="moi">＋ Thêm dòng</button><button class="nut" id="chep">Sao chép kỳ trước</button></div>` : '')
      + (duyet && ds.some((x) => x['Trạng thái duyệt'] !== 'Đã duyệt') ? '<button class="nut rong" id="duyet" style="margin-bottom:10px">Duyệt toàn bộ kế hoạch kỳ</button>' : '')
      + `<div class="cuon"><table class="bang"><tr><th>Việc</th><th>Cụm / khu vực</th><th>Ngày</th><th>Đội</th><th>Duyệt</th></tr>${ds.map((x) => `<tr><td>${esc(G.dvTen(x['Mã việc']))}</td><td>${esc(x['Cụm'])}${x['Khu vực'] ? ' · ' + esc(x['Khu vực']) : ''}</td><td>${G.ngayVN(x['Từ ngày']).slice(0, 5)}${x['Đến ngày'] !== x['Từ ngày'] ? '–' + G.ngayVN(x['Đến ngày']).slice(0, 5) : ''}</td><td>${esc(x['Đội'])}</td><td>${x['Trạng thái duyệt'] === 'Đã duyệt' ? '✓' : 'Chờ'}</td></tr>`).join('') || '<tr><td colspan="5" class="mo">Chưa có kế hoạch kỳ này</td></tr>'}</table></div>`;
    const moi = m.querySelector('#moi');
    if (moi) moi.onclick = () => hop('Thêm kế hoạch', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const cums = [...new Set(S.dm.vitri.filter((v) => v.ap === 'Có').map((v) => v.cum))];
      const lay = G.form(o.querySelector('#f'), [{ k: 'viec', nhan: 'Việc', loai: 'chips', ds: S.dm.dauviec.filter((v) => /^DV0[1-8]$/.test(v.ma)).map((v) => v.ten), bb: true }, { k: 'cum', nhan: 'Cụm', loai: 'chips', ds: cums, bb: true },
        { k: 'kv', nhan: 'Khu vực cụ thể (không bắt buộc)', loai: 'chu' }, { k: 'tu', nhan: 'Từ ngày', loai: 'ngay', bb: true }, { k: 'den', nhan: 'Đến ngày', loai: 'ngay', bb: true }, { k: 'doi', nhan: 'Đội', loai: 'chips', ds: ['Đội cơ động', 'Đội khu vực'], bb: true }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); if (v.tu < k.tu || v.den > k.den) throw new Error('Ngày phải trong kỳ ' + k.ten); await API.goi('ghi', { bang: 'KeHoachDinhKy', dong: { 'Mã KH': '', 'Kỳ': k.ten, 'Mã việc': S.dm.dauviec.find((x) => x.ten === v.viec).ma, 'Cụm': v.cum, 'Khu vực': v.kv, 'Từ ngày': v.tu, 'Đến ngày': v.den, 'Đội': v.doi, 'Trạng thái duyệt': 'Chờ duyệt', 'Người lập': '' } }); dong(); bao('Đã lưu'); G.taiLai(); }, e.target);
    });
    const chep = m.querySelector('#chep');
    if (chep) chep.onclick = () => chay(async () => {
      const cu = d.KeHoachDinhKy.filter((x) => x['Kỳ'] === kyTruoc); if (!cu.length) throw new Error('Kỳ trước chưa có kế hoạch');
      const lech = (s) => G.congNgay(s, Math.round((new Date(k.tu) - new Date(API.ky(G.congNgay(k.tu, -1)).tu)) / 864e5));
      await API.goi('ghiNhieu', { bang: 'KeHoachDinhKy', dong: cu.map((x) => ({ 'Mã KH': '', 'Kỳ': k.ten, 'Mã việc': x['Mã việc'], 'Cụm': x['Cụm'], 'Khu vực': x['Khu vực'], 'Từ ngày': lech(x['Từ ngày']), 'Đến ngày': lech(x['Đến ngày']), 'Đội': x['Đội'], 'Trạng thái duyệt': 'Chờ duyệt', 'Người lập': '' })) });
      bao('Đã chép ' + cu.length + ' dòng'); G.taiLai();
    }, chep);
    const du = m.querySelector('#duyet'); if (du) du.onclick = () => chay(async () => { await API.goi('sua', { bang: 'KeHoachDinhKy', khoa: { 'Kỳ': k.ten }, doi: { 'Trạng thái duyệt': 'Đã duyệt' } }); bao('Đã duyệt'); G.taiLai(); }, du);
  } };

  /* ================= LỊCH ================= */
  G.man.lich = { ten: 'Lịch', bt: '📅', nhom: 'Kế hoạch', ph: 'homnay', fn: async () => {
    const st = G.man.lich.st || (G.man.lich.st = { thang: API.ngay().slice(0, 7), chon: API.ngay() });
    const [y, mo] = st.thang.split('-').map(Number);
    const m = G.khung('Lịch', `Tháng ${mo}/${y}`);
    const can = (b) => q(API.BANG[b][0]) >= 1;
    const ds = []; [['SuKien'], ['DuAnGiaiDoan'], ['Phieu', 300], ['KeHoachDinhKy', 2000], ['ViecLapLai'], ['NhatKyPhunBon', 200]].forEach(([b, n]) => { if (can(b)) ds.push({ bang: b, gioiHan: n }); });
    const d = await API.goi('docNhieu', { ds });
    const su = {}; const them = (ngay, loai, ten, link) => { (su[ngay] = su[ngay] || []).push({ loai, ten, link }); };
    const dau = `${st.thang}-01`; const soNgay = new Date(y, mo, 0).getDate(); const cuoi = `${st.thang}-${String(soNgay).padStart(2, '0')}`;
    const moiNgay = (tu, den, fn) => { let n = tu < dau ? dau : tu; const e = den > cuoi ? cuoi : den; let i = 0; while (n <= e && i++ < 62) { fn(n); n = G.congNgay(n, 1); } };
    (d.SuKien || []).forEach((s) => them(ngayCua(s['Bắt đầu']), 'sukien', '🎉 ' + s['Tên'], 'sukien'));
    (d.DuAnGiaiDoan || []).forEach((g) => moiNgay(g['Bắt đầu'], g['Hoàn thành'], (n) => them(n, 'duan', '🏗️ ' + g['Mã DA'] + ' · ' + g['Nội dung'], 'duan/' + g['Mã DA'])));
    (d.Phieu || []).filter((p) => p['Trạng thái'] !== 'Đã duyệt' && /Khẩn cấp|Cao/.test(p['Mức độ'])).forEach((p) => them(ngayCua(p['Hạn']), p['Mức độ'] === 'Khẩn cấp' ? 'khan' : 'cao', '🎫 ' + p['Loại lỗi'], 'phieu'));
    (d.KeHoachDinhKy || []).forEach((k) => moiNgay(k['Từ ngày'], k['Đến ngày'], (n) => them(n, 'dinhky', '✅ ' + G.dvTen(k['Mã việc']) + ' · ' + k['Cụm'], 'dinhky/' + k['Mã việc'])));
    (d.NhatKyPhunBon || []).filter((p) => +p['Cách ly dài nhất (ngày)'] > 0).forEach((p) => moiNgay(ngayCua(p['Ngày giờ']), p['Hết cách ly'], (n) => them(n, 'cachly', '⚠️ Cách ly ' + G.tenVT(p['Mã vị trí'], p['Vị trí chi tiết'] || p['Cụm']), 'phunbon')));
    for (let i = 1; i <= soNgay; i++) {
      const dd = new Date(y, mo - 1, i); const n = API.ngay(dd);
      (d.ViecLapLai || []).forEach((r) => { if (G.denHanLapLai(r, dd)) them(n, 'xam', '🔁 ' + r['Nội dung'], 'laplai'); });
      G.lichNoiBo(dd).forEach((x) => them(n, 'xam', '🔧 ' + x[1], 'nb/may'));
    }
    (S.dm.ngayle || []).forEach((l) => { const p = String(l.ngay).split('/'); if (p.length === 3) them(`${p[2]}-${p[1]}-${p[0]}`, 'xam', '🎌 ' + l.ten, 'lich'); });
    const batDauTuan = (new Date(y, mo - 1, 1).getDay() + 6) % 7;
    let o = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((t) => `<div class="th">${t}</div>`).join('');
    for (let i = 0; i < batDauTuan; i++) o += '<div class="ng ngoai"></div>';
    for (let i = 1; i <= soNgay; i++) { const n = `${st.thang}-${String(i).padStart(2, '0')}`; const x = su[n] || []; const loai = [...new Set(x.map((e) => e.loai))];
      o += `<div class="ng ${n === API.ngay() ? 'hn' : ''}" data-n="${n}" style="${n === st.chon ? 'background:var(--xanh-nhat)' : ''}"><div class="s">${i}</div>${loai.map((l) => `<span class="cham c-${l}"></span>`).join('')}${x.length > 3 ? `<div class="mo">${x.length}</div>` : ''}</div>`; }
    const chon = su[st.chon] || [];
    m.innerHTML = `<div class="hang" style="margin-bottom:8px"><button class="nut nho" id="tr">‹</button><b class="gian" style="text-align:center">Tháng ${mo}/${y}</b><button class="nut nho" id="sa">›</button></div>
      <div class="lich">${o}</div>
      <p class="mo" style="margin:8px 0"><span class="cham c-dinhky"></span>Định kỳ <span class="cham c-khan"></span>Khẩn cấp <span class="cham c-cao"></span>Cao <span class="cham c-duan"></span>Dự án <span class="cham c-sukien"></span>Sự kiện <span class="cham c-xam"></span>Bảo trì, lặp lại, lễ <span class="cham c-cachly"></span>Cách ly</p>
      <h3 style="font-size:14px">${G.thu(st.chon)}, ${G.ngayVN(st.chon)}</h3><div class="ds">${chon.map((e) => `<a class="muc" href="#/${e.link}" style="color:inherit;text-decoration:none"><span class="cham c-${e.loai}"></span><span class="gian">${esc(e.ten)}</span>›</a>`).join('') || '<div class="muc mo">Không có việc</div>'}</div>`;
    m.querySelector('#tr').onclick = () => { const t = new Date(y, mo - 2, 1); st.thang = API.ngay(t).slice(0, 7); G.taiLai(); };
    m.querySelector('#sa').onclick = () => { const t = new Date(y, mo, 1); st.thang = API.ngay(t).slice(0, 7); G.taiLai(); };
    m.querySelectorAll('[data-n]').forEach((x) => { x.onclick = () => { st.chon = x.dataset.n; G.taiLai(); }; });
  } };

  /* ================= TUẦN TRA ================= */
  G.man.tuantra = { ten: 'Tuần tra', bt: '🚶', nhom: 'Kiểm tra', ph: 'tuantra', fn: async () => {
    const m = G.khung('Tuần tra', 'Mỗi lỗi thành phiếu ngay');
    const d = await API.goi('docNhieu', { ds: [{ bang: 'TuanTra', gioiHan: 100 }, { bang: 'Phieu', gioiHan: 500 }] });
    const dang = d.TuanTra.find((x) => !x['Kết thúc'] && x['Người tuần tra'] === S.u.ten);
    const ghi = q('tuantra') >= 3;
    if (dang) {
      const loi = d.Phieu.filter((p) => p['Mã tuần tra'] === dang['Mã tuần tra']);
      m.innerHTML = `<div class="bang-viec"><div class="gian"><small>Đang tuần tra cùng</small><b>${esc(dang['Tổ trưởng đi cùng'])}</b><small>Từ ${esc(String(dang['Bắt đầu']).slice(11, 16))} · ${loi.length} lỗi</small></div></div>
        <button class="nut chinh rong" id="loi" style="min-height:64px;font-size:17px;margin-bottom:10px">📷 Ghi lỗi</button>
        <div class="ds">${loi.slice().reverse().map((p) => `<div class="muc"><div class="gian"><b>${esc(p['Loại lỗi'])}</b><div class="mo">${esc(G.tenVT(p['Mã vị trí'], p['Vị trí khác']))}</div></div><span class="chip ${G.MAU_MUC[p['Mức độ']]}">${esc(p['Mức độ'])}</span></div>`).join('') || '<div class="muc mo">Chưa ghi lỗi</div>'}</div>
        <button class="nut rong" id="kt">Kết thúc tuần tra</button>`;
      const doi = (S.dm.nguoi.find((n) => n.ten === dang['Tổ trưởng đi cùng']) || {}).doi || dang['Tổ trưởng đi cùng'];
      m.querySelector('#loi').onclick = () => G.taoPhieu({ tieuDe: 'Ghi lỗi tuần tra', nguon: 'Tuần tra', giao: doi, maTT: dang['Mã tuần tra'], sau: () => G.taiLai() });
      m.querySelector('#kt').onclick = () => chay(async () => { await API.goi('sua', { bang: 'TuanTra', khoa: { 'Mã tuần tra': dang['Mã tuần tra'] }, doi: { 'Kết thúc': API.bayGio(), 'Số lỗi': loi.length } }); bao(`Kết thúc · ${loi.length} lỗi đã thành phiếu, tổ trưởng nhận trong mục Phiếu`); G.taiLai(); });
      return;
    }
    m.innerHTML = (ghi ? '<button class="nut chinh rong" id="bd" style="min-height:60px;margin-bottom:12px">▶ Bắt đầu tuần tra</button>' : '<p class="mo">Lỗi tuần tra được giao cho đội anh/chị trong mục Phiếu. Bấm "Nhận việc" từng phiếu.</p>')
      + `<div class="ds">${d.TuanTra.slice().reverse().map((t) => { const loi = d.Phieu.filter((p) => p['Mã tuần tra'] === t['Mã tuần tra']); const nhan = loi.filter((p) => p['Người nhận']).length; return `<div class="muc"><div class="gian"><b>${G.gioVN(t['Bắt đầu'])}</b> · ${esc(t['Tổ trưởng đi cùng'])}<div class="mo">${loi.length} lỗi · ${nhan}/${loi.length} đã nhận · ${loi.filter((p) => p['Trạng thái'] === 'Đã duyệt').length} xong</div></div>${loi.length && nhan === loi.length ? '<span class="chip xanh">Đã nhận hết</span>' : ''}</div>`; }).join('') || '<div class="muc mo">Chưa có lần tuần tra</div>'}</div>`;
    const bd = m.querySelector('#bd');
    if (bd) bd.onclick = async () => { const t = await G.chonDS('Tổ trưởng đi cùng', S.dm.nguoi.filter((n) => n.nhom === 'Tổ trưởng').map((n) => ({ ten: n.ten, phu: n.doi }))); if (!t) return;
      chay(async () => { await API.goi('ghi', { bang: 'TuanTra', dong: { 'Mã tuần tra': '', 'Bắt đầu': API.bayGio(), 'Kết thúc': '', 'Người tuần tra': '', 'Tổ trưởng đi cùng': t.ten, 'Số lỗi': 0, 'Đã nhận hết': '' } }); G.taiLai(); }); };
  } };

  /* ================= CHẤM ĐIỂM CHẤT LƯỢNG ================= */
  G.man.chamdiem = { ten: 'Chấm điểm chất lượng', bt: '⭐', nhom: 'Kiểm tra', ph: 'homnay', cap: 3, fn: async () => {
    const k = S.dm.ky; const m = G.khung('Chấm điểm chất lượng', `Kỳ ${k.ten} · ~10 vị trí/tuần`);
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'ChamDiem', loc: { 'Ngày': { tu: k.tu } } }] })).ChamDiem;
    const tb = ds.length ? ds.reduce((a, r) => a + +r['Điểm (1–5)'], 0) / ds.length : 0;
    const theoTC = {}; ds.forEach((r) => { (theoTC[r['Tiêu chí']] = theoTC[r['Tiêu chí']] || []).push(+r['Điểm (1–5)']); });
    m.innerHTML = `<div class="the"><div class="so-lon">${ds.length ? G.so(tb, 2) : '—'}<small style="font-size:14px">/5</small></div><div class="mo">${new Set(ds.map((r) => r['Ngày'] + r['Mã vị trí'])).size} lượt kiểm tra trong kỳ</div>
      ${Object.keys(theoTC).map((t) => `<div class="mo">${esc(t)}: <b>${G.so(theoTC[t].reduce((a, b) => a + b, 0) / theoTC[t].length, 2)}</b></div>`).join('')}</div>
      <button class="nut chinh rong" id="boc" style="margin-bottom:12px">🎲 Bốc ngẫu nhiên 10 vị trí để kiểm tra</button>
      <div class="ds">${ds.slice().reverse().slice(0, 60).map((r) => `<div class="muc"><div class="gian">${esc(G.tenVT(r['Mã vị trí']))}<div class="mo">${G.ngayVN(r['Ngày'])} · ${esc(r['Tiêu chí'])}${r['Ghi chú'] ? ' · ' + esc(r['Ghi chú']) : ''}</div></div><b>${esc(r['Điểm (1–5)'])}</b></div>`).join('')}</div>`;
    m.querySelector('#boc').onclick = () => {
      const vt = S.dm.vitri.filter((v) => v.ap === 'Có').sort(() => Math.random() - 0.5).slice(0, 10);
      hop('Kiểm tra ngẫu nhiên', `<p class="mo">Chấm 1–5 từng tiêu chí. Bỏ trống tiêu chí không áp dụng.</p>${vt.map((v, i) => `<div class="the" style="padding:10px"><b>${i + 1}. ${esc(v.ten)}</b> <span class="mo">${esc(v.kv)}</span>${S.dm.tieuChi.map((t, j) => `<div style="margin-top:8px"><div class="mo">${esc(t.ten)}</div><div class="sao" data-v="${i}" data-t="${j}">${[1, 2, 3, 4, 5].map((s) => `<button type="button" data-s="${s}">${s}</button>`).join('')}</div></div>`).join('')}<input type="text" placeholder="Ghi chú" data-gc="${i}" style="margin-top:8px"></div>`).join('')}<button class="nut chinh rong" id="l">Lưu điểm</button>`, (o, dong) => {
        const diem = {};
        o.querySelectorAll('.sao').forEach((s) => s.querySelectorAll('[data-s]').forEach((b) => { b.onclick = () => { diem[s.dataset.v + '|' + s.dataset.t] = b.dataset.s; s.querySelectorAll('button').forEach((x) => x.classList.toggle('dang', x === b)); }; }));
        o.querySelector('#l').onclick = (e) => chay(async () => { const rows = Object.keys(diem).map((k) => { const [i, j] = k.split('|'); return { 'Ngày': '', 'Mã vị trí': vt[+i].ma, 'Tiêu chí': S.dm.tieuChi[+j].ten, 'Điểm (1–5)': diem[k], 'Ảnh': '', 'Ghi chú': o.querySelector(`[data-gc="${i}"]`).value, 'Người chấm': '' }; }); if (!rows.length) throw new Error('Chưa chấm điểm nào'); await API.goi('ghiNhieu', { bang: 'ChamDiem', dong: rows }); dong(); bao('Đã lưu ' + rows.length + ' điểm'); G.taiLai(); }, e.target);
      }, true);
    };
  } };

  /* ================= MÙA MƯA BÃO ================= */
  G.man.bao = { ten: 'Mùa mưa bão', bt: '🌀', nhom: 'Kiểm tra', ph: 'homnay', cap: 3, fn: async () => {
    const m = G.khung('Mùa mưa bão', 'Kiểm tra trước bão · cảnh báo · thiệt hại');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'CanhBaoBao' }] })).CanhBaoBao;
    const dang = ds.find((x) => !x['Kết thúc']);
    m.innerHTML = (dang ? `<div class="canh-bao do"><b>🌀 Đang cảnh báo bão</b> từ ${G.gioVN(dang['Kích hoạt lúc'])}<br>${esc(dang['Ghi chú'])}</div><button class="nut rong" id="kt" style="margin-bottom:10px">Kết thúc cảnh báo</button>`
      : '<button class="nut do rong" id="kh" style="min-height:60px;margin-bottom:10px">🌀 Kích hoạt cảnh báo bão</button>')
      + `<div class="the"><h2>Danh sách kiểm tra trước bão</h2>${S.dm.kiemTraBao.map((x) => `<div class="mo">☐ ${esc(x)}</div>`).join('')}<p class="mo">Kích hoạt sẽ giao mỗi việc trên thành một phiếu mức Cao cho cả hai đội.</p></div>
      <button class="nut chinh rong" id="th">＋ Phiếu đánh giá thiệt hại sau bão</button>
      <h3 style="font-size:14px">Lịch sử</h3><div class="ds">${ds.slice().reverse().map((x) => `<div class="muc"><div class="gian">${G.gioVN(x['Kích hoạt lúc'])} → ${x['Kết thúc'] ? G.gioVN(x['Kết thúc']) : 'đang'}<div class="mo">${esc(x['Ghi chú'])}</div></div></div>`).join('') || '<div class="muc mo">Chưa có</div>'}</div>`;
    const kh = m.querySelector('#kh');
    if (kh) kh.onclick = async () => { const g = await G.hoi('Ghi chú (tên bão, dự báo)'); if (g === null) return; chay(async () => {
      const b = await API.goi('ghi', { bang: 'CanhBaoBao', dong: { 'Mã đợt': '', 'Kích hoạt lúc': '', 'Người kích hoạt': '', 'Ghi chú': g, 'Kết thúc': '' } });
      for (const v of S.dm.kiemTraBao) for (const doi of ['Đội cơ động', 'Đội khu vực']) await API.goi('phieu.tao', { loai: v, nhom: 'Mùa mưa bão', muc: 'Cao', vtKhac: 'Toàn khu ' + doi, giao: doi, nguon: 'Bộ phận khác', moTa: 'Cảnh báo bão ' + b['Mã đợt'] + (g ? ': ' + g : '') });
      bao('Đã kích hoạt, giao ' + S.dm.kiemTraBao.length * 2 + ' phiếu'); G.taiLai(); }); };
    const kt = m.querySelector('#kt'); if (kt) kt.onclick = () => chay(async () => { await API.goi('sua', { bang: 'CanhBaoBao', khoa: { 'Mã đợt': dang['Mã đợt'] }, doi: { 'Kết thúc': API.bayGio() } }); G.taiLai(); });
    m.querySelector('#th').onclick = () => G.taoPhieu({ tieuDe: 'Đánh giá thiệt hại sau bão', muc: 'Cao', nguon: 'Bộ phận khác', sau: () => (location.hash = '#/phieu') });
  } };
})();
