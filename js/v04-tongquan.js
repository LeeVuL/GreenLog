/* GreenLog 0.4 – Tổng quan (anh Vũ): 8 ô chỉ số, Phát triển bền vững, ma trận định kỳ, nhân sự, chờ duyệt, đang diễn ra; bấm thẻ nào cũng ra chi tiết */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q, chay, bao } = G;
  const hn = () => API.ngay();
  const so = (n, k) => G.so(n, k == null ? 1 : k);
  const sum = (ds, f) => ds.reduce((a, r) => a + (+f(r) || 0), 0);
  const trongKhoang = (d, tu, den) => d >= tu && d <= den;

  /* ---------- số liệu bền vững ---------- */
  const LOAI_PB = 'Loại (Phun thuốc/Phun phân bón lá/Bón gốc)';
  const doiDV = (r) => { const dv = String(r['ĐVT'] || '').toLowerCase(); const n = +r['Tổng lượng'] || 0; if (dv === 'ml') return ['l', n / 1000]; if (dv === 'g') return ['kg', n / 1000]; if (dv === 'l' || dv === 'lít') return ['l', n]; if (dv === 'kg') return ['kg', n]; if (dv === 'bao') return ['kg', n * 25]; return [dv || 'kg', n]; };
  const huuCo = (ten) => /compost|hữu cơ|trùn|vi sinh/i.test(ten || '');
  G.BV = [
    { k: 'compost', ten: 'Hữu cơ tuần hoàn', ic: 'compost', dv: 'kg', bang: 'PhanCompost', ngay: 'Ngày', gt: (r) => +r['Phân compost tuần hoàn (kg)'] || 0, cot: ['Ngày', 'Phân compost tuần hoàn (kg)', 'Ghi chú', 'Người ghi'] },
    { k: 'muncua', ten: 'Chất cải tạo đất hữu cơ', ic: 'trong_cay', dv: 'bao', ghep: true },
    { k: 'vigarden', ten: 'Thu hoạch Vị Garden', ic: 'thu_hoach', dv: 'kg', bang: 'ThuHoach', ngay: 'Ngày', gt: (r) => +r.kg || 0, cot: ['Ngày', 'Vườn', 'Tên cây', 'kg', 'Bếp nhận', 'Người ghi'] },
    { k: 'racbien', ten: 'Rác bãi biển', ic: 'bai_bien', dv: 'kg', bang: 'VeSinhBien', ngay: 'Ngày', gt: (r) => +r['kg rác'] || 0, cot: ['Ngày', 'Buổi', 'kg rác', 'Người ghi'] },
    { k: 'nuoc', ten: 'Nước tưới', ic: 'tuoi', dv: 'm³', ghep: true },
    { k: 'vuonuom', ten: 'Vườn ươm sân vườn', ic: 'vuon_uom', dv: 'cây', ghep: true },
    { k: 'vanchuyen', ten: 'Vận chuyển', ic: 'van_chuyen', dv: 'chuyến', bang: 'VanChuyen', ngay: 'Ngày', gt: (r) => +r['Số chuyến'] || 0, cot: ['Ngày', 'Đội', 'Loại hàng', 'Nhóm', 'Số chuyến', 'Người ghi'] },
    { k: 'bvtv', ten: 'Thuốc BVTV', ic: 'thuoc', dv: 'lít | kg', ghep: true },
    { k: 'phanvoco', ten: 'Phân bón vô cơ', ic: 'bon_phan_co', dv: 'lít | kg', ghep: true },
  ];
  /* đọc mọi bảng cần cho [tu, den] (đồng hồ nước lấy thêm 1 ngày trước để tính chênh lệch) */
  G.taiBV = async (tu, den) => {
    const loc = { 'Ngày': { tu, den } };
    const d = await G.docNhieu([{ bang: 'PhanCompost', loc }, { bang: 'ThuHoach', loc }, { bang: 'VeSinhBien', loc }, { bang: 'VanChuyen', loc }, { bang: 'VuonUom', loc },
      { bang: 'DongHoNuoc', loc: { 'Ngày': { tu: G.congNgay(tu, -3), den } } }, { bang: 'SoTrongCay', loc: { 'Thời gian': { tu, den: den + ' 99' } } }, { bang: 'DuAnTienDo', loc },
      { bang: 'NhatKyPhunBon', loc: { 'Ngày giờ': { tu, den: den + ' 99' } } }, { bang: 'NhatKyPhunBonChiTiet', gioiHan: 5000 }, { bang: 'PhunLai', loc: { 'Ngày': { tu, den } } }]);
    Object.keys(d).forEach((k) => { d[k] = d[k] || []; });
    return d;
  };
  /* trả về { k: { so, phu, chuoi: {ngay: giá trị}, dong: [hàng chi tiết] } } */
  G.tinhBV = (d, tu, den) => {
    const out = {}; const chuoi = (ds, fn, gt) => { const o = {}; ds.forEach((r) => { const n = String(fn(r)).slice(0, 10); o[n] = (o[n] || 0) + gt(r); }); return o; };
    G.BV.filter((b) => !b.ghep).forEach((b) => { const ds = (d[b.bang] || []).filter((r) => trongKhoang(r[b.ngay], tu, den)); out[b.k] = { so: sum(ds, b.gt), chuoi: chuoi(ds, (r) => r[b.ngay], b.gt), dong: ds, cot: b.cot }; });
    const vc = (d.VanChuyen || []).filter((r) => trongKhoang(r['Ngày'], tu, den)); out.vanchuyen.phu = `trong đó rác cắt tỉa ${so(sum(vc.filter((r) => r['Nhóm'] === 'Rác cắt tỉa'), (r) => r['Số chuyến']), 0)} chuyến`;
    // mùn cưa: vườn ươm + dự án + sổ trồng cây
    const mc = [];
    (d.VuonUom || []).forEach((r) => { if (+r['Chất cải tạo đất hữu cơ (bao)']) mc.push({ 'Ngày': r['Ngày'], 'Nguồn': r['Vườn ươm'], 'Chi tiết': r['Tên cây'] || r['Việc'], 'Bao': +r['Chất cải tạo đất hữu cơ (bao)'] }); });
    (d.SoTrongCay || []).forEach((r) => { if (+r['Chất cải tạo đất hữu cơ (bao)']) mc.push({ 'Ngày': String(r['Thời gian']).slice(0, 10), 'Nguồn': 'Sổ trồng cây' + (r['Mã DA'] ? ' · ' + r['Mã DA'] : ''), 'Chi tiết': r['Tên cây'] + ' · ' + (r['Khu vực'] || ''), 'Bao': +r['Chất cải tạo đất hữu cơ (bao)'] }); });
    (d.DuAnTienDo || []).forEach((r) => { if (+r['Mùn cưa (bao)']) mc.push({ 'Ngày': r['Ngày'], 'Nguồn': 'Dự án ' + r['Mã DA'], 'Chi tiết': r['Khối lượng hôm nay'] || '', 'Bao': +r['Mùn cưa (bao)'] }); });
    const mcK = mc.filter((r) => trongKhoang(r['Ngày'], tu, den)); const bao_ = sum(mcK, (r) => r['Bao']);
    out.muncua = { so: bao_, phu: `= ${so(bao_ * 25, 0)} kg · 1 bao 25 kg`, chuoi: chuoi(mcK, (r) => r['Ngày'], (r) => r['Bao']), dong: mcK.map((r) => Object.assign({ 'kg': r['Bao'] * 25 }, r)), cot: ['Ngày', 'Nguồn', 'Chi tiết', 'Bao', 'kg'] };
    // nước: DH01 sau xử lý, DH02 tổng tưới (gồm sau xử lý)
    const dung = (ma) => { const r = (d.DongHoNuoc || []).filter((x) => x['Mã đồng hồ'] === ma).sort((a, b) => (a['Ngày'] < b['Ngày'] ? -1 : 1)); const o = {}; for (let i = 1; i < r.length; i++) if (trongKhoang(r[i]['Ngày'], tu, den)) o[r[i]['Ngày']] = Math.max(0, r[i]['Chỉ số'] - r[i - 1]['Chỉ số']); return o; };
    const t1 = dung('DH01'), t2 = dung('DH02'); const ta = Object.values(t1).reduce((a, b) => a + b, 0), tt = Object.values(t2).reduce((a, b) => a + b, 0);
    out.nuoc = { so: ta, tong: tt, tyLe: tt ? Math.round(ta / tt * 100) : 0, phu: `Tái sử dụng ${so(ta, 0)} m³ chiếm tỷ lệ ${tt ? Math.round(ta / tt * 100) : 0}% · Tổng tưới ${so(tt, 0)} m³`, chuoi: t2,
      dong: Object.keys(t2).sort().map((n) => ({ 'Ngày': n, 'Nước sau xử lý (m³)': t1[n] || 0, 'Tổng nước tưới (m³)': t2[n], 'Tái sử dụng (%)': t2[n] ? Math.round((t1[n] || 0) / t2[n] * 100) : 0 })), cot: ['Ngày', 'Nước sau xử lý (m³)', 'Tổng nước tưới (m³)', 'Tái sử dụng (%)'] };
    // vườn ươm sân vườn: đã ươm / đã xuất
    const vu = (d.VuonUom || []).filter((r) => r['Vườn ươm'] === 'Vườn ươm sân vườn' && trongKhoang(r['Ngày'], tu, den));
    const uom = vu.filter((r) => r['Loại ghi'] === 'Ươm vào' || /Ươm mới/.test(r['Việc'])); const xuat = vu.filter((r) => r['Loại ghi'] === 'Xuất vườn' || /Xuất cây/.test(r['Việc']));
    out.vuonuom = { so: sum(uom, (r) => r['Số lượng']), xuat: sum(xuat, (r) => r['Số lượng']), phu: `Đã ươm ${so(sum(uom, (r) => r['Số lượng']), 0)} · Đã xuất ${so(sum(xuat, (r) => r['Số lượng']), 0)}`, chuoi: chuoi(uom, (r) => r['Ngày'], (r) => +r['Số lượng'] || 0), dong: uom.concat(xuat), cot: ['Ngày', 'Loại ghi', 'Tên cây', 'Số lượng', 'ĐVT', 'Xuất đi', 'Người ghi'] };
    // thuốc BVTV, phân vô cơ: tách lít / kg
    const nk = {}; (d.NhatKyPhunBon || []).forEach((r) => { if (trongKhoang(String(r['Ngày giờ']).slice(0, 10), tu, den)) nk[r['Mã NK']] = r; });
    const ct = (d.NhatKyPhunBonChiTiet || []).filter((r) => nk[r['Mã NK']]);
    const nhom = (laThuoc) => { const ds = ct.filter((r) => { const l = nk[r['Mã NK']][LOAI_PB]; return laThuoc ? l === 'Phun thuốc' : (l !== 'Phun thuốc' && !huuCo(r['Sản phẩm'])); });
      const l = sum(ds, (r) => (doiDV(r)[0] === 'l' ? doiDV(r)[1] : 0)); const k = sum(ds, (r) => (doiDV(r)[0] === 'kg' ? doiDV(r)[1] : 0));
      return { so: l, kg: k, phu: `${so(l, 2)} lít · ${so(k, 2)} kg (không cộng chung)`, chuoi: chuoi(ds, (r) => nk[r['Mã NK']]['Ngày giờ'], (r) => doiDV(r)[1]),
        dong: ds.map((r) => ({ 'Ngày': String(nk[r['Mã NK']]['Ngày giờ']).slice(0, 10), 'Mã NK': r['Mã NK'], 'Loại': nk[r['Mã NK']][LOAI_PB], 'Sản phẩm': r['Sản phẩm'], 'Lượng': so(doiDV(r)[1], 3), 'Đơn vị': doiDV(r)[0] === 'l' ? 'lít' : 'kg', 'Vị trí': nk[r['Mã NK']]['Cụm'] || '', 'Người': nk[r['Mã NK']]['Người phun'] || '' })),
        cot: ['Ngày', 'Mã NK', 'Loại', 'Sản phẩm', 'Lượng', 'Đơn vị', 'Vị trí', 'Người'] }; };
    out.bvtv = nhom(true); out.phanvoco = nhom(false);
    const hao = (d.PhunLai || []).reduce((a, r) => { try { JSON.parse(r['Lượng hao'] || '[]').forEach(([, n, dv]) => { const x = doiDV({ 'Tổng lượng': n, 'ĐVT': dv }); a[x[0]] = (a[x[0]] || 0) + x[1]; }); } catch (e) { /* bỏ qua */ } return a; }, {});
    if (hao.l || hao.kg) out.bvtv.phu += ` · hao do mưa ${so(hao.l || 0, 2)} lít, ${so(hao.kg || 0, 2)} kg`;
    return out;
  };
  const sparkline = (chuoi, tu, den, mau) => {
    const ngay = []; for (let d = tu; d <= den && ngay.length < 400; d = G.congNgay(d, 1)) ngay.push(d);
    const v = ngay.map((n) => chuoi[n] || 0); const mx = Math.max(1, ...v); if (ngay.length < 2) return '';
    const pts = v.map((x, i) => `${(i / (v.length - 1) * 100).toFixed(1)},${(28 - x / mx * 26).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 100 30" preserveAspectRatio="none" style="width:100%;height:26px;margin-top:6px"><polyline points="${pts}" fill="none" stroke="${mau || '#C9E265'}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
  };
  const giaTri = (b, x) => {
    if (b.k === 'bvtv' || b.k === 'phanvoco') return `${so(x.so, 2)}<small> lít</small> · ${so(x.kg, 2)}<small> kg</small>`;
    if (b.k === 'nuoc') return `${so(x.so, 0)}<small> m³ · ${x.tyLe}%</small>`;
    if (b.k === 'vuonuom') return `${so(x.so, 0)}<small> ươm · </small>${so(x.xuat, 0)}<small> xuất</small>`;
    return `${so(x.so, b.dv === 'kg' ? 1 : 0)}<small> ${esc(b.dv)}</small>`;
  };
  G.theBV = (bv, tu, den, nhan) => `<div class="bv-luoi">${G.BV.map((b) => { const x = bv[b.k]; return `<a class="bv-o" href="#/bv/${b.k}">
      <div class="t">${G.ic(b.ic, 26)}<span>${esc(b.ten)}</span></div><div class="so">${giaTri(b, x)}</div>
      <div class="phu">${esc(x.phu || nhan || '')}</div>${sparkline(x.chuoi, tu, den)}</a>`; }).join('')}</div>`;

  /* ---------- TỔNG QUAN ---------- */
  const st = { khoang: 'nam' };
  async function manTongQuan() {
    if (!G.laAnhVu()) return G.manHomNayMoi ? G.manHomNayMoi() : G.manHomNayGoc();
    if (!G.MT_IC) { G.MT_IC = {}; (G.MT_DK || []).forEach(([, r]) => r.forEach((x) => { if (x) G.MT_IC[x[0]] = x[1]; })); }
    const k = S.dm.ky; const ngayHN = hn(); if (G.kiemKy) G.kiemKy().catch(() => {});
    const m = G.khung('Tổng quan', `${G.thu()}, ${G.ngayVN(ngayHN)} · Chào anh ${S.u.ten.split(' ').pop()}`);
    const [tu, den] = G.khoang(st.khoang);
    const [d, bvD] = await Promise.all([G.docNhieu([
      { bang: 'DiemDanh', loc: { 'Ngày': ngayHN } }, { bang: 'DuyetCong', loc: { 'Ngày': ngayHN } }, { bang: 'TickDinhKy', loc: { 'Kỳ': k.ten } }, { bang: 'Phieu', gioiHan: 500 }, { bang: 'Tuoi', loc: { 'Ngày': ngayHN } },
      { bang: 'ViecPhatSinh', loc: { 'Ngày': ngayHN } }, { bang: 'DichHai', gioiHan: 300 }, { bang: 'BatThuong', gioiHan: 300 }, { bang: 'CongNhanDangKy', loc: { 'Trạng thái duyệt': 'Chờ duyệt' } },
      { bang: 'DeXuatThuoc', loc: { 'Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)': 'Chờ duyệt' } }, { bang: 'SuKien', gioiHan: 100 }, { bang: 'DuAn', gioiHan: 100 }, { bang: 'NhacNho', gioiHan: 300 }, { bang: 'KhoKhan', gioiHan: 300 },
      { bang: 'DuaVaoHop', loc: { 'Trạng thái': 'Chờ họp' } }, { bang: 'DaoTao', gioiHan: 200 }, { bang: 'NgayLamViec', loc: { 'Ngày': ngayHN } }, { bang: 'KyDinhKy', gioiHan: 50 }, { bang: 'HoanViec', gioiHan: 300 }]),
    G.taiBV(tu, den)]);
    Object.keys(d).forEach((x) => { d[x] = d[x] || []; });
    const bv = G.tinhBV(bvD, tu, den);
    // 1 quân số
    const sang = d.DiemDanh.filter((x) => x['Buổi'] === 'Sáng'); const coMat = new Set(sang.filter((x) => /Có mặt/.test(x['Trạng thái (Có mặt/Vắng/Về sớm)'])).map((x) => x['Mã CN']));
    const pMat = (S.dm.congnhan || []).find((x) => /Quản lý/.test(x.cd || '')); if (pMat && d.DiemDanh.some((x) => x['Mã CN'] === pMat.ma)) coMat.add(pMat.ma);
    const db = G.thieuDinhBien(sang.length ? coMat : null, S.dm.khu);
    // 2 định kỳ
    const dvDK = S.dm.dauviec.filter((v) => /^DV0[1-8]$/.test(v.ma) || v.ma === 'DV37' || v.ma === 'DV38');
    const td = {}; d.TickDinhKy.forEach((r) => { if ((r['Trạng thái'] || 'Xong') === 'Xong' && String(r['Lần'] || '1') === '1') td[r['Mã việc']] = (td[r['Mã việc']] || 0) + 1; });
    const tongVT = (ma) => G.dsVT(ma).length || 1;
    const pTB = dvDK.reduce((a, v) => a + Math.min(1, (td[v.ma] || 0) / tongVT(v.ma)), 0) / dvDK.length;
    const tuK = new Date(k.tu), denK = new Date(k.den); const ngayThu = Math.round((new Date(ngayHN) - tuK) / 864e5) + 1; const tongN = Math.round((denK - tuK) / 864e5) + 1; const moc = ngayThu / tongN;
    // 3 phiếu
    const pMo = d.Phieu.filter((x) => x['Trạng thái'] !== 'Đã duyệt'); const pQH = pMo.filter((x) => x['Hạn'] && x['Hạn'] < API.bayGio() && x['Trạng thái'] !== 'Báo xong');
    // 4 chờ duyệt
    const cho = [];
    ['Đội cơ động', 'Đội khu vực'].forEach((doi) => { const x = d.DuyetCong.find((y) => y['Đội'] === doi && y['Buổi'] === 'Sáng' && y['Khóa'] !== 'Có'); if (x) cho.push(['Điểm danh sáng · ' + doi, 'diemdanh']); });
    d.Phieu.filter((x) => x['Trạng thái'] === 'Báo xong').forEach((x) => cho.push(['Phiếu ' + x['Mã phiếu'] + ' · ' + (x['Loại lỗi'] || x['Mô tả'] || ''), 'phieu']));
    d.DichHai.filter((x) => /Báo xong/.test(x['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)'])).forEach((x) => cho.push(['Dịch hại ' + x['Mã DH'], 'dichhai']));
    d.CongNhanDangKy.forEach((x) => cho.push(['Đăng ký công nhân · ' + x['Họ và tên'], 'congnhan']));
    d.DeXuatThuoc.forEach((x) => cho.push(['Đề xuất thuốc · ' + x['Tên thuốc/phân'], 'thuoc']));
    d.DaoTao.filter((x) => /Chờ duyệt/.test(x['Trạng thái'] || '')).forEach((x) => cho.push(['Đào tạo · ' + x['Nội dung'] + ' (' + x['Trạng thái'] + ')', 'daotao/' + encodeURIComponent(x['Mã ĐT'])]));
    d.KyDinhKy.filter((x) => x['Trạng thái'] === 'Chờ anh duyệt kết thúc').forEach((x) => cho.push(['Kết thúc kỳ ' + x['Kỳ'], 'kydinhky']));
    d.NgayLamViec.filter((x) => x['Loại'] === 'Chốt ngày' && x['Trạng thái'] === 'Chờ anh chốt').forEach((x) => cho.push(['Chốt ngày · ' + x['Đội'], 'homnay']));
    // 5 tưới
    const nVT = S.dm.vitri.filter((v) => v.ap === 'Có').length; const mua = d.Tuoi.filter((x) => /mưa/i.test(x['Trạng thái'])).length;
    // 6 phát sinh
    const ps = d.ViecPhatSinh; const ngGio = sum(ps, (x) => (+x['Số người'] || 1) * (+x['Số giờ'] || 0));
    // 7 dịch hại
    const dhMo = d.DichHai.filter((x) => !/Đã duyệt|Đã đóng/.test(x['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)'])); const dhNang = dhMo.filter((x) => /Nặng|Rất nặng/.test(x['Mức độ']));
    // 8 cây nội thất bất thường
    const btMo = d.BatThuong.filter((x) => x['Trạng thái'] !== 'Đã đóng' && (x['Mã điểm'] || /^NT/.test(x['Mã vị trí'] || '')));
    const kpi = (ic, ten, gt, chip, cls, link) => `<a class="kpi" href="#/${link}"><span class="ic">${G.ic(ic, 34)}</span><span style="min-width:0"><small>${esc(ten)}</small><b>${gt}</b>${chip ? `<span class="chip ${cls || ''}">${esc(chip)}</span>` : ''}</span></a>`;
    let html = `<div class="kpi8">
      ${kpi('diem_danh', 'Quân số hôm nay', sang.length ? `${coMat.size}/${G.TONG_DINH_BIEN}` : '—', sang.length ? (db.trong.length ? db.trong.length + ' khu trống' : 'đủ khu') : 'chưa điểm danh', db.trong.length || !sang.length ? 'do' : 'xanh', 'homnay')}
      ${kpi('viec', 'Định kỳ kỳ ' + k.ten.split('.')[0], Math.round(pTB * 100) + '%', (pTB >= moc - 0.1 ? 'đúng tiến độ' : 'chậm') + ` (ngày ${ngayThu}/${tongN})`, pTB >= moc - 0.1 ? 'xanh' : 'cam', 'viec')}
      ${kpi('phieu', 'Phiếu đang mở', pMo.length, `${pMo.filter((x) => x['Mức độ'] === 'Khẩn cấp').length} khẩn · ${pQH.length} quá hạn`, pQH.length ? 'do' : '', 'phieu')}
      ${kpi('cham_diem', 'Chờ anh duyệt', cho.length, cho.length ? cho.slice(0, 2).map((c) => c[0].split(' · ')[0]).join(' · ') : 'không có', cho.length ? 'vang' : 'xanh', 'homnay')}
      ${kpi('tuoi', 'Tưới hôm nay', `${d.Tuoi.length}/${nVT}`, mua ? mua + ' chỗ mưa bỏ qua' : 'chưa có chỗ mưa', 'xanh', 'tuoi')}
      ${kpi('phat_sinh', 'Việc phát sinh', ps.length, so(ngGio) + ' người-giờ', 'chanh', 'phatsinh')}
      ${kpi('dich_hai', 'Dịch hại đang xử lý', dhMo.length, dhNang.length ? dhNang.length + ' mức nặng' : 'không có mức nặng', dhNang.length ? 'do' : 'xanh', 'dichhai')}
      ${kpi('noi_that', 'Cây nội thất bất thường', btMo.length, btMo.length ? 'đang mở · bấm để xử lý' : 'không có', btMo.length ? 'cam' : 'xanh', 'batthuong')}</div>`;
    // khối bền vững
    html += `<div class="bv"><div class="hang" style="flex-wrap:wrap;gap:8px"><div class="gian"><h2>🌿 Phát triển bền vững</h2><div class="mo" style="font-size:13px">Tự cộng từ ghi chép hằng ngày · dùng cho báo cáo GM tháng và lũy kế</div></div>
      <div class="chon" style="margin:0">${['ngay', 'thang', 'nam'].map((x) => `<button data-kh="${x}" class="${st.khoang === x ? 'dang' : ''}">${G.TEN_KHOANG[x]}</button>`).join('')}</div></div>${G.theBV(bv, tu, den)}</div>`;
    // ma trận định kỳ + nhân sự + chờ duyệt + đang diễn ra
    const dkHtml = dvDK.map((v) => { const n = td[v.ma] || 0; const t = tongVT(v.ma); const p = Math.min(1, n / t); const tre = moc - p;
      return `<a href="#/dinhky/${v.ma}" style="display:block;color:inherit;text-decoration:none;margin-bottom:10px"><div class="hang" style="font-size:14px;margin-bottom:4px">${G.ic(G.MT_IC ? G.MT_IC[v.ma] || 'viec' : 'viec', 26)}<span class="gian">${esc(v.ten)}</span><b>${n}/${t} · ${Math.round(p * 100)}%</b></div><div class="thanh ${tre > 0.25 ? 'do' : tre > 0.1 ? 'cam' : ''}"><i style="width:${Math.round(p * 100)}%"></i></div></a>`; }).join('');
    const dangDR = [];
    d.SuKien.filter((x) => String(x['Bắt đầu']).slice(0, 10) >= ngayHN).forEach((x) => dangDR.push(['Sự kiện', `${x['Tên']} · ${G.ngayVN(x['Bắt đầu']).slice(0, 5)}`, 'còn ' + Math.round((new Date(String(x['Bắt đầu']).slice(0, 10)) - new Date(ngayHN)) / 864e5) + ' ngày', 'cam', 'sukien']));
    d.DuAn.filter((x) => x['Trạng thái'] === 'Đang làm').forEach((x) => dangDR.push(['Dự án', x['Tên'], (x['Tiến độ (%)'] || '') + (x['Tiến độ (%)'] ? '%' : 'đang làm'), 'xanh', 'duan/' + encodeURIComponent(x['Mã DA'])]));
    pMo.filter((x) => x['Mức độ'] === 'Khẩn cấp' || pQH.includes(x)).forEach((x) => dangDR.push(['Phiếu', x['Mô tả'] || x['Loại lỗi'], pQH.includes(x) ? 'quá hạn' : 'khẩn', 'do', 'phieu']));
    ps.filter((x) => x['Trạng thái'] === 'Đang làm').forEach((x) => dangDR.push(['Phát sinh', x['Mô tả'], (x['Số người'] || 1) + ' người', 'chanh', 'phatsinh']));
    const nnMo = d.NhacNho.filter((x) => !/Đã xong|Bỏ/.test(x['Trạng thái'])); const kkMo = d.KhoKhan.filter((x) => x['Trạng thái'] !== 'Đã xử lý');
    html += `<div class="luoi-tq">
      <div class="the"><div class="hang"><h2 class="gian" style="margin:0">Việc định kỳ kỳ ${esc(k.ten)}</h2><span class="chip xanh">mốc kỳ: ${Math.round(moc * 100)}%</span></div><p class="mo" style="margin:4px 0 10px">Xanh đúng tiến độ · vàng hơi chậm · đỏ chậm. Định kỳ chỉ 1 biểu đồ tổng.</p>${dkHtml}</div>
      <div class="the"><div class="hang"><h2 class="gian" style="margin:0">Nhân sự hôm nay</h2>${db.trong.length ? `<span class="chip do">${db.trong.length} khu trống</span>` : ''}</div>
        <div class="hang" style="margin:10px 0;gap:24px"><div><b style="font-size:30px">${sang.length ? coMat.size : '—'}</b><span class="mo">/${G.TONG_DINH_BIEN}</span><div class="mo">có mặt</div></div><div><b style="font-size:30px">${db.thieu.reduce((a, x) => a + x.thieu, 0)}</b><div class="mo">chức danh thiếu</div></div></div>
        ${db.trong.map((c) => `<div>🔴 <b>${esc(c)}</b> trống người hôm nay</div>`).join('')}
        ${db.thieu.length ? `<p class="mo">Thiếu theo định biên: ${db.thieu.map((x) => `${esc(x.cd)} ${x.thieu}`).join(' · ')}</p>` : ''}
        ${sang.filter((x) => !/Có mặt/.test(x['Trạng thái (Có mặt/Vắng/Về sớm)'])).map((x) => `<div class="mo">${esc(x['Họ tên'])} · ${esc(x['Trạng thái (Có mặt/Vắng/Về sớm)'])}${x['Lý do'] ? ' · ' + esc(x['Lý do']) : ''}</div>`).join('')}
        <a href="#/homnay" class="nut nho" style="margin-top:10px;text-decoration:none">Hôm nay toàn bộ phận ›</a></div>
      <div class="the"><div class="hang"><h2 class="gian" style="margin:0">Chờ anh duyệt</h2><span class="chip vang">${cho.length}</span></div>
        ${cho.length ? `<table class="bang-tq">${cho.slice(0, 12).map((c) => `<tr><td>${esc(c[0])}</td><td style="text-align:right"><a class="chip xanh" href="#/${c[1]}" style="text-decoration:none">Duyệt</a></td></tr>`).join('')}</table>` : '<p class="mo">Không có việc chờ duyệt.</p>'}</div>
      <div class="the rong2"><div class="hang"><h2 class="gian" style="margin:0">Đang diễn ra</h2><a class="mo" href="#/lich">xem tất cả</a></div>
        <table class="bang-tq"><tr><th>Loại</th><th>Nội dung</th><th>Trạng thái</th></tr>${dangDR.slice(0, 10).map((x) => `<tr><td><span class="chip ${x[3]}">${esc(x[0])}</span></td><td><a href="#/${x[4]}" style="color:inherit">${esc(x[1])}</a></td><td><span class="chip ${x[3]}">${esc(x[2])}</span></td></tr>`).join('') || '<tr><td colspan="3" class="mo">Không có</td></tr>'}</table></div>
      <div class="the"><div class="hang"><h2 class="gian" style="margin:0">📣 Nhắc nhở · ⚠ Khó khăn</h2><button class="nut nho" id="nnMoi">＋ Nhắc nhở</button></div>
        ${nnMo.slice(0, 5).map((x) => `<a href="#/nhacnho" style="display:block;color:inherit;margin-top:8px"><b>${esc(x['Nội dung'])}</b><div class="mo">${esc(x['Nguồn'])} → ${esc(x['Giao đội'])} · ${esc(x['Trạng thái'])}</div></a>`).join('') || '<p class="mo">Không có nhắc nhở đang mở.</p>'}
        ${kkMo.slice(0, 5).map((x) => `<div style="margin-top:8px">⚠ <b>${esc(x['Loại'])}</b>: ${esc(x['Mô tả'])}<div class="mo">${esc(x['Người báo'])} · ${G.ngayVN(x['Ngày'])}</div></div>`).join('')}
        <p class="mo" style="margin-top:10px">📌 ${d.DuaVaoHop.length} mục đang chờ đưa vào họp tuần · <a href="#/hop">mở họp</a></p></div>
      <div class="the"><div class="hang"><h2 class="gian" style="margin:0">🥀 Cây nội thất bất thường</h2><span class="chip ${btMo.length ? 'cam' : 'xanh'}">${btMo.length}</span></div>
        ${btMo.slice(0, 6).map((x) => `<a href="#/batthuong/${encodeURIComponent(G.maBT(x))}" style="display:block;color:inherit;margin-top:8px"><b>${esc(x['Tên cây'])}</b> · ${esc(x['Tình trạng'])}<div class="mo">${esc(G.tenVT(x['Mã điểm'] || x['Mã vị trí']))} · ${G.ngayVN(x['Ngày'])}</div></a>`).join('') || '<p class="mo">Không có việc đang mở.</p>'}</div>
      <div class="the"><div class="hang"><h2 class="gian" style="margin:0">🏗️ Dự án đang chạy</h2></div>
        ${d.DuAn.filter((x) => x['Trạng thái'] === 'Đang làm').map((x) => `<a href="#/duan/${encodeURIComponent(x['Mã DA'])}" style="display:block;color:inherit;margin-top:8px"><b>${esc(x['Tên'])}</b><div class="thanh" style="margin-top:4px"><i style="width:${+x['Tiến độ (%)'] || 0}%"></i></div><div class="mo">${G.ngayVN(x['Bắt đầu'])} → ${G.ngayVN(x['Kết thúc'])}</div></a>`).join('') || '<p class="mo">Không có dự án đang chạy.</p>'}</div>
    </div>`;
    m.innerHTML = html;
    m.querySelectorAll('[data-kh]').forEach((b) => { b.onclick = () => { st.khoang = b.dataset.kh; G.taiLai(); }; });
    m.querySelector('#nnMoi').onclick = () => G.moNhacNho();
  }
  G.manTongQuan = manTongQuan;
  G.man[''] = { an: true, thay: true, fn: manTongQuan };

  /* ---------- CHI TIẾT một thẻ bền vững ---------- */
  const stCT = { khoang: 'thang', tu: '', den: '' };
  G.man.bv = { an: true, fn: async (key) => {
    const b = G.BV.find((x) => x.k === key); if (!b) { location.hash = '#/'; return; }
    const m = G.khung(b.ten, 'Chi tiết · biểu đồ · bảng ghi gốc · xuất Excel', '#/');
    const [tu, den] = stCT.khoang === 'tuy' ? [stCT.tu || G.dauThang(), stCT.den || hn()] : G.khoang(stCT.khoang);
    const bv = G.tinhBV(await G.taiBV(tu, den), tu, den); const x = bv[key];
    const soNgay = Math.round((new Date(den) - new Date(tu)) / 864e5) + 1; const theoThang = soNgay > 62;
    const nhom = {}; Object.keys(x.chuoi).forEach((n) => { const kk = theoThang ? n.slice(0, 7) : n; nhom[kk] = (nhom[kk] || 0) + x.chuoi[n]; });
    const truc = []; if (theoThang) { for (let d = tu.slice(0, 7); d <= den.slice(0, 7); d = API.ngay(new Date(+d.slice(0, 4), +d.slice(5, 7), 1)).slice(0, 7)) truc.push(d); } else { for (let d = tu; d <= den; d = G.congNgay(d, 1)) truc.push(d); }
    const mx = Math.max(1, ...truc.map((t) => nhom[t] || 0));
    m.innerHTML = `<div class="chon">${[['ngay', 'Hôm nay'], ['thang', 'Từ đầu tháng'], ['ky', 'Kỳ 20→19'], ['nam', 'Từ đầu năm'], ['tuy', 'Tùy chọn']].map(([kk, t]) => `<button data-kh="${kk}" class="${stCT.khoang === kk ? 'dang' : ''}">${t}</button>`).join('')}</div>
      ${stCT.khoang === 'tuy' ? `<div class="luoi2" style="margin-bottom:10px"><label class="o"><span>Từ ngày</span><input type="date" id="tu" value="${tu}"></label><label class="o"><span>Đến ngày</span><input type="date" id="den" value="${den}"></label></div>` : ''}
      <div class="the"><div class="mo">${G.ngayVN(tu)} → ${G.ngayVN(den)}</div><div class="so-lon">${giaTri(b, x)}</div><div class="mo">${esc(x.phu || '')}</div>
        <div class="bd-cot" style="margin-top:12px">${truc.map((t) => `<div title="${esc(t)}: ${so(nhom[t] || 0, 2)}" style="height:${Math.round((nhom[t] || 0) / mx * 100)}%"></div>`).join('')}</div>
        <div class="bd-nhan"><span>${esc(theoThang ? truc[0] : G.ngayVN(truc[0]).slice(0, 5))}</span><span>${theoThang ? 'theo tháng' : 'theo ngày'}</span><span>${esc(theoThang ? truc[truc.length - 1] : G.ngayVN(truc[truc.length - 1]).slice(0, 5))}</span></div></div>
      <div class="hang" style="margin:6px 0"><input type="search" id="loc" placeholder="Lọc trong bảng…" class="gian"><button class="nut nho" id="xl">⬇ Xuất Excel</button></div>
      <div class="the cuon-ngang"><table class="bang" id="bang"><tr>${x.cot.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>${x.dong.slice().sort((a, c) => (String(a['Ngày'] || a['Thời gian']) < String(c['Ngày'] || c['Thời gian']) ? 1 : -1)).map((r) => `<tr>${x.cot.map((c) => `<td>${esc(c === 'Ngày' ? G.ngayVN(r[c]) : r[c])}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${x.cot.length}" class="mo">Chưa có ghi chép</td></tr>`}</table></div>`;
    m.querySelectorAll('[data-kh]').forEach((bt) => { bt.onclick = () => { stCT.khoang = bt.dataset.kh; G.taiLai(); }; });
    ['tu', 'den'].forEach((id) => { const i = m.querySelector('#' + id); if (i) i.onchange = () => { stCT[id] = i.value; G.taiLai(); }; });
    const loc = m.querySelector('#loc'); loc.oninput = () => { const t = loc.value.toLowerCase(); m.querySelectorAll('#bang tr').forEach((tr, i) => { if (i) tr.style.display = !t || tr.textContent.toLowerCase().includes(t) ? '' : 'none'; }); };
    m.querySelector('#xl').onclick = () => G.taiCSV(`GreenLog_${b.ten}_${tu}_${den}`, [x.cot].concat(x.dong.map((r) => x.cot.map((c) => r[c]))));
  } };
})();
