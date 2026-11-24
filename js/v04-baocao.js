/* GreenLog 0.4 – Báo cáo tháng gửi GM (song ngữ, 5 trang, tick phần + ảnh, khung thời gian) và Slide họp tuần GM + HODs
   (điền đúng file mẫu Movenpick_Phu_Quoc_Weekly_HOD_Briefing_Template, không đổi định dạng; ⭐ đánh dấu việc không thường ngày) */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hn = () => API.ngay();
  const DK = '#123524', DK2 = '#1F4D2B', LI = '#C9E265', BG = '#F2F5EF', MU = '#5F6F64', CR = '#F6F3E9', AC = '#1F6B35';
  const ME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ENM = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const f0 = (v) => Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }); const f1 = (v) => Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 1 });
  const vn = (v, k) => G.so(v, k == null ? 1 : k);
  const bi = (en, vi) => `<span class="en">${en}</span><span class="vi">${vi}</span>`;
  /* 6 thẻ chính (thứ tự theo email tháng 10) */
  const KPI = [
    { k: 'reuse', en: 'Wastewater reuse', vi: 'Nước thải tái sử dụng', u: 'm³', mau: '#2E6F8E', lay: (b) => b.nuoc.so },
    { k: 'comp', en: 'Food waste → compost', vi: 'Rác hữu cơ → phân hữu cơ', u: 'kg', mau: AC, lay: (b) => b.compost.so, cho: true },
    { k: 'nur', en: 'Nursery production', vi: 'Cây ươm vườn ươm', u: 'pots', mau: '#9A7B2F', lay: (b) => b.vuonuom.so },
    { k: 'plant', en: 'Plants planted', vi: 'Cây trồng mới / trồng dặm', u: 'plants', mau: AC, lay: (b, d) => b._trong },
    { k: 'beach', en: 'Beach cleaning', vi: 'Rác thu gom bãi biển', u: 'kg', mau: '#2E6F8E', lay: (b) => b.racbien.so },
    { k: 'harv', en: 'Vị Garden harvest', vi: 'Thu hoạch Vị Garden', u: 'kg', mau: '#9A7B2F', lay: (b) => b.vigarden.so },
  ];
  const khoangGM = (kieu, tu, den) => {
    const d = hn(); const y = +d.slice(0, 4), m = +d.slice(5, 7);
    if (kieu === 'thang') { const t = G.dauThang(d); return [t, d, 'thang']; }
    if (kieu === 'thangtruoc') { const t = API.ngay(new Date(y, m - 2, 1)); const e = API.ngay(new Date(y, m - 1, 0)); return [t, e, 'thang']; }
    if (kieu === 'ky') return [API.ky(G.congNgay(S.dm.ky.tu, -1)).tu, API.ky(G.congNgay(S.dm.ky.tu, -1)).den, 'ky'];
    if (kieu === 'quy') { const qm = Math.floor((m - 1) / 3) * 3; return [API.ngay(new Date(y, qm, 1)), d, 'quy']; }
    if (kieu === 'nam') return [G.dauNam(d), d, 'nam'];
    return [tu || G.dauThang(d), den || d, 'tuy'];
  };
  async function soLieuGM(tu, den) {
    const nam0 = G.dauNam(den); const truocTu = G.congNgay(tu, -(Math.round((new Date(den) - new Date(tu)) / 864e5) + 1)); const truocDen = G.congNgay(tu, -1);
    const d = await G.taiBV(nam0 < truocTu ? nam0 : truocTu, den);
    const x = await G.docNhieu([{ bang: 'SoTrongCay', gioiHan: 5000 }, { bang: 'BaoCaoGM', gioiHan: 500 }, { bang: 'DuAn', gioiHan: 200 }, { bang: 'DichHai', gioiHan: 500 }, { bang: 'NhacNho', gioiHan: 1000 }, { bang: 'ChamDiem', loc: { 'Ngày': { tu, den } } },
      { bang: 'TickDinhKy', gioiHan: 20000 }, { bang: 'KhoKhan', loc: { 'Ngày': { tu, den } } }, { bang: 'HoanViec', loc: { 'Ngày': { tu, den } } }, { bang: 'DaoTao', gioiHan: 500 }, { bang: 'KetQuaThi', gioiHan: 2000 }, { bang: 'SuKien', gioiHan: 200 }, { bang: 'KeHoachTuan', gioiHan: 3000 }]);
    Object.keys(x).forEach((k) => { x[k] = x[k] || []; });
    const cu = {}; x.BaoCaoGM.filter((r) => r['Loại'] === 'Số liệu cũ').forEach((r) => { cu[r['Tháng'] + '|' + r['Chỉ số']] = +r['Giá trị'] || 0; });
    const bvOf = (a, b) => { const bv = G.tinhBV(d, a, b); bv._trong = x.SoTrongCay.filter((r) => String(r['Thời gian']).slice(0, 10) >= a && String(r['Thời gian']).slice(0, 10) <= b && !/m²|m2/i.test(r['ĐVT'])).reduce((s, r) => s + (+r['Số lượng'] || 0), 0); return bv; };
    const nay = bvOf(tu, den); const truoc = bvOf(truocTu, truocDen);
    const y = +den.slice(0, 4); const mDen = +den.slice(5, 7);
    const thang = []; for (let i = 0; i < mDen; i++) { const a = API.ngay(new Date(y, i, 1)); const b = API.ngay(new Date(y, i + 1, 0)) > den ? den : API.ngay(new Date(y, i + 1, 0)); const bv = bvOf(a, b); thang.push(KPI.map((k) => { const v = k.lay(bv); return v || cu[(i + 1) + '|' + k.k] || 0; })); }
    // vận hành
    const k = API.ky(G.congNgay(den, 0) > S.dm.ky.den ? S.dm.ky.tu : den); const kyBC = den >= S.dm.ky.tu ? API.ky(G.congNgay(S.dm.ky.tu, -1)) : API.ky(den);
    const dvs = S.dm.dauviec.filter((v) => /^DV0[1-8]$/.test(v.ma) || v.ma === 'DV37' || v.ma === 'DV38');
    const dk = dvs.map((v) => { const n = G.dsVT(v.ma).length || 1; const xx = new Set(x.TickDinhKy.filter((r) => r['Kỳ'] === kyBC.ten && r['Mã việc'] === v.ma && (r['Trạng thái'] || 'Xong') === 'Xong').map((r) => r['Mã vị trí'])).size; return { ten: v.ten, p: Math.min(100, xx / n * 100) }; });
    const pDK = dk.reduce((a, v) => a + v.p, 0) / (dk.length || 1);
    const cong = await G.tinhCong(kyBC.tu, kyBC.den);
    const cd = x.ChamDiem; const dat = cd.filter((r) => (r['Kết quả'] || (+r['Điểm (1–5)'] >= 4 ? 'Đạt' : '')) === 'Đạt').length;
    const yc = x.NhacNho.filter((r) => r['Ngày'] >= tu && r['Ngày'] <= den); const ycXong = yc.filter((r) => /Đã xong/.test(r['Trạng thái']));
    const theoBP = {}; yc.forEach((r) => { theoBP[r['Nguồn']] = (theoBP[r['Nguồn']] || 0) + 1; });
    const hoan = {}; x.HoanViec.forEach((r) => { hoan[r['Lý do']] = (hoan[r['Lý do']] || 0) + 1; });
    const dt = x.DaoTao.filter((r) => r['Ngày'] >= tu && r['Ngày'] <= den && /Hoàn thành/.test(r['Trạng thái'] || 'Hoàn thành'));
    return { tu, den, truocTu, truocDen, nay, truoc, thang, kyBC, dk, pDK, cong, cd: cd.length ? dat / cd.length * 100 : null, luotCD: cd.length, yc, ycXong, theoBP, hoan, x, dt, d };
  }
  /* nhận xét song ngữ tự viết từ số liệu */
  function nhanXet(s) {
    const n = s.nay, t = s.truoc; const pct = (a, b) => (b ? Math.round((a - b) / b * 100) : null);
    const hl = []; const at = [];
    if (n.nuoc.tong) hl.push([`<b>${n.nuoc.tyLe}%</b> of garden irrigation came from treated wastewater (${f0(n.nuoc.so)} of ${f0(n.nuoc.tong)} m³)${t.nuoc.tong ? `, ${n.nuoc.tyLe - t.nuoc.tyLe >= 0 ? '+' : ''}${n.nuoc.tyLe - t.nuoc.tyLe} pts vs previous period` : ''}.`, `${n.nuoc.tyLe}% nước tưới sân vườn là nước thải sau xử lý (${vn(n.nuoc.so, 0)}/${vn(n.nuoc.tong, 0)} m³)${t.nuoc.tong ? `, ${n.nuoc.tyLe - t.nuoc.tyLe >= 0 ? 'tăng' : 'giảm'} ${Math.abs(n.nuoc.tyLe - t.nuoc.tyLe)} điểm so với kỳ trước` : ''}.`]);
    s.x.DuAn.filter((a) => a['Trạng thái'] === 'Đang làm' || a['Trạng thái'] === 'Hoàn thành').slice(0, 2).forEach((a) => hl.push([`Project “${esc(a['Tên'])}”: <b>${esc(a['Tiến độ (%)'] || (a['Trạng thái'] === 'Hoàn thành' ? 100 : '—'))}%</b>.`, `Dự án “${esc(a['Tên'])}”: ${esc(a['Tiến độ (%)'] || (a['Trạng thái'] === 'Hoàn thành' ? 100 : '—'))}%.`]));
    if (n.vigarden.so) hl.push([`Vị Garden harvest <b>${f1(n.vigarden.so)} kg</b>${pct(n.vigarden.so, t.vigarden.so) != null ? ` (${pct(n.vigarden.so, t.vigarden.so) >= 0 ? '+' : ''}${pct(n.vigarden.so, t.vigarden.so)}%)` : ''}, delivered to the kitchen.`, `Thu hoạch Vị Garden ${vn(n.vigarden.so)} kg, giao cho bếp.`]);
    if (n.racbien.so) hl.push([`Beach cleaning <b>${f0(n.racbien.so)} kg</b> of waste collected.`, `Thu gom ${vn(n.racbien.so, 0)} kg rác bãi biển.`]);
    if (s.cong.chenhThang < 0) at.push([`Contractor manpower <b>${f0(s.cong.chenhThang)} man-days</b> vs contract (${f1(s.cong.tt / (s.cong.hd + 12) * 100)}%); follow-up with PQC.`, `Nhân công nhà thầu thiếu ${vn(-s.cong.chenhThang)} công so với hợp đồng (${vn(s.cong.tt / (s.cong.hd + 12) * 100)}%); đã yêu cầu PQC khắc phục.`]);
    const dh = s.x.DichHai.filter((r) => !/Đã duyệt/.test(r['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)'])); if (dh.length) at.push([`${dh.length} plant-health case(s) under treatment.`, `${dh.length} hồ sơ dịch hại đang xử lý.`]);
    if (Object.keys(s.hoan).length) at.push([`${Object.values(s.hoan).reduce((a, b) => a + b, 0)} postponed task(s), all with reasons and make-up dates.`, `${Object.values(s.hoan).reduce((a, b) => a + b, 0)} việc hoãn, đều có lý do và ngày làm bù.`]);
    return { hl, at };
  }

  /* ---------- dựng 5 trang ---------- */
  const CSS = `@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Be Vietnam Pro',Inter,Arial,sans-serif;color:#14261B;font-size:9.6px}
.pg{width:210mm;height:297mm;background:#fff;padding:10mm 12mm 14mm;position:relative;overflow:hidden;page-break-after:always}@media screen{body{background:#ddd}.pg{margin:0 auto 12px}}
.en{display:block}.vi{display:block;color:${MU};font-style:italic;font-size:.88em;margin-top:1px}
.hero{background:${DK};color:#fff;border-radius:12px;padding:14px 16px 12px;margin:-2mm -2mm 8px}.hero .t{font-size:20px;font-weight:800}.hero .vi{color:#B9C8B9}
.grid6{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.card{background:${CR};border-radius:10px;padding:9px 10px 8px;color:#14261B}
.card .lb{font-size:9.5px;font-weight:800;text-transform:uppercase}.card .lb .vi{text-transform:none;font-weight:500}.card .v{font-size:25px;font-weight:800;margin-top:3px;line-height:1}.card .v small{font-size:13px;margin-left:3px}
.card .row{display:flex;justify-content:space-between;align-items:flex-end;margin-top:5px}.ytd{font-size:9px;color:${MU};line-height:1.45}.ytd b{color:#14261B}.up{color:${AC};font-weight:800}.dn{color:#B33A36;font-weight:800}
.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${DK};padding-bottom:6px;margin-bottom:8px}.logo{display:flex;gap:7px;align-items:center;font-weight:800;font-size:12px;color:${DK}}.logo i{width:22px;height:22px;border-radius:7px;background:${LI};display:grid;place-items:center;font-style:normal;color:${DK}}
.top .meta{text-align:right;color:${MU};font-size:9px;line-height:1.5}
h2{font-size:12px;color:#fff;background:${DK};padding:5px 10px;border-radius:7px;margin:8px 0 5px;display:flex;justify-content:space-between;align-items:center}h2 .vi{color:#B9C8B9;font-size:9.5px;display:inline;margin-left:6px}h2 b{color:${LI};font-weight:600;font-size:10px}
h3{font-size:10.5px;color:${DK2};margin:7px 0 4px}h3 .vi{display:inline;font-weight:500}
table{width:100%;border-collapse:collapse;margin-bottom:4px}th{background:#E7EFE3;color:${DK};font-size:8.8px;text-align:left;padding:4px 5px;font-weight:700}th .vi{font-weight:500}td{padding:3px 5px;border-bottom:1px solid #E6ECE4;vertical-align:top}
.r{text-align:right}.c{text-align:center}.b{font-weight:700}.chip{display:inline-block;padding:1px 7px;border-radius:99px;font-size:8.5px;font-weight:700}.g{background:#E5F4E4;color:#1F6B35}.o{background:#FCEBDD;color:#B4621E}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.box{background:${BG};border-radius:9px;padding:8px 10px}
ul.bl{list-style:none}ul.bl li{padding:3px 0 3px 14px;position:relative;border-bottom:1px dashed #DDE5D9}ul.bl li:before{content:'';position:absolute;left:2px;top:7px;width:6px;height:6px;border-radius:2px;background:${AC}}ul.bl.w li:before{background:#D08A2E}
.foot{position:absolute;bottom:7mm;left:12mm;right:12mm;display:flex;justify-content:space-between;color:${MU};font-size:8.5px;border-top:1px solid #E6ECE4;padding-top:4px}
.ph{width:100%;height:110px;object-fit:cover;border-radius:8px}.sm{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.mini{border:1px solid #E1E8DE;border-radius:9px;padding:7px 8px}.mini .n{font-weight:800;font-size:10px}`;
  function dung(s, opt) {
    const tenKy = opt.kieu === 'thang' ? `${ENM[+s.den.slice(5, 7) - 1]} ${s.den.slice(0, 4)}` : `${G.ngayVN(s.tu)} – ${G.ngayVN(s.den)}`;
    const nhan = opt.kieu === 'thang' ? '' : 'Báo cáo theo giai đoạn · ';
    const ref = 'GL-GM-' + s.den.slice(2, 4) + s.den.slice(5, 7) + (opt.kieu === 'thang' ? '' : '-' + opt.kieu.toUpperCase());
    const N = opt.phan.length; let pgN = 0; const foot = () => `<div class="foot"><span>Mövenpick Resort Waverly Phú Quốc · Landscape Department · Data auto-compiled by GreenLog · ${nhan}${G.ngayVN(s.tu)}–${G.ngayVN(s.den)}</span><span>Page ${++pgN}/${N}</span></div>`;
    const top = (en, vi) => `<div class="top"><div><div class="logo"><i>✓</i>Landscape &amp; Sustainability Report · ${tenKy}</div><div style="font-size:15px;font-weight:800;color:${DK};margin-top:5px">${en}</div><div class="vi" style="font-size:10px">${vi}</div></div><div class="meta">To: ${esc(opt.gm)}<br>From: Le Vu, Landscape Manager<br>Issued ${G.ngayVN(hn())} · Ref ${ref}</div></div>`;
    const mY = s.thang.length; const sumY = (i) => s.thang.reduce((a, r) => a + r[i], 0);
    const spark = (i, col) => { const v = s.thang.map((r) => r[i]); const mx = Math.max(1, ...v); const bw = 96 / Math.max(1, v.length); return `<svg width="96" height="30">${v.map((x, j) => `<rect x="${j * bw + 1}" y="${30 - x / mx * 30}" width="${bw - 2}" height="${x / mx * 30}" rx="1.5" fill="${j === v.length - 1 ? col : '#CFD8CC'}"/>`).join('')}</svg>`; };
    const nx = nhanXet(s); const out = [];
    if (opt.phan.includes(1)) {
      const cards = KPI.map((k, i) => { const cur = k.lay(s.nay), prev = k.lay(s.truoc); const dd = prev ? (cur - prev) / prev * 100 : null;
        return `<div class="card"><div class="lb">${k.en}<span class="vi">${k.vi}${k.cho ? ' · (nguồn số liệu chờ anh chốt)' : ''}</span></div><div class="v" style="color:${k.mau}">${f0(cur)}<small>${k.u}</small></div>
          <div class="row"><div class="ytd">YTD ${s.den.slice(0, 4)} <b>${f0(sumY(i))} ${k.u}</b><br>${dd == null ? '—' : `<span class="${dd >= 0 ? 'up' : 'dn'}">${dd >= 0 ? '▲' : '▼'} ${Math.abs(dd).toFixed(0)}%</span> vs prev.`}</div>${spark(i, k.mau)}</div></div>`; }).join('');
      out.push(`<div class="pg"><div class="hero"><div class="logo" style="color:#fff"><i>✓</i>Mövenpick Resort Waverly Phú Quốc · Landscape</div><div class="t" style="margin-top:10px">LANDSCAPE &amp; SUSTAINABILITY</div><div class="t" style="font-size:15px;font-weight:600;color:${LI}">${opt.kieu === 'thang' ? 'Monthly Report' : 'Period Report'} · ${tenKy}</div>
        <div class="vi" style="font-size:10.5px">Báo cáo Cảnh quan &amp; Phát triển bền vững · ${opt.kieu === 'thang' ? 'Tháng ' + s.den.slice(5, 7) + '/' + s.den.slice(0, 4) : nhan + G.ngayVN(s.tu) + ' – ' + G.ngayVN(s.den)}</div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:9.5px;color:#DDE6DA"><span>Prepared for <b style="color:#fff">${esc(opt.gm)}</b><br>Prepared by <b style="color:#fff">Le Vu</b>, Landscape Manager</span><span style="color:${LI};font-weight:700;letter-spacing:1px">REUSE · RESTORE · GROW · PROTECT</span></div><div class="grid6">${cards}</div></div>
        <div class="two"><div><h3>Highlights<span class="vi"> · Điểm nổi bật</span></h3><ul class="bl">${nx.hl.map((x) => `<li>${bi(x[0], x[1])}</li>`).join('')}${opt.ghiChu.hl ? `<li>${bi(esc(opt.ghiChu.hlEn || ''), esc(opt.ghiChu.hl))}</li>` : ''}</ul></div>
        <div><h3>Attention<span class="vi"> · Cần lưu ý</span></h3><ul class="bl w">${nx.at.map((x) => `<li>${bi(x[0], x[1])}</li>`).join('') || `<li>${bi('No major issue.', 'Không có vấn đề lớn.')}</li>`}</ul>
        <h3>Focus next month<span class="vi"> · Trọng tâm tháng tới</span></h3><ul class="bl">${(opt.ghiChu.focus || '').split('\n').filter(Boolean).map((x) => `<li>${bi(esc((opt.ghiChu.focusEn || '').split('\n')[0] || ''), esc(x))}</li>`).join('') || s.x.KeHoachTuan.filter((r) => r['Tuần'] >= s.den).slice(0, 3).map((r) => `<li>${bi('', esc(r['Nội dung']))}</li>`).join('') || `<li>${bi('Continue scheduled maintenance.', 'Duy trì việc định kỳ.')}</li>`}</ul></div></div>
        <h2>Operations at a glance<span class="vi">Vận hành tóm tắt</span><b>${esc(s.kyBC.ten)}</b></h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px">
        <div class="box"><div class="vi">Scheduled maintenance · Việc định kỳ</div><div style="font-size:20px;font-weight:800;color:${AC}">${f1(s.pDK)}%</div></div>
        <div class="box"><div class="vi">Quality · Tiêu chí đạt</div><div style="font-size:20px;font-weight:800;color:${AC}">${s.cd == null ? '—' : f1(s.cd) + '%'}</div><div class="ytd">${s.luotCD} criteria checked</div></div>
        <div class="box"><div class="vi">Dept. requests · Yêu cầu bộ phận</div><div style="font-size:20px;font-weight:800;color:${AC}">${s.ycXong.length}/${s.yc.length}</div><div class="ytd">closed</div></div>
        <div class="box"><div class="vi">Manpower · Nhân công</div><div style="font-size:20px;font-weight:800;color:${s.cong.chenhThang < 0 ? '#B4621E' : AC}">${f1(s.cong.tt / (s.cong.hd + 12) * 100)}%</div><div class="ytd">${f1(s.cong.tt)}/${s.cong.hd + 12} man-days</div></div></div>${foot()}</div>`);
    }
    if (opt.phan.includes(2)) {
      const mins = KPI.map((k, i) => { const v = s.thang.map((r) => r[i]); const W = 200, H = 70, bw = W / Math.max(1, v.length), mx = Math.max(1, ...v) * 1.15; const cum = v.map((_, j) => v.slice(0, j + 1).reduce((a, b) => a + b, 0)); const cm = Math.max(1, cum[cum.length - 1]) * 1.1;
        return `<div class="mini"><div style="display:flex;justify-content:space-between"><div><div class="n">${k.en}</div><div class="vi">${k.vi}</div></div><div class="n" style="color:${k.mau}">${f0(sumY(i))} ${k.u}</div></div>
          <svg width="100%" viewBox="0 0 ${W} ${H + 12}">${v.map((x, j) => `<rect x="${j * bw + 3}" y="${H - x / mx * H}" width="${bw - 6}" height="${x / mx * H}" rx="2" fill="${k.mau}" opacity="${j === v.length - 1 ? 1 : 0.55}"/><text x="${j * bw + bw / 2}" y="${H + 10}" font-size="7" text-anchor="middle" fill="${MU}">${ME[j][0]}</text>`).join('')}<polyline points="${cum.map((c, j) => `${j * bw + bw / 2},${H - c / cm * H}`).join(' ')}" fill="none" stroke="${DK}" stroke-width="1.5"/></svg></div>`; }).join('');
      const n = s.nay;
      out.push(`<div class="pg">${top('Year-to-date progress', 'Tiến độ lũy kế từ đầu năm')}<div class="sm">${mins}</div>
        <h2>Key indicators<span class="vi">Bảng chỉ số chính</span><b>Jan–${ME[mY - 1]} ${s.den.slice(0, 4)}</b></h2><table><tr><th>Indicator</th><th>Unit</th><th class="r">This period</th><th class="r">Previous</th><th class="r">YTD</th><th class="r">Avg/month</th></tr>
        ${KPI.map((k, i) => `<tr><td><b>${k.en}</b><span class="vi">${k.vi}</span></td><td>${k.u}</td><td class="r b">${f0(k.lay(s.nay))}</td><td class="r">${f0(k.lay(s.truoc))}</td><td class="r b">${f0(sumY(i))}</td><td class="r">${f0(sumY(i) / mY)}</td></tr>`).join('')}</table>
        <h3>Supporting indicators<span class="vi"> · Chỉ số bổ trợ</span></h3><table><tr><th>Indicator</th><th class="r">This period</th><th>Comment</th></tr>
        <tr><td>Total irrigation water<span class="vi">Tổng nước tưới</span></td><td class="r">${f0(n.nuoc.tong)} m³</td><td>Reuse share ${n.nuoc.tyLe}%<span class="vi">Tỷ lệ tái sử dụng ${n.nuoc.tyLe}%</span></td></tr>
        <tr><td>Organic soil amendment<span class="vi">Chất cải tạo đất hữu cơ</span></td><td class="r">${f0(n.muncua.so)} bags · ${f0(n.muncua.so * 25)} kg</td><td>Composted sawdust<span class="vi">Mùn cưa ủ</span></td></tr>
        <tr><td>Inorganic fertiliser<span class="vi">Phân bón vô cơ</span></td><td class="r">${f1(n.phanvoco.kg)} kg · ${f1(n.phanvoco.so)} L</td><td>Litres and kilograms reported separately<span class="vi">Tách lít và kg</span></td></tr>
        <tr><td>Plant protection products<span class="vi">Thuốc BVTV</span></td><td class="r">${f1(n.bvtv.so)} L · ${f1(n.bvtv.kg)} kg</td><td>Approved list only<span class="vi">Chỉ dùng danh mục duyệt</span></td></tr>
        <tr><td>Transport trips<span class="vi">Vận chuyển</span></td><td class="r">${f0(n.vanchuyen.so)}</td><td>${esc(n.vanchuyen.phu || '')}</td></tr></table>${foot()}</div>`);
    }
    if (opt.phan.includes(3)) {
      const dkSvg = `<svg width="100%" viewBox="0 0 400 ${s.dk.length * 20 + 4}">${s.dk.map((x, i) => `<text x="0" y="${i * 20 + 12}" font-size="9">${esc(x.ten.slice(0, 26))}</text><rect x="150" y="${i * 20 + 3}" width="200" height="11" rx="5.5" fill="#E7ECE6"/><rect x="150" y="${i * 20 + 3}" width="${x.p * 2}" height="11" rx="5.5" fill="${x.p >= 90 ? AC : '#C9A227'}"/><text x="356" y="${i * 20 + 12}" font-size="9" font-weight="700">${Math.round(x.p)}%</text>`).join('')}</svg>`;
      const dh = s.x.DichHai.filter((r) => r['Ngày phát hiện'] >= G.congNgay(s.tu, -30)).slice(0, 6);
      out.push(`<div class="pg">${top('Garden operations &amp; service quality', 'Vận hành sân vườn &amp; chất lượng dịch vụ')}
        <div class="two"><div><h2>Scheduled maintenance<span class="vi">Việc định kỳ</span><b>${esc(s.kyBC.ten)}</b></h2>${dkSvg}<div class="vi">Hoàn thành chung ${vn(s.pDK)}%. Hoãn có giải trình: ${Object.keys(s.hoan).map((k) => esc(k) + ' ' + s.hoan[k]).join(', ') || '0'}.</div></div>
        <div><h2>Manpower – contractor PQC<span class="vi">Nhân công nhà thầu</span></h2><table><tr><th></th><th class="r">Contract</th><th class="r">Actual</th><th class="r">Variance</th></tr>
          <tr><td>Days (Mon–Sat 31, Sun/holiday 20)<span class="vi">Theo ngày</span></td><td class="r">${s.cong.hd}</td><td class="r">${f1(s.cong.tt)}</td><td class="r ${s.cong.chenh < 0 ? 'dn' : 'up'}">${f1(s.cong.chenh)}</td></tr><tr><td>Supervision<span class="vi">Giám sát</span></td><td class="r">12</td><td class="r">—</td><td class="r">−12</td></tr>
          <tr><td class="b">Total</td><td class="r b">${s.cong.hd + 12}</td><td class="r b">${f1(s.cong.tt)}</td><td class="r b ${s.cong.chenhThang < 0 ? 'dn' : 'up'}">${f1(s.cong.chenhThang)}</td></tr></table>
          <h2>Training<span class="vi">Đào tạo</span></h2><div class="box">${s.dt.length} classes · ${f1(s.dt.reduce((a, r) => a + (+String(r['Tổng thời lượng'] || '0').replace(',', '.') || 0), 0))} h<span class="vi">${s.dt.length} lớp đã hoàn thành</span></div></div></div>
        <h2>Requests from other departments<span class="vi">Yêu cầu từ các bộ phận</span><b>${s.yc.length} received · ${s.ycXong.length} closed</b></h2><table><tr><th>Department</th><th class="r">Requests</th></tr>${Object.keys(s.theoBP).map((k) => `<tr><td>${esc(k)}</td><td class="r b">${s.theoBP[k]}</td></tr>`).join('') || '<tr><td colspan="2">—</td></tr>'}</table>
        <h2>Special-tree care &amp; plant health<span class="vi">Chăm sóc cây đặc biệt &amp; sức khỏe cây</span></h2><table><tr><th>Case</th><th>Plant · location</th><th>Severity</th><th>Status</th></tr>${dh.map((r) => `<tr><td>${esc(r['Mã DH'])}</td><td>${esc(r['Tên cây'] || '')} · ${esc(G.tenVT(r['Mã vị trí'], r['Vị trí chi tiết']))}<span class="vi">${esc(r['Loại dịch hại'])}</span></td><td>${esc(r['Mức độ'])}</td><td><span class="chip ${/Đã duyệt/.test(r['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)']) ? 'g' : 'o'}">${esc(r['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)'])}</span></td></tr>`).join('') || '<tr><td colspan="4">—</td></tr>'}</table>${foot()}</div>`);
    }
    if (opt.phan.includes(4)) {
      const da = s.x.DuAn.filter((a) => a['Trạng thái'] === 'Đang làm' || (a['Trạng thái'] === 'Hoàn thành' && (a['Kết thúc'] || '') >= s.tu));
      out.push(`<div class="pg">${top('Projects &amp; before / after', 'Dự án cải tạo &amp; hình ảnh trước / sau')}<h2>Landscape projects<span class="vi">Dự án cải tạo cảnh quan</span><b>${da.length}</b></h2>
        ${da.map((a) => { const an = (opt.anh[a['Mã DA']] || []); return `<div style="margin-bottom:8px"><b style="font-size:10.5px">${esc(a['Tên'])}</b> · ${esc(a['Tiến độ (%)'] || '')}%<span class="vi">${esc(a['Loại'] || '')} · ${G.ngayVN(a['Bắt đầu'])} → ${G.ngayVN(a['Kết thúc'])}</span>
          ${an.length ? `<div class="two" style="margin-top:5px">${an.slice(0, 2).map((x) => `<img class="ph" src="${esc(API.anhUrl(x))}">`).join('')}</div>` : ''}</div>`; }).join('') || '<p>—</p>'}
        <h2>Requests from GM &amp; site checks<span class="vi">Việc GM giao &amp; kiểm tra hiện trường</span></h2><table><tr><th>Date</th><th>Request</th><th>Status</th></tr>${s.yc.filter((r) => /GM/.test(r['Nguồn'])).map((r) => `<tr><td>${G.ngayVN(r['Ngày']).slice(0, 5)}</td><td>${esc(r['Nội dung'])}</td><td>${esc(r['Trạng thái'])}</td></tr>`).join('') || '<tr><td colspan="3">—</td></tr>'}</table>${foot()}</div>`);
    }
    if (opt.phan.includes(5)) {
      const kh = s.x.KeHoachTuan.filter((r) => r['Tuần'] > s.den).slice(0, 12); const kk = s.x.KhoKhan;
      out.push(`<div class="pg">${top('Next month plan &amp; support needed', 'Kế hoạch tháng tới &amp; đề xuất hỗ trợ')}<h2>Plan<span class="vi">Kế hoạch</span></h2><table><tr><th>Week</th><th>Task</th><th>Team</th></tr>${kh.map((r) => `<tr><td>${G.ngayVN(r['Tuần']).slice(0, 5)}</td><td>${esc(r['Nội dung'])}</td><td>${esc(r['Đội/Người'] || '')}</td></tr>`).join('') || '<tr><td colspan="3">Scheduled maintenance 20 → 19 as per contract.<span class="vi">Việc định kỳ theo hợp đồng.</span></td></tr>'}</table>
        <div class="two"><div><h2>Challenges<span class="vi">Khó khăn</span></h2><ul class="bl w">${kk.slice(0, 6).map((x) => `<li>${bi('', esc(x['Loại'] + ': ' + x['Mô tả']))}</li>`).join('') || `<li>${bi('None.', 'Không có.')}</li>`}</ul></div>
        <div><h2>Support requested<span class="vi">Đề xuất hỗ trợ</span></h2><ul class="bl">${(opt.ghiChu.ht || '').split('\n').filter(Boolean).map((x, i) => `<li>${bi(esc((opt.ghiChu.htEn || '').split('\n')[i] || ''), esc(x))}</li>`).join('') || `<li>${bi('—', '—')}</li>`}</ul></div></div>
        <h2>Attachments<span class="vi">Tài liệu đính kèm</span></h2><table><tr><th>#</th><th>Document</th><th>Source</th></tr><tr><td>1</td><td>Attendance Staff Report (Excel)</td><td>GreenLog export</td></tr><tr><td>2</td><td>Key indicators by month (Excel)</td><td>GreenLog export</td></tr><tr><td>3</td><td>Period-end documents (site log, inspection)</td><td>GreenLog export</td></tr></table>
        <div style="display:flex;justify-content:space-between;margin-top:14px;font-size:10px"><div style="width:44%;text-align:center">Prepared by · Người lập<br><br><br><b>Le Vu</b><br>Landscape Manager<span class="vi">Trưởng bộ phận Cảnh Quan</span></div><div style="width:44%;text-align:center">Acknowledged by · Xác nhận<br><br><br><b>${esc(opt.gm.split(',')[0])}</b><br>General Manager</div></div>${foot()}</div>`);
    }
    return `<style>${CSS}</style>${out.join('')}`;
  }
  /* ảnh email: vẽ SVG thuần → PNG (không cần thư viện) */
  async function anhEmail(s, tenKy) {
    const W = 900, H = 520; let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="22" fill="${DK}"/><text x="32" y="56" font-family="Arial" font-size="30" font-weight="700" fill="#fff">LANDSCAPE &amp; SUSTAINABILITY</text><text x="32" y="90" font-family="Arial" font-size="20" fill="${LI}">${esc(tenKy)}</text>`;
    KPI.forEach((k, i) => { const x = 32 + (i % 3) * 284, y = 120 + Math.floor(i / 3) * 190; const v = k.lay(s.nay); svg += `<rect x="${x}" y="${y}" width="268" height="172" rx="16" fill="${CR}"/><text x="${x + 18}" y="${y + 36}" font-family="Arial" font-size="15" font-weight="700" fill="#14261B">${esc(k.en.toUpperCase())}</text><text x="${x + 18}" y="${y + 58}" font-family="Arial" font-size="13" font-style="italic" fill="${MU}">${esc(k.vi)}</text><text x="${x + 18}" y="${y + 120}" font-family="Arial" font-size="46" font-weight="700" fill="${k.mau}">${f0(v)}<tspan font-size="20"> ${k.u}</tspan></text><text x="${x + 18}" y="${y + 152}" font-family="Arial" font-size="13" fill="${MU}">YTD ${f0(s.thang.reduce((a, r) => a + r[i], 0))} ${k.u}</text>`; });
    svg += '</svg>';
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await new Promise((ok) => { img.onload = ok; img.onerror = ok; });
    const c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2; const x = c.getContext('2d'); x.scale(2, 2); x.drawImage(img, 0, 0); return c.toDataURL('image/png');
  }

  G.man.baocaogm = { ten: 'Báo cáo tháng gửi GM', ic: 'bao_cao', bt: '📈', nhom: 'Báo cáo', ph: 'homnay', cap: 3, fn: async (sub) => {
    if (sub === 'socu') return soCu();
    const st = G.man.baocaogm.st || (G.man.baocaogm.st = { kieu: 'thangtruoc', tu: '', den: '', phan: [1, 2, 3, 4, 5], anh: {}, ghiChu: {} });
    const [tu, den, kieu] = khoangGM(st.kieu, st.tu, st.den);
    const m = G.khung('Báo cáo gửi GM', `${G.ngayVN(tu)} → ${G.ngayVN(den)} · song ngữ EN / VI`, '#/baocao');
    const s = await soLieuGM(tu, den); const gm = G.caiDat('GM', 'Mr Claudio Schibli, General Manager');
    const daKhoa = s.x.BaoCaoGM.find((r) => r['Loại'] === 'Bản chính thức' && r['Từ'] === tu && r['Đến'] === den);
    const thieu = []; if (!s.nay.nuoc.tong) thieu.push('đồng hồ nước'); if (!s.nay.vigarden.so) thieu.push('thu hoạch Vị Garden'); if (!s.nay.racbien.so) thieu.push('rác bãi biển'); if (s.thang.slice(0, -1).some((r) => r.every((v) => !v))) thieu.push('số liệu các tháng trước (T1–T10)');
    const da = s.x.DuAn.filter((a) => a['Trạng thái'] === 'Đang làm' || a['Trạng thái'] === 'Hoàn thành');
    m.innerHTML = `<div class="chon">${[['thangtruoc', 'Tháng trước'], ['thang', 'Tháng này (01 → nay)'], ['ky', 'Kỳ nhà thầu 20 → 19'], ['quy', 'Quý'], ['nam', 'Từ đầu năm'], ['tuy', 'Tùy chọn']].map(([k, t]) => `<button data-kieu="${k}" class="${st.kieu === k ? 'dang' : ''}">${t}</button>`).join('')}</div>
      ${st.kieu === 'tuy' ? `<div class="luoi2"><label class="o"><span>Từ ngày</span><input type="date" id="tu" value="${tu}"></label><label class="o"><span>Đến ngày</span><input type="date" id="den" value="${den}"></label></div>` : ''}
      <div class="the ${thieu.length ? 'the-mo' : 'the-xanh'}"><b>Kiểm tra dữ liệu</b><div class="mo">${thieu.length ? 'Còn thiếu: ' + thieu.join(', ') : 'Đủ dữ liệu cho báo cáo'}. So sánh với ${G.ngayVN(s.truocTu)} – ${G.ngayVN(s.truocDen)} (cùng độ dài).${kieu !== 'thang' ? ' Bản này ghi "Báo cáo theo giai đoạn", không khóa số.' : ''}</div>${daKhoa ? `<span class="chip xanh">Đã khóa số ${esc(G.gioVN(daKhoa['Giờ']))}</span>` : ''}
        <a class="nut nho" href="#/baocaogm/socu" style="margin-top:8px">Nhập số liệu tháng cũ (T1–T10)</a></div>
      <div class="the"><h2>Phần đưa vào báo cáo</h2>${[[1, 'Tr.1 Tổng quan: 6 thẻ, nổi bật, lưu ý, trọng tâm, vận hành'], [2, 'Tr.2 Lũy kế theo tháng + chỉ số phụ'], [3, 'Tr.3 Vận hành: định kỳ, nhân công, yêu cầu bộ phận, cây đặc biệt'], [4, 'Tr.4 Dự án ảnh trước/sau + việc GM giao'], [5, 'Tr.5 Kế hoạch tháng tới, khó khăn, đề xuất, đính kèm, ký']].map(([n, t]) => `<label class="hang" style="padding:4px 0"><input type="checkbox" data-phan="${n}" ${st.phan.includes(n) ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>
      ${da.length ? `<div class="the"><h2>Ảnh trước / sau cho dự án</h2>${da.map((a) => `<div style="margin-bottom:8px"><b>${esc(a['Tên'])}</b><div data-anhda="${esc(a['Mã DA'])}"></div></div>`).join('')}</div>` : ''}
      <div class="the"><h2>Nhận xét thêm (app đã tự viết phần chính từ số liệu)</h2><div id="f"></div></div>
      <div class="nhom-nut" style="flex-wrap:wrap;margin-bottom:30px"><button class="nut chinh" id="pdf">⬇ PDF</button><button class="nut" id="png">🖼 Ảnh email</button><button class="nut" id="xls">⬇ Excel</button><button class="nut" id="mail">✉ Email soạn sẵn</button>${kieu === 'thang' && !daKhoa ? '<button class="nut" id="khoa">🔒 Khóa số bản tháng</button>' : ''}</div>`;
    m.querySelectorAll('[data-kieu]').forEach((b) => { b.onclick = () => { st.kieu = b.dataset.kieu; G.taiLai(); }; });
    ['tu', 'den'].forEach((id) => { const i = m.querySelector('#' + id); if (i) i.onchange = () => { st[id] = i.value; G.taiLai(); }; });
    m.querySelectorAll('[data-phan]').forEach((c) => { c.onchange = () => { const n = +c.dataset.phan; st.phan = c.checked ? [...new Set(st.phan.concat(n))].sort() : st.phan.filter((x) => x !== n); }; });
    const oa = {}; m.querySelectorAll('[data-anhda]').forEach((el) => { oa[el.dataset.anhda] = G.oAnh(el, { tuyChon: true, batBuoc: false, toiDa: 2 }); });
    const lay = G.form(m.querySelector('#f'), [{ k: 'hl', nhan: 'Điểm nổi bật thêm (VI)', loai: 'mota', gt: st.ghiChu.hl }, { k: 'hlEn', nhan: 'Highlight (EN)', loai: 'chu', gt: st.ghiChu.hlEn }, { k: 'focus', nhan: 'Trọng tâm tháng tới (VI, mỗi dòng 1 ý)', loai: 'mota', gt: st.ghiChu.focus }, { k: 'focusEn', nhan: 'Focus next month (EN)', loai: 'chu', gt: st.ghiChu.focusEn },
      { k: 'ht', nhan: 'Đề xuất hỗ trợ (VI, mỗi dòng 1 ý)', loai: 'mota', gt: st.ghiChu.ht }, { k: 'htEn', nhan: 'Support requested (EN)', loai: 'chu', gt: st.ghiChu.htEn }, { k: 'gm', nhan: 'Gửi tới', loai: 'chu', gt: gm }]);
    const opt = () => { const v = lay(); st.ghiChu = v; const anh = {}; Object.keys(oa).forEach((k) => { anh[k] = oa[k].ds(); }); return { kieu, phan: st.phan, anh, ghiChu: v, gm: v.gm || gm }; };
    const tenKy = kieu === 'thang' ? `${ENM[+den.slice(5, 7) - 1]} ${den.slice(0, 4)}` : `${G.ngayVN(tu)} – ${G.ngayVN(den)}`;
    m.querySelector('#pdf').onclick = () => chay(async () => G.inA4('Landscape Report ' + tenKy, dung(s, opt())));
    m.querySelector('#png').onclick = () => chay(async () => { const url = await anhEmail(s, tenKy); const a = document.createElement('a'); a.href = url; a.download = 'Email_Highlights_' + den + '.png'; a.click(); });
    m.querySelector('#xls').onclick = () => G.taiCSV('GM_KPI_' + den, [['Month'].concat(KPI.map((k) => k.en + ' (' + k.u + ')'))].concat(s.thang.map((r, i) => [ME[i]].concat(r))).concat([['YTD'].concat(KPI.map((_, i) => s.thang.reduce((a, r) => a + r[i], 0)))]));
    m.querySelector('#mail').onclick = () => { const o = opt(); const nx = nhanXet(s); const body = `Dear ${o.gm.split(',')[0]},\n\nPlease find attached the Landscape & Sustainability report for ${tenKy}.\n\nHighlights:\n${nx.hl.map((x) => '- ' + x[0].replace(/<[^>]+>/g, '')).join('\n')}\n\nBest regards,\nLe Vu\nLandscape Manager`;
      location.href = `mailto:?subject=${encodeURIComponent('Landscape & Sustainability Report · ' + tenKy)}&body=${encodeURIComponent(body)}`; };
    const kh = m.querySelector('#khoa'); if (kh) kh.onclick = () => chay(async () => { await API.goi('ghi', { bang: 'BaoCaoGM', dong: { 'Loại': 'Bản chính thức', 'Từ': tu, 'Đến': den, 'Số liệu': JSON.stringify({ kpi: KPI.map((k) => [k.k, k.lay(s.nay)]) }), 'Giờ': API.bayGio(), 'Người ghi': '' } }); bao('Đã khóa số báo cáo tháng'); G.taiLai(); });
  } };
  async function soCu() {
    const m = G.khung('Số liệu tháng cũ', 'Nhập T1–T10 khi chưa có GreenLog', '#/baocaogm'); const nam = hn().slice(0, 4); const ds = (await G.doc('BaoCaoGM')).filter((r) => r['Loại'] === 'Số liệu cũ' && r['Năm'] === nam);
    const gt = (t, k) => (ds.find((r) => r['Tháng'] === String(t) && r['Chỉ số'] === k) || {})['Giá trị'] || '';
    m.innerHTML = `<div class="the cuon-ngang"><table class="bang"><tr><th>Tháng</th>${KPI.map((k) => `<th>${esc(k.vi)} (${k.u})</th>`).join('')}</tr>${Array.from({ length: +hn().slice(5, 7) - 1 }, (_, i) => `<tr><td>T${i + 1}</td>${KPI.map((k) => `<td><input type="number" style="width:90px" data-t="${i + 1}" data-k="${k.k}" value="${esc(gt(i + 1, k.k))}"></td>`).join('')}</tr>`).join('')}</table></div><button class="nut chinh rong" id="luu">Lưu</button>`;
    m.querySelector('#luu').onclick = (e) => chay(async () => { const rows = [...m.querySelectorAll('[data-t]')].filter((i) => i.value !== '').map((i) => ({ 'Loại': 'Số liệu cũ', 'Năm': nam, 'Tháng': i.dataset.t, 'Chỉ số': i.dataset.k, 'Giá trị': i.value }));
      await API.goi('ghiNhieu', { bang: 'BaoCaoGM', thay: ['Loại', 'Năm', 'Tháng', 'Chỉ số'], dong: rows }); bao('Đã lưu ' + rows.length + ' ô'); location.hash = '#/baocaogm'; }, e.target);
  }

  /* ================= SLIDE HỌP TUẦN GM + HODs (mục 41–42) ================= */
  const NHAN = ['Sáng kiến', 'Dự án', 'Cải tiến quy trình', 'Khó khăn', 'Phối hợp bộ phận', 'Thành tích / khách khen', 'Xu hướng khách', 'Tiết kiệm chi phí', 'Đào tạo'];
  const NHAN_EN = { 'Sáng kiến': 'Initiative', 'Dự án': 'Project', 'Cải tiến quy trình': 'Process improvement', 'Khó khăn': 'Challenge', 'Phối hợp bộ phận': 'Cross-department', 'Thành tích / khách khen': 'Achievement', 'Xu hướng khách': 'Guest trend', 'Tiết kiệm chi phí': 'Cost saving', 'Đào tạo': 'Training' };
  G.danhSao = (ctx) => G.hop('⭐ Đưa vào slide tuần', '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
    const lay = G.form(o.querySelector('#f'), [{ k: 'nhan', nhan: 'Nhãn', loai: 'chips', ds: NHAN, bb: true }, { k: 'vi', nhan: 'Nội dung (VI)', loai: 'mota', bb: true, gt: ctx.tieuDe || '' }, { k: 'en', nhan: 'Nội dung (EN) – slide tiếng Anh', loai: 'chu' }, { k: 'anh', nhan: 'Ảnh cho trang ảnh', loai: 'anh', toiDa: 3, tuyChon: true, gt: ctx.anh }]);
    o.querySelector('#l').onclick = (e) => chay(async () => { const v = lay(); await API.goi('ghi', { bang: 'DanhDauSlide', dong: { 'Mã': G.ma('SL'), 'Ngày': '', 'Tuần': G.thu2(), 'Nhãn': v.nhan, 'Nội dung VI': v.vi, 'Nội dung EN': v.en, 'Ảnh': v.anh, 'Liên kết': ctx.link || location.hash, 'Chọn': 'Có', 'Người ghi': '' } }); dong(); bao('⭐ Đã đưa vào slide tuần'); }, e.target);
  });
  // nút ⭐ ở cuối mọi cửa sổ chi tiết (cạnh 📌)
  new MutationObserver((ms) => ms.forEach((mm) => mm.addedNodes.forEach((n) => { if (n.nodeType === 1 && n.classList && n.classList.contains('chan-hop') && G.laAnhVu() && !n.querySelector('[data-sao]')) { const b = G.h('<button type="button" class="nut" data-sao>⭐ Slide tuần</button>'); b.onclick = () => G.danhSao({ tieuDe: ((n.closest('.hop') || {}).querySelector ? n.closest('.hop').querySelector('.hop-dau h2').textContent : '') }); n.appendChild(b); } }))).observe(document.body, { childList: true, subtree: true });

  async function soLieuTuan() {
    const a = G.congNgay(G.thu2(), -7); const b = G.congNgay(a, 6); // tuần T2–CN trước buổi họp thứ Ba
    const loc = { 'Ngày': { tu: a, den: b } };
    const d = await G.docNhieu([{ bang: 'TickDinhKy', loc }, { bang: 'SoTrongCay', gioiHan: 3000 }, { bang: 'Phieu', gioiHan: 800 }, { bang: 'NhacNho', gioiHan: 500 }, { bang: 'DanhDauSlide', gioiHan: 500 }, { bang: 'DuAn', gioiHan: 100 }, { bang: 'ViecPhatSinh', loc }, { bang: 'DaoTao', gioiHan: 300 }, { bang: 'KhoKhan', loc }, { bang: 'SuKien', gioiHan: 100 }]);
    Object.keys(d).forEach((k) => { d[k] = d[k] || []; });
    const bv = G.tinhBV(await G.taiBV(a, b), a, b);
    const vt = new Set(d.TickDinhKy.filter((r) => (r['Trạng thái'] || 'Xong') === 'Xong').map((r) => r['Mã việc'] + r['Mã vị trí'])).size;
    const cay = d.SoTrongCay.filter((r) => String(r['Thời gian']).slice(0, 10) >= a && String(r['Thời gian']).slice(0, 10) <= b).reduce((s, r) => s + (+r['Số lượng'] || 0), 0);
    const mo = d.Phieu.filter((p) => !/Đã duyệt/.test(p['Trạng thái'])).length + d.NhacNho.filter((x) => !/Đã xong|Bỏ/.test(x['Trạng thái'])).length;
    // gợi ý việc không thường ngày (việc thường ngày mặc định loại; chỉ vào khi bất thường → Khó khăn)
    const goiY = [];
    d.DuAn.filter((x) => x['Trạng thái'] === 'Đang làm').forEach((x) => goiY.push({ nhan: 'Dự án', vi: `${x['Tên']}: ${x['Tiến độ (%)'] || ''}%`, en: `${x['Tên']}: ${x['Tiến độ (%)'] || ''}% complete` }));
    d.ViecPhatSinh.filter((x) => x['Loại việc'] === 'Hỗ trợ bộ phận khác').forEach((x) => goiY.push({ nhan: 'Phối hợp bộ phận', vi: `Hỗ trợ ${x['Hỗ trợ']}: ${x['Mô tả']}`, en: `Support to ${x['Hỗ trợ']}: ${x['Mô tả']}` }));
    d.KhoKhan.forEach((x) => goiY.push({ nhan: 'Khó khăn', vi: `${x['Loại']}: ${x['Mô tả']}`, en: '' }));
    d.DaoTao.filter((x) => x['Ngày'] >= a && x['Ngày'] <= b).forEach((x) => goiY.push({ nhan: 'Đào tạo', vi: `Lớp ${x['Nội dung']} · ${x['Số học viên'] || ''} người`, en: `Training: ${x['Nội dung']}` }));
    if (bv.vuonuom.xuat) goiY.push({ nhan: 'Tiết kiệm chi phí', vi: `Vườn ươm tự cung cấp ${vn(bv.vuonuom.xuat, 0)} cây, không phải mua`, en: `Our nursery supplied ${f0(bv.vuonuom.xuat)} plants instead of buying` });
    if (bv.compost.so) goiY.push({ nhan: 'Sáng kiến', vi: `${vn(bv.compost.so)} kg rác bếp, bar thành phân hữu cơ`, en: `${f1(bv.compost.so)} kg of kitchen and bar waste turned into compost` });
    const sao = d.DanhDauSlide.filter((x) => x['Tuần'] === G.thu2() || (x['Ngày'] >= a && x['Ngày'] <= b));
    return { a, b, vt, cay, nuoc: bv.nuoc, mo, goiY, sao, d, bv };
  }
  /* điền file mẫu bằng JSZip: thay chữ trong khung có sẵn, giữ nguyên màu/font/layout */
  const xe = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  async function dungPPTX(mau, nd) {
    if (!window.JSZip) throw new Error('Thiếu thư viện JSZip');
    const z = await JSZip.loadAsync(mau); const doc = async (p) => z.file(p).async('string'); const ghi = (p, x) => z.file(p, x);
    const rep = async (n, pairs) => { const p = `ppt/slides/slide${n}.xml`; let x = await doc(p); pairs.forEach(([o, m]) => { const a = '<a:t>' + o + '</a:t>'; if (x.includes(a)) x = x.replace(a, '<a:t>' + xe(m) + '</a:t>'); }); ghi(p, x.replace(/ show="0"/g, '')); };
    const notes = async (n, en, vi) => { const rel = await doc(`ppt/slides/_rels/slide${n}.xml.rels`); const t = (rel.match(/notesSlides\/(notesSlide\d+\.xml)/) || [])[1]; if (!t) return; const p = 'ppt/notesSlides/' + t; let x = await doc(p);
      x = x.replace(/(<p:sp>(?:(?!<\/p:sp>).)*?type="body"(?:(?!<\/p:sp>).)*?<p:txBody>(?:(?!<a:p>).)*?)(<a:p>.*?)(<\/p:txBody>)/s, (_, a, b, c) => `${a}<a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>EN: ${xe(en)}</a:t></a:r></a:p><a:p><a:r><a:rPr lang="vi-VN" dirty="0"/><a:t>VI: ${xe(vi)}</a:t></a:r></a:p>${c}`); ghi(p, x); };
    const anh = async (n, rIds, ds) => { const p = `ppt/slides/_rels/slide${n}.xml.rels`; let rel = await doc(p); for (let i = 0; i < Math.min(rIds.length, ds.length); i++) { const b64 = String(ds[i]).split(',')[1]; if (!b64) continue; const ten = `ppt/media/gl_${n}_${i}.jpg`; z.file(ten, b64, { base64: true }); rel = rel.replace(new RegExp(`(Id="${rIds[i]}"[^>]*Target=")[^"]+(")`), `$1../media/gl_${n}_${i}.jpg$2`); } ghi(p, rel); };
    await rep(13, [['Presenter: [Name, Title] · [10–15] min', 'Presenter: Le Vu, Landscape Manager · 15 min']]);
    await rep(14, [['–', nd.kpi[0]], ['–', nd.kpi[1]], ['–', nd.kpi[2]], ['–', nd.kpi[3]], ['[What drove the result this week]', nd.drove], ['[Actions to close any gap vs budget]', nd.actions], ['PASTE HERE', 'PROJECT PROGRESS'], ['Financial or departmental report (optional)', nd.duAnNgan], ['Copy the table or report page, then Home &gt; Paste &gt; Picture. Delete this box afterwards.', ' ']]);
    await notes(14, nd.kpiNoteEn, nd.kpiNoteVi);
    const hl = nd.highlights.concat(['', '', '', '', '']).slice(0, 5);
    await rep(37, [['[DEPARTMENT]', 'LANDSCAPING'], ['Past week', nd.tuanEn]].concat(hl.slice(0, 3).map((x) => ['[Activity · result]', x.en || ' '])).concat(hl.slice(3, 5).map((x) => ['[Achievement or compliment]', x.en || ' '])));
    await notes(37, nd.highlights.map((x) => x.en).filter(Boolean).join(' '), nd.highlights.map((x) => x.vi).filter(Boolean).join(' '));
    const pa = nd.anhTrang || [];
    if (pa[0]) { await rep(41, [['SLIDE TEMPLATE', 'LANDSCAPING · ' + (NHAN_EN[pa[0].nhan] || 'HIGHLIGHT').toUpperCase()], ['Hero Picture · Half Slide', pa[0].en || pa[0].vi], ['Text left, picture right', nd.tuanEn], ['Key message', pa[0].en || ' '], ['[Short supporting point]', ' '], ['[Short supporting point]', ' '], ['[Short supporting point]', ' ']]); await anh(41, ['rId3'], pa[0].anh); await notes(41, pa[0].en || '', pa[0].vi); }
    if (pa[1]) { await rep(43, [['SLIDE TEMPLATE', 'LANDSCAPING · ' + (NHAN_EN[pa[1].nhan] || 'HIGHLIGHT').toUpperCase()], ['Two Quarter Pictures', pa[1].en || pa[1].vi], ['Text left, two pictures right', nd.tuanEn], ['Key message', pa[1].en || ' '], ['[Short supporting point]', ' '], ['[Short supporting point]', ' ']]); await anh(43, ['rId3', 'rId4'], pa[1].anh); await notes(43, pa[1].en || '', pa[1].vi); }
    if (pa[2]) { await rep(44, [['SLIDE TEMPLATE', 'LANDSCAPING · ' + (NHAN_EN[pa[2].nhan] || 'HIGHLIGHT').toUpperCase()], ['Three Pictures with Captions', pa[2].en || pa[2].vi], ['[Caption]', ' '], ['[Caption]', ' '], ['[Caption]', ' ']]); await anh(44, ['rId3', 'rId4', 'rId5'], pa[2].anh); await notes(44, pa[2].en || '', pa[2].vi); }
    const rows = nd.plans.concat(Array(5).fill(null)).slice(0, 5); const pairs = [['[DEPARTMENT]', 'LANDSCAPING']]; rows.forEach((r) => { ['[Project or plan]', '[Name]', '[Status]', '[DD MMM]', '[Next step]'].forEach((k, i) => pairs.push([k, r ? r[i] : ' '])); });
    await rep(38, pairs); await notes(38, nd.plansEn, nd.plansVi);
    await rep(39, [['[DEPARTMENT]', 'LANDSCAPING'], ['[Idea to improve guest experience, revenue or efficiency]', nd.sug[0] || ' '], ['[Department · what is needed · by when]', nd.sug[1] || ' '], ['[Decision · from whom · by when]', nd.sug[2] || ' ']]); await notes(39, nd.sugEn, nd.sugVi);
    // giữ đúng thứ tự trang mẫu: Landscaping mở đầu → Performance → Highlights → ảnh → Plans → Suggestions (+ KPIs buổi đầu tháng)
    const giu = ['slide13', 'slide14', 'slide37'].concat(pa[0] ? ['slide41'] : []).concat(pa[1] ? ['slide43'] : []).concat(pa[2] ? ['slide44'] : []).concat(['slide38', 'slide39']);
    const prel = await doc('ppt/_rels/presentation.xml.rels'); const ridOf = (s) => (prel.match(new RegExp(`Id="(rId\\d+)"[^>]*Target="slides/${s}.xml"`)) || prel.match(new RegExp(`Target="slides/${s}.xml"[^>]*Id="(rId\\d+)"`)) || [])[1];
    let pres = await doc('ppt/presentation.xml'); const ids = {}; (pres.match(/<p:sldId [^>]*\/>/g) || []).forEach((t) => { ids[(t.match(/r:id="(rId\d+)"/) || [])[1]] = t; });
    pres = pres.replace(/<p:sldIdLst>.*?<\/p:sldIdLst>/s, '<p:sldIdLst>' + giu.map((s) => ids[ridOf(s)]).filter(Boolean).join('') + '</p:sldIdLst>'); ghi('ppt/presentation.xml', pres);
    // bỏ hẳn các trang không dùng (để PowerPoint không báo sửa file)
    const tatCa = Object.keys(z.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f)).map((f) => f.match(/(slide\d+)\.xml/)[1]);
    let prel2 = prel; let ct = await doc('[Content_Types].xml');
    for (const s of tatCa.filter((x) => !giu.includes(x))) { const rel = await doc(`ppt/slides/_rels/${s}.xml.rels`).catch(() => ''); const nt = (rel.match(/notesSlides\/(notesSlide\d+)\.xml/) || [])[1];
      z.remove(`ppt/slides/${s}.xml`); z.remove(`ppt/slides/_rels/${s}.xml.rels`); prel2 = prel2.replace(new RegExp(`<Relationship [^>]*Target="slides/${s}.xml"[^>]*/>`), ''); ct = ct.replace(new RegExp(`<Override PartName="/ppt/slides/${s}.xml"[^>]*/>`), '');
      if (nt) { z.remove(`ppt/notesSlides/${nt}.xml`); z.remove(`ppt/notesSlides/_rels/${nt}.xml.rels`); ct = ct.replace(new RegExp(`<Override PartName="/ppt/notesSlides/${nt}.xml"[^>]*/>`), ''); } }
    ghi('ppt/_rels/presentation.xml.rels', prel2); ghi('[Content_Types].xml', ct.replace('presentationml.template.main+xml', 'presentationml.presentation.main+xml'));
    // bỏ ảnh không còn trang nào dùng, bỏ mục thư mục trong zip
    const dung = new Set(); for (const f of Object.keys(z.files).filter((n) => n.endsWith('.rels') && !z.files[n].dir)) { const r = await doc(f); const goc = f.replace(/_rels\/[^/]+\.rels$/, ''); (r.match(/Target="([^"]+)"/g) || []).forEach((t) => { const tg = t.slice(8, -1); if (/^https?:/.test(tg)) return; const p = (tg.startsWith('/') ? tg.slice(1) : goc + tg).split('/'); const o = []; p.forEach((x) => { if (x === '..') o.pop(); else if (x && x !== '.') o.push(x); }); dung.add(o.join('/')); }); }
    Object.keys(z.files).filter((n) => /^ppt\/media\//.test(n) && !z.files[n].dir && !dung.has(n)).forEach((n) => z.remove(n));
    Object.keys(z.files).filter((n) => z.files[n].dir).forEach((n) => { delete z.files[n]; });
    return z.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  }
  let MAU_HOD = null;
  G.man.slidetuan = { ten: 'Slide họp tuần GM + HODs', ic: 'hop', bt: '🖥️', nhom: 'Báo cáo', ph: 'homnay', cap: 3, fn: async () => {
    const s = await soLieuTuan(); const tuan = `${G.ngayVN(s.a).slice(0, 5)} – ${G.ngayVN(s.b)}`;
    const d1 = new Date(s.a), d2 = new Date(s.b); const tuanEn = `${d1.getDate()} – ${d2.getDate()} ${ENM[d2.getMonth()]} ${d2.getFullYear()}`;
    const m = G.khung('Slide họp tuần GM + HODs', `Tuần ${tuan} · họp thứ Ba 9:30 · nộp trước 17:30 thứ Hai`, '#/baocao');
    const st = G.man.slidetuan.st || (G.man.slidetuan.st = { chon: new Set(s.sao.map((x) => x['Mã']).concat(s.goiY.map((_, i) => 'gy' + i))) });
    const items = s.sao.map((x) => ({ ma: x['Mã'], nhan: x['Nhãn'], vi: x['Nội dung VI'], en: x['Nội dung EN'], anh: API.dsAnh(x['Ảnh']), sao: true })).concat(s.goiY.map((x, i) => Object.assign({ ma: 'gy' + i, anh: [] }, x)));
    const gio = API.bayGio().slice(11, 16); const thu = new Date().getDay();
    m.innerHTML = `${thu === 1 && gio >= '15:00' ? '<div class="canh-bao">⏰ Hạn nộp 17:30 hôm nay. Xuất file khi xong.</div>' : ''}
      <div class="the"><h2>Departmental Performance</h2><div class="luoi2">${[['Areas completed', s.vt], ['Plants replaced', s.cay], ['Water use m³', Math.round(s.nuoc.tong)], ['Open requests', s.mo]].map(([t, v], i) => `<label class="o"><span>${t}</span><input data-kpi="${i}" value="${v}"></label>`).join('')}</div></div>
      <div class="the"><h2>⭐ Việc không thường ngày trong tuần</h2><p class="mo" style="margin-top:0">Việc thường ngày mặc định loại; chỉ vào khi bất thường (→ Khó khăn). Bấm ⭐ ở mọi hồ sơ để thêm. Tick để đưa vào slide, nhập câu tiếng Anh cho slide.</p>
        ${items.map((x, i) => `<div class="dong-cham" style="display:block"><label class="hang"><input type="checkbox" data-c="${i}" ${st.chon.has(x.ma) || (!x.sao && st.chon.has(x.ma)) ? 'checked' : ''}><span class="chip ${x.sao ? 'chanh' : ''}">${x.sao ? '⭐ ' : ''}${esc(x.nhan)}</span><span class="gian">${esc(x.vi)}</span></label>
          <input data-en="${i}" placeholder="English for the slide" value="${esc(x.en || '')}" style="margin-top:4px">${x.anh.length ? `<div>${G.xemAnh(x.anh.join(' | '))}</div>` : ''}</div>`).join('') || '<p class="mo">Chưa có. Bấm ⭐ ở hồ sơ, ảnh, dự án để đánh dấu.</p>'}
        <button class="nut nho" id="themSao" style="margin-top:8px">＋ Thêm ⭐</button></div>
      <div class="the"><h2>Plans &amp; Projects · Suggestions &amp; Support Needed</h2><div id="f"></div></div>
      <div class="the"><b>File mẫu</b><p class="mo" style="margin:4px 0 8px">Bắt buộc dùng Movenpick_Phu_Quoc_Weekly_HOD_Briefing_Template, không đổi màu/font/layout; app chỉ điền chữ, ảnh vào khung có sẵn. ${API.coThat() ? 'App lấy mẫu từ Drive của anh.' : 'Chế độ chạy thử: chọn file mẫu (.potx) trên máy.'}</p>
        ${API.coThat() ? '' : '<input type="file" id="mau" accept=".potx,.pptx">'}<div class="mo" id="mauTT">${MAU_HOD ? '✓ Đã có file mẫu' : ''}</div></div>
      <button class="nut chinh rong" id="xuat" style="margin-bottom:30px">⬇ Xuất phần Landscaping (.pptx)</button>`;
    m.querySelectorAll('[data-c]').forEach((c) => { c.onchange = () => { const x = items[+c.dataset.c]; if (c.checked) st.chon.add(x.ma); else st.chon.delete(x.ma); }; });
    m.querySelector('#themSao').onclick = () => G.danhSao({});
    const da = s.d.DuAn.filter((x) => x['Trạng thái'] === 'Đang làm');
    const lay = G.form(m.querySelector('#f'), [{ k: 'drove', nhan: 'What drove the result this week (EN)', loai: 'chu', gt: da.length ? `Renovation projects: ${da.map((x) => x['Tên'] + ' ' + (x['Tiến độ (%)'] || '') + '%').join(', ')}.` : '' },
      { k: 'actions', nhan: 'Next actions (EN)', loai: 'chu' }, { k: 'sug1', nhan: 'Idea to improve guest experience / efficiency (EN)', loai: 'chu' }, { k: 'sug2', nhan: 'Department · what is needed · by when (EN)', loai: 'chu' }, { k: 'sug3', nhan: 'Decision · from whom · by when (EN)', loai: 'chu' },
      { k: 'ghiVi', nhan: 'Ghi chú thuyết trình tiếng Việt thêm (không bắt buộc)', loai: 'mota' }]);
    const f = m.querySelector('#mau'); if (f) f.onchange = async () => { MAU_HOD = await f.files[0].arrayBuffer(); m.querySelector('#mauTT').textContent = '✓ ' + f.files[0].name; };
    m.querySelector('#xuat').onclick = (e) => chay(async () => {
      if (!MAU_HOD && API.coThat()) { const r = await API.goi('mauHOD'); MAU_HOD = Uint8Array.from(atob(r.b64), (c) => c.charCodeAt(0)).buffer; }
      if (!MAU_HOD) throw new Error('Chọn file mẫu HOD trước');
      const v = lay(); m.querySelectorAll('[data-en]').forEach((i) => { items[+i.dataset.en].en = i.value; });
      const chon = items.filter((x) => st.chon.has(x.ma)); const kpi = [...m.querySelectorAll('[data-kpi]')].map((i) => i.value);
      const nd = { kpi, tuanEn, drove: v.drove || ' ', actions: v.actions || ' ', duAnNgan: da.map((x) => x['Tên'] + ' ' + (x['Tiến độ (%)'] || '') + '%').join(' · ') || ' ',
        kpiNoteEn: `This week we completed ${kpi[0]} areas, replaced ${kpi[1]} plants, used ${kpi[2]} cubic metres of irrigation water (${s.nuoc.tyLe}% reused) and have ${kpi[3]} open requests.`,
        kpiNoteVi: `Tuần này hoàn thành ${kpi[0]} lượt vị trí, thay ${kpi[1]} cây, dùng ${kpi[2]} m³ nước tưới (tái sử dụng ${s.nuoc.tyLe}%), còn ${kpi[3]} yêu cầu đang mở.`,
        highlights: chon.slice(0, 5).map((x) => ({ en: x.en || x.vi, vi: x.vi })), anhTrang: chon.filter((x) => x.anh.length).slice(0, 3),
        plans: da.map((x) => [x['Tên'], 'Le Vu · PQC', 'In progress', G.ngayVN(x['Kết thúc']).slice(0, 5), x['Ghi chú'] || ' ']).concat(s.d.SuKien.filter((x) => String(x['Bắt đầu']).slice(0, 10) > s.b).slice(0, 2).map((x) => [x['Tên'], 'Le Vu', 'Not started', G.ngayVN(x['Bắt đầu']).slice(0, 5), 'Prepare plants and decoration'])),
        plansEn: `${da.length} projects in progress.`, plansVi: `${da.length} dự án đang thực hiện.${v.ghiVi ? ' ' + v.ghiVi : ''}`, sug: [v.sug1, v.sug2, v.sug3], sugEn: [v.sug1, v.sug2, v.sug3].filter(Boolean).join(' '), sugVi: v.ghiVi || 'Đề xuất và hỗ trợ cần thiết như trên slide.' };
      const blob = await dungPPTX(MAU_HOD, nd); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Landscaping Weekly Report ${G.ngayVN(G.congNgay(s.b, 1)).replace(/\//g, '.')}.pptx`; a.click();
      await API.goi('ghi', { bang: 'BaoCaoGM', dong: { 'Loại': 'Slide tuần', 'Từ': s.a, 'Đến': s.b, 'Giờ': API.bayGio(), 'Người ghi': '' } }).catch(() => {});
      bao('Đã xuất file slide tuần');
    }, e.target);
  } };
})();
