/* GreenLog – lớp dữ liệu.
   Chế độ thật: gửi tới Apps Script (apps-script/Code.gs).
   Chế độ chạy thử: chạy cùng quy tắc ngay trên máy, dữ liệu mẫu, lưu trong trình duyệt.
   Mọi bảng dùng đúng tên trang và tên cột như trong Google Sheets, nên báo cáo hai chế độ giống nhau. */
(function () {
  const CFG = window.GL_CONFIG;
  const LS = {
    get: (k, d) => { try { const v = localStorage.getItem('gl_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem('gl_' + k, JSON.stringify(v)); } catch (e) { throw new Error('Bộ nhớ máy đầy. Vào Thêm → Xóa dữ liệu chạy thử.'); } },
    del: (k) => { try { localStorage.removeItem('gl_' + k); } catch (e) {} },
  };
  const z = (n) => String(n).padStart(2, '0');
  const ngay = (d) => { d = d || new Date(); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); };
  const bayGio = () => { const d = new Date(); return ngay(d) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds()); };
  function ky(d) {
    const p = d.split('-').map(Number); let y = p[0], m = p[1];
    if (p[2] >= 20) { m++; if (m > 12) { m = 1; y++; } }
    const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
    return { ten: 'T' + z(m) + '.' + y, tu: py + '-' + z(pm) + '-20', den: y + '-' + z(m) + '-19' };
  }

  /* Bảng → [phân hệ, cấp tối thiểu để ghi]. Đọc cần cấp Xem (1). Giống hệt BANG trong Code.gs */
  const BANG = {
    DiemDanh: ['diemdanh', 3], DuyetCong: ['diemdanh', 3], PhieuSuaCong: ['diemdanh', 3], // TickDinhKy, AnhNgay, DiemDanh, DuyetCong, Phieu: chỉ ghi qua hàm riêng
    TickDinhKy: ['dinhky', 3], AnhNgay: ['dinhky', 3], Tuoi: ['dinhky', 2], ViecHangNgay: ['dinhky', 2], KeHoachDinhKy: ['kehoach', 2],
    DongHoNuoc: ['donghonuoc', 2], VuonUom: ['vuonuom', 2], VuonUomNoiThat: ['noibo', 2],
    VeSinhBien: ['noibo', 2], KiemTraBien: ['noibo', 2], VuonRau: ['noibo', 2], ThuHoach: ['noibo', 2], CayNoiThat: ['noibo', 2],
    RacHuuCo: ['noibo', 2], PhanCompost: ['noibo', 2], MaySangCat: ['noibo', 2],
    Phieu: ['phieu', 3], PhieuLichSu: ['phieu', 3], DichHai: ['phieu', 2], DichHaiCapNhat: ['phieu', 2], SoTrongCay: ['phieu', 2], BatThuong: ['phieu', 2],
    NhatKyPhunBon: ['phunbon', 2], NhatKyPhunBonChiTiet: ['phunbon', 2], DeXuatThuoc: ['phunbon', 2], CongThucPha: ['phunbon', 3],
    DuAn: ['duan', 3], DuAnGiaiDoan: ['duan', 3], DuAnVatTu: ['duan', 3], DuAnTienDo: ['duan', 2],
    SuKien: ['sukien', 3], KeHoachTuan: ['kehoach', 2], TuanTra: ['tuantra', 3],
    ChamDiem: ['homnay', 3], KyCham: ['homnay', 3], CanhBaoBao: ['homnay', 3], ViecLapLai: ['homnay', 3],
    VanChuyen: ['dinhky', 3], ViecPhatSinh: ['homnay', 2], Hop: ['homnay', 3], DaoTao: ['homnay', 3], ThuVienSOP: ['homnay', 3],
    CongNhanDangKy: ['congnhan', 2], PhanQuyen: ['danhmuc', 3], UyQuyen: ['danhmuc', 3], ThoiTiet: ['homnay', 1], NhatKyThayDoi: ['homnay', 3],
  };
  /* cột tự điền: người, giờ */
  const COT_NGUOI = ['Người thêm', 'Người ghi', 'Người tạo', 'Người tick', 'Người phun', 'Người báo', 'Người chấm', 'Người đọc', 'Người đăng ký', 'Người đề xuất', 'Người lập', 'Người phát hiện', 'Người tuần tra', 'Người kích hoạt', 'Người'];
  const COT_GIO = ['Giờ thêm', 'Giờ ghi', 'Giờ tạo', 'Giờ tick', 'Giờ đăng ký', 'Thời điểm', 'Ngày giờ', 'Kích hoạt lúc', 'Cập nhật gần nhất'];
  const laDuyet = (doi) => Object.keys(doi).some((k) => ['Khóa', 'Người duyệt', 'Giờ duyệt'].includes(k) || String(doi[k]) === 'Đã duyệt');
  const MA_SO = { ViecPhatSinh: ['Mã PS', 'PS'], Hop: ['Mã họp', 'H'], DaoTao: ['Mã ĐT', 'ĐT'], ThuVienSOP: ['Mã SOP', 'SOP'], Phieu: ['Mã phiếu', 'P'], DichHai: ['Mã DH', 'DH'], NhatKyPhunBon: ['Mã NK', 'NK'], SuKien: ['Mã SK', 'SK'], DuAn: ['Mã DA', 'DA'],
    TuanTra: ['Mã tuần tra', 'TT'], ViecLapLai: ['Mã LL', 'LL'], CongNhanDangKy: ['Mã ĐK', 'ĐK'], DeXuatThuoc: ['Mã ĐX', 'ĐX'], KeHoachTuan: ['Mã KHT', 'KT'],
    KeHoachDinhKy: ['Mã KH', 'KH'], CongThucPha: ['Mã CT', 'CT'], PhieuSuaCong: ['Mã phiếu', 'SC'], CanhBaoBao: ['Mã đợt', 'BAO'] };

  /* ---------- Chế độ thật ---------- */
  /* Mất sóng vẫn lưu: lệnh ghi được xếp hàng trên máy (mỗi lệnh một mã), tự gửi lại khi có mạng; máy chủ bỏ qua mã đã nhận */
  const GHI = ['ghi', 'ghiNhieu', 'thayNhom', 'sua', 'dinhKy.luu', 'phieu.tao', 'phieu.chuyen', 'diemDanh.gui', 'diemDanh.tuDiem', 'vanChuyen.gui'];
  const hang = () => LS.get('hang', []);
  async function guiMot(action, body, cid) {
    const res = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action, token: LS.get('token'), cid }, body || {})) });
    return res.json();
  }
  async function goiThat(action, body) {
    const cid = GHI.includes(action) ? 'C' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) : '';
    if (cid && hang().length) { await API.guiHang(); }
    let j;
    try { j = await guiMot(action, body, cid); }
    catch (e) {
      if (!cid) throw new Error('Không có mạng hoặc máy chủ chưa phản hồi. Thử lại sau.');
      LS.set('hang', hang().concat([{ cid, action, body, luc: bayGio() }])); API.baoHang();
      window.dispatchEvent(new CustomEvent('gl-hang'));
      return action === 'ghiNhieu' ? (body.dong || []) : Object.assign({ xepHang: true }, body.dong || {});
    }
    if (!j.ok) {
      if (j.loi === 'HET_PHIEN') { LS.del('token'); location.reload(); }
      throw new Error(j.loi || 'Lỗi không rõ');
    }
    if (j.hoan && !(body && body.imLang)) window.dispatchEvent(new CustomEvent('gl-hoan', { detail: j.hoan }));
    return j.data;
  }

  /* ---------- Chế độ chạy thử ---------- */
  const CAP = { 'Không thấy': 0, 'Xem': 1, 'Ghi': 2, 'Duyệt': 3 };
  const MAC_DINH = { // [Tổ trưởng, Quản lý nhà thầu, Nhân viên nội bộ, Trưởng bộ phận] – giống PhanQuyenMacDinh
    homnay: ['Ghi', 'Xem', 'Ghi', 'Duyệt'], diemdanh: ['Ghi', 'Ghi', 'Không thấy', 'Duyệt'], congnhan: ['Xem', 'Ghi', 'Không thấy', 'Duyệt'],
    dinhky: ['Ghi', 'Xem', 'Không thấy', 'Duyệt'], noibo: ['Không thấy', 'Không thấy', 'Ghi', 'Duyệt'],
    vuonuom: ['Ghi|Xem', 'Xem', 'Không thấy', 'Duyệt'], donghonuoc: ['Ghi|Không thấy', 'Xem', 'Không thấy', 'Duyệt'],
    phieu: ['Ghi', 'Ghi', 'Ghi', 'Duyệt'], phunbon: ['Ghi', 'Ghi', 'Ghi', 'Duyệt'], duan: ['Ghi', 'Xem', 'Ghi', 'Duyệt'],
    sukien: ['Ghi', 'Xem', 'Ghi', 'Duyệt'], kehoach: ['Ghi', 'Ghi', 'Ghi', 'Duyệt'], tuantra: ['Xem', 'Không thấy', 'Không thấy', 'Duyệt'],
    ai: ['Ghi', 'Không thấy', 'Ghi', 'Duyệt'], baocao: ['Không thấy', 'Xem', 'Không thấy', 'Duyệt'], danhmuc: ['Không thấy', 'Không thấy', 'Không thấy', 'Duyệt'],
  };
  const NHOM_COT = { 'Tổ trưởng': 0, 'Quản lý nhà thầu': 1, 'Nhân viên nội bộ': 2, 'Trưởng bộ phận': 3 };
  const NGUOI_THU = [
    { ten: 'Lê Vũ', nhom: 'Trưởng bộ phận', vaiTro: 'Trưởng bộ phận cảnh quan', doi: '', gmail: 'levule15101994@gmail.com' },
    { ten: 'Phan Văn Thìn', nhom: 'Tổ trưởng', vaiTro: 'Tổ trưởng đội cơ động', doi: 'Đội cơ động', gmail: 'thin@vd' },
    { ten: 'Phạm Nhật Trường', nhom: 'Tổ trưởng', vaiTro: 'Tổ trưởng đội khu vực', doi: 'Đội khu vực', gmail: 'truong@vd' },
    { ten: 'Mai Hòa Pháp', nhom: 'Quản lý nhà thầu', vaiTro: 'Quản lý nhà thầu', doi: '', gmail: 'maihoaphap1994@gmail.com' },
    { ten: 'Nguyễn Tấn Hiệp', nhom: 'Nhân viên nội bộ', vaiTro: 'Nhân viên nội bộ', doi: '', gmail: 'hiepnguyen97979@gmail.com' },
    { ten: 'Lê Hữu Nghị', nhom: 'Nhân viên nội bộ', vaiTro: 'Nhân viên nội bộ', doi: '', gmail: 'lehuunghinghi070@gmail.com' },
  ];
  function quyenThu(u) {
    const q = {}; const c = NHOM_COT[u.nhom];
    Object.keys(MAC_DINH).forEach((k) => {
      let v = MAC_DINH[k][c];
      if (v.includes('|')) v = u.ten.endsWith('Trường') ? v.split('|')[0] : v.split('|')[1];
      q[k] = CAP[v];
    });
    // chỉnh riêng + ủy quyền (bảng PhanQuyen, UyQuyen)
    const PH = { 'Hôm nay / Lịch': 'homnay' };
    tb('PhanQuyen').forEach((r) => {
      const ap = String(r['Áp cho (nhóm hoặc Gmail)']).trim();
      if (ap !== u.nhom && ap.toLowerCase() !== u.gmail && ap !== u.ten) return;
      const k = PH[r['Phân hệ']] || r['Phân hệ']; if (k in q) q[k] = CAP[r['Cấp (Không thấy/Xem/Ghi/Duyệt)']] || 0;
    });
    const hn = ngay();
    tb('UyQuyen').forEach((r) => {
      if (r['Người nhận'] !== u.ten || r['Từ ngày'] > hn || r['Đến ngày'] < hn) return;
      const k = r['Phân hệ']; if (k in q) q[k] = Math.max(q[k], CAP[r['Cấp']] || 0);
    });
    return q;
  }
  const HAN_GIO = { 'Khẩn cấp': 2, 'Cao': 24, 'Trung bình': 72, 'Thấp': 168 };
  let DM = null;
  async function dm() { if (!DM) DM = await (await fetch('js/demo-data.json')).json(); return DM; }
  const tb = (k) => LS.get('tb_' + k, []);
  const luuTb = (k, v) => LS.set('tb_' + k, v);
  function can(u, ph, cap) { if ((u.quyen[ph] || 0) < cap) throw new Error('Anh/chị chưa có quyền này'); }
  function quyenBang(u, bang, cap, hd) {
    const b = BANG[bang]; if (!b) throw new Error('Không có bảng ' + bang);
    if (bang === 'DuAnTienDo' && cap === 2 && (u.quyen.duan || 0) >= 2) return; // ghi tiến độ
    if (bang === 'SuKien' && hd === 'sua' && cap === 2 && (u.quyen.sukien || 0) >= 2) return; // thêm ảnh sự kiện
    if (cap >= 2 && u.nhom === 'Quản lý nhà thầu' && (API.NHA_THAU_GHI || []).includes(bang)) return; // anh Pháp cập nhật báo cáo tuần, kế hoạch tuần
    if (cap >= 2) cap = Math.max(cap, b[1]); // ghi: theo mức tối thiểu của bảng
    can(u, b[0], cap);
  }
  /* ảnh bắt buộc cho mọi đầu việc (mục 18) – máy chủ cũng chặn; ngoại lệ: checklist Vị Garden (VuonRau) */
  const COT_ANH = { Tuoi: 'Ảnh', ViecHangNgay: 'Ảnh', VeSinhBien: 'Ảnh', KiemTraBien: 'Ảnh', CayNoiThat: 'Ảnh', PhanCompost: 'Ảnh', VuonUom: 'Ảnh', VuonUomNoiThat: 'Ảnh', DongHoNuoc: 'Ảnh', ThuHoach: 'Ảnh cân', NhatKyPhunBon: 'Ảnh', SoTrongCay: 'Ảnh', TuiThuocDua: 'Ảnh', BaoTriMay: 'Ảnh', DichHai: 'Ảnh', BatThuong: 'Ảnh' };
  function canAnh(bang, dong) {
    const c = COT_ANH[bang]; if (!c || !dong.length) return;
    if (bang === 'TuiThuocDua' && dong.every((x) => x['Loại dòng'] === 'Cây')) return;
    if (bang === 'MaySangCat' && dong.every((x) => x['Loại'] === 'Không sàng' || x['Bảo trì'] === 'Đọc đồng hồ giờ')) return; // mục 73
    const co = (x) => { const v = x[c] != null ? x[c] : x['Ảnh']; return Array.isArray(v) ? v.length > 0 : !!String(v || '').trim(); };
    if (!dong.some(co)) throw new Error('Cần ít nhất 1 ảnh hiện trường cho việc này');
  }
  function maMoi(bang) {
    const m = MA_SO[bang]; if (!m) return null;
    const d = new Date(); const ds = tb(bang);
    const tien = m[1] + String(d.getFullYear()).slice(2) + z(d.getMonth() + 1) + z(d.getDate()) + '-';
    const n = ds.filter((r) => String(r[m[0]] || '').startsWith(tien)).length + 1;
    return [m[0], tien + String(n).padStart(3, '0')];
  }
  function dien(u, bang, dong) {
    const r = Object.assign({}, dong);
    COT_NGUOI.forEach((c) => { if (c in r && !r[c]) r[c] = u.ten; });
    COT_GIO.forEach((c) => { if (c in r && !r[c]) r[c] = bayGio(); });
    if ('Ngày' in r && !r['Ngày']) r['Ngày'] = ngay();
    const m = maMoi(bang); if (m && !r[m[0]]) r[m[0]] = m[1];
    Object.keys(r).forEach((k) => { if (r[k] == null) r[k] = ''; else if (Array.isArray(r[k])) r[k] = r[k].join(' | '); else r[k] = String(r[k]); });
    return r;
  }
  const khop = (r, loc) => !loc || Object.keys(loc).every((k) => {
    const v = loc[k];
    if (Array.isArray(v)) return v.includes(r[k]);
    if (v && typeof v === 'object') return (v.tu == null || r[k] >= v.tu) && (v.den == null || r[k] <= v.den);
    return r[k] === v;
  });

  /* hoàn tác 10 giây: lưu cách khôi phục, trả mã */
  let HOAN = null;
  function nhoHoan(u, info) { const t = 'H' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); const all = LS.get('hoan', {}); Object.keys(all).forEach((k) => { if (Date.now() - all[k].luc > 6e5) delete all[k]; }); all[t] = Object.assign({ ai: u.ten, luc: Date.now() }, info); LS.set('hoan', all); HOAN = t; return t; }
  const DOI_TT = (r) => r['Trạng thái'] || 'Xong';
  const THU = {
    async hoanTac(u, r) {
      const all = LS.get('hoan', {}); const h = all[r.ma];
      if (!h || h.ai !== u.ten) throw new Error('Không hoàn tác được nữa (quá thời gian).');
      if (Date.now() - h.luc > 120000) throw new Error('Đã quá thời gian hoàn tác.');
      (h.xoa || []).forEach((x) => { luuTb(x.bang, tb(x.bang).filter((y) => !khop(y, x.khoa))); });
      if (h.them) luuTb(h.them.bang, tb(h.them.bang).concat(h.them.dong));
      (h.khoi || []).forEach((x) => { const ds = tb(x.bang); ds.forEach((y) => { if (khop(y, x.khoa)) Object.assign(y, x.cu); }); luuTb(x.bang, ds); });
      delete all[r.ma]; LS.set('hoan', all); return { ok: true };
    },
    async 'vanChuyen.gui'(u, r) {
      can(u, 'dinhky', 2); const hn = ngay(); const doi = r.doi || u.doi || 'Chung';
      const cu = tb('VanChuyen').filter((x) => x['Ngày'] === hn && x['Đội'] === doi);
      if (cu.length && (u.quyen.homnay || 0) < 3) throw new Error('Hôm nay ' + doi + ' đã gửi lúc ' + cu[0]['Giờ ghi'].slice(11, 16) + '. Cần sửa thì báo Trưởng bộ phận.');
      if ((r.anh || []).length < 2 && (u.quyen.homnay || 0) < 3) throw new Error('Cần ít nhất 2 ảnh của vài chuyến trong ngày');
      const gio = bayGio(); const ds = tb('VanChuyen').filter((x) => !(x['Ngày'] === hn && x['Đội'] === doi));
      const moi = r.ds.filter((x) => +x.n > 0).map((x, i) => ({ 'Ngày': hn, 'Đội': doi, 'Loại hàng': x.loai, 'Nhóm': /rác cắt tỉa/i.test(x.loai) ? 'Rác cắt tỉa' : 'Khác', 'Số chuyến': String(x.n), 'Mã DA': r.maDA || '', 'Ghi chú': r.ghiChu || '', 'Ảnh': i === 0 ? (r.anh || []).join(' | ') : '', 'Người ghi': u.ten, 'Giờ ghi': gio }));
      luuTb('VanChuyen', ds.concat(moi)); return { n: moi.length };
    },
    async 'congNhan.sua'(u, r) {
      can(u, 'congnhan', 3); const d = await dm(); const sua = tb('CongNhanSua');
      const goc = d.congnhan.find((x) => x.ma === r.ma) || {}; const cu = Object.assign({}, goc, sua.find((x) => x.ma === r.ma) || {});
      let ma = r.ma;
      if (!ma) { const tat = d.congnhan.concat(sua); ma = 'CN' + String(Math.max(...tat.map((y) => +String(y.ma).slice(2) || 0)) + 1).padStart(2, '0'); }
      const moi = Object.assign({ tt: 'Đang làm' }, cu, r.doi, { ma });
      luuTb('CongNhanSua', sua.filter((x) => x.ma !== ma).concat([moi]));
      const nk = tb('NhatKyThayDoi'); Object.keys(r.doi).forEach((k) => { if (String(cu[k] || '') !== String(r.doi[k])) nk.push({ 'Thời điểm': bayGio(), 'Người': u.ten, 'Trang': 'CongNhan', 'Mã bản ghi': ma, 'Trường': k, 'Giá trị cũ': cu[k] || '', 'Giá trị mới': r.doi[k], 'Lý do': r.lyDo || (r.ma ? 'Trưởng bộ phận sửa' : 'Thêm mới') }); });
      luuTb('NhatKyThayDoi', nk); return { ma };
    },
    async khoiDong(u) {
      const d = await dm();
      const sua = tb('CongNhanSua'); const cn = d.congnhan.map((x) => Object.assign({}, x, (sua.find((y) => y.ma === x.ma) || {}))).concat(sua.filter((y) => !d.congnhan.some((x) => x.ma === y.ma)));
      const dx = tb('DeXuatThuoc').filter((x) => x['Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)'] !== 'Từ chối').map((x) => ({ ma: x['Mã ĐX'], ten: x['Tên thuốc/phân'], nhom: x['Loại'], dvt: '', cachLy: +x['Cách ly đề xuất (ngày)'] || 14,
        tt: x['Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)'] === 'Đã duyệt' ? 'Đang dùng' : 'Chờ duyệt', khongPha: x['Không pha chung với'] || '' }));
      return Object.assign({}, d, { user: u, ky: ky(ngay()), congnhan: (u.quyen.diemdanh || u.quyen.congnhan || u.quyen.baocao || u.quyen.homnay >= 3) ? cn : [],
        thuoc: d.thuoc.concat(dx), hangrao: d.hangrao.concat(tb('HangRaoThem')), congThuc: tb('CongThucPha'), nguoi: NGUOI_THU.map((n) => ({ ten: n.ten, nhom: n.nhom, doi: n.doi, gmail: n.gmail })), coThoiTiet: false, coAI: false });
    },
    async 'congNhan.duyet'(u, r) {
      can(u, 'congnhan', 3);
      const dk = tb('CongNhanDangKy'); const x = dk.find((y) => y['Mã ĐK'] === r.ma); if (!x) throw new Error('Không thấy đăng ký');
      x['Trạng thái duyệt'] = r.dongY ? 'Đã duyệt' : 'Từ chối'; x['Người duyệt'] = u.ten; x['Giờ duyệt'] = bayGio(); luuTb('CongNhanDangKy', dk);
      if (!r.dongY) return { ok: true };
      const d = await dm(); const sua = tb('CongNhanSua'); const loai = x['Loại (Mới/Thay đổi/Nghỉ việc)'];
      let ma = x['Mã CN'];
      if (loai === 'Mới') { const tat = d.congnhan.concat(sua); ma = 'CN' + String(Math.max(...tat.map((y) => +String(y.ma).slice(2) || 0)) + 1).padStart(2, '0'); }
      const cu = sua.find((y) => y.ma === ma) || {}; const goc = d.congnhan.find((y) => y.ma === ma) || {};
      const moi = Object.assign({ ma, ten: x['Họ và tên'], tt: 'Đang làm' }, goc, cu);
      if (x['Đội']) moi.doi = x['Đội']; if (x['Chức danh']) moi.cd = x['Chức danh']; if (x['Khu vực phụ trách']) moi.kv = x['Khu vực phụ trách']; if (x['Số điện thoại']) moi.sdt = x['Số điện thoại'];
      if (loai === 'Nghỉ việc') moi.tt = 'Đã nghỉ';
      luuTb('CongNhanSua', sua.filter((y) => y.ma !== ma).concat([moi]));
      return { ok: true, ma };
    },
    /* ---- chung ---- */
    async docNhieu(u, r) {
      const out = {};
      r.ds.forEach((x) => { quyenBang(u, x.bang, 1); let rows = tb(x.bang).filter((y) => khop(y, x.loc)); if (x.gioiHan) rows = rows.slice(-x.gioiHan); out[x.ten || x.bang] = rows; });
      return out;
    },
    async thayNhom(u, r) { // thay toàn bộ nhóm dòng khớp khóa (vd: người của một khu phụ trách)
      quyenBang(u, r.bang, 3); const ds = tb(r.bang).filter((x) => !khop(x, r.khoa)); const moi = r.dong.map((x) => dien(u, r.bang, x));
      luuTb(r.bang, ds.concat(moi)); return { n: moi.length };
    },
    async ghi(u, r, noiBo) {
      if (!noiBo) quyenBang(u, r.bang, 2);
      if (!noiBo) canAnh(r.bang, [r.dong]);
      const ds = tb(r.bang); const dong = dien(u, r.bang, r.dong); ds.push(dong); luuTb(r.bang, ds);
      if (!noiBo) nhoHoan(u, { xoa: [{ bang: r.bang, khoa: dong }] }); return dong;
    },
    async ghiNhieu(u, r) { // ghi nhiều dòng; r.thay = các cột khóa → xóa dòng cũ trùng khóa trước khi ghi
      quyenBang(u, r.bang, 2); canAnh(r.bang, r.dong);
      let ds = tb(r.bang); const moi = r.dong.map((x) => dien(u, r.bang, x));
      const bo = r.thay ? ds.filter((o) => moi.some((n) => r.thay.every((k) => o[k] === n[k]))) : [];
      if (r.thay) ds = ds.filter((o) => !bo.includes(o));
      luuTb(r.bang, ds.concat(moi)); nhoHoan(u, { xoa: moi.map((x) => ({ bang: r.bang, khoa: x })), them: bo.length ? { bang: r.bang, dong: bo } : null }); return moi;
    },
    async sua(u, r) {
      quyenBang(u, r.bang, laDuyet(r.doi) ? 3 : 2, 'sua');
      const ds = tb(r.bang); let n = 0;
      ds.forEach((x) => { if (khop(x, r.khoa)) { Object.keys(r.doi).forEach((k) => { x[k] = String(r.doi[k] == null ? '' : r.doi[k]); }); n++; } });
      luuTb(r.bang, ds);
      if (r.bang !== 'NhatKyThayDoi' && r.lyDo) { const nk = tb('NhatKyThayDoi'); nk.push(dien(u, 'NhatKyThayDoi', { 'Thời điểm': '', 'Người': '', 'Trang': r.bang, 'Mã bản ghi': JSON.stringify(r.khoa), 'Trường': Object.keys(r.doi).join(', '), 'Giá trị mới': Object.values(r.doi).join(', '), 'Lý do': r.lyDo })); luuTb('NhatKyThayDoi', nk); }
      return { n };
    },
    async xoa(u, r) { // chỉ xóa dòng của chính mình trong hôm nay (đánh nhầm); Trưởng bộ phận xóa được mọi dòng
      quyenBang(u, r.bang, 2);
      const ds = tb(r.bang); const hn = ngay(); let n = 0;
      const giu = ds.filter((x) => {
        if (!khop(x, r.khoa)) return true;
        const cua = COT_NGUOI.some((c) => x[c] === u.ten) && Object.keys(x).some((k) => String(x[k]).startsWith(hn));
        if (u.quyen.homnay >= 3 || cua) { n++; return false; } return true;
      });
      if (!n) throw new Error('Chỉ xóa được dòng do mình ghi trong hôm nay.');
      luuTb(r.bang, giu); return { n };
    },
    /* ---- điểm danh ---- */
    async 'diemDanh.gui'(u, r) {
      if (u.nhom === 'Quản lý nhà thầu') throw new Error('Anh Pháp chỉ tự điểm danh cho mình');
      return ghiDD(u, r);
    },
    async 'diemDanh.tuDiem'(u, r) {
      const d = await dm(); const cn = d.congnhan.find((x) => x.ten === u.ten);
      if (!cn) throw new Error('Không có tên trong danh sách công nhân');
      return ghiDD(u, { ngay: ngay(), buoi: r.buoi, doi: 'Quản lý nhà thầu', ds: [{ ma: cn.ma, tt: 'Có mặt' }] });
    },
    async 'diemDanh.duyet'(u, r) {
      can(u, 'diemdanh', 3);
      const loc = (x) => x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && (!r.doi || x['Đội'] === r.doi);
      const coAnh = (x) => x['Đội'] === 'Quản lý nhà thầu' || !!String(x['Ảnh tập thể'] || '').trim();
      const du = tb('DuyetCong'); const chon = du.filter((x) => loc(x) && x['Khóa'] !== 'Có');
      if (!chon.length) throw new Error(r.doi ? 'Chưa có điểm danh của ' + r.doi + ' buổi này' : 'Không có buổi nào chờ duyệt');
      const duoc = chon.filter(coAnh); const bo = chon.filter((x) => !coAnh(x));
      if (!duoc.length) throw new Error('Chưa có ảnh tập thể, chưa duyệt được: ' + bo.map((x) => x['Đội']).join(', '));
      const doiDuoc = duoc.map((x) => x['Đội']); const gio = bayGio();
      duoc.forEach((x) => Object.assign(x, { 'Người duyệt': u.ten, 'Giờ duyệt': gio, 'Khóa': 'Có' })); luuTb('DuyetCong', du);
      const dd = tb('DiemDanh'); dd.forEach((x) => { if (loc(x) && doiDuoc.includes(x['Đội'])) x['Trạng thái duyệt'] = 'Đã duyệt'; }); luuTb('DiemDanh', dd);
      return { ok: true, doi: doiDuoc, boQua: bo.map((x) => x['Đội']) };
    },
    /* ---- định kỳ: lưu nhiều vị trí + ảnh một lần ---- */
    async 'dinhKy.luu'(u, r) {
      can(u, 'dinhky', 2);
      if (!r.anh || !r.anh.length) throw new Error('Cần ít nhất 1 ảnh hiện trường');
      const tt = r.trangThai === 'Đang làm' ? 'Đang làm' : 'Xong';
      const t = tb('TickDinhKy'); const hn = ngay(); const k = ky(hn).ten; const gio = bayGio(); const hoan = { xoa: [], khoi: [] };
      r.ds.forEach((x) => {
        const mo = t.find((y) => y['Mã việc'] === r.viec && y['Mã vị trí'] === x.vt && y['Trạng thái'] === 'Đang làm');
        if (mo) {
          if (tt === 'Đang làm') return;
          const khoa = { 'Mã việc': r.viec, 'Mã vị trí': x.vt, 'Bắt đầu': mo['Bắt đầu'], 'Trạng thái': 'Đang làm' };
          hoan.khoi.push({ bang: 'TickDinhKy', khoa: { 'Mã việc': r.viec, 'Mã vị trí': x.vt, 'Bắt đầu': mo['Bắt đầu'], 'Ngày xong': hn }, cu: { 'Trạng thái': 'Đang làm', 'Ngày xong': '', 'Số ngày': '', 'Kỳ': mo['Kỳ'] } });
          Object.assign(mo, { 'Trạng thái': 'Xong', 'Ngày xong': hn, 'Kỳ': k, 'Số ngày': String(Math.round((new Date(hn) - new Date(mo['Bắt đầu'])) / 864e5) + 1), 'Người tick': u.ten, 'Giờ tick': gio, 'Ghi chú': [mo['Ghi chú'], r.ghiChu].filter(Boolean).join(' · ') });
          return void khoa;
        }
        const kx = r.kyBu && (r.kyBu.ds || []).includes(x.vt) && !t.some((y) => y['Kỳ'] === r.kyBu.ten && y['Mã việc'] === r.viec && y['Mã vị trí'] === x.vt && DOI_TT(y) === 'Xong') ? r.kyBu.ten : k; // làm dồn: tính cho kỳ cũ trước
        const truoc = t.filter((y) => y['Kỳ'] === kx && y['Mã việc'] === r.viec && y['Mã vị trí'] === x.vt && DOI_TT(y) === 'Xong').length;
        if (truoc && !x.lyDo) throw new Error('Vị trí ' + x.vt + ' đã làm trong kỳ. Chọn lý do làm thêm.');
        t.push({ 'Ngày': hn, 'Kỳ': kx, 'Làm dồn': kx !== k ? 'Có' : '', 'Mã việc': r.viec, 'Mã vị trí': x.vt, 'Mã KH': '', 'Lần': String(truoc + 1), 'Lý do làm thêm': x.lyDo || '', 'Mã dịch hại': r.maDH || '', 'Người tick': u.ten, 'Giờ tick': gio, 'Ghi chú': r.ghiChu || '',
          'Trạng thái': tt, 'Bắt đầu': hn, 'Ngày xong': tt === 'Xong' ? hn : '', 'Số ngày': tt === 'Xong' ? '1' : '', 'Mã NK': r.maNK || '' });
        hoan.xoa.push({ bang: 'TickDinhKy', khoa: { 'Mã việc': r.viec, 'Mã vị trí': x.vt, 'Giờ tick': gio } });
      });
      luuTb('TickDinhKy', t);
      const a = tb('AnhNgay');
      r.anh.forEach((x) => a.push({ 'Ngày': hn, 'Mã việc': r.viec, 'Khu vực': [...new Set(r.ds.map((d) => d.kv))].join(', '), 'Link ảnh': x, 'Nguồn ảnh': 'Chụp', 'Mã băm': r.bam || '', 'Người chụp': u.ten, 'Giờ': gio, 'GPS': '' }));
      luuTb('AnhNgay', a); hoan.xoa.push({ bang: 'AnhNgay', khoa: { 'Mã việc': r.viec, 'Giờ': gio, 'Người chụp': u.ten } });
      nhoHoan(u, hoan);
      return { n: r.ds.length };
    },
    /* ---- phiếu ---- */
    async 'phieu.tao'(u, r) {
      can(u, 'phieu', 2);
      const han = new Date(Date.now() + (HAN_GIO[r.muc] || 72) * 36e5);
      const p = await THU.ghi(u, { bang: 'Phieu', dong: { 'Mã phiếu': '', 'Loại': r.loaiPhieu || 'Lỗi', 'Nguồn': r.nguon || 'Nhân viên tự phát hiện', 'Nhóm lỗi': r.nhom || '', 'Loại lỗi': r.loai,
        'Mức độ': r.muc, 'Mã vị trí': r.vt || '', 'Vị trí khác': r.vtKhac || '', 'Mô tả': r.moTa || '', 'Giao cho': r.giao || '', 'Người tạo': '', 'Giờ tạo': '',
        'Hạn': ngay(han) + ' ' + z(han.getHours()) + ':' + z(han.getMinutes()), 'Ảnh trước': (r.anh || []).join(' | '), 'Chi tiết trồng': r.trong ? JSON.stringify(r.trong) : '', 'Trạng thái': 'Mới', 'Số lần trả lại': '0', 'Mã tuần tra': r.maTT || '', 'Mã sự kiện': r.maSK || '', 'Mã dự án': r.maDA || '', 'Mã lặp lại': r.maLL || '' } }, true);
      await THU.ghi(u, { bang: 'PhieuLichSu', dong: { 'Mã phiếu': p['Mã phiếu'], 'Thời điểm': '', 'Hành động': 'Tạo', 'Người': '' } }, true);
      return { ma: p['Mã phiếu'] };
    },
    async 'phieu.chuyen'(u, r) {
      can(u, 'phieu', r.hd === 'duyet' || r.hd === 'traLai' ? 3 : 2);
      const ds = tb('Phieu'); const p = ds.find((x) => x['Mã phiếu'] === r.ma);
      if (!p) throw new Error('Không tìm thấy phiếu');
      const now = bayGio();
      if (r.hd === 'nhan') Object.assign(p, { 'Người nhận': u.ten, 'Giờ nhận': now, 'Trạng thái': 'Đang xử lý' });
      if (r.hd === 'xong') { if (!(r.anh && r.anh.length)) throw new Error('Cần ảnh sau khi xử lý'); if (p['Chi tiết trồng'] && !(r.anhTrong && r.anhTrong.length)) throw new Error('Phiếu trồng cây cần ảnh trong khi trồng'); Object.assign(p, { 'Ảnh sau': r.anh.join(' | '), 'Ảnh trong': (r.anhTrong || []).join(' | '), 'Giờ xong': now, 'Trạng thái': 'Báo xong' }); }
      if (r.hd === 'duyet') { Object.assign(p, { 'Giờ duyệt': now, 'Trạng thái': 'Đã duyệt' }); if (p['Chi tiết trồng']) ghiTrong(u, p); }
      if (r.hd === 'traLai') Object.assign(p, { 'Trạng thái': 'Bị trả lại', 'Số lần trả lại': String(+p['Số lần trả lại'] + 1) });
      luuTb('Phieu', ds);
      await THU.ghi(u, { bang: 'PhieuLichSu', dong: { 'Mã phiếu': r.ma, 'Thời điểm': '', 'Hành động': r.hd, 'Người': '', 'Ghi chú': r.ghiChu || '' } }, true);
      return { ok: true };
    },
    /* ---- thời tiết, AI: cần mã ở chế độ thật ---- */
    async thoiTiet() { return null; },
    async 'ai.cay'() { throw new Error('AI nhận diện cây chỉ chạy khi đã nối dữ liệu thật và có mã Pl@ntNet.'); },
    async 'ai.trieuChung'() { throw new Error('AI phân tích triệu chứng chỉ chạy khi đã nối dữ liệu thật và có mã Gemini.'); },
  };
  function ghiTrong(u, p) { // phiếu trồng dặm được duyệt → Sổ trồng cây + tiến độ dự án
    const c = JSON.parse(p['Chi tiết trồng']); const so = tb('SoTrongCay'); let n = so.length;
    c.cay.forEach((x, i) => so.push({ 'STT': String(++n), 'Thời gian': ngay(), 'Khu vực': c.kv || '', 'Mã vị trí': p['Mã vị trí'], 'Vị trí khác': p['Vị trí khác'], 'Hình thức': c.ht, 'Nguồn cây': c.nc, 'Mã cây': x.ma || '', 'Tên cây': x.ten, 'ĐVT': x.dvt, 'Số lượng': String(x.sl),
      'Chất cải tạo đất hữu cơ (bao)': i === 0 ? String(c.bao || '') : '', 'Cây trước khi cải tạo': c.truoc || '', 'Ghi chú': 'Từ phiếu ' + p['Mã phiếu'], 'Ảnh': [p['Ảnh trước'], p['Ảnh trong'], p['Ảnh sau']].filter(Boolean).join(' | '), 'Mã DA': c.da || '', 'Mã phiếu': p['Mã phiếu'], 'Người ghi': p['Người nhận'] || u.ten }));
    luuTb('SoTrongCay', so);
  }
  async function ghiDD(u, r) {
    can(u, 'diemdanh', 2);
    const anh = (u.quyen.diemdanh || 0) >= 3;
    const doi = r.doi || u.doi || 'Chưa phân đội';
    const d = await dm(); const cnMap = {}; d.congnhan.concat(tb('CongNhanSua')).forEach((x) => { cnMap[x.ma] = x; });
    const cu = tb('DiemDanh').filter((x) => x['Ngày'] === r.ngay && x['Buổi'] === r.buoi);
    const khoaDoi = tb('DuyetCong').some((x) => x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && x['Đội'] === doi && x['Khóa'] === 'Có');
    const thay = !anh && u.doi && doi.toLowerCase() !== u.doi.toLowerCase() && doi !== 'Quản lý nhà thầu';
    if (thay) {
      const khac = tb('DuyetCong').find((x) => x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && x['Đội'] === doi && x['Người gửi'] !== u.ten);
      if (khac) throw new Error(doi + ' đã được ' + khac['Người gửi'] + ' điểm danh buổi này.');
    }
    if (!anh && r.ngay !== ngay()) throw new Error('Chỉ điểm danh cho hôm nay.');
    if (!anh && doi !== 'Quản lý nhà thầu' && !(r.anh || []).length) throw new Error('Cần 1 ảnh tập thể đầu ca buổi ' + String(r.buoi).toLowerCase() + '.');
    if (!anh) {
      if (khoaDoi) throw new Error('Buổi này Trưởng bộ phận đã duyệt và khóa. Cần sửa thì báo Trưởng bộ phận.');
      const khoa = r.ds.filter((x) => cu.some((c) => c['Mã CN'] === x.ma && c['Trạng thái duyệt'] === 'Đã duyệt'));
      if (khoa.length) throw new Error('Đã khóa, không sửa được: ' + khoa.map((x) => (cnMap[x.ma] || {}).ten || x.ma).join(', ') + '. Cần sửa thì báo Trưởng bộ phận.');
      const khac = r.ds.filter((x) => cu.some((c) => c['Mã CN'] === x.ma && c['Người ghi'] !== u.ten));
      if (khac.length) throw new Error('Đã được tổ trưởng khác điểm danh: ' + khac.map((x) => (cnMap[x.ma] || {}).ten || x.ma).join(', '));
    }
    const ma = r.ds.map((x) => x.ma);
    const dd = tb('DiemDanh').filter((x) => !(x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && ma.includes(x['Mã CN'])));
    const gio = bayGio(); const nk = tb('NhatKyThayDoi');
    r.ds.forEach((x) => {
      const c = cu.find((y) => y['Mã CN'] === x.ma);
      if (anh && c && c['Trạng thái (Có mặt/Vắng/Về sớm)'] !== x.tt) nk.push({ 'Thời điểm': gio, 'Người': u.ten, 'Trang': 'DiemDanh', 'Mã bản ghi': r.ngay + '/' + r.buoi + '/' + x.ma, 'Trường': 'Trạng thái', 'Giá trị cũ': c['Trạng thái (Có mặt/Vắng/Về sớm)'], 'Giá trị mới': x.tt, 'Lý do': r.lyDo || 'Trưởng bộ phận sửa trực tiếp' });
      dd.push({ 'Ngày': r.ngay, 'Buổi': r.buoi, 'Mã CN': x.ma, 'Họ tên': (cnMap[x.ma] || {}).ten || '', 'Đội': anh ? (c ? c['Đội'] : (cnMap[x.ma] || {}).doi || 'Chưa phân đội') : doi,
        'Trạng thái (Có mặt/Vắng/Về sớm)': x.tt, 'Giờ về': x.gioVe || '', 'Lý do': x.lyDo || '', 'Công': x.tt === 'Có mặt' ? '0.5' : '0', 'Ảnh tập thể': '',
        'Người ghi': anh && c ? c['Người ghi'] : u.ten, 'Giờ ghi': gio, 'Trạng thái duyệt': anh ? 'Đã duyệt' : 'Chờ duyệt' });
    });
    luuTb('DiemDanh', dd); if (anh) luuTb('NhatKyThayDoi', nk);
    if (!anh) {
      const du = tb('DuyetCong').filter((x) => !(x['Ngày'] === r.ngay && x['Buổi'] === r.buoi && x['Đội'] === doi));
      du.push({ 'Ngày': r.ngay, 'Buổi': r.buoi, 'Đội': doi, 'Người gửi': u.ten, 'Giờ gửi': gio, 'Người duyệt': '', 'Giờ duyệt': '', 'Khóa': 'Không',
        'Ảnh tập thể': (r.anh || []).join(' | '), 'Ghi chú': thay ? 'Điểm danh giúp (tổ trưởng ' + doi + ' nghỉ) · ' + u.ten : '' }); luuTb('DuyetCong', du);
    }
    return { ok: true };
  }

  /* ---------- Mặt ngoài ---------- */
  const API = {
    thu: () => LS.get('che_do') === 'thu',
    coThat: () => !!(CFG.API_URL && CFG.CLIENT_ID),
    daDangNhap: () => (API.thu() ? !!LS.get('thu_user') : !!LS.get('token')),
    nguoiThu: NGUOI_THU,
    async vaoThu(i) { LS.set('che_do', 'thu'); LS.set('thu_i', i); LS.set('thu_user', true); },
    async dangNhapGoogle(idToken) {
      const j = await (await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'dangNhap', idToken }) })).json();
      if (!j.ok) throw new Error(j.loi);
      LS.set('che_do', 'that'); LS.set('token', j.data.token);
    },
    dangXuat() { LS.del('token'); LS.del('thu_user'); LS.del('che_do'); },
    xoaDuLieuThu() { Object.keys(localStorage).filter((k) => k.startsWith('gl_tb_')).forEach((k) => localStorage.removeItem(k)); },
    async goi(action, body) {
      if (API.thu()) {
        const fn = THU[action]; if (!fn) throw new Error('Chưa có ở chế độ chạy thử: ' + action);
        const u = Object.assign({}, NGUOI_THU[LS.get('thu_i', 0)]); u.quyen = quyenThu(u);
        if (u.nhom === 'Tổ trưởng') u.doi = u.doi; HOAN = null;
        const kq = JSON.parse(JSON.stringify(await fn(u, body || {})));
        if (HOAN && GHI.includes(action) && action !== 'hoanTac' && !(body && body.imLang)) window.dispatchEvent(new CustomEvent('gl-hoan', { detail: HOAN }));
        return kq;
      }
      return goiThat(action, body);
    },
    soHang: () => hang().length,
    baoHang() { const n = hang().length; document.querySelectorAll('.bang-hang').forEach((b) => { b.textContent = n ? `📶 Mất sóng: ${n} mục đang chờ gửi, tự gửi khi có mạng` : ''; b.style.display = n ? '' : 'none'; }); },
    async guiHang() {
      if (API.thu() || API.guiHang.dang) return; API.guiHang.dang = true;
      try {
        let ds = hang();
        while (ds.length) {
          const x = ds[0]; let j;
          try { j = await guiMot(x.action, x.body, x.cid); } catch (e) { break; }
          if (!j.ok && j.loi === 'HET_PHIEN') break;
          if (!j.ok) { const loi = LS.get('hangLoi', []); loi.push(Object.assign({ loi: j.loi }, x)); LS.set('hangLoi', loi); }
          ds = hang().filter((y) => y.cid !== x.cid); LS.set('hang', ds);
        }
      } finally { API.guiHang.dang = false; API.baoHang(); }
    },
    anhUrl(v) {
      v = String(v || '').trim(); if (!v) return '';
      if (v.startsWith('data:') || v.startsWith('http')) return v;
      if (/^(img|icons)\//.test(v)) return v; // ảnh mẫu trong app
      return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(v) + '&sz=w800';
    },
    LS,
    dsAnh: (v) => String(v || '').split('|').map((s) => s.trim()).filter(Boolean),
    ngay, bayGio, ky, BANG,
  };
  window.GL_API = API;
})();
