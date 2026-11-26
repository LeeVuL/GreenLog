/* GreenLog 0.4 – hồ sơ cuối kỳ theo bộ mẫu đã duyệt HoSoCuoiKy_Mau_v3 (24/11/2026): bìa nhật ký, trang nhật ký hằng ngày,
   phiếu yêu cầu nghiệm thu YCNT (ngày 18), biên bản nghiệm thu BBNT (ngày 19), phụ lục kết quả dịch vụ kỳ, bảng công chi tiết. Luôn tiếng Việt. */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hn = () => API.ngay();
  const goc = () => location.origin + location.pathname.replace(/index\.html$/, '');
  const IMG = (f) => goc() + 'img/hoso/' + f;
  const DK = '#123524', DK2 = '#1F4D2B', LI = '#C9E265', BG = '#F2F5EF', MU = '#5F6F64';
  const CT = { congTrinh: 'Khu nghỉ dưỡng Mövenpick Resort Waverly Phu Quoc', diaChi: 'Tổ 1, khu phố Ông Lang, đặc khu Phú Quốc, tỉnh An Giang', cdt: 'Công ty Cổ phần Ngôi Sao Cửa Dương', nt: 'Công ty TNHH Xây dựng và Cảnh quan Phú Quốc',
    hopDong: 'Dịch vụ cung cấp dịch vụ bảo trì, chăm sóc thảm cỏ, cây xanh, cây cảnh tại Khu nghỉ dưỡng Mövenpick Resort Waverly Phu Quoc' };
  const KY_NT = '<b>Mai Hòa Pháp</b><br><span class="mu">Trưởng Phòng Quản Lý Cảnh Quan</span>';
  const KY_KS = '<b>Lê Vũ</b><br><span class="mu">Trưởng bộ phận Cảnh Quan</span>';
  const BASE = `*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Be Vietnam Pro',Inter,Arial,sans-serif;color:#14261B;font-size:9.4px}
.pg{position:relative;overflow:hidden;background:#fff;width:210mm;height:297mm;padding:9mm 11mm 12mm;page-break-after:always}.pg.ngang{width:297mm;height:210mm;padding:6mm 9mm 10mm}
.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${DK};padding-bottom:6px;margin-bottom:7px}
.logo{display:flex;gap:7px;align-items:center;font-weight:800;font-size:11.5px;color:${DK}}.logo i{width:22px;height:22px;border-radius:7px;background:${LI};display:grid;place-items:center;font-style:normal}
h1{font-size:16px;color:${DK};margin-top:5px}.meta{color:${MU};font-size:8.8px;line-height:1.5}
h2{font-size:10.5px;color:#fff;background:${DK};padding:4px 9px;border-radius:6px;margin:7px 0 4px;display:flex;justify-content:space-between}h2 b{color:${LI};font-weight:600}
table{width:100%;border-collapse:collapse}th{background:#E7EFE3;color:${DK};font-size:8.6px;text-align:left;padding:3px 5px;font-weight:700}td{padding:2.5px 5px;border-bottom:1px solid #E6ECE4;vertical-align:top}
.r{text-align:right}.c{text-align:center}.b{font-weight:700}.mu{color:${MU}}.red{color:#14261B}
.chip{display:inline-block;padding:1px 6px;border-radius:99px;font-size:8px;font-weight:700;white-space:nowrap}.g{background:#E5F4E4;color:#1F6B35}.o{background:#FCEBDD;color:#B4621E}.rd{background:#FBE3E2;color:#B33A36}.gr{background:#EEF1EC;color:${MU}}
.grid{display:grid;gap:7px}.box{background:${BG};border-radius:8px;padding:6px 8px}.box .k{font-size:8.3px;color:${MU}}.box .v{font-size:13px;font-weight:800;color:${DK}}
.ph{border-radius:6px;height:64px;object-fit:cover;width:100%}
.sig{display:flex;justify-content:space-around;text-align:center;margin-top:8px;font-size:9px}
.foot{position:absolute;bottom:6mm;left:11mm;right:11mm;display:flex;justify-content:space-between;color:${MU};font-size:8px;border-top:1px solid #E6ECE4;padding-top:3px}
.ck{display:inline-block;width:9px;height:9px;border:1.3px solid ${DK};border-radius:2px;margin-right:4px;vertical-align:-1px}.ck.x{background:${DK}}
.tnr{font-family:'Times New Roman',Tinos,serif;color:#000;font-size:13px}`;
  const HDR = `Công trình: ${CT.congTrinh} · ${CT.diaChi}<br>Chủ đầu tư: ${CT.cdt} · Nhà thầu: ${CT.nt}`;
  const top = (title, right) => `<div class="top"><div><div class="logo"><i>✓</i>GreenLog · Bộ phận Cảnh quan</div><h1>${title}</h1><div class="meta">${HDR}</div></div><div class="meta" style="text-align:right"><div style="display:flex;gap:10px;justify-content:flex-end;align-items:center;margin-bottom:5px"><img src="${IMG('mvp.svg')}" style="height:26px"><img src="${IMG('pqc.svg')}" style="height:32px"></div>${right}</div></div>`;
  const soKy = (k) => k.ten.slice(1, 3) + '-' + k.ten.slice(4); // 11-2026
  const maKy = (k) => k.ten.slice(6, 8) + k.ten.slice(1, 3); // 2611
  const quyenSo = (k) => { const [mm, yy] = k.ten.slice(1).split('.').map(Number); const goc_ = G.caiDat('Quyển nhật ký gốc', '2026-11:2'); const [gk, gs] = goc_.split(':'); const [gy, gm] = gk.split('-').map(Number); return String((yy - gy) * 12 + (mm - gm) + +gs).padStart(2, '0'); };

  async function taiKy(k) {
    const loc = { 'Ngày': { tu: k.tu, den: k.den } };
    const d = await G.docNhieu([{ bang: 'DiemDanh', loc }, { bang: 'DuyetCong', loc }, { bang: 'GiaoViecNgay', loc }, { bang: 'NgayLamViec', loc }, { bang: 'DongHoNuoc', loc: { 'Ngày': { tu: G.congNgay(k.tu, -3), den: k.den } } },
      { bang: 'VanChuyen', loc }, { bang: 'NhatKyPhunBon', loc: { 'Ngày giờ': { tu: k.tu, den: k.den + ' 99' } } }, { bang: 'NhatKyPhunBonChiTiet', gioiHan: 8000 }, { bang: 'ViecPhatSinh', loc }, { bang: 'KhoKhan', loc }, { bang: 'NhacNho', loc },
      { bang: 'AnhNgay', loc }, { bang: 'Tuoi', loc }, { bang: 'TickDinhKy', loc: { 'Kỳ': k.ten } }, { bang: 'ChamDiem', loc }, { bang: 'Phieu', gioiHan: 2000 }, { bang: 'VuonUom', loc }, { bang: 'VuonUomNoiThat', loc }, { bang: 'SoTrongCay', gioiHan: 3000 }, { bang: 'NghiemThu', loc: { 'Kỳ': k.ten } }]);
    Object.keys(d).forEach((x) => { d[x] = d[x] || []; }); return d;
  }

  /* ---- (1) BÌA ---- */
  const bia = (k) => `<div class="pg tnr" style="padding:0"><div style="position:absolute;inset:14mm;border:4px double #000;padding:20mm 14mm 14mm">
    <div style="display:flex;justify-content:space-between;align-items:center;margin:-10mm 0 8mm"><img src="${IMG('mvp.svg')}" style="height:46px"><img src="${IMG('pqc.svg')}" style="height:58px"></div><div class="c b" style="font-size:40px">NHẬT KÝ THI CÔNG</div>
    <div class="c b" style="font-size:16px;margin-top:6px">Quyển số (No): ${quyenSo(k)} (BẢN CHÍNH)</div><div class="c b" style="font-size:16px">(Từ ngày ${G.ngayVN(k.tu)} đến ngày ${G.ngayVN(k.den)})</div>
    <table style="margin:14mm auto 0;font-size:13.5px;line-height:1.5;width:92%"><tr><td class="b" style="width:30%;vertical-align:top;border:0">Hợp đồng:</td><td class="b" style="border:0">${CT.hopDong}</td></tr><tr><td class="b" style="border:0">Địa điểm:</td><td class="b" style="border:0">${CT.diaChi}</td></tr><tr><td class="b" style="border:0">Chủ đầu tư:</td><td class="b" style="border:0">${CT.cdt}</td></tr><tr><td class="b" style="border:0">Đơn vị thi công:</td><td class="b" style="border:0">${CT.nt}</td></tr></table>
    <img src="${IMG('cover_aerial.jpg')}" style="display:block;margin:12mm auto 0;width:150mm;height:106mm;object-fit:cover"><div class="c b" style="position:absolute;bottom:14mm;left:0;right:0;font-size:15px;font-style:italic">PHÚ QUỐC, ${k.den.slice(0, 4)}</div></div></div>`;

  /* ---- (2) TRANG NHẬT KÝ HẰNG NGÀY ---- */
  function trangNK(d, ngay, k, stt) {
    const dd = d.DiemDanh.filter((r) => r['Ngày'] === ngay); const nlv = d.NgayLamViec.filter((r) => r['Ngày'] === ngay); const chot = nlv.filter((r) => r['Loại'] === 'Chốt ngày');
    const dem = (doi, b) => dd.filter((r) => (doi ? r['Đội'] === doi : true) && r['Buổi'] === b && /Có mặt/.test(r['Trạng thái (Có mặt/Vắng/Về sớm)'])).length;
    const cong = (doi) => dd.filter((r) => !doi || r['Đội'] === doi).reduce((a, r) => a + (+r['Công'] || 0), 0);
    const anhTT = (doi) => { const x = d.DuyetCong.find((r) => r['Ngày'] === ngay && r['Đội'] === doi && r['Buổi'] === 'Sáng'); return x ? `<span class="chip g">${esc(String(x['Giờ gửi']).slice(11, 16))}</span>` : '<span class="mu">—</span>'; };
    const vang = dd.filter((r) => !/Có mặt/.test(r['Trạng thái (Có mặt/Vắng/Về sớm)'])).map((r) => `${r['Họ tên']} (${r['Buổi'].toLowerCase()}${r['Lý do'] ? ', ' + r['Lý do'] : ''})`);
    const dh = (ma) => { const t = G.dungNuoc(d.DongHoNuoc.filter((x) => x['Mã đồng hồ'] === ma)); return t[ngay] != null ? t[ngay] : null; };
    const n1 = dh('DH01'), n2 = dh('DH02'); const vc = d.VanChuyen.filter((r) => r['Ngày'] === ngay);
    const gv = d.GiaoViecNgay.filter((r) => r['Ngày'] === ngay); const xong = gv.filter((r) => r['Trạng thái'] === 'Xong').length;
    const mua = d.Tuoi.some((r) => r['Ngày'] === ngay && r['Hôm nay mưa'] === 'Có');
    const chip = (t) => (t === 'Xong' ? '<span class="chip g">Xong</span>' : t === 'Làm một phần' ? '<span class="chip o">Một phần</span>' : t === 'Chưa làm' ? '<span class="chip rd">Hoãn</span>' : `<span class="chip gr">${esc(t || '')}</span>`);
    const phN = (d.Phieu || []).filter((p) => String(p['Giờ tạo'] || '').slice(0, 10) === ngay || String(p['Giờ xong'] || p['Giờ báo xong'] || '').slice(0, 10) === ngay);
    const ttPh = (t) => (/Báo xong|Đã duyệt/.test(t) ? 'Xong' : /Đang xử lý/.test(t) ? 'Làm một phần' : 'Chưa làm');
    const wrows = ['Đội cơ động', 'Đội khu vực'].map((doi) => { const g = gv.filter((r) => r['Đội'] === doi).concat(phN.filter((p) => p['Giao cho'] === doi && !gv.some((r) => r['Mã nguồn'] === 'P:' + p['Mã phiếu'])).map((p) => ({ 'Nội dung': '📋 Phiếu ' + (p['Mô tả'] || p['Loại lỗi'] || ''), 'Vị trí': G.tenVT(p['Mã vị trí'], p['Vị trí khác']), 'Người': p['Người nhận'] || '', 'Trạng thái': ttPh(p['Trạng thái']) }))); return `<tr><td colspan="4" class="b" style="background:${BG};color:${DK}">${doi} · ${dem(doi, 'Sáng')} người</td></tr>` + (g.map((r) => `<tr><td>${esc(r['Nội dung'])}</td><td>${esc(r['Vị trí'] || '')}</td><td class="mu">${esc(r['Người'])}</td><td>${chip(r['Trạng thái'])}${r['Tiến độ'] && r['Trạng thái'] !== 'Xong' ? ' ~' + esc(r['Tiến độ']) + '%' : ''}${r['Bắt đầu'] && r['Bắt đầu'] !== ngay ? ' <span class="mu">từ ' + esc(G.ngayVN(r['Bắt đầu']).slice(0, 5)) + '</span>' : ''}${r['Lý do'] ? ' ' + esc(r['Lý do']) : ''}</td></tr>`).join('') || '<tr><td colspan="4" class="mu">Không có kế hoạch ngày</td></tr>'); }).join('');
    const nk = d.NhatKyPhunBon.filter((r) => String(r['Ngày giờ']).slice(0, 10) === ngay);
    const vt = d.NhatKyPhunBonChiTiet.filter((c) => nk.some((n) => n['Mã NK'] === c['Mã NK'])).map((c) => { const n = nk.find((x) => x['Mã NK'] === c['Mã NK']); return `<tr><td>${esc(c['Sản phẩm'])}</td><td>${c['Liều / bình'] ? esc(c['Liều / bình'] + ' ' + c['ĐVT'] + '/bình × ' + (n['Số bình'] || '')) : '—'}</td><td class="r">${G.so(c['Tổng lượng'], 2)} ${esc(c['ĐVT'])}</td><td>${n['Cách ly dài nhất (ngày)'] ? esc(n['Cách ly dài nhất (ngày)']) + ' ngày' : '—'}</td></tr>`; }).join('');
    const vu = (d.VuonUom || []).concat(d.VuonUomNoiThat || []).filter((r) => r['Ngày'] === ngay && r['Tên cây']).map((r) => `<tr><td>${esc(r['Tên cây'])} (vườn ươm)</td><td>${esc(r['Loại ghi'] === 'Xuất vườn' ? 'đã xuất' : 'đã ươm')}</td><td class="r">${esc(r['Số lượng'])} ${esc(r['ĐVT'])}</td><td>—</td></tr>`).join('');
    const ps = d.ViecPhatSinh.filter((r) => r['Ngày'] === ngay).map((r) => `<tr><td><span class="chip o">Phát sinh</span> ${esc(r['Mô tả'])}${r['Số người'] ? ' · ' + esc(r['Số người']) + ' người' : ''}${r['Số giờ'] ? ' · ' + esc(r['Số giờ']) + ' giờ' : ''}</td></tr>`)
      .concat(d.KhoKhan.filter((r) => r['Ngày'] === ngay).map((r) => `<tr><td><span class="chip rd">Khó khăn</span> ${esc(r['Loại'])}: ${esc(r['Mô tả'])}</td></tr>`))
      .concat(d.NhacNho.filter((r) => r['Ngày'] === ngay).map((r) => `<tr><td><span class="chip gr">Nhắc nhở</span> ${esc(r['Nguồn'])}: ${esc(r['Nội dung'])}${r['Trạng thái'] === 'Đã xong' ? ' → xong' : ''}</td></tr>`)).join('') || '<tr><td class="mu">Không có</td></tr>';
    const anh = [...new Set(d.AnhNgay.filter((r) => r['Ngày'] === ngay).map((r) => r['Link ảnh']).concat(d.DuyetCong.filter((r) => r['Ngày'] === ngay).flatMap((r) => API.dsAnh(r['Ảnh tập thể'])))
      .concat(d.TickDinhKy.filter((r) => (r['Ngày xong'] || r['Ngày']) === ngay).flatMap((r) => API.dsAnh(r['Ảnh'])))
      .concat(gv.flatMap((r) => API.dsAnh(r['Ảnh']))).concat(phN.flatMap((p) => API.dsAnh(p['Ảnh sau']))).filter(Boolean))].slice(0, 12);
    const yk = chot.map((r) => r['Ý kiến giám sát']).filter(Boolean).join(' · ') || '';
    const nguoiLap = [...new Set(nlv.map((r) => r['Người ghi']).filter(Boolean))].join(' · ') || 'Phan Văn Thìn · Phạm Nhật Trường';
    const daChot = chot.length && chot.every((r) => r['Trạng thái'] === 'Đã chốt');
    return `<div class="pg">${top('NHẬT KÝ THI CÔNG HẰNG NGÀY', `Ngày <b style="color:#14261B">${G.thu(ngay)} ${G.ngayVN(ngay)}</b><br>Trang số ${String(stt).padStart(3, '0')} · kỳ ${G.ngayVN(k.tu).slice(0, 5)}–${G.ngayVN(k.den).slice(0, 5)}<br>${daChot ? `<span class="chip g">Đã chốt · Lê Vũ duyệt</span>` : chot.length ? '<span class="chip o">Tổ trưởng đã chốt · chờ duyệt</span>' : '<span class="chip gr">Chưa chốt ngày</span>'}`)}
      <div class="grid" style="grid-template-columns:repeat(5,1fr)"><div class="box"><div class="k">Thời tiết</div><div class="v">${mua ? 'Có mưa' : 'Không mưa'}</div><div class="k">${mua ? 'Đã bấm ☔ ở Tưới' : '&nbsp;'}</div></div>
        <div class="box"><div class="k">Nhân lực nhà thầu</div><div class="v">${dem('', 'Sáng')}/31</div><div class="k">Sáng ${dem('', 'Sáng')} · chiều ${dem('', 'Chiều')}</div></div>
        <div class="box"><div class="k">Phiếu giao việc</div><div class="v">${phN.length} phiếu</div><div class="k">${phN.filter((p) => /Báo xong|Đã duyệt/.test(p['Trạng thái'])).length} đã xử lý</div></div>
        <div class="box"><div class="k">Vận chuyển</div><div class="v">${vc.reduce((a, r) => a + (+r['Số chuyến'] || 0), 0)} chuyến</div><div class="k">rác cắt tỉa ${vc.filter((r) => r['Nhóm'] === 'Rác cắt tỉa').reduce((a, r) => a + (+r['Số chuyến'] || 0), 0)}</div></div>
        <div class="box"><div class="k">Tỷ lệ hoàn thành KH</div><div class="v">${xong}/${gv.length} việc</div><div class="k">${gv.length - xong ? gv.length - xong + ' chưa xong / hoãn' : '&nbsp;'}</div></div></div>
      <h2>1. Nhân lực<b>${vang.length ? 'Vắng: ' + esc(vang.slice(0, 4).join(' · ')) : 'Đủ người'}</b></h2>
      <table><tr><th>Đội</th><th class="r">Định biên</th><th class="r">Sáng</th><th class="r">Chiều</th><th class="r">Công</th><th>Ảnh tập thể</th></tr>
        <tr><td>Quản lý</td><td class="r">1</td><td class="r">${dem('Quản lý nhà thầu', 'Sáng')}</td><td class="r">${dem('Quản lý nhà thầu', 'Chiều')}</td><td class="r">${G.so(cong('Quản lý nhà thầu'))}</td><td class="mu">—</td></tr>
        <tr><td>Đội cơ động</td><td class="r">10</td><td class="r">${dem('Đội cơ động', 'Sáng')}</td><td class="r">${dem('Đội cơ động', 'Chiều')}</td><td class="r">${G.so(cong('Đội cơ động'))}</td><td>${anhTT('Đội cơ động')}</td></tr>
        <tr><td>Đội khu vực</td><td class="r">20</td><td class="r">${dem('Đội khu vực', 'Sáng')}</td><td class="r">${dem('Đội khu vực', 'Chiều')}</td><td class="r">${G.so(cong('Đội khu vực'))}</td><td>${anhTT('Đội khu vực')}</td></tr>
        <tr><td class="b">Tổng</td><td class="r b">31</td><td class="r b">${dem('', 'Sáng')}</td><td class="r b">${dem('', 'Chiều')}</td><td class="r b">${G.so(cong())}</td><td class="mu">Định mức ${G.congHD(ngay)} → chênh ${G.so(cong() - G.congHD(ngay))}</td></tr></table>
      <h2>2. Công việc theo kế hoạch ngày<b>${nlv.find((r) => r['Loại'] === 'Bắt đầu ngày') ? 'Kế hoạch gửi ' + esc(String(nlv.find((r) => r['Loại'] === 'Bắt đầu ngày')['Giờ']).slice(11, 16)) : ''}${chot[0] ? ' · chốt ' + esc(String(chot[0]['Giờ']).slice(11, 16)) : ''}</b></h2>
      <table><tr><th style="width:30%">Công việc</th><th style="width:25%">Vị trí</th><th>Người thực hiện</th><th style="width:20%">Kết quả</th></tr>${wrows}</table>
      <div class="grid" style="grid-template-columns:1.25fr 1fr;margin-top:2px"><div><h2>3. Vật tư, thuốc, phân<b>bình 16 L</b></h2><table><tr><th>Loại</th><th>Liều / lượng</th><th class="r">Tổng</th><th>Cách ly</th></tr>${vt + vu || '<tr><td colspan="4" class="mu">Không dùng</td></tr>'}</table></div>
        <div><h2>4. Phát sinh &amp; khó khăn</h2><table>${ps}</table></div></div>
      <h2>5. Hình ảnh hiện trường<b>${anh.length} ảnh</b></h2><div class="grid" style="grid-template-columns:repeat(6,1fr)">${anh.map((a) => `<img class="ph" src="${esc(API.anhUrl(a))}">`).join('') || '<span class="mu">Chưa có ảnh</span>'}</div>
      <h2>6. Ý kiến giám sát</h2><div class="box" style="background:#fff;border:1px solid #E1E8DE;min-height:26px">${esc(yk)}</div>
      <div class="meta" style="margin-top:5px">Người lập: ${esc(nguoiLap)} – chốt trên app</div>
      <div class="sig"><div style="width:42%">ĐẠI DIỆN NHÀ THẦU<br>${CT.nt.toUpperCase()}<br><br><br>${KY_NT}</div><div style="width:42%">ĐẠI DIỆN KHÁCH SẠN<br>MÖVENPICK RESORT WAVERLY PHU QUOC<br><br><br>${KY_KS}</div></div>
      <div class="foot"><span>Tự tạo khi Chốt ngày · cuối kỳ xuất gộp thành một quyển</span><span>NK-${ngay.replace(/-/g, '')}</span></div></div>`;
  }

  /* ---- số liệu kỳ dùng chung cho YCNT, BBNT, phụ lục ---- */
  async function soKyNT(d, k) {
    const dvs = S.dm.dauviec.filter((v) => /^DV0[1-8]$/.test(v.ma) || v.ma === 'DV37' || v.ma === 'DV38');
    const dk = dvs.map((v) => { const n = G.dsVT(v.ma).length || 1; const x = new Set(d.TickDinhKy.filter((r) => r['Mã việc'] === v.ma && (r['Trạng thái'] || 'Xong') === 'Xong').map((r) => r['Mã vị trí'])).size; return { ten: v.ten, n, x: Math.min(x, n) }; });
    const tn = dk.reduce((a, x) => a + x.n, 0), tx = dk.reduce((a, x) => a + x.x, 0);
    const c = await G.tinhCong(k.tu, k.den); const cd = d.ChamDiem; const dat = cd.filter((r) => (r['Kết quả'] || (+r['Điểm (1–5)'] >= 4 ? 'Đạt' : '')) === 'Đạt').length;
    const loi = d.Phieu.filter((p) => String(p['Giờ tạo']).slice(0, 10) >= k.tu && String(p['Giờ tạo']).slice(0, 10) <= k.den); const loiXong = loi.filter((p) => p['Trạng thái'] === 'Đã duyệt').length;
    const bv = G.tinhBV(await G.taiBV(k.tu, k.den), k.tu, k.den);
    return { dk, tn, tx, pDK: tn ? tx / tn * 100 : 0, c, diem: cd.length ? dat / cd.length * 100 : null, luot: new Set(cd.map((r) => r['Mã lượt'] || r['Ngày'] + r['Mã vị trí'])).size, loi: loi.length, loiXong, bv, soTrang: [...new Set(d.NgayLamViec.map((r) => r['Ngày']))].length };
  }
  const so1 = (x) => G.so(x, 1);

  /* ---- (3) PHIẾU YÊU CẦU NGHIỆM THU · YCNT/CSCQ-MVP/MM-YYYY · ngày 18 ---- */
  const row = (vi, en, v) => `<tr><td style="width:30%" class="mu">${vi} / <i>${en}</i></td><td class="b">${v}</td></tr>`;
  const ycnt = (k, s, nt) => { const so = `YCNT/CSCQ-MVP/${soKy(k)}`; const ngay18 = G.congNgay(k.den, -1); return `<div class="pg">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid ${DK};padding-bottom:7px"><img src="${IMG('mvp.svg')}" style="height:40px"><div style="text-align:center"><div style="font-size:19px;font-weight:800;color:${DK};letter-spacing:.5px">INSPECTION REQUEST</div><div style="font-size:15px;font-weight:700;color:${DK2}">PHIẾU YÊU CẦU NGHIỆM THU</div></div><img src="${IMG('pqc.svg')}" style="height:48px"></div>
    <div style="display:flex;justify-content:space-between;margin:6px 0 2px" class="meta"><span>GreenLog · Bộ phận Cảnh quan</span><span>Số <b>${so}</b> · Ngày <b>${G.ngayVN(ngay18)}</b> · <span class="chip ${nt ? 'g' : 'o'}">${nt ? 'Đã nghiệm thu' : 'Chờ nghiệm thu'}</span></span></div>
    <h2>Thông tin chung<b>General information</b></h2><table>${row('Công trình', 'Project', CT.congTrinh)}${row('Địa chỉ', 'Address', CT.diaChi)}${row('Chủ đầu tư', 'Owner', CT.cdt.toUpperCase())}${row('Nhà thầu', 'Contractor', CT.nt.toUpperCase())}${row('Số tham chiếu', 'Doc ref No', so)}${row('Ngày', 'Date', G.ngayVN(ngay18))}</table>
    <h2>Nội dung đề nghị nghiệm thu<b>Detailed description of works to be inspected</b></h2>
    <table><tr><th style="width:28%">HẠNG MỤC<br><i style="font-weight:500">Construction item</i></th><th style="width:30%">CÔNG VIỆC<br><i style="font-weight:500">Construction job</i></th><th>VỊ TRÍ<br><i style="font-weight:500">Location</i></th><th style="width:18%">THỜI GIAN<br><i style="font-weight:500">Time</i></th></tr>
    <tr><td>Chăm sóc cảnh quan ${CT.congTrinh}</td><td>Nghiệm thu công tác chăm sóc bảo dưỡng cây xanh cảnh quan ${CT.congTrinh} <b>(Tháng ${soKy(k).replace('-', '/')} · kỳ ${G.ngayVN(k.tu)} – ${G.ngayVN(k.den)})</b></td><td>${CT.congTrinh}</td><td class="b">13h30' ngày ${G.ngayVN(k.den)}</td></tr></table>
    <h2>Hồ sơ kèm theo<b>Attached documents · GreenLog</b></h2>
    <table><tr><th>#</th><th>Tài liệu</th><th>Số hiệu</th><th>Ghi chú</th></tr><tr><td>1</td><td>Nhật ký thi công – Quyển ${quyenSo(k)} (bản chính)</td><td>NK-${maKy(k)}</td><td>${s.soTrang} trang · ${G.ngayVN(k.tu)} – ${G.ngayVN(k.den)}</td></tr>
    <tr><td>2</td><td>Bảng công chi tiết kỳ</td><td>BC-${maKy(k)}</td><td>${G.so(s.c.tt)} / ${G.so(s.c.hd + 12)} công</td></tr><tr><td>3</td><td>Phụ lục kết quả dịch vụ kỳ (nếu dùng)</td><td>PL-${maKy(k)}</td><td>Hoàn thành định kỳ ${so1(s.pDK)}%</td></tr><tr><td>4</td><td>Sơ đồ khu vực đánh dấu (nếu có)</td><td>—</td><td class="mu">Attach marked-up drawing</td></tr></table>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px"><div class="box" style="text-align:center;height:170px;position:relative;background:#fff;border:1px solid #E1E8DE"><b style="color:${DK}">YÊU CẦU BỞI / <i>REQUESTED BY</i></b><br><span class="mu">Đại diện nhà thầu – ${CT.nt}</span><div style="position:absolute;bottom:10px;left:0;right:0">${KY_NT}</div></div>
    <div class="box" style="text-align:center;height:170px;position:relative;background:#fff;border:1px solid #E1E8DE"><b style="color:${DK}">XÁC NHẬN BỞI / <i>ACKNOWLEDGED BY</i></b><br><span class="mu">Đại diện khách sạn Mövenpick Resort Waverly Phu Quoc</span><div style="position:absolute;bottom:10px;left:0;right:0">${KY_KS}</div></div></div>
    <div class="foot"><span>App tự tạo ngày 18 hằng tháng · số hiệu nối với nhật ký, bảng công, biên bản nghiệm thu BBNT/CSCQ-MVP/${soKy(k)}</span><span>YCNT-${maKy(k)}</span></div></div>`; };

  /* ---- (4) BIÊN BẢN NGHIỆM THU · BBNT/CSCQ-MVP/MM-YYYY · ngày 19 ---- */
  const kv = (a, b) => `<tr><td style="width:24%" class="mu">${a}</td><td>${b}</td></tr>`;
  const bbnt = (k, s, nt) => { nt = nt || {}; const [y, mth, dd] = k.den.split('-'); const kl = nt['Kết luận'] || 'Đồng ý nghiệm thu'; const ck = (t) => `<span class="ck ${kl === t ? 'x' : ''}"></span>`;
    return `<div class="pg" style="font-size:9.8px"><div style="display:flex;justify-content:space-between;align-items:center"><img src="${IMG('mvp.svg')}" style="height:40px"><div style="text-align:center;line-height:1.45"><div class="b" style="font-size:11px">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div><div class="b">Độc lập – Tự do – Hạnh phúc</div><div class="mu" style="font-style:italic">Phú Quốc, ngày ${dd} tháng ${mth} năm ${y}</div></div><img src="${IMG('pqc.svg')}" style="height:48px"></div>
    <div style="text-align:center;border-bottom:3px solid ${DK};padding:8px 0 7px"><div style="font-size:19px;font-weight:800;color:${DK}">BIÊN BẢN NGHIỆM THU</div><div class="b" style="color:${DK2}">Số: BBNT/CSCQ-MVP/${soKy(k)} &nbsp;<span class="chip ${nt['Trạng thái'] === 'Đã nghiệm thu' ? 'g' : 'o'}">${esc(nt['Trạng thái'] || 'Bản nháp')}</span></div></div>
    <h2>Thông tin chung</h2><table>${kv('Công trình', '<b>' + CT.congTrinh + '</b>')}${kv('Hạng mục', 'Chăm sóc cảnh quan ' + CT.congTrinh)}${kv('Địa điểm thi công', CT.diaChi)}</table>
    <h2>1. Đối tượng nghiệm thu</h2><div style="padding:2px 5px"><b>Nghiệm thu công tác chăm sóc cây xanh cảnh quan ${CT.congTrinh} tháng ${mth}/${y} (kỳ ${G.ngayVN(k.tu)} – ${G.ngayVN(k.den)})</b></div>
    <h2>2. Thành phần trực tiếp tham gia nghiệm thu</h2><table><tr><th colspan="2">Đại diện: MÖVENPICK RESORT WAVERLY PHU QUOC – ${CT.cdt.toUpperCase()}</th></tr><tr><td style="width:45%">Ông: <b>Lê Vũ</b></td><td>Chức vụ: Trưởng bộ phận Cảnh Quan</td></tr><tr><td>Ông: ....................................</td><td>Chức vụ: ....................................</td></tr>
      <tr><th colspan="2">Đại diện: ${CT.nt.toUpperCase()}</th></tr><tr><td>Ông: <b>Mai Hòa Pháp</b></td><td>Chức vụ: Trưởng Phòng Quản Lý Cảnh Quan</td></tr><tr><td>Ông: ....................................</td><td>Chức vụ: ....................................</td></tr></table>
    <h2>3. Thời gian nghiệm thu</h2><table>${kv('Bắt đầu', `13h30' ngày ${G.ngayVN(k.den)}`)}${kv('Kết thúc', `17h30' ngày ${G.ngayVN(k.den)}`)}${kv('Tại', 'Mövenpick Resort Waverly Phu Quoc, ' + CT.diaChi)}</table>
    <h2>4. Đánh giá các hạng mục thi công</h2><div class="b" style="color:${DK2};margin:3px 0 2px">Về tài liệu làm căn cứ nghiệm thu</div>
    <table><tr><th>#</th><th>Căn cứ</th><th>Số hiệu</th></tr><tr><td>1</td><td>Phiếu yêu cầu nghiệm thu công việc của nhà thầu chăm sóc bảo dưỡng cây xanh</td><td>YCNT/CSCQ-MVP/${soKy(k)}</td></tr><tr><td>2</td><td>Tình hình chăm sóc bảo dưỡng cây xanh thực tế tại khu nghỉ dưỡng</td><td class="mu">Kiểm tra hiện trường ${G.ngayVN(k.den).slice(0, 5)}</td></tr>
      <tr><td>3</td><td>Nhật ký thi công tháng ${mth}/${y}</td><td>NK-${maKy(k)} · ${s.soTrang} trang</td></tr><tr><td>4</td><td>Quy định nghiệm thu hiện hành</td><td class="mu">—</td></tr><tr><td>5</td><td>Phụ lục kết quả dịch vụ kỳ (nếu dùng)</td><td>PL-${maKy(k)}</td></tr></table>
    <div class="b" style="color:${DK2};margin:6px 0 2px">Về chất lượng thi công</div>
    <div class="grid" style="grid-template-columns:repeat(4,1fr)">${[['Hoàn thành việc định kỳ', so1(s.pDK) + '%'], ['Tỷ lệ tiêu chí đạt (chấm điểm)', s.diem == null ? '—' : so1(s.diem) + '%'], ['Công thực tế / hợp đồng', `${G.so(s.c.tt)} / ${G.so(s.c.hd + 12)}`], ['Lỗi đã khắc phục', `${s.loiXong} / ${s.loi}`]].map(([a, b]) => `<div class="box"><div class="k">${a}</div><div class="v">${b}</div></div>`).join('')}</div>
    <div style="padding:4px 5px">${esc(nt['Chất lượng'] || 'Đảm bảo chất lượng theo Hợp đồng.')}</div>
    <h2>B) Các ý kiến khác (nếu có)</h2><div style="padding:2px 5px;line-height:1.7">${esc(nt['Ý kiến'] || '').replace(/\n/g, '<br>') || '.......................................................................................................................................................'}</div>
    <h2>5. Kết luận</h2><div class="box" style="background:#fff;border:1px solid #E1E8DE;line-height:1.8">${ck('Đồng ý nghiệm thu')}<b>Đồng ý nghiệm thu</b> công tác chăm sóc cây xanh cảnh quan cho Mövenpick Resort Waverly Phu Quoc tháng ${mth}/${y}<br>${ck('Đồng ý, khắc phục tồn tại')}Đồng ý nghiệm thu, nhà thầu khắc phục tồn tại theo mục B &nbsp;&nbsp; ${ck('Chưa đồng ý')}Chưa đồng ý nghiệm thu</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:9px"><div class="box" style="text-align:center;height:118px;position:relative;background:#fff;border:1px solid #E1E8DE"><b style="color:${DK}">ĐẠI DIỆN KHÁCH SẠN</b><br><span class="mu">Mövenpick Resort Waverly Phu Quoc</span><div style="position:absolute;bottom:8px;left:0;right:0">${KY_KS}</div></div>
    <div class="box" style="text-align:center;height:118px;position:relative;background:#fff;border:1px solid #E1E8DE"><b style="color:${DK}">ĐẠI DIỆN NHÀ THẦU</b><br><span class="mu">${CT.nt}</span><div style="position:absolute;bottom:8px;left:0;right:0">${KY_NT}</div></div></div>
    <div class="foot"><span>App tự lập ngày 19 khi đóng kỳ · nối với YCNT/CSCQ-MVP/${soKy(k)}, NK-${maKy(k)}, BC-${maKy(k)}</span><span>BBNT-${maKy(k)}</span></div></div>`; };

  /* ---- (5) PHỤ LỤC KẾT QUẢ DỊCH VỤ KỲ ---- */
  const phuLuc = (k, s, d) => { const ton = d.Phieu.filter((p) => !/Đã duyệt/.test(p['Trạng thái']) && String(p['Giờ tạo']).slice(0, 10) <= k.den).slice(0, 8); const bv = s.bv;
    return `<div class="pg" style="font-size:9.6px">${top(`PHỤ LỤC KẾT QUẢ DỊCH VỤ KỲ ${G.ngayVN(k.tu)} – ${G.ngayVN(k.den)}`, `Đính kèm BBNT/CSCQ-MVP/${soKy(k)}<br>Số liệu tự tổng hợp từ nhật ký thi công`)}
    <div class="grid" style="grid-template-columns:repeat(5,1fr)">${[['Hoàn thành định kỳ', so1(s.pDK) + '%', `${s.tx}/${s.tn} lượt vị trí`], ['Tiêu chí đạt', s.diem == null ? '—' : so1(s.diem) + '%', `${s.luot} lượt chấm`], ['Lỗi phát hiện', s.loi, `${s.loiXong} đã khắc phục`], ['Công thực tế', G.so(s.c.tt), `hợp đồng ${G.so(s.c.hd + 12)}`], ['Chênh lệch công', G.so(s.c.chenhThang), 'gồm 12 giám sát']].map(([a, b, c]) => `<div class="box"><div class="k">${a}</div><div class="v">${b}</div><div class="k">${c}</div></div>`).join('')}</div>
    <h2>1. Việc định kỳ theo kế hoạch kỳ</h2><table><tr><th>#</th><th>Đầu việc</th><th class="r">Kế hoạch</th><th class="r">Thực hiện</th><th class="r">Đạt</th><th></th></tr>${s.dk.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.ten)}</td><td class="r">${x.n}</td><td class="r">${x.x}</td><td class="r">${so1(x.x / x.n * 100)}%</td><td>${x.x >= x.n ? '<span class="chip g">Đạt</span>' : `<span class="chip o">Không hoàn thành ${x.n - x.x}</span>`}</td></tr>`).join('')}</table>
    <h2>2. Chất lượng &amp; tồn tại</h2><table><tr><th>Tồn tại</th><th>Vị trí</th><th>Hạn khắc phục</th><th>Trạng thái</th></tr>${ton.map((p) => `<tr><td>${esc(p['Mô tả'] || p['Loại lỗi'])}</td><td>${esc(G.tenVT(p['Mã vị trí'], p['Vị trí khác']))}</td><td>${esc(G.gioVN(p['Hạn']))}</td><td>${esc(p['Trạng thái'])}</td></tr>`).join('') || '<tr><td colspan="4" class="mu">Không có tồn tại</td></tr>'}</table>
    <h2>3. Nhân công &amp; vật tư</h2><div class="mu" style="line-height:1.6">Công thực tế ${G.so(s.c.tt)} · hợp đồng ${G.so(s.c.hd + 12)} (${G.so(s.c.hd)} theo ngày + 12 giám sát) · chênh ${G.so(s.c.chenhThang)} công (chi tiết: Bảng công chi tiết kỳ).<br>
      Thuốc BVTV ${G.so(bv.bvtv.so, 2)} L + ${G.so(bv.bvtv.kg, 2)} kg · phân vô cơ ${G.so(bv.phanvoco.kg, 1)} kg + ${G.so(bv.phanvoco.so, 2)} L · mùn cưa ${G.so(bv.muncua.so)} bao (${G.so(bv.muncua.so * 25)} kg) · ${G.so(bv.vanchuyen.so)} chuyến vận chuyển (${esc(bv.vanchuyen.phu || '')}).</div>
    <div class="foot"><span>GreenLog tự tổng hợp khi đóng kỳ</span><span>PL-${maKy(k)}</span></div></div>`; };

  /* ---- (6) BẢNG CÔNG CHI TIẾT ---- */
  const bangCong = (k, c) => { const wd = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']; const nen = (n) => (new Date(n).getDay() === 0 || G.laLe(n) ? 'background:#F6F0DE' : '');
    const nguoi = c.cn.filter((x) => c.ngay.some((n) => c.cong[x.ma + '|' + n]));
    const cell = (v, n) => `<td class="c" style="${nen(n)};color:${!v ? '#B33A36' : v === 0.5 ? '#B4621E' : '#14261B'};padding:1.5px 0">${v === 1 ? '1' : v === 0.5 ? '½' : v ? G.so(v) : '·'}</td>`;
    return `<div class="pg ngang">${top(`BẢNG CÔNG CHI TIẾT KỲ ${G.ngayVN(k.tu)} – ${G.ngayVN(k.den)}`, `Attendance Staff Report · tháng ${soKy(k).replace('-', '/')}<br>Nhà thầu PQC · ${nguoi.length} người trong kỳ`)}
    <table style="font-size:7.4px"><tr><th class="c">#</th><th>Họ và tên</th>${c.ngay.map((n) => `<th class="c" style="padding:2px 0;${nen(n) ? 'background:#EFE3BE' : ''}">${+n.slice(8)}<br><span style="font-weight:500">${G.laLe(n) ? 'Lễ' : wd[new Date(n).getDay()]}</span></th>`).join('')}<th class="r">Tổng</th></tr>
    ${nguoi.map((x, i) => { let t = 0; const cs = c.ngay.map((n) => { const v = c.cong[x.ma + '|' + n] || 0; t += v; return cell(v, n); }).join(''); return `<tr><td class="c">${i + 1}</td><td style="white-space:nowrap">${esc(x.ten)}</td>${cs}<td class="r b">${G.so(t)}</td></tr>`; }).join('')}
    <tr style="background:${BG}"><td></td><td class="b">Thực tế</td>${c.ngTT.map((v, i) => `<td class="c b" style="${nen(c.ngay[i])}">${G.so(v)}</td>`).join('')}<td class="r b">${G.so(c.tt)}</td></tr>
    <tr><td></td><td class="mu">Hợp đồng (31 / CN, lễ 20)</td>${c.ngHD.map((v, i) => `<td class="c" style="${nen(c.ngay[i])}">${v}</td>`).join('')}<td class="r">${c.hd}</td></tr>
    <tr><td></td><td class="b">Chênh lệch</td>${c.ngTT.map((v, i) => `<td class="c b" style="${nen(c.ngay[i])};color:${v - c.ngHD[i] < 0 ? '#B33A36' : '#1F6B35'}">${G.so(v - c.ngHD[i])}</td>`).join('')}<td class="r b">${G.so(c.chenh)}</td></tr></table>
    <div class="grid" style="grid-template-columns:1.2fr 1fr 1fr;margin-top:6px;align-items:start"><table><tr><th colspan="2">Tổng hợp kỳ</th></tr><tr><td>I. Công thực tế</td><td class="r b">${G.so(c.tt)} công</td></tr><tr><td>II. Công hợp đồng: ${c.hd} theo ngày + 12 giám sát</td><td class="r b">${c.hd + 12} công</td></tr><tr><td>Chênh lệch (I – II)</td><td class="r b" style="color:${c.chenhThang < 0 ? '#B33A36' : '#1F6B35'}">${G.so(c.chenhThang)} công</td></tr></table>
    <div class="meta" style="font-size:8.3px">Ký hiệu: 1 = cả ngày · ½ = một buổi · · = vắng · cột vàng = Chủ nhật / lễ${c.le.length ? ' (' + c.le.map(([n, t]) => G.ngayVN(n).slice(0, 5) + ' ' + esc(t)).join('; ') + ')' : ''}. Số lấy từ điểm danh sáng/chiều Trưởng bộ phận đã duyệt.</div>
    <div class="sig" style="margin-top:0"><div style="width:45%">Đại diện nhà thầu<br>&nbsp;<br><br>${KY_NT}</div><div style="width:45%">Đại diện khách sạn<br><span style="white-space:nowrap">Mövenpick Resort Waverly Phu Quoc</span><br><br>${KY_KS}</div></div></div>
    <div class="foot"><span>GreenLog xuất cùng nhật ký và biên bản nghiệm thu khi đóng kỳ</span><span>BC-${maKy(k)}</span></div></div>`; };

  const inHoSo = (tieuDe, body) => { const w = window.open('', '_blank'); if (!w) throw new Error('Trình duyệt chặn cửa sổ in. Cho phép cửa sổ bật lên rồi thử lại.');
    w.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(tieuDe)}</title><style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4;margin:0}@page ngang{size:A4 landscape}.pg.ngang{page:ngang}${BASE}@media screen{body{background:#ddd}.pg{margin:0 auto 12px;box-shadow:0 2px 8px rgba(0,0,0,.15)}}</style></head><body>${body}<script>setTimeout(()=>print(),900)<\/script></body></html>`); w.document.close(); };
  G.hoSoHTML = { bia, trangNK, ycnt, bbnt, phuLuc, bangCong, BASE, taiKy, soKyNT };

  /* ---------- màn Hồ sơ cuối kỳ ---------- */
  G.man.hoso = { ten: 'Hồ sơ cuối kỳ', ic: 'bao_cao', bt: '📁', nhom: 'Báo cáo', ph: () => G.laAnhVu() || G.qv('DV29') >= 1, fn: async () => {
    const st = G.man.hoso.st || (G.man.hoso.st = { ky: API.ky(G.congNgay(S.dm.ky.tu, -1)).ten });
    const kys = []; let n = S.dm.ky.tu; for (let i = 0; i < 6; i++) { kys.push(API.ky(n)); n = G.congNgay(API.ky(n).tu, -1); }
    const k = kys.find((x) => x.ten === st.ky) || kys[1];
    const m = G.khung('Hồ sơ cuối kỳ', `Kỳ ${k.ten} · mẫu đã duyệt 24/11/2026 · luôn xuất tiếng Việt`, '#/baocao');
    const d = await taiKy(k); const s = await soKyNT(d, k); const nt = d.NghiemThu.find((x) => x['Kỳ'] === k.ten);
    const ngay = []; for (let x = k.tu; x <= k.den && x <= hn(); x = G.congNgay(x, 1)) ngay.push(x);
    const daChot = ngay.filter((x) => d.NgayLamViec.some((r) => r['Ngày'] === x && r['Loại'] === 'Chốt ngày'));
    m.innerHTML = `<div class="chon">${kys.map((x) => `<button data-k="${x.ten}" class="${x.ten === k.ten ? 'dang' : ''}">${x.ten}</button>`).join('')}</div>
      <div class="the"><h2>Bộ hồ sơ kỳ ${esc(k.ten)}</h2><table class="bang">
        <tr><td>(1) Bìa nhật ký</td><td>Quyển số ${quyenSo(k)}</td><td><button class="nut nho" data-in="bia">Xem</button></td></tr>
        <tr><td>(2) Nhật ký thi công hằng ngày</td><td>${daChot.length}/${ngay.length} ngày đã chốt</td><td><button class="nut nho" data-in="nk">Xem</button></td></tr>
        <tr><td>(3) Phiếu yêu cầu nghiệm thu YCNT/CSCQ-MVP/${soKy(k)}</td><td>tự tạo ngày ${G.ngayVN(G.congNgay(k.den, -1))}</td><td><button class="nut nho" data-in="yc">Xem</button></td></tr>
        <tr><td>(4) Biên bản nghiệm thu BBNT/CSCQ-MVP/${soKy(k)}</td><td>${nt ? esc(nt['Trạng thái']) : 'chưa lập'}</td><td><button class="nut nho" data-in="bb">Xem</button>${G.laAnhVu() ? ' <button class="nut nho chinh" id="lapBB">Lập / sửa</button>' : ''}</td></tr>
        <tr><td>(5) Phụ lục kết quả dịch vụ kỳ</td><td>Định kỳ ${so1(s.pDK)}%</td><td><button class="nut nho" data-in="pl">Xem</button></td></tr>
        <tr><td>(6) Bảng công chi tiết</td><td>${G.so(s.c.tt)} / ${G.so(s.c.hd + 12)} công</td><td><button class="nut nho" data-in="bc">Xem</button></td></tr></table>
        <button class="nut chinh rong" data-in="tat" style="margin-top:10px">⬇ Xuất cả bộ (PDF)</button>
        <p class="mo">Hồ sơ pháp lý ký với nhà thầu luôn xuất tiếng Việt; phiếu yêu cầu nghiệm thu giữ song ngữ. Logo Mövenpick + PQC và ảnh phối cảnh lấy từ bộ mẫu đã duyệt.</p></div>`;
    m.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => { st.ky = b.dataset.k; G.taiLai(); }; });
    const phan = { bia: () => bia(k), nk: () => ngay.map((x, i) => trangNK(d, x, k, i + 1)).join(''), yc: () => ycnt(k, s, nt), bb: () => bbnt(k, s, nt), pl: () => phuLuc(k, s, d), bc: () => bangCong(k, s.c) };
    m.querySelectorAll('[data-in]').forEach((b) => { b.onclick = () => chay(async () => { const x = b.dataset.in; inHoSo('Hồ sơ cuối kỳ ' + k.ten, x === 'tat' ? ['bia', 'nk', 'yc', 'bb', 'pl', 'bc'].map((y) => phan[y]()).join('') : phan[x]()); }); });
    const lb = m.querySelector('#lapBB'); if (lb) lb.onclick = () => G.hop('Biên bản nghiệm thu ' + k.ten, '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), [{ k: 'cl', nhan: 'Về chất lượng thi công', loai: 'mota', gt: (nt || {})['Chất lượng'] || 'Đảm bảo chất lượng theo Hợp đồng.' }, { k: 'yk', nhan: 'B) Các ý kiến khác', loai: 'mota', gt: (nt || {})['Ý kiến'] || s.dk.filter((x) => x.x < x.n).map((x) => `– ${x.ten} đạt ${so1(x.x / x.n * 100)}%, phần còn lại hoàn thành trước ${G.ngayVN(G.congNgay(k.den, 6))}.`).join('\n') },
        { k: 'kl', nhan: 'Kết luận', loai: 'chips', ds: ['Đồng ý nghiệm thu', 'Đồng ý, khắc phục tồn tại', 'Chưa đồng ý'], bb: true, gt: (nt || {})['Kết luận'] || 'Đồng ý nghiệm thu' }, { k: 'tt', nhan: 'Trạng thái', loai: 'chips', ds: ['Bản nháp', 'Đã nghiệm thu'], bb: true, gt: (nt || {})['Trạng thái'] || 'Bản nháp' }]);
      o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghiNhieu', { bang: 'NghiemThu', thay: ['Kỳ'], dong: [{ 'Kỳ': k.ten, 'Ngày': k.den, 'Số': 'BBNT/CSCQ-MVP/' + soKy(k), 'Chất lượng': v.cl, 'Ý kiến': v.yk, 'Kết luận': v.kl, 'Trạng thái': v.tt, 'Người lập': S.u.ten, 'Giờ lập': API.bayGio() }] }); dong(); bao('Đã lưu biên bản'); G.taiLai(); }, e.target);
    });
  } };
  /* xem một trang nhật ký (sau khi chốt ngày) */
  G.man.nhatky = { an: true, fn: async (ngay) => { ngay = ngay || hn(); const k = API.ky(ngay); const d = await taiKy(k); const m = G.khung('Nhật ký thi công ' + G.ngayVN(ngay), 'Trang tự tạo khi chốt ngày', '#/');
    const trang = trangNK(d, ngay, k, Math.round((new Date(ngay) - new Date(k.tu)) / 864e5) + 1);
    m.innerHTML = `<button class="nut chinh rong" id="in" style="margin-bottom:10px">⬇ In / PDF</button><iframe style="width:100%;height:80vh;border:0;border-radius:12px;background:#ddd" srcdoc="${esc('<!doctype html><html><head><meta charset=utf-8><style>' + BASE + 'body{background:#ddd;padding:10px}.pg{margin:auto}</style></head><body>' + trang + '</body></html>')}"></iframe>`;
    m.querySelector('#in').onclick = () => chay(async () => inHoSo('Nhật ký ' + ngay, trangNK(d, ngay, k, Math.round((new Date(ngay) - new Date(k.tu)) / 864e5) + 1))); } };
})();
