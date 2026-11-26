/* GreenLog 0.4.7 · mục 113–115, 126: Mầm – trợ lý GreenLog
   113 hiểu toàn bộ nội dung app: mỗi chủ đề trả lời 4 kiểu câu (còn chỗ nào chưa làm · lần cuối · bao nhiêu · làm ở đâu, thế nào),
       chưa rõ ý thì HỎI LẠI kèm nút chọn, không từ chối câu hỏi công việc; Gemini chỉ cho câu NGOÀI app
   114 tên "Mầm" · 115 chạm Mầm rồi nói, Mầm đọc to câu trả lời; công tắc "Gọi Mầm ơi" (mặc định tắt, chỉ khi mở app, tự tắt sau 2 phút)
   126 giọng đọc tiếng Việt tự nhiên tốt nhất có trên máy, chọn giọng nam / nữ; không có giọng Việt thì chỉ hiện chữ */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hn = () => API.ngay(); const gio = () => API.bayGio().slice(11, 16);
  const num = (v) => +String(v == null ? '' : v).replace(',', '.') || 0;
  const so = (n, k) => G.so(Math.round((+n || 0) * 10) / 10, k == null ? 1 : k);
  const laAnh = () => G.laAnhVu && G.laAnhVu(); const laNB = () => S.u && S.u.nhom === 'Nhân viên nội bộ'; const laPhap = () => S.u && S.u.nhom === 'Quản lý nhà thầu';
  const ngan0 = (t) => String(t || '').split(' ').pop();
  const ngan = (t) => (((S.dm && S.dm.nguoi) || []).some((n) => n.ten === t && n.nhom === 'Trưởng bộ phận') ? 'Trưởng bộ phận' : ngan0(t));
  const T = () => G._tim || {}; const bo = (s) => (T().bo ? T().bo(s) : String(s || '').toLowerCase());
  const en = () => G.lang && G.lang() === 'en';
  const TEN = 'Mầm';
  const TT_DD = 'Trạng thái (Có mặt/Vắng/Về sớm)';
  const ngayTu = (d) => Math.round((new Date(hn()) - new Date(String(d).slice(0, 10))) / 864e5);
  const ngayVN5 = (d) => G.ngayVN(String(d).slice(0, 10)).slice(0, 5);

  /* ------------------------------------------------------------------ chủ đề trong app ------------------------------------------------------------------ */
  const diemK = (l) => (S.dm.diemkhac || []).filter((x) => x.loai === l);
  const dsDK = (ma, ten, kw) => ({ k: 'dk:' + ma, ten, kw, ma, xem: () => q('dinhky') >= 1, link: 'dinhky/' + ma, bc: 'dinhky',
    chua: async () => { const vt = G.dsVT(ma); const t = await G.doc('TickDinhKy', { 'Kỳ': S.dm.ky.ten, 'Mã việc': ma }).catch(() => []); const dang = await G.doc('TickDinhKy', { 'Mã việc': ma, 'Trạng thái': 'Đang làm' }).catch(() => []);
      const xong = new Set(t.filter((r) => (r['Trạng thái'] || 'Xong') === 'Xong').map((r) => r['Mã vị trí'])); const dg = new Set(dang.map((r) => r['Mã vị trí']));
      const con = vt.filter((v) => !xong.has(v.ma)); const conCum = {}; con.forEach((v) => { (conCum[v.cum] = conCum[v.cum] || []).push(v); });
      if (!con.length) return { chu: `${ten}: đã xong cả ${vt.length} vị trí trong kỳ ${S.dm.ky.ten}. 👍`, nut: [['Mở ' + ten, '#/' + 'dinhky/' + ma]] };
      return { chu: `${ten} · kỳ ${S.dm.ky.ten}: còn ${con.length}/${vt.length} vị trí chưa xong${dg.size ? `, trong đó ${dg.size} đang làm` : ''}.`,
        dong: Object.entries(conCum).slice(0, 10).map(([c, r]) => `${c}: ${r.length === vt.filter((v) => v.cum === c).length ? 'cả cụm' : r.slice(0, 6).map((v) => (G.laVilla && G.laVilla(v) ? v.kv + ' ' + (G.mat ? G.mat(v.ten) : '') : v.ten)).join(', ') + (r.length > 6 ? '…' : '')}${r.some((v) => dg.has(v.ma)) ? ' (có chỗ đang làm)' : ''}`), nut: [['Mở ' + ten, '#/dinhky/' + ma]] }; },
    lanCuoi: async (cau) => lanCuoiTick(ma, ten, cau) });
  const lanCuoiTick = async (ma, ten, cau) => { const t = (await G.doc('TickDinhKy', { 'Mã việc': ma }).catch(() => [])).filter((r) => (r['Trạng thái'] || 'Xong') === 'Xong');
    const vt = viTriTrongCau(cau); const r = vt.length ? t.filter((x) => vt.includes(x['Mã vị trí'])) : t; const c = r.sort((a, b) => ((a['Ngày xong'] || a['Ngày']) < (b['Ngày xong'] || b['Ngày']) ? 1 : -1))[0];
    if (!c) return { chu: `Chưa có lần ${ten.toLowerCase()} nào${vt.length ? ' ở ' + G.tenVT(vt[0]) : ''} được ghi.` };
    const kvs = [...new Set(vt.map((v) => (G.vt(v) || {}).kv).filter(Boolean))];
    return { chu: `${ten} lần gần nhất${vt.length ? ' ở ' + (kvs.length === 1 ? kvs[0] : G.tenVT(vt.join('|'))) : ''}: ${G.ngayVN(c['Ngày xong'] || c['Ngày'])} (${ngayTu(c['Ngày xong'] || c['Ngày'])} ngày trước) · ${ngan(c['Người tick'])}${c['Số ngày'] > 1 ? ' · làm ' + c['Số ngày'] + ' ngày' : ''}.`, anh: c['Ảnh'] }; };
  const viTriTrongCau = (cau) => { const t = ' ' + (T().moRong ? T().moRong(cau) : bo(cau)) + ' '; const so_ = (t.match(/ villa (\d{1,2}) /) || [])[1];
    if (so_) return (S.dm.vitri || []).filter((v) => v.kv === 'Villa ' + +so_).map((v) => v.ma);
    const kv = [...new Set((S.dm.vitri || []).map((v) => v.kv || v.ten))].filter((k) => k && bo(k).length > 3 && t.includes(' ' + bo(k) + ' '));
    return kv.length ? (S.dm.vitri || []).filter((v) => kv.includes(v.kv || v.ten)).map((v) => v.ma) : []; };

  const CD = [
    { k: 'noithat', ten: 'Cây nội thất', kw: 'cay noi that cay trong nha cay chau cay sanh lobby residences indoor plant tuoi cay noi that', xem: () => q('noibo') >= 1 || laAnh(), link: 'nb/noithat', bc: 'nb/noithat', ai: 'Hiệp',
      chua: async () => { const p = diemK('Cây nội thất'); const d = await G.doc('CayNoiThat', { 'Ngày': { tu: G.congNgay(hn(), -30) } }).catch(() => []);
        const cuoi = {}; d.forEach((r) => { if (/Tưới/.test(r['Việc'] || 'Tưới nước') && (!cuoi[r['Mã điểm']] || r['Ngày'] > cuoi[r['Mã điểm']])) cuoi[r['Mã điểm']] = r['Ngày']; });
        const den = p.filter((x) => !cuoi[x.ma] || ngayTu(cuoi[x.ma]) >= 2); const homNay = p.filter((x) => cuoi[x.ma] === hn());
        if (!den.length) return { chu: `Cây nội thất: cả ${p.length} điểm đều đã tưới đúng lịch (2 ngày/lần). Hôm nay đã tưới ${homNay.length} điểm.`, nut: [['🪴 Mở Cây nội thất', '#/nb/noithat']] };
        return { chu: `Cây nội thất còn ${den.length}/${p.length} điểm đến hạn tưới (lịch 2 ngày/lần)${laNB() && ngan(S.u.ten) !== 'Hiệp' ? ' · việc này Hiệp phụ trách' : ''}:`, dong: den.map((x) => `◯ ${x.ten} · ${cuoi[x.ma] ? 'tưới lần cuối ' + ngayVN5(cuoi[x.ma]) + ' (' + ngayTu(cuoi[x.ma]) + ' ngày)' : 'chưa tưới trong 30 ngày'}`), nut: [['🪴 Mở Cây nội thất để ghi', '#/nb/noithat']] }; },
      lanCuoi: async () => { const d = (await G.doc('CayNoiThat', { 'Ngày': { tu: G.congNgay(hn(), -60) } }).catch(() => [])).sort((a, b) => (a['Ngày'] < b['Ngày'] ? 1 : -1)); const r = d[0]; if (!r) return { chu: 'Chưa có ghi chép cây nội thất.' };
        return { chu: `Lần ghi gần nhất: ${G.ngayVN(r['Ngày'])} · ${(diemK('Cây nội thất').find((p) => p.ma === r['Mã điểm']) || {}).ten || r['Mã điểm']} · ${r['Việc'] || 'Tưới nước'}${r['Số chậu tưới'] ? ' ' + r['Số chậu tưới'] + ' chậu' : ''} · ${ngan(r['Người ghi'])}.` }; } },
    { k: 'tuoi', ten: 'Tưới nước sân vườn', kw: 'tuoi nuoc tuoi san vuon tuoi cay chua tuoi watering', xem: () => q('dinhky') >= 1, link: 'tuoi', bc: 'tuoi',
      chua: async () => { const vt = (S.dm.vitri || []).filter((v) => v.ap === 'Có'); const t = await G.doc('Tuoi', { 'Ngày': hn() }).catch(() => []); const mua = t.some((r) => r['Hôm nay mưa'] === 'Có');
        if (mua) return { chu: '☔ Hôm nay đã bấm trời mưa, không cần tưới.' }; const da = new Set(t.map((r) => r['Mã vị trí'])); const con = vt.filter((v) => !da.has(v.ma)); const cum = {}; con.forEach((v) => { cum[v.cum] = (cum[v.cum] || 0) + 1; });
        return con.length ? { chu: `Hôm nay còn ${con.length}/${vt.length} vị trí chưa ghi tưới:`, dong: Object.entries(cum).map(([c, n]) => `${c}: ${n} vị trí`), nut: [['💧 Mở Tưới nước', '#/tuoi']] } : { chu: `Đã ghi tưới đủ ${vt.length} vị trí hôm nay.` }; } },
    { k: 'vesinh', ten: 'Vệ sinh theo cụm', kw: 've sinh thu gom rac san vuon loi di quet don', xem: () => q('dinhky') >= 1, link: 'cum/DV10', bc: 'cum/DV10', chua: async () => chuaCum('DV10', 'Vệ sinh') },
    { k: 'nhoco', ten: 'Nhổ cỏ dại', kw: 'nho co co dai weeding', xem: () => q('dinhky') >= 1, link: 'cum/DV11', bc: 'cum/DV11', chua: async () => chuaCum('DV11', 'Nhổ cỏ dại') },
    dsDK('DV01', 'Cắt cỏ thảm', 'cat co thao co may cat co mowing'), dsDK('DV02', 'Bón phân cỏ', 'bon phan co phan co'), dsDK('DV03', 'Bón phân cây bụi', 'bon phan cay bui phan bui'),
    dsDK('DV04', 'Phun thuốc cỏ', 'phun thuoc co xit co'), dsDK('DV05', 'Phun thuốc cây bụi', 'phun thuoc cay bui xit bui'), dsDK('DV06', 'Phun thuốc cây bóng mát', 'phun thuoc cay bong mat cay lon'),
    dsDK('DV07', 'Cắt tỉa cây bóng mát', 'tia cay bong mat cat tia cay lon cay to'), dsDK('DV08', 'Cắt tỉa cây bụi', 'tia cay bui cat tia bui xen bui'), dsDK('DV37', 'Cắt tỉa hàng rào, hàng viền', 'hang rao hang vien tia rao'), dsDK('DV38', 'Bón phân cây thủy sinh', 'thuy sinh ho thuy sinh ca canh'),
    { k: 'vuonrau', ten: 'Vị Garden', kw: 'vuon rau vi garden rau checklist ph ppm', xem: () => q('noibo') >= 1 || laAnh(), link: 'nb/vuonrau', bc: 'nb/vuonrau', ai: 'Nghị',
      chua: async () => { const p = diemK('Vườn rau'); const d = await G.doc('VuonRau', { 'Ngày': hn() }).catch(() => []); const da = new Set(d.map((r) => r['Mã vườn'] || r['Mã điểm'] || r['Vườn']));
        const con = p.filter((x) => !da.has(x.ma) && !da.has(x.ten)); return con.length ? { chu: `Vị Garden hôm nay còn ${con.length}/${p.length} vườn chưa ghi checklist:`, dong: con.map((x) => '◯ ' + x.ten), nut: [['🥬 Mở Vị Garden', '#/nb/vuonrau']] } : { chu: `Đã ghi đủ ${p.length} vườn hôm nay.` }; } },
    { k: 'thuhoach', ten: 'Thu hoạch Vị Garden', kw: 'thu hoach hai rau giao bep harvest', xem: () => q('noibo') >= 1 || laAnh(), link: 'nb/thuhoach', bc: 'nb/thuhoach' },
    { k: 'rac', ten: 'Thu gom rác hữu cơ', kw: 'rac huu co rac bep rau cu compost vo trai cay ba ca phe thu gom rac', xem: () => q('noibo') >= 1 || laAnh(), link: 'nb/rac', bc: 'nb/rac', ai: 'Nghị',
      chua: async () => { const d = await G.doc('RacHuuCo', { 'Ngày': hn() }).catch(() => []); const kg = d.reduce((a, r) => a + num(r['kg rác thu gom']), 0);
        return d.length ? { chu: `Hôm nay đã thu gom ${so(kg)} kg rác hữu cơ (${d.length} lần ghi).` } : { chu: 'Hôm nay chưa ghi thu gom rác hữu cơ.', nut: [['♻️ Ghi thu gom', '#/nb/rac']] }; } },
    { k: 'bien', ten: 'Vệ sinh bãi biển', kw: 'bai bien rac bien ve sinh bien beach', xem: () => q('noibo') >= 1 || laAnh() || q('dinhky') >= 1, link: 'nb/bien', bc: 'nb/bien',
      chua: async () => { const [d, gv] = await Promise.all([G.doc('VeSinhBien', { 'Ngày': hn() }).catch(() => []), G.doc('GiaoViecNgay', { 'Ngày': hn(), 'Đội': 'Đội cơ động' }).catch(() => [])]); const cd = gv.find((g) => /bãi biển/i.test(g['Nội dung']));
        const dong = []; if (q('noibo') >= 1 || laAnh()) dong.push(d.length ? `Nội bộ: đã ghi ${so(d.reduce((a, r) => a + num(r['kg rác']), 0))} kg rác` : 'Nội bộ: chưa ghi vệ sinh bãi biển hôm nay'); if (cd) dong.push(`Đội cơ động hỗ trợ đầu ca: ${cd['Trạng thái']}`);
        return { chu: 'Bãi biển hôm nay:', dong, nut: (q('noibo') >= 1 ? [['🏖 Mở Vệ sinh bãi biển', '#/nb/bien']] : []) }; } },
    { k: 'maysang', ten: 'Máy sàng cát', kw: 'may sang cat sand man barber sang cat bao tri may sang', xem: () => q('noibo') >= 1 || laAnh(), link: 'kho/may', bc: 'nb/may', chua: async (c) => CD.find((x) => x.k === 'baotri').chua(c) },
    { k: 'kubota', ten: 'Máy Kubota', kw: 'kubota may cay xe cay may keo', xem: () => true, link: 'nb/may', bc: 'kubota', chua: async () => { const kl = await G.doc('KubotaLuot', { 'Ngày': hn() }).catch(() => []); const x = kl.find((r) => r['Giờ nhận'] && !r['Giờ trả']);
      return { chu: x ? `Kubota đang được ${ngan(x['Người'])} dùng từ ${String(x['Giờ nhận']).slice(0, 5)}.` : 'Kubota đang rảnh, chưa ai nhận máy.', nut: [['🚜 Mở Kubota', '#/nb/may']] }; } },
    { k: 'kho', ten: 'Kho vật tư', kw: 'kho vat tu xuat kho nhap kho sap het het hang phan trong kho', xem: () => q('noibo') >= 1 || laAnh(), link: 'kho/vattu', bc: 'kho/xuatnhap',
      chua: async () => { const ds = await G.khoTon(); const r = ds.filter((x) => x.tt[0] !== 'xanh'); return r.length ? { chu: `Kho có ${r.length} món sắp hết, đã hết:`, dong: r.map((x) => `${x.tt[1].slice(0, 2)} ${x.v['Tên']}: còn ${so(x.t)} ${x.v['ĐVT']}`), nut: [['📦 Mở Vật tư', '#/kho/vattu']] } : { chu: 'Kho đang đủ, chưa món nào sắp hết.' }; } },
    { k: 'dungcu', ten: 'Dụng cụ', kw: 'dung cu do nghe keo cuoc xeng thang xe rua cap phat kiem tra dung cu muon tra', xem: () => q('noibo') >= 1 || laAnh(), link: 'kho/dungcu', bc: 'kho/dungcu',
      chua: async () => { const [kt, mu, dc] = await Promise.all([G.doc('KiemTraDC', { 'Tháng': hn().slice(0, 7) }).catch(() => []), G.doc('DungCuMuon').catch(() => []), G.doc('DungCu').catch(() => [])]);
        const dong = kt.filter((x) => x['Trạng thái'] !== 'Đã nộp').map((x) => `🧰 ${ngan(x['Người'])} chưa gửi kiểm tra lần ${x['Lần']} (giao ${ngayVN5(x['Ngày giao'])})`)
          .concat(mu.filter((x) => !x['Giờ trả']).map((x) => `🔴 ${x['Tên']} · ${ngan(x['Người'])} mượn từ ${String(x['Giờ mượn']).slice(11, 16)} chưa trả`))
          .concat(dc.filter((x) => /^Báo/.test(x['Trạng thái'] || '')).map((x) => `⚠ ${x['Tên']} · ${x['Trạng thái']} · ${ngan(x['Người giữ'])}`));
        return dong.length ? { chu: 'Dụng cụ cần chú ý:', dong, nut: [['🧰 Mở Dụng cụ', '#/kho/dungcu']] } : { chu: 'Dụng cụ ổn: không ai nợ kiểm tra, không món nào đang mượn quá giờ hay báo hỏng.' }; } },
    { k: 'baotri', ten: 'Bảo trì máy', kw: 'bao tri may moc gio may moc bao tri thay nhot loc gio bugi', xem: () => q('noibo') >= 1 || laAnh(), link: 'kho/may', bc: 'kho/baotri',
      chua: async () => { await G.ktBaoTri(); const ph = await G.doc('BaoTriPH').catch(() => []); const g = await G.gioMayTong(); const r = ph.filter((x) => /Chờ phát hành|Đã phát hành/.test(x['Trạng thái']));
        const dong = r.map((x) => `🔧 ${x['Máy']} · ${x['Mốc']} · ${x['Trạng thái'] === 'Chờ phát hành' ? 'chờ Trưởng bộ phận phát hành' : 'đã giao ' + ngan(x['Giao cho'])}`).concat((T().MAY || []).map((m) => { const t = T().tiepTheo(m, g[m.ma] || 0, ph); return `${m.ten}: ${so(g[m.ma])} giờ${t ? ' · ' + t.c.ten + ' còn ' + so(t.con) + ' giờ' : ''}`; }));
        return { chu: r.length ? `${r.length} việc bảo trì đang mở:` : 'Không có bảo trì nào đang chờ. Giờ máy:', dong, nut: [['🚜 Mở Máy móc', '#/kho/may']] }; } },
    { k: 'phieu', ten: 'Phiếu giao việc', kw: 'phieu phieu giao viec loi canh quan ticket qua han', xem: () => q('phieu') >= 1, link: 'phieu', bc: 'phieu',
      chua: async () => { const p = (await G.doc('Phieu', {}, 2000).catch(() => [])).filter((x) => !/Đã duyệt|Báo xong/.test(x['Trạng thái']) && (laAnh() || laPhap() || x['Giao cho'] === S.u.doi || x['Giao cho'] === S.u.ten || (laNB() && /Nội bộ|Hiệp|Nghị/.test(x['Giao cho'] || ''))));
        const tre = p.filter((x) => x['Hạn'] && String(x['Hạn']) < API.bayGio().slice(0, 16));
        return p.length ? { chu: `Còn ${p.length} phiếu chưa xong${tre.length ? `, ${tre.length} phiếu quá hạn` : ''}:`, dong: p.slice(0, 10).map((x) => `${tre.includes(x) ? '⏰' : '◯'} ${x['Mô tả'] || x['Loại lỗi']} · ${G.tenVT(x['Mã vị trí'], x['Vị trí khác'])} · ${x['Giao cho'] || ''} · ${x['Trạng thái']}`), nut: [['📋 Mở Phiếu', '#/phieu']] } : { chu: 'Không còn phiếu nào đang mở.' }; } },
    { k: 'diemdanh', ten: 'Điểm danh', kw: 'diem danh co mat vang nghi ai nghi cong anh tap the', xem: () => q('diemdanh') >= 1 || laAnh(), link: 'diemdanh', bc: 'diemdanh',
      chua: async () => { const [dc, dd] = await Promise.all([G.doc('DuyetCong', { 'Ngày': hn() }).catch(() => []), G.doc('DiemDanh', { 'Ngày': hn() }).catch(() => [])]); const buoi = gio() >= '13:00' ? 'Chiều' : 'Sáng';
        const dong = ['Đội cơ động', 'Đội khu vực', 'Quản lý nhà thầu'].map((d) => { const x = dc.find((r) => r['Đội'] === d && r['Buổi'] === buoi); return `${d === 'Quản lý nhà thầu' ? 'Quản lý' : d}: ${x ? (x['Khóa'] === 'Có' ? '✓ đã duyệt' : '◐ đã gửi, chờ duyệt') : '◯ chưa điểm danh'} buổi ${buoi.toLowerCase()}`; });
        const vang = dd.filter((r) => /Vắng/.test(r[TT_DD] || '')); if (vang.length) dong.push('Vắng: ' + vang.map((r) => ngan(r['Họ tên'])).join(', '));
        const nghi = await G.nghiNB().catch(() => []); if (laAnh() || laNB()) dong.push(nghi.length ? 'Nội bộ nghỉ: ' + nghi.map(ngan).join(', ') : 'Nội bộ: đủ người');
        return { chu: 'Điểm danh hôm nay:', dong, nut: [['📝 Mở Điểm danh', '#/diemdanh']] }; } },
    { k: 'kehoach', ten: 'Kế hoạch ngày, chốt ngày', kw: 'bat dau ngay ke hoach ngay giao viec chot ngay ket thuc ca bao cao cuoi ngay', xem: () => true, link: laNB() ? 'ketthucca' : 'batdaungay', bc: 'ngay/kehoach',
      chua: async () => { const n = await G.doc('NgayLamViec', { 'Ngày': hn() }).catch(() => []); const dong = ['Đội cơ động', 'Đội khu vực'].map((d) => { const b = n.find((r) => r['Đội'] === d && r['Loại'] === 'Bắt đầu ngày'); const c = n.find((r) => r['Đội'] === d && r['Loại'] === 'Chốt ngày');
          return `${d}: ${b ? '✓ gửi kế hoạch ' + String(b['Giờ']).slice(11, 16) : '◯ chưa gửi kế hoạch'} · ${c ? '✓ đã chốt ' + String(c['Giờ']).slice(11, 16) : '◯ chưa chốt ngày'}`; });
        if (laAnh() || laNB()) nb2().forEach((t) => { const k = n.find((r) => r['Loại'] === 'Kết thúc ca' && r['Người'] === t); dong.push(`${ngan(t)}: ${k ? '✓ kết thúc ca ' + String(k['Giờ']).slice(11, 16) : '◯ chưa kết thúc ca'}`); });
        return { chu: 'Báo cáo đầu ca, cuối ngày:', dong }; } },
    { k: 'viechomnay', ten: 'Việc hôm nay', kw: 'viec hom nay con viec gi viec chua xong viec con lai lam gi hom nay', xem: () => true, link: '',
      chua: async () => { if (laNB()) { const ds = (await G.viecNoiBo(hn())).filter((x) => x.tt !== 'xong'); return ds.length ? { chu: `Hôm nay còn ${ds.length} việc chưa xong:`, dong: ds.map((x) => '◯ ' + x.ten + (x.phu ? ' · ' + x.phu : '')), nut: [['Mở Hôm nay', '#/']] } : { chu: 'Hôm nay xong hết việc rồi. 👍' }; }
        const gv = (await G.doc('GiaoViecNgay', { 'Ngày': hn() }).catch(() => [])).filter((g) => laAnh() || laPhap() || g['Đội'] === S.u.doi); const con = gv.filter((g) => g['Trạng thái'] !== 'Xong');
        const ch = G.dsChuong ? await G.dsChuong() : []; const dong = con.map((g) => `◯ ${g['Đội'] && (laAnh() || laPhap()) ? g['Đội'].replace('Đội ', '') + ': ' : ''}${g['Nội dung']}${g['Vị trí'] ? ' · ' + g['Vị trí'] : ''}${g['Trạng thái'] === 'Làm một phần' ? ' (đang làm dở)' : ''}`).concat(ch.slice(0, 6).map((x) => '• ' + x.ten));
        return dong.length ? { chu: (gv.length ? `Hôm nay còn ${con.length}/${gv.length} việc giao chưa xong` : 'Hôm nay chưa có việc giao trong kế hoạch ngày') + (ch.length ? `, ${ch.length} việc cần chú ý` : '') + ':', dong, nut: [['Mở Hôm nay', '#/']] } : { chu: gv.length ? `Đã xong cả ${gv.length} việc giao hôm nay. 👍` : 'Hôm nay chưa có việc nào được giao.' }; } },
    { k: 'dichhai', ten: 'Dịch hại', kw: 'dich hai sau benh rep nam benh cay ho so dich hai', xem: () => q('phunbon') >= 1 || laAnh(), link: 'dichhai', bc: 'dichhai',
      chua: async () => { const d = (await G.doc('DichHai', {}, 1000).catch(() => [])).filter((r) => !/Đóng|Hết/.test(r['Trạng thái'] || '')); return d.length ? { chu: `${d.length} hồ sơ dịch hại đang mở:`, dong: d.slice(0, 8).map((r) => `🐛 ${r['Dịch hại'] || r['Tên dịch hại']} · ${G.tenVT(r['Mã vị trí'], r['Vị trí khác'])} · ${r['Trạng thái']}`), nut: [['Mở Dịch hại', '#/dichhai']] } : { chu: 'Không có hồ sơ dịch hại nào đang mở.' }; } },
    { k: 'phunbon', ten: 'Nhật ký phun, bón', kw: 'nhat ky phun bon phun thuoc bon phan phan bon thuoc bao nhieu kg phan', xem: () => q('phunbon') >= 1 || laAnh(), link: 'phunbon', bc: 'bongoc' },
    { k: 'vuonuom', ten: 'Vườn ươm', kw: 'vuon uom uom cay cay giong nhan giong', xem: () => true, link: laNB() ? 'nb/vuonuomnt' : 'vuonuom', bc: laNB() ? 'nb/vuonuomnt' : 'vuonuom' },
    { k: 'vanchuyen', ten: 'Vận chuyển', kw: 'van chuyen chuyen rac cat tia xe cho', xem: () => q('dinhky') >= 1 || laAnh(), link: 'vanchuyen', bc: 'vanchuyen' },
    { k: 'trongcay', ten: 'Trồng cây, trồng dặm', kw: 'trong cay trong dam so trong cay cay moi', xem: () => true, link: 'sotrongcay', bc: 'sotrongcay' },
    { k: 'daotao', ten: 'Đào tạo, SOP', kw: 'dao tao sop lop hoc bai hoc kiem tra thi', xem: () => true, link: 'daotao', bc: 'daotao' },
    { k: 'congky', ten: 'Bảng công, chênh lệch', kw: 'bang cong cong hop dong chenh lech cong thuc te ky cong chot nam', xem: () => laAnh() || laPhap(), link: 'baocao/cong', bc: 'diemdanh' },
    { k: 'gopy', ten: 'Góp ý app', kw: 'gop y loi app bao loi app', xem: () => true, link: 'gopy' },
  ];
  const nb2 = () => ((S.dm && S.dm.nguoi) || []).filter((n) => n.nhom === 'Nhân viên nội bộ').map((n) => n.ten);
  const chuaCum = async (ma, ten) => { const cums = [...new Set((S.dm.vitri || []).filter((v) => v.ap === 'Có').map((v) => v.cum))]; const d = await G.doc('ViecHangNgay', { 'Ngày': hn(), 'Mã việc': ma }).catch(() => []); const da = new Set(d.map((r) => r['Cụm']));
    const con = cums.filter((c) => !da.has(c)); return con.length ? { chu: `${ten} hôm nay còn ${con.length}/${cums.length} cụm chưa ghi:`, dong: con.map((c) => '◯ ' + c), nut: [['Mở ' + ten, '#/cum/' + ma]] } : { chu: `${ten}: đã ghi đủ ${cums.length} cụm hôm nay.` }; };

  /* ------------------------------------------------------------------ hiểu câu hỏi ------------------------------------------------------------------ */
  const KIEU = {
    chua: /\bchua\b|sap het|het gi|da het|can chu y|chu y gi|co gi (can|moi|la)|van de|\bcon (cho|vi tri|noi|khu|cum|gi|bao nhieu (cho|vi tri|cum))|\bsot\b|\btre\b|qua han|den han|can lam|chua lam|nao chua|bo sot|left|pending|not yet|overdue|missing/,
    lanCuoi: /lan cuoi|khi nao|bao gio|hom nao|gan nhat|lan truoc|last time|when/,
    soLieu: /bao nhieu|\btong\b|\bmay (kg|chuyen|lan|cay|bao|chau)|so luong|thong ke|so lieu|duoc nhieu|how many|how much|total/,
    cach: /lam sao|lam the nao|\bcach\b|o dau|cho nao|huong dan|mo man|vao dau|chi (em|toi|anh|chi)|how (do|to|can)|where/,
  };
  const CHUNG = new Set(['hom nay', 'thang nay', 'tuan nay', 'con gi', 'bao nhieu', 'lan cuoi', 'khi nao', 'viec hom', 'nay con', 'con viec', 'viec gi', 'lam gi', 'gi hom', 'chua xong']);
  const TU_CHUNG = new Set(['hom', 'nay', 'con', 'gi', 'nao', 'chua', 'viec', 'lam', 'cua', 'cho', 'the', 'thi', 'bao', 'nhieu', 'em', 'anh', 'chi', 'oi', 'vay', 'khong', 'co', 'duoc', 'xem']);
  const diemCD = (t, c) => { if (c.xem && !c.xem()) return 0; const w = (' ' + c.kw + ' ' + bo(c.ten) + ' '); let d = 0;
    const cum = [...new Set(c.kw.split(/\s+/).reduce((a, x, i, arr) => (i < arr.length - 1 ? a.concat([x + ' ' + arr[i + 1]]) : a), []))].filter((p) => !CHUNG.has(p));
    cum.forEach((p) => { if (t.includes(' ' + p + ' ')) d += 2.2; }); [...new Set(t.trim().split(' '))].forEach((x) => { if (x.length > 2 && !TU_CHUNG.has(x) && w.includes(' ' + x + ' ')) d += 0.6; }); if (t.includes(' ' + bo(c.ten) + ' ')) d += 3;
    if (c.k === 'viechomnay' && /(con|nhung|co) viec|viec (gi|con|chua|nao)|lam gi/.test(t)) d += 3; return d; };
  const chonCD = (t) => { const it = t.trim().split(' ').filter((x) => x && !TU_CHUNG.has(x)).length <= 2; return CD.map((c) => ({ c, d: diemCD(t, c) })).filter((x) => x.d >= (it ? 0.6 : 1.2)).sort((a, b) => b.d - a.d); };
  G._mamCD = (cau) => chonCD(' ' + (T().moRong ? T().moRong(cau) : bo(cau)) + ' ').map((x) => x.c.k + ':' + x.d.toFixed(1)).join(' ');
  const kieuCua = (t) => Object.keys(KIEU).filter((k) => KIEU[k].test(t));
  const soLieuCD = async (c, cau) => { const y = (T().Y || []).find((x) => x.ten === 'solieu'); if (!y || !c.bc) return null; const b = (G.BC_VIEC || []).find((x) => x.k === c.bc); if (!b) return null;
    const t = (T().moRong ? T().moRong(cau) : bo(cau)) + ' ' + bo(b.ten) + ' ' + bo(b.nhom); return y.lam(' ' + t + ' ', cau); };
  const cachCD = (c) => { const HD = G.HD_TRO || {}; const k = Object.keys(HD).find((x) => x === c.link) || Object.keys(HD).find((x) => c.link && x.startsWith(c.link.split('/')[0]));
    const x = k ? (HD[k][en() ? 'en' : 'vi'] || HD[k].vi) : null; return x ? { chu: x[0] + ':', dong: x[1].map((s, i) => `${i + 1}. ${s}`).concat(x[2] ? ['💡 ' + x[2]] : []), nut: c.link ? [['Làm ngay', '#/' + c.link]] : [] } : { chu: `Mở màn ${c.ten} để làm:`, nut: c.link ? [['Mở ' + c.ten, '#/' + c.link]] : [] }; };
  const hoiLai = (c) => ({ chu: `Anh chị muốn xem gì về ${c.ten}?`, hoi: [c.chua ? ['Chỗ nào chưa làm', `${c.ten} còn chỗ nào chưa làm`] : null, c.lanCuoi ? ['Lần làm gần nhất', `${c.ten} lần cuối khi nào`] : null, c.bc ? ['Số liệu tháng này', `${c.ten} tháng này được bao nhiêu`] : null, ['Cách làm, mở màn', `cách làm ${c.ten}`]].filter(Boolean) });
  const MENU = () => CD.filter((c) => c.xem() && c.chua).slice(0, 8);

  G.traLoiMam = async (cau, nguon) => {
    const t = ' ' + (T().moRong ? T().moRong(cau) : bo(cau)) + ' ';
    if (/^\s*(xin )?chao|^\s*hello|^\s*hi\b|cam on|thank|mam oi\s*$/.test(t)) return { chu: /cam on|thank/.test(t) ? 'Dạ không có gì, cần gì anh chị cứ hỏi Mầm nhé.' : `Dạ, Mầm nghe ạ. Anh chị hỏi gì trong GreenLog cũng được, ví dụ: hôm nay còn việc gì, cây nội thất chỗ nào chưa tưới, kho sắp hết gì…`, hoi: MENU().slice(0, 4).map((c) => [c.ten, `${c.ten} còn chỗ nào chưa làm`]) };
    const cd = chonCD(t); const kieu = kieuCua(t); const c = cd[0] && cd[0].c;
    if (c) {
      const k = kieu[0];
      try {
        if (k === 'chua' && c.chua) return await c.chua(cau);
        if (k === 'lanCuoi' && c.lanCuoi) return await c.lanCuoi(cau);
        if (k === 'lanCuoi' && c.chua && /bao tri|may|kho|dung cu/.test(c.kw)) return await c.chua(cau);
        if (k === 'lanCuoi') { const y = (T().Y || []).find((x) => x.ten === 'lancuoi'); const r = y && !laNB() ? await y.lam(t, cau) : null; if (r) return r; }
        if (k === 'soLieu') { const r = await soLieuCD(c, cau); if (r) return r; }
        if (k === 'cach') return cachCD(c);
        if (!k && c.chua && /hom nay|bay gio|hien tai|tinh hinh|the nao|sao roi|ra sao|status/.test(t)) return await c.chua(cau);
      } catch (e) { console.warn(e); }
      const dungTen = t.includes(' ' + bo(c.ten) + ' ');
      if (!dungTen && cd[1] && cd[1].d >= (k ? cd[0].d - 0.5 : cd[0].d * 0.5) && cd[1].c !== c) return { chu: 'Anh chị đang hỏi về việc nào ạ?', hoi: cd.slice(0, 4).map((x) => [x.c.ten, !kieu[0] ? x.c.ten : `${x.c.ten} ${kieu[0] === 'soLieu' ? 'tháng này được bao nhiêu' : kieu[0] === 'lanCuoi' ? 'lần cuối khi nào' : 'còn chỗ nào chưa làm'}`]) };
      return hoiLai(c);
    }
    /* chưa nhận ra chủ đề: thử các ý cũ (nghỉ, máy, kho, báo hỏng, mượn, cây, lần cuối, số liệu, cách làm) */
    for (const y of (T().Y || [])) { if (y.ten === 'chao') continue; try { if (y.khop(t)) { const r = await y.lam(t, cau); if (r) return r; } } catch (e) { /* bỏ qua */ } }
    /* tìm trong app: có kết quả gần đúng → hỏi lại kèm nút mở */
    const ds = G.chiMucTim ? await G.chiMucTim() : []; const di = T().diem; const r = di ? ds.map((x) => ({ x, d: di(cau, x) })).filter((y) => y.d >= 1.4).sort((a, b) => b.d - a.d).slice(0, 4).map((y) => y.x) : [];
    if (r.length) return { chu: 'Mầm chưa chắc anh chị muốn gì. Có phải là:', nut: r.map((x) => [x.ten, x.link && !x.link.startsWith('vt:') ? x.link : '', x]) };
    /* có dấu hiệu công việc nhưng chưa rõ → đưa menu để chọn, không từ chối */
    if (/\bviec\b|\bcay\b|vuon|\bkho\b|\bmay\b|phieu|bao cao|so lieu|nhan vien|\bdoi\b|kiem tra|tuoi|\bphan\b|thuoc|\brac\b|\bbien\b|villa|\bkhu\b|\bcum\b|vi tri|\bcong\b|\bnghi\b|greenlog|\bapp\b/.test(t))
      return { chu: 'Mầm chưa hiểu rõ câu này. Anh chị chọn giúp Mầm một mục nhé:', hoi: MENU().map((c) => [c.ten, `${c.ten} còn chỗ nào chưa làm`]).concat([['Cách dùng app', 'cách dùng app']]) };
    return null; /* thật sự ngoài app → Gemini (nếu có) */
  };

  /* Gemini chỉ cho câu ngoài app; hết lượt hoặc chưa có mã → nói rõ, gợi ý hỏi việc trong app */
  const LUOT = 30; const khoaLuot = () => 'troly_luot_' + hn() + '_' + S.u.ten;
  const coGemini = () => S.dm.coAI && API.coThat && API.coThat() && (+(API.LS.get(khoaLuot(), 0)) || 0) < LUOT && !API.LS.get('troly_het_' + hn(), false);
  G.traLoiTroLy = async (cau, nguon) => {
    let k = await G.traLoiMam(cau, nguon); if (k) { k.cheDo = coGemini() ? 'thong_minh' : 'co_ban'; return k; }
    if (coGemini()) { try { const r = await API.goi('ai.troLy', { cau, cheDo: 'traLoi', en: en() }); API.LS.set(khoaLuot(), (+(API.LS.get(khoaLuot(), 0)) || 0) + 1); if (r && r.tra) return { chu: r.tra, cheDo: 'thong_minh', ngoai: true }; }
      catch (e) { if (/hết|quota|429/i.test(e.message)) API.LS.set('troly_het_' + hn(), true); } }
    return { chu: S.dm.coAI && API.coThat && API.coThat() ? 'Câu này nằm ngoài GreenLog và hôm nay Mầm đã hết lượt hỏi Gemini. Anh chị hỏi Mầm việc trong app nhé.' : 'Câu này nằm ngoài GreenLog. Khi Trưởng bộ phận nối Gemini, Mầm sẽ trả lời được cả câu ngoài app. Bây giờ anh chị hỏi Mầm việc trong app nhé.', hoi: MENU().slice(0, 4).map((c) => [c.ten, `${c.ten} còn chỗ nào chưa làm`]), cheDo: 'co_ban' };
  };

  /* ------------------------------------------------------------------ giọng nói ------------------------------------------------------------------ */
  const LS = API.LS;
  const giongVi = () => { const v = (window.speechSynthesis && speechSynthesis.getVoices()) || []; const vi = v.filter((x) => /^vi/i.test(x.lang)); if (!vi.length) return null;
    const nam = LS.get('mam_giong', 'nu') === 'nam'; const tot = (x) => (/Natural|Online|Neural|Google|Premium|Enhanced/i.test(x.name) ? 2 : 0) + (nam ? (/NamMinh|male|An\b|Nam/i.test(x.name) ? 3 : 0) : (/HoaiMy|Linh|female|My\b/i.test(x.name) ? 3 : 0));
    return vi.sort((a, b) => tot(b) - tot(a))[0]; };
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};
  G.mamNoi = (text) => new Promise((ok) => { try { if (!window.speechSynthesis || LS.get('mam_tat_tieng', false)) return ok(false); const g = giongVi(); if (!g) return ok(false);
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/[◯✓◐⏰🔧🧰📦🔴⚠•🐛]/gu, '').replace(/\n/g, '. ').slice(0, 600)); u.voice = g; u.lang = g.lang; u.rate = 1; u.onend = () => ok(true); u.onerror = () => ok(false); speechSynthesis.speak(u); setTimeout(() => ok(true), 20000); } catch (e) { ok(false); } });
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  G.mamNghe = () => new Promise((ok) => { if (!SR) return ok(null); try { const r = new SR(); r.lang = en() ? 'en-US' : 'vi-VN'; r.interimResults = false; r.maxAlternatives = 1; let xong = false;
    r.onresult = (e) => { xong = true; ok(e.results[0][0].transcript); }; r.onerror = () => { if (!xong) ok(null); }; r.onend = () => { if (!xong) ok(null); }; r.start(); G._mamSR = r; } catch (e) { ok(null); } });

  /* "Gọi Mầm ơi": chỉ khi app đang mở; tự tắt sau 2 phút không ai gọi; chấm đỏ khi mic đang nghe */
  let thuc = null; let hen = null;
  const cham = (bat) => { let d = document.querySelector('.mam-cham'); if (bat && !d) { d = G.h('<div class="mam-cham" title="Mic đang nghe “Mầm ơi”">● Đang nghe “Mầm ơi”</div>'); d.onclick = () => tatGoi('Đã tắt nghe Mầm ơi'); document.body.appendChild(d); } if (!bat && d) d.remove(); };
  const tatGoi = (tb) => { LS.set('mam_goi', false); if (thuc) { try { thuc.onend = null; thuc.stop(); } catch (e) { /* bỏ qua */ } } thuc = null; clearTimeout(hen); cham(false); if (tb) bao(tb); };
  G.batGoiMam = () => { if (!SR) { bao('Máy này không hỗ trợ nghe giọng nói', true); return; } if (thuc) return; LS.set('mam_goi', true);
    const bd = () => { if (!LS.get('mam_goi', false) || document.hidden) { cham(false); thuc = null; return; } try { thuc = new SR(); thuc.lang = 'vi-VN'; thuc.continuous = true; thuc.interimResults = false;
      thuc.onresult = (e) => { const s = e.results[e.results.length - 1][0].transcript; const b = bo(s); const m = b.match(/\bm[a-z]*m oi\b(.*)$/) || b.match(/^\s*mam\b(.*)$/); if (!m) return;
        clearTimeout(hen); hen = setTimeout(() => tatGoi('Đã tắt nghe “Mầm ơi” sau 2 phút không ai gọi'), 120000);
        const con = s.replace(/^.*?m[aầâ]m\s*ơi[,.\s]*/i, '').trim(); try { thuc.onend = null; thuc.stop(); } catch (er) { /* bỏ qua */ } thuc = null; cham(false);
        G._cauTroLy = con.length > 3 ? con : null; G._ngheNgay = con.length <= 3; if (!/^#\/troly/.test(location.hash)) location.hash = '#/troly'; else G.taiLai(); };
      thuc.onend = () => { thuc = null; if (LS.get('mam_goi', false) && !document.hidden && !/^#\/troly/.test(location.hash)) setTimeout(bd, 400); else cham(false); };
      thuc.start(); cham(true); } catch (e) { cham(false); } };
    clearTimeout(hen); hen = setTimeout(() => tatGoi('Đã tắt nghe “Mầm ơi” sau 2 phút không ai gọi'), 120000); bd(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (thuc) { try { thuc.onend = null; thuc.stop(); } catch (e) { /* bỏ qua */ } thuc = null; } cham(false); } else if (LS.get('mam_goi', false)) { tatGoi(); } });
  window.addEventListener('hashchange', () => { if (LS.get('mam_goi', false) && !thuc && !/^#\/troly/.test(location.hash) && !document.hidden) G.batGoiMam(); });

  /* cài đặt: giọng đọc, tắt tiếng, công tắc Gọi Mầm ơi */
  const cd0 = G.theCaiDat; const gan0 = G.ganCaiDat;
  if (cd0) G.theCaiDat = () => cd0() + `<div class="the"><h2>${G.ROBOT(28)} Mầm</h2>
    <div class="mo" style="margin-bottom:4px">Giọng đọc</div><div class="chon" id="mamGiong">${[['nu', 'Giọng nữ'], ['nam', 'Giọng nam'], ['tat', 'Không đọc']].map(([k, t]) => `<button type="button" data-g="${k}" class="${(LS.get('mam_tat_tieng', false) ? 'tat' : LS.get('mam_giong', 'nu')) === k ? 'dang' : ''}">${t}</button>`).join('')}</div>
    <p class="mo" style="margin:4px 0 8px">${giongVi() ? 'Đang dùng: ' + esc(giongVi().name) : 'Máy này chưa có giọng tiếng Việt, Mầm chỉ hiện chữ.'}</p><button type="button" class="nut nho" id="mamThu">🔊 Nghe thử</button>
    <label class="hang" style="gap:10px;margin-top:12px"><input type="checkbox" id="mamGoi" ${LS.get('mam_goi', false) ? 'checked' : ''} ${SR ? '' : 'disabled'}> <span><b>Gọi “Mầm ơi”</b><br><small class="mo">Mặc định tắt. Chỉ nghe khi đang mở app, tự tắt sau 2 phút không ai gọi, có chấm đỏ khi mic đang nghe. Không nên bật khi làm trong villa có khách.</small></span></label></div>`;
  if (gan0) G.ganCaiDat = (m) => { gan0(m);
    m.querySelectorAll('#mamGiong [data-g]').forEach((b) => { b.onclick = () => { if (b.dataset.g === 'tat') LS.set('mam_tat_tieng', true); else { LS.set('mam_tat_tieng', false); LS.set('mam_giong', b.dataset.g); } m.querySelectorAll('#mamGiong [data-g]').forEach((x) => x.classList.toggle('dang', x === b)); }; });
    const th = m.querySelector('#mamThu'); if (th) th.onclick = async () => { if (!(await G.mamNoi('Dạ, Mầm nghe ạ. Hôm nay anh chị cần Mầm giúp gì?'))) bao('Máy này chưa có giọng tiếng Việt hoặc đang tắt tiếng', true); };
    const g = m.querySelector('#mamGoi'); if (g) g.onchange = () => { if (g.checked) { G.batGoiMam(); bao('Đã bật · nói “Mầm ơi” khi cần'); } else tatGoi('Đã tắt nghe Mầm ơi'); }; };

  /* ------------------------------------------------------------------ khung chat Mầm ------------------------------------------------------------------ */
  const khoaChat = () => 'troly_chat_' + S.u.ten;
  const goiY = () => (laNB() ? ['Hôm nay còn việc gì?', 'Cây nội thất còn chỗ nào chưa tưới?', 'Kho sắp hết gì?', 'Máy sàng còn bao nhiêu giờ thì bảo trì?', 'Tuần này thu gom bao nhiêu kg rác hữu cơ?', 'Dụng cụ có gì cần chú ý?']
    : laAnh() ? ['Hôm nay còn việc gì?', 'Điểm danh hôm nay thế nào?', 'Phiếu nào còn quá hạn?', 'Cắt tỉa cây bụi còn chỗ nào chưa làm?', 'Kho sắp hết gì?', 'Tháng này thu gom bao nhiêu kg rác hữu cơ?']
      : laPhap() ? ['Hôm nay còn việc gì?', 'Điểm danh hôm nay thế nào?', 'Phiếu nào còn quá hạn?', 'Cắt cỏ còn chỗ nào chưa làm?', 'Bón phân cây bụi lần cuối khi nào?']
        : ['Hôm nay còn việc gì?', 'Cắt cỏ còn chỗ nào chưa làm?', 'Tưới nước còn chỗ nào chưa ghi?', 'Phiếu nào còn quá hạn?', 'Tháng này vận chuyển bao nhiêu chuyến?']);
  G.man.troly = Object.assign(G.man.troly || {}, { ten: 'Mầm · trợ lý GreenLog', bt: '🌱', fn: async () => {
    const m = G.khung('Mầm', 'Trợ lý GreenLog · hỏi mọi việc trong app', true); m.classList.add('tl-man');
    const ls = LS.get(khoaChat(), []);
    m.innerHTML = `<div class="tl-khung"><div class="tl-ds" id="tlDs"></div><div class="chon tl-goiy">${goiY().map((c) => `<button type="button" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="tl-nhap"><textarea id="tlCau" rows="1" placeholder="Hỏi Mầm bất cứ điều gì về GreenLog…"></textarea><button class="nut nho mic" id="tlMic" type="button" title="Bấm rồi nói">🎤 Nói</button><button class="nut chinh" id="tlGui" type="button" aria-label="Gửi">Gửi</button></div>
      <div class="hang" style="justify-content:space-between;margin-top:6px"><small class="mo" id="tlCD"></small><span class="nhom-nut" style="gap:6px"><button class="nut nho" id="tlTieng" type="button">${LS.get('mam_tat_tieng', false) ? '🔇 Đang tắt tiếng' : '🔊 Đang đọc to'}</button><button class="nut nho" id="tlMoi" type="button">Cuộc trò chuyện mới</button></span></div></div>`;
    const dsEl = m.querySelector('#tlDs'); const i = m.querySelector('#tlCau');
    const cuon = () => { setTimeout(() => { dsEl.lastElementChild && dsEl.lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, 30); };
    const bong = (x) => { const toi = x.ai === 'toi';
      const el = G.h(`<div class="tl-hang ${toi ? 'toi' : 'tl'}">${toi ? '' : `<span class="tl-av">${G.ROBOT(34)}</span>`}<div class="tl-bong">${esc(x.chu || '').replace(/\n/g, '<br>')}${x.dong && x.dong.length ? `<ul>${x.dong.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}${x.anh ? G.xemAnh(x.anh) : ''}
        ${(x.hoi || []).length ? `<div class="chon tl-hoi" style="margin-top:8px">${x.hoi.map((h, k) => `<button type="button" data-h="${k}">${esc(h[0])}</button>`).join('')}</div>` : ''}
        ${(x.nut || []).length ? `<div class="nhom-nut" style="margin-top:8px">${x.nut.map((n, k) => `<button type="button" class="nut nho ${k ? '' : 'chinh'}" data-k="${k}">${esc(n[0])}</button>`).join('')}</div>` : ''}
        ${!toi && x.chu ? '<button type="button" class="tl-loa" title="Đọc to">🔊</button>' : ''}${x.ngoai ? '<small class="mo" style="display:block;margin-top:6px">Trả lời từ Gemini · kiến thức chung, không phải số liệu trong app</small>' : ''}</div></div>`);
      el.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => { const n = x.nut[+b.dataset.k]; if (n[2] && G.moKetQuaTim) G.moKetQuaTim(n[2]); else if (n[1]) location.hash = n[1]; }; });
      el.querySelectorAll('[data-h]').forEach((b) => { b.onclick = () => gui(x.hoi[+b.dataset.h][1], 'nut'); });
      const loa = el.querySelector('.tl-loa'); if (loa) loa.onclick = () => G.mamNoi([x.chu].concat(x.dong || []).join('. ')).then((d) => { if (!d) bao('Máy này chưa có giọng tiếng Việt', true); });
      dsEl.appendChild(el); };
    if (!ls.length) bong({ ai: 'tl', chu: `Chào ${G.laAnhVu() ? 'Trưởng bộ phận' : ngan(S.u.ten)},\nem là Mầm 🌱, trợ lý của GreenLog. Anh chị hỏi gì trong app cũng được: còn chỗ nào chưa làm, lần cuối làm khi nào, được bao nhiêu, làm ở đâu. Bấm 🎤 để nói.` }); ls.forEach(bong);
    const cd = (c) => { m.querySelector('#tlCD').textContent = c === 'thong_minh' ? `Có Gemini cho câu ngoài app · còn ${Math.max(0, LUOT - (+(LS.get(khoaLuot(), 0)) || 0))} câu hôm nay` : 'Trả lời từ dữ liệu trong app'; };
    cd(coGemini() ? 'thong_minh' : 'co_ban'); cuon();
    const gui = async (cau, nguon) => { cau = String(cau || '').trim(); if (!cau) return; i.value = ''; const a = { ai: 'toi', chu: cau }; bong(a); ls.push(a);
      const cho = G.h(`<div class="tl-hang tl dang-nghi"><span class="tl-av">${G.ROBOT(34)}</span><div class="tl-bong">…</div></div>`); dsEl.appendChild(cho); cuon();
      let k; try { k = await G.traLoiTroLy(cau, nguon); } catch (e) { k = { chu: 'Mầm gặp lỗi khi tìm: ' + e.message }; } cho.remove();
      const b = { ai: 'tl', chu: k.chu, dong: k.dong, hoi: k.hoi, anh: k.anh, ngoai: k.ngoai, nut: (k.nut || []).filter((n) => n[1] || n[2]).map((n) => [n[0], n[1] || '', n[2] && n[2].link && n[2].link.startsWith('vt:') ? n[2] : null]) };
      bong(b); ls.push({ ai: 'tl', chu: b.chu, dong: b.dong, hoi: b.hoi, ngoai: b.ngoai, nut: b.nut.filter((n) => !n[2]) }); LS.set(khoaChat(), ls.slice(-60)); cd(k.cheDo); cuon();
      if (nguon === 'giong' && !LS.get('mam_tat_tieng', false)) G.mamNoi([b.chu].concat((b.dong || []).slice(0, 6)).concat((b.hoi || []).length ? ['Anh chị chọn: ' + b.hoi.map((h) => h[0]).join(', ')] : []).join('. ')); };
    const noi = async () => { const btn = m.querySelector('#tlMic'); btn.classList.add('dang'); btn.textContent = '● Đang nghe…'; await G.mamNoi('Dạ, Mầm nghe ạ'); const s = await G.mamNghe(); btn.classList.remove('dang'); btn.textContent = '🎤 Nói';
      if (s) gui(s, 'giong'); else if (!SR) bao('Máy này không nhận giọng nói, anh chị gõ giúp Mầm nhé', true); };
    m.querySelector('#tlGui').onclick = () => gui(i.value);
    i.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gui(i.value); } });
    m.querySelectorAll('.tl-goiy [data-c]').forEach((b) => { b.onclick = () => gui(b.dataset.c); });
    m.querySelector('#tlMoi').onclick = () => { LS.set(khoaChat(), []); G.taiLai(); };
    m.querySelector('#tlMic').onclick = noi;
    m.querySelector('#tlTieng').onclick = (e) => { const t = !LS.get('mam_tat_tieng', false); LS.set('mam_tat_tieng', t); if (t && window.speechSynthesis) speechSynthesis.cancel(); e.target.textContent = t ? '🔇 Đang tắt tiếng' : '🔊 Đang đọc to'; };
    if (G._cauTroLy) { const c = G._cauTroLy; G._cauTroLy = null; gui(c, G._ngheNgay === false ? 'giong' : 'giong'); } else if (G._ngheNgay) { G._ngheNgay = false; setTimeout(noi, 300); }
  } });
  /* nút Mầm nổi: chạm là mở Mầm và nghe luôn */
  document.addEventListener('click', (e) => { const f = e.target.closest('.fab-tl'); if (!f) return; e.preventDefault(); e.stopImmediatePropagation(); G._ngheNgay = !!SR; location.hash = '#/troly'; }, true);
  const kh = G.khung; G.khung = function (...a) { const m = kh.apply(this, a); setTimeout(() => { const f = document.querySelector('.fab-tl'); if (f) { f.title = 'Mầm · chạm để nói'; f.setAttribute('aria-label', 'Mầm · chạm để nói'); } }, 30); return m; };
  if (G.HD_TRO) { G.HD_TRO.troly = { vi: ['Mầm · trợ lý GreenLog', ['Chạm Mầm (góc phải) rồi nói, hoặc gõ câu hỏi.', 'Hỏi được: còn chỗ nào chưa làm, lần cuối làm khi nào, được bao nhiêu, làm ở đâu.', 'Chưa rõ ý, Mầm hỏi lại kèm nút để chọn.', 'Bấm 🔊 để nghe đọc to.'], 'Muốn gọi “Mầm ơi” không cần chạm: bật trong Thêm › Cài đặt (mặc định tắt).'],
    en: ['Mầm · GreenLog assistant', ['Tap Mầm (bottom right) and speak, or type a question.', 'Ask: what is not done yet, when was it last done, how much, where and how.', 'If unclear, Mầm asks back with buttons.', 'Tap 🔊 to hear the answer.'], 'Hands-free “Mầm ơi”: turn it on in More › Settings (off by default).'] }; }
})();
