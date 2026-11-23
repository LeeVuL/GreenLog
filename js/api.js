/* GreenLog – lớp gọi dữ liệu.
   Chế độ thật: gửi tới Apps Script. Chế độ chạy thử: xử lý ngay trên máy bằng dữ liệu mẫu. */
(function () {
  const CFG = window.GL_CONFIG;
  const LS = {
    get: (k, d) => { try { const v = localStorage.getItem('gl_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem('gl_' + k, JSON.stringify(v)); } catch (e) {} },
    del: (k) => { try { localStorage.removeItem('gl_' + k); } catch (e) {} },
  };

  /* ---------- Chế độ thật ---------- */
  async function goiThat(action, body) {
    const res = await fetch(CFG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // tránh preflight CORS
      body: JSON.stringify(Object.assign({ action, token: LS.get('token') }, body || {})),
    });
    const j = await res.json();
    if (!j.ok) {
      if (j.loi === 'HET_PHIEN') { LS.del('token'); location.reload(); }
      throw new Error(j.loi || 'Lỗi không rõ');
    }
    return j.data;
  }

  /* ---------- Chế độ chạy thử ---------- */
  const CAP = { 'Không thấy': 0, 'Xem': 1, 'Ghi': 2, 'Duyệt': 3 };
  // cùng bảng mặc định với PhanQuyenMacDinh: [Tổ trưởng, Quản lý nhà thầu, Nhân viên nội bộ, Trưởng bộ phận]
  const MAC_DINH = {
    homnay: ['Ghi', 'Xem', 'Ghi', 'Duyệt'], diemdanh: ['Ghi', 'Ghi', 'Không thấy', 'Duyệt'], congnhan: ['Xem', 'Ghi', 'Không thấy', 'Duyệt'],
    dinhky: ['Ghi', 'Xem', 'Không thấy', 'Duyệt'], noibo: ['Không thấy', 'Không thấy', 'Ghi', 'Duyệt'],
    vuonuom: ['Ghi|Xem', 'Xem', 'Không thấy', 'Duyệt'], donghonuoc: ['Ghi|Không thấy', 'Xem', 'Không thấy', 'Duyệt'],
    phieu: ['Ghi', 'Xem', 'Ghi', 'Duyệt'], phunbon: ['Ghi', 'Ghi', 'Ghi', 'Duyệt'], duan: ['Ghi', 'Xem', 'Ghi', 'Duyệt'],
    sukien: ['Ghi', 'Xem', 'Ghi', 'Duyệt'], kehoach: ['Ghi', 'Ghi', 'Ghi', 'Duyệt'], tuantra: ['Xem', 'Không thấy', 'Không thấy', 'Duyệt'],
    ai: ['Ghi', 'Không thấy', 'Ghi', 'Duyệt'], baocao: ['Không thấy', 'Xem', 'Không thấy', 'Duyệt'], danhmuc: ['Không thấy', 'Không thấy', 'Không thấy', 'Duyệt'],
  };
  const NHOM_COT = { 'Tổ trưởng': 0, 'Quản lý nhà thầu': 1, 'Nhân viên nội bộ': 2, 'Trưởng bộ phận': 3 };
  const NGUOI_THU = [
    { ten: 'Lê Vũ', nhom: 'Trưởng bộ phận', vaiTro: 'Trưởng bộ phận cảnh quan', doi: '' },
    { ten: 'Phan Văn Thìn', nhom: 'Tổ trưởng', vaiTro: 'Tổ trưởng đội cơ động', doi: 'Đội cơ động' },
    { ten: 'Phạm Nhật Trường', nhom: 'Tổ trưởng', vaiTro: 'Tổ trưởng đội khu vực', doi: 'Đội khu vực' },
    { ten: 'Mai Hòa Pháp', nhom: 'Quản lý nhà thầu', vaiTro: 'Quản lý nhà thầu', doi: '' },
    { ten: 'Nguyễn Tấn Hiệp', nhom: 'Nhân viên nội bộ', vaiTro: 'Nhân viên nội bộ', doi: '' },
  ];
  function quyenThu(u) {
    const q = {}; const c = NHOM_COT[u.nhom];
    Object.keys(MAC_DINH).forEach((k) => {
      let v = MAC_DINH[k][c];
      if (v.includes('|')) v = u.ten.endsWith('Trường') ? v.split('|')[0] : v.split('|')[1];
      q[k] = CAP[v];
    });
    return q;
  }
  const HAN_GIO = { 'Khẩn cấp': 2, 'Cao': 24, 'Trung bình': 72, 'Thấp': 168 };
  const z = (n) => String(n).padStart(2, '0');
  const ngay = () => { const d = new Date(); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); };
  const bayGio = () => { const d = new Date(); return ngay() + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds()); };
  function ky(d) {
    const p = d.split('-').map(Number); let y = p[0], m = p[1];
    if (p[2] >= 20) { m++; if (m > 12) { m = 1; y++; } }
    const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
    return { ten: 'T' + z(m) + '.' + y, tu: py + '-' + z(pm) + '-20', den: y + '-' + z(m) + '-19' };
  }
  let DM = null;
  async function dm() { if (!DM) DM = await (await fetch('js/demo-data.json')).json(); return DM; }
  const db = (k) => LS.get('thu_' + k, []);
  const luu = (k, v) => LS.set('thu_' + k, v);
  function can(u, ph, cap) { if ((u.quyen[ph] || 0) < cap) throw new Error('Anh/chị chưa có quyền này'); }

  const THU = {
    async toi(u) { return u; },
    async khoiDong(u) {
      const d = await dm();
      return { user: u, ky: ky(ngay()), vitri: d.vitri, dauviec: d.dauviec, loi: d.loi, congnhan: (u.quyen.diemdanh || u.quyen.congnhan) ? d.congnhan : undefined };
    },
    async homNay() {
      const d = await dm(); const k = ky(ngay()); const tienDo = {};
      db('tick').filter((x) => x.ky === k.ten && x.lan === 1).forEach((x) => { tienDo[x.viec] = (tienDo[x.viec] || 0) + 1; });
      const ph = db('phieu').filter((x) => x.tt !== 'Đã duyệt');
      return { ngay: ngay(), ky: k, tienDo, soViTri: d.vitri.filter((v) => v.ap === 'Có').length, phieuMo: ph.length,
        phieuKhan: ph.filter((x) => x.muc === 'Khẩn cấp').length, phieuChoDuyet: ph.filter((x) => x.tt === 'Báo xong').length,
        diemDanh: db('duyet').filter((x) => x.ngay === ngay()).map((x) => ({ buoi: x.buoi, doi: x.doi, duyet: x.khoa })) };
    },
    async 'diemDanh.lay'(u, r) {
      can(u, 'diemdanh', 1);
      return { rows: db('dd').filter((x) => x.ngay === r.ngay && x.buoi === r.buoi), duyet: db('duyet').filter((x) => x.ngay === r.ngay && x.buoi === r.buoi) };
    },
    async 'diemDanh.gui'(u, r) {
      if (u.nhom === 'Quản lý nhà thầu') throw new Error('Anh Pháp chỉ tự điểm danh cho mình');
      return ghiDD(u, r);
    },
    async 'diemDanh.tuDiem'(u, r) {
      const d = await dm(); const cn = d.congnhan.find((x) => x.ten === u.ten);
      return ghiDD(u, { ngay: ngay(), buoi: r.buoi, doi: 'Quản lý nhà thầu', ds: [{ ma: cn.ma, tt: 'Có mặt' }] });
    },
    async 'diemDanh.duyet'(u, r) {
      can(u, 'diemdanh', 3);
      const du = db('duyet'); du.forEach((x) => { if (x.ngay === r.ngay && x.buoi === r.buoi && (!r.doi || x.doi === r.doi)) { x.khoa = true; x.nguoiDuyet = u.ten; } }); luu('duyet', du);
      const dd = db('dd'); dd.forEach((x) => { if (x.ngay === r.ngay && x.buoi === r.buoi && (!r.doi || x.doi === r.doi)) x.duyet = 'Đã duyệt'; }); luu('dd', dd);
      return { ok: true };
    },
    async 'dinhKy.lay'(u, r) { can(u, 'dinhky', 1); const k = r.ky || ky(ngay()).ten; return db('tick').filter((x) => x.ky === k); },
    async 'dinhKy.tick'(u, r) {
      can(u, 'dinhky', 2);
      const t = db('tick'); const k = ky(ngay()).ten;
      const truoc = t.filter((x) => x.ky === k && x.viec === r.viec && x.vt === r.vt).length;
      if (truoc && !r.lyDo) throw new Error('Vị trí này đã làm trong kỳ. Chọn lý do làm thêm.');
      t.push({ ngay: ngay(), ky: k, viec: r.viec, vt: r.vt, lan: truoc + 1, lyDo: r.lyDo || '', nguoi: u.ten }); luu('tick', t);
      return { lan: truoc + 1 };
    },
    async 'dinhKy.boTick'(u, r) {
      can(u, 'dinhky', 2);
      const t = db('tick'); const d = ngay();
      for (let i = t.length - 1; i >= 0; i--) if (t[i].ngay === d && t[i].viec === r.viec && t[i].vt === r.vt && t[i].nguoi === u.ten) { t.splice(i, 1); luu('tick', t); return { ok: true }; }
      throw new Error('Chỉ bỏ được dấu do mình đánh trong hôm nay. Trường hợp khác báo anh Vũ.');
    },
    async 'phieu.ds'(u) { can(u, 'phieu', 1); return db('phieu').slice().reverse(); },
    async 'phieu.tao'(u, r) {
      can(u, 'phieu', 2);
      const p = db('phieu'); const d = new Date();
      const ma = 'P' + String(d.getFullYear()).slice(2) + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(p.length + 1).padStart(3, '0');
      const han = new Date(Date.now() + (HAN_GIO[r.muc] || 72) * 36e5);
      p.push({ ma, loai: r.loai, nhom: r.nhom, muc: r.muc, vt: r.vt, vtKhac: r.vtKhac, moTa: r.moTa, giao: r.giao, tao: u.ten, gioTao: bayGio(),
        han: han.getFullYear() + '-' + z(han.getMonth() + 1) + '-' + z(han.getDate()) + ' ' + z(han.getHours()) + ':' + z(han.getMinutes()),
        anhTruoc: r.anh || '', tt: 'Mới', traLai: 0, nguon: r.nguon });
      luu('phieu', p); return { ma };
    },
    'phieu.nhan': (u, r) => chuyen(u, r, 'nhan'), 'phieu.xong': (u, r) => chuyen(u, r, 'xong'),
    'phieu.duyet': (u, r) => chuyen(u, r, 'duyet'), 'phieu.traLai': (u, r) => chuyen(u, r, 'traLai'),
  };
  async function ghiDD(u, r) {
    can(u, 'diemdanh', 2);
    const doi = r.doi || u.doi || 'Chưa phân đội';
    if (db('duyet').some((x) => x.ngay === r.ngay && x.buoi === r.buoi && x.doi === doi && x.khoa)) throw new Error('Buổi này anh Vũ đã duyệt và khóa. Muốn sửa thì tạo phiếu sửa công.');
    const ma = r.ds.map((d) => d.ma);
    const dd = db('dd').filter((x) => !(x.ngay === r.ngay && x.buoi === r.buoi && ma.includes(x.ma)));
    r.ds.forEach((d) => dd.push({ ngay: r.ngay, buoi: r.buoi, ma: d.ma, tt: d.tt, gioVe: d.gioVe || '', lyDo: d.lyDo || '', doi, duyet: 'Chờ duyệt', nguoi: u.ten }));
    luu('dd', dd);
    const du = db('duyet').filter((x) => !(x.ngay === r.ngay && x.buoi === r.buoi && x.doi === doi));
    du.push({ ngay: r.ngay, buoi: r.buoi, doi, nguoiGui: u.ten, khoa: false }); luu('duyet', du);
    return { ok: true };
  }
  async function chuyen(u, r, hd) {
    can(u, 'phieu', hd === 'duyet' || hd === 'traLai' ? 3 : 2);
    const p = db('phieu'); const x = p.find((y) => y.ma === r.ma);
    if (hd === 'nhan') Object.assign(x, { nhan: u.ten, tt: 'Đang xử lý' });
    if (hd === 'xong') { if (!r.anh && !x.anhSau) throw new Error('Cần ảnh sau khi xử lý'); Object.assign(x, { anhSau: r.anh || x.anhSau, tt: 'Báo xong' }); }
    if (hd === 'duyet') x.tt = 'Đã duyệt';
    if (hd === 'traLai') Object.assign(x, { tt: 'Bị trả lại', traLai: (x.traLai || 0) + 1 });
    luu('phieu', p); return { ok: true };
  }

  /* ---------- Mặt ngoài ---------- */
  const API = {
    thu: () => LS.get('che_do') === 'thu',
    coThat: () => !!(CFG.API_URL && CFG.CLIENT_ID),
    daDangNhap: () => (API.thu() ? !!LS.get('thu_user') : !!LS.get('token')),
    nguoiThu: NGUOI_THU,
    async vaoThu(i) {
      const u = Object.assign({}, NGUOI_THU[i]); u.quyen = quyenThu(u);
      LS.set('che_do', 'thu'); LS.set('thu_user', u);
    },
    async dangNhapGoogle(idToken) {
      const j = await (await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'dangNhap', idToken }) })).json();
      if (!j.ok) throw new Error(j.loi);
      LS.set('che_do', 'that'); LS.set('token', j.data.token);
    },
    dangXuat() { LS.del('token'); LS.del('thu_user'); LS.del('che_do'); },
    xoaDuLieuThu() { ['dd', 'duyet', 'tick', 'phieu'].forEach((k) => LS.del('thu_' + k)); },
    async goi(action, body) {
      if (API.thu()) {
        const fn = THU[action]; if (!fn) throw new Error('Chưa có ở chế độ chạy thử: ' + action);
        return JSON.parse(JSON.stringify(await fn(LS.get('thu_user'), body || {})));
      }
      return goiThat(action, body);
    },
    anhUrl(v) {
      if (!v) return '';
      if (v.startsWith('data:')) return v;
      return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(v) + '&sz=w800';
    },
    ngay, ky,
  };
  window.GL_API = API;
})();
