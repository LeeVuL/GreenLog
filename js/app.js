/* GreenLog – khung app, đăng nhập, Hôm nay, Việc (hằng ngày + định kỳ), Điểm danh, Phiếu */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S;
  const { esc, h, bao, chay, hop, q } = G;
  const $app = document.getElementById('app');
  const MUC = ['Khẩn cấp', 'Cao', 'Trung bình', 'Thấp'];
  const MAU_MUC = { 'Khẩn cấp': 'do', 'Cao': 'cam', 'Trung bình': '', 'Thấp': '' };
  const LY_DO_THEM = ['Làm lại vì chưa đạt', 'Theo yêu cầu', 'Khác'];
  G.MUC = MUC; G.MAU_MUC = MAU_MUC;

  /* ---------- khung ---------- */
  function menuDuoi() {
    const m = [{ k: '', ten: 'Hôm nay', bt: '🏠' }];
    if (q('diemdanh') && S.u.nhom !== 'Nhân viên nội bộ') m.push({ k: 'diemdanh', ten: 'Điểm danh', bt: '🧑‍🤝‍🧑' });
    if (q('dinhky') || q('noibo')) m.push({ k: 'viec', ten: 'Việc', bt: '✅' });
    if (q('phieu')) m.push({ k: 'phieu', ten: 'Phiếu', bt: '🎫' });
    m.push({ k: 'them', ten: 'Thêm', bt: '☰' });
    return m;
  }
  G.khung = function (tieuDe, phu, lui) {
    const tuyen = location.hash.replace(/^#\/?/, '').split('/')[0];
    $app.innerHTML = `
      ${API.thu() ? '<div class="bang-thu">Chế độ chạy thử · dữ liệu mẫu, chỉ lưu trên máy này</div>' : ''}
      <header class="dau">${lui ? `<button class="nut-tron" id="nutLui">‹</button>` : '<img src="icons/icon-192.png" alt="">'}
        <div class="tieude"><b>${esc(tieuDe)}</b><small>${esc(phu || '')}</small></div>
        <button class="nut-tron" id="nutTk">${esc(S.u.ten.split(' ').pop())}</button></header>
      <main id="noiDung"><div class="dang-tai">Đang tải…</div></main>
      <nav class="duoi">${menuDuoi().map((m) => `<a href="#/${m.k}" class="${tuyen === m.k ? 'dang' : ''}"><span class="bt">${m.bt}</span>${m.ten}</a>`).join('')}</nav>`;
    document.getElementById('nutTk').onclick = () => { location.hash = '#/them'; };
    const l = document.getElementById('nutLui'); if (l) l.onclick = () => { if (typeof lui === 'string') location.hash = lui; else history.back(); };
    return document.getElementById('noiDung');
  };
  /* mục 103: sau mọi thao tác, vẽ lại màn nhưng giữ nguyên chỗ đang xem (không nhảy về đầu trang) */
  G.taiLai = () => { G._giuCuon = { y: window.scrollY, h: document.documentElement.scrollHeight, mo: [...document.querySelectorAll('#noiDung details')].map((d) => d.open) }; dieuHuong(); };

  /* ---------- đăng nhập ---------- */
  function manVao() {
    window.onhashchange = null;
    $app.innerHTML = `<div class="vao"><img class="logo" src="icons/GreenLog_Logo_Ngang.svg" alt="GreenLog">
      <div class="hop-vao">
        ${API.coThat() ? `<p class="mo">Đăng nhập bằng Gmail đã đăng ký với Trưởng bộ phận</p><div id="nutGoogle" style="display:flex;justify-content:center;margin-bottom:18px"></div><hr style="border:0;border-top:1px solid var(--vien2);margin:18px 0">` : ''}
        <p class="mo"><b>Chạy thử</b> với dữ liệu mẫu, chọn vai để xem mỗi người thấy gì:</p>
        <div class="chon-nguoi" data-giu-ten>${API.nguoiThu.map((n, i) => `<button class="nut" data-i="${i}">👤 ${esc(n.ten)} <span class="mo" style="margin-left:auto">${esc(n.nhom)}</span></button>`).join('')}</div>
      </div></div>`;
    $app.querySelectorAll('[data-i]').forEach((b) => { b.onclick = async () => { await API.vaoThu(+b.dataset.i); history.replaceState(null, '', location.pathname); batDau(); }; });
    if (API.coThat()) {
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = () => {
        google.accounts.id.initialize({ client_id: window.GL_CONFIG.CLIENT_ID, callback: (r) => chay(async () => { await API.dangNhapGoogle(r.credential); batDau(); }) });
        google.accounts.id.renderButton(document.getElementById('nutGoogle'), { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'signin_with', locale: 'vi' });
      };
      document.head.appendChild(s);
    }
  }
  G.dangXuat = () => { API.dangXuat(); S.u = null; history.replaceState(null, '', location.pathname); manVao(); };

  async function batDau() {
    if (!API.daDangNhap()) return manVao();
    $app.innerHTML = '<div class="dang-tai">Đang tải dữ liệu…</div>';
    try { S.dm = await API.goi('khoiDong'); S.u = S.dm.user; }
    catch (e) { bao(e.message, true); API.dangXuat(); return manVao(); }
    window.onhashchange = dieuHuong; dieuHuong();
  }
  G.taiDanhMuc = async () => { S.dm = await API.goi('khoiDong'); S.u = S.dm.user; };
  function dieuHuong() {
    const t = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    const thay = G.man[t[0]] && G.man[t[0]].thay && G.man[t[0]].fn;
    const man = thay || { '': manHomNay, viec: manViec, dinhky: manDinhKy, tuoi: manTuoi, cum: manTheoCum, diemdanh: manDiemDanh, phieu: manPhieu, them: manThem }[t[0]]
      || (G.man[t[0]] && G.man[t[0]].fn) || manHomNay;
    document.querySelectorAll('.lop-phu').forEach((x) => x.remove());
    const giu = G._giuCuon; G._giuCuon = null;
    if (giu) document.body.style.minHeight = giu.h + 'px'; else if (!G._quayLai) window.scrollTo(0, 0);
    const traCuon = () => { if (!giu) return; const mo = [...document.querySelectorAll('#noiDung details')]; if (mo.length === giu.mo.length) mo.forEach((d, i) => { if (giu.mo[i]) d.open = true; });
      window.scrollTo(0, giu.y); [120, 450].forEach((ms) => setTimeout(() => { if (window.scrollY < giu.y - 4) window.scrollTo(0, giu.y); if (ms === 450) document.body.style.minHeight = ''; }, ms)); };
    Promise.resolve().then(() => man(t[1], t[2])).then(() => { if (G.sauVe) G.sauVe(); traCuon(); }).catch((e) => { document.body.style.minHeight = '';
      console.error(e);
      const nd = document.getElementById('noiDung');
      if (nd && /Đang tải/.test(nd.textContent)) nd.innerHTML = G.trong(/quyền/.test(e.message) ? 'Mục này không nằm trong quyền của anh/chị.' : e.message);
      else bao(e.message, true);
    });
  }

  /* ---------- việc hằng ngày theo vai ---------- */
  const CUM = () => [...new Set(S.dm.vitri.filter((v) => v.ap === 'Có').map((v) => v.cum))];
  const dvTen = (ma) => (S.dm.dauviec.find((d) => d.ma === ma) || {}).ten || ma;
  G.dvTen = dvTen;
  function lichNoiBo(d) { // việc nội bộ theo ngày trong tháng / thứ
    const n = d.getDate(); const cuoiT2 = new Date(d.getFullYear(), 2, 0).getDate();
    const ds = [];
    if (d.getDay() === 5) ds.push(['DV24', 'Thu gom rác bên kia hàng rào']);
    const ky = d.getMonth() === 1 ? [9, 19, cuoiT2 - 1] : [9, 19, 29]; const sm = d.getMonth() === 1 ? [10, 20, cuoiT2] : [10, 20, 30];
    if (ky.includes(n)) ds.push(['DV25', 'Bảo trì máy Kubota']);
    if (sm.includes(n)) ds.push(['DV26', 'Bảo trì máy Sand Man']);
    return ds;
  }
  G.lichNoiBo = lichNoiBo;

  /* ================= HÔM NAY ================= */
  async function manHomNay() {
    const hn = API.ngay(); const k = S.dm.ky;
    const m = G.khung('Hôm nay', `${G.thu()}, ${G.ngayVN(hn)}`);
    const can = (b) => { const x = API.BANG[b]; return x && q(x[0]) >= 1; };
    const yeuCau = [];
    const them = (ten, bang, loc, gioiHan) => { if (can(bang)) yeuCau.push({ ten, bang, loc, gioiHan }); };
    them('tick', 'TickDinhKy', { 'Kỳ': k.ten });
    them('tuoi', 'Tuoi', { 'Ngày': hn });
    them('cum', 'ViecHangNgay', { 'Ngày': hn });
    them('phieu', 'Phieu', null, 400);
    them('dd', 'DuyetCong', { 'Ngày': hn });
    them('dh', 'DongHoNuoc', { 'Ngày': hn });
    them('vu', 'VuonUom', { 'Ngày': hn }); them('vunt', 'VuonUomNoiThat', { 'Ngày': hn });
    them('sk', 'SuKien', null, 100);
    them('ll', 'ViecLapLai', { 'Đang chạy': 'Có' });
    them('pb', 'NhatKyPhunBon', { 'Hết cách ly': { tu: hn } });
    them('dichhai', 'DichHai', null, 300);
    them('biens', 'VeSinhBien', { 'Ngày': hn }); them('ktb', 'KiemTraBien', { 'Ngày': hn }); them('vr', 'VuonRau', { 'Ngày': hn });
    them('nt', 'CayNoiThat', { 'Ngày': { tu: API.ngay(new Date(Date.now() - 864e5)) } }); them('rac', 'RacHuuCo', { 'Ngày': hn }); them('rac30', 'RacHuuCo', { 'Ngày': { tu: k.tu } });
    if (q('homnay') >= 3) { them('vc', 'VanChuyen', { 'Ngày': hn }); them('ddr', 'DiemDanh', { 'Ngày': hn }); them('bt', 'BatThuong', null, 300); them('ps', 'ViecPhatSinh', { 'Ngày': hn }); }
    them('cn', 'CongNhanDangKy', { 'Trạng thái duyệt': 'Chờ duyệt' }); them('dx', 'DeXuatThuoc', { 'Trạng thái (Chờ duyệt/Đã duyệt/Từ chối)': 'Chờ duyệt' });
    const d = await API.goi('docNhieu', { ds: yeuCau });
    const tt = (on, ten, phu, link) => `<a class="the-viec" href="#/${link}"><span class="bt">${on === true ? '✅' : on === false ? '⬜' : on}</span><span class="gian"><b>${esc(ten)}</b><span class="mo">${esc(phu || '')}</span></span><span>›</span></a>`;
    let html = '';

    if (S.dm.coThoiTiet) html += '<div id="thoiTiet"></div>';
    if (q('homnay') >= 3 && G.theAnh) html += G.theAnh(d);
    if (S.u.nhom === 'Tổ trưởng' && G.theToTruong) html += G.theToTruong(d);

    // sự kiện hôm nay, ngày mai
    const mai = API.ngay(new Date(Date.now() + 864e5));
    const sk = (d.sk || []).filter((s) => String(s['Bắt đầu']).slice(0, 10) === hn || String(s['Bắt đầu']).slice(0, 10) === mai);
    if (sk.length) html += `<div class="the"><h2>🎉 Sự kiện</h2>${sk.map((s) => `<a href="#/sukien" style="display:block;color:inherit;text-decoration:none;margin-bottom:6px"><b>${esc(s['Tên'])}</b> <span class="chip">${esc(s['Loại'])}</span><div class="mo">${esc(G.gioVN(s['Bắt đầu']))} · ${esc(G.tenVT(s['Mã vị trí'], s['Vị trí khác']))}${!s['Ảnh trước tiệc'] ? ' · <b style="color:var(--do)">chưa có ảnh trước tiệc</b>' : ''}</div></a>`).join('')}</div>`;

    // cần anh duyệt
    if (q('homnay') >= 3) {
      const cho = [];
      const ddCho = (d.dd || []).filter((x) => x['Khóa'] !== 'Có').length; if (ddCho) cho.push([ddCho + ' buổi điểm danh', 'diemdanh']);
      const pCho = (d.phieu || []).filter((x) => x['Trạng thái'] === 'Báo xong').length; if (pCho) cho.push([pCho + ' phiếu báo xong', 'phieu']);
      const dhCho = (d.dichhai || []).filter((x) => /Báo xong/.test(x['Trạng thái (Phát hiện/Đang xử lý/Báo xong/Đã duyệt)'])).length; if (dhCho) cho.push([dhCho + ' hồ sơ dịch hại', 'dichhai']);
      if ((d.cn || []).length) cho.push([d.cn.length + ' đăng ký công nhân', 'congnhan']);
      if ((d.dx || []).length) cho.push([d.dx.length + ' đề xuất thuốc mới', 'thuoc']);
      const btCho = (d.bt || []).filter((x) => x['Mã điểm'] && !x['Trả lời của Trưởng bộ phận']).length; if (btCho) cho.push([btCho + ' cây nội thất bất thường cần anh trả lời', 'nb/noithat']);
      html += `<div class="the"><h2>Chờ duyệt</h2>${cho.length ? cho.map((c) => `<a href="#/${c[1]}" class="chip cam" style="margin:0 6px 6px 0;text-decoration:none">${esc(c[0])} ›</a>`).join('') : '<p class="mo" style="margin:0">Không có việc chờ duyệt.</p>'}</div>`;
    }

    // việc hằng ngày
    const viec = [];
    if (S.u.nhom === 'Tổ trưởng' || q('homnay') >= 3) {
      if (S.u.nhom === 'Tổ trưởng') {
        const ddDoi = (d.dd || []).filter((x) => x['Đội'] === S.u.doi);
        ['Sáng', 'Chiều'].forEach((b) => { const x = ddDoi.find((y) => y['Buổi'] === b); viec.push(tt(!!x, 'Điểm danh buổi ' + b.toLowerCase(), x ? (x['Khóa'] === 'Có' ? 'Đã duyệt' : 'Đã gửi, chờ duyệt') : 'Chưa gửi', 'diemdanh')); });
      }
      const nVT = S.dm.vitri.filter((v) => v.ap === 'Có').length; const t = d.tuoi || [];
      viec.push(tt(t.length >= nVT, 'Tưới nước sân vườn', `${t.length}/${nVT} vị trí đã ghi · ${t.filter((x) => x['Trạng thái'] === 'Chưa tưới được').length} chưa tưới được`, 'tuoi'));
      ['DV10', 'DV11'].forEach((ma) => { const xong = new Set((d.cum || []).filter((x) => x['Mã việc'] === ma).map((x) => x['Cụm'])); viec.push(tt(xong.size >= CUM().length, dvTen(ma), `${xong.size}/${CUM().length} cụm`, 'cum/' + ma)); });
      if (q('donghonuoc')) { const n = new Set((d.dh || []).map((x) => x['Mã đồng hồ'])).size; viec.push(tt(n >= 2, 'Đọc 2 đồng hồ nước', `${n}/2 đồng hồ`, 'donghonuoc')); }
      if (q('vuonuom')) { const x = (d.vu || []).some((y) => y['Vườn ươm'] === 'Vườn ươm cây bụi'); viec.push(tt(x, 'Vườn ươm cây bụi', x ? 'Đã ghi hôm nay' : 'Chưa ghi', 'vuonuom')); }
    }
    if (q('noibo')) {
      const vs = d.biens || []; const co = (b) => vs.some((x) => x['Buổi'] === b);
      viec.push(tt(co('Sáng') && co('Chiều'), 'Vệ sinh bãi biển (kg rác)', `Sáng ${co('Sáng') ? '✓' : '–'} · Chiều ${co('Chiều') ? '✓' : '–'}`, 'nb/bien'));
      const kt = d.ktb || []; viec.push(tt(kt.length >= 2, 'Kiểm tra bãi biển', `${kt.length}/2 lần`, 'nb/ktbien'));
      const vr = new Set((d.vr || []).map((x) => x['Mã vườn'])).size; viec.push(tt(vr >= 7, 'Chăm sóc vườn rau', `${vr}/7 vườn`, 'nb/vuonrau'));
      const nt = new Set((d.nt || []).map((x) => x['Mã điểm'])).size; viec.push(tt(nt >= 10, 'Tưới cây nội thất (2 ngày/lần)', `${nt}/10 điểm trong 2 ngày`, 'nb/noithat'));
      viec.push(tt((d.rac || []).length > 0, 'Thu gom rác hữu cơ', (d.rac || []).length ? G.so(d.rac.reduce((a, x) => a + +x['kg rác thu gom'], 0)) + ' kg hôm nay' : 'Chưa ghi', 'nb/rac'));
      const vuNT = (d.vunt || []).length > 0; viec.push(tt(vuNT, 'Vườn ươm cây nội thất', vuNT ? 'Đã ghi' : 'Chưa ghi', 'nb/vuonuomnt'));
      lichNoiBo(new Date()).forEach((x) => viec.push(tt('🗓️', x[1], 'Hôm nay theo lịch', x[0] === 'DV24' ? 'nb/hangrao' : 'nb/may')));
    }
    (d.ll || []).filter((x) => G.denHanLapLai && G.denHanLapLai(x, new Date())).forEach((x) => viec.push(tt('🔁', x['Nội dung'], (x['Người phụ trách'] || '') + ' · ' + G.tenVT(x['Mã vị trí']), 'laplai')));
    if (viec.length) html += `<h2 style="font-size:15px;margin:4px 0 8px">${q('homnay') >= 3 ? 'Tình hình việc hằng ngày' : 'Việc hôm nay'}</h2>${viec.join('')}`;

    if (S.u.nhom === 'Quản lý nhà thầu') html = `<div class="the"><h2>Tự điểm danh</h2><p class="mo" style="margin-top:0">Bấm khi có mặt tại resort. Không cần ảnh, không cần vị trí.</p>
        <div class="nhom-nut"><button class="nut chinh" data-buoi="Sáng">Có mặt sáng</button><button class="nut chinh" data-buoi="Chiều">Có mặt chiều</button></div></div>` + html;

    if (q('phieu')) {
      const mo = (d.phieu || []).filter((x) => x['Trạng thái'] !== 'Đã duyệt');
      const cuaToi = mo.filter((x) => x['Người nhận'] === S.u.ten || x['Giao cho'] === S.u.doi || x['Giao cho'] === S.u.ten);
      const qh = mo.filter((x) => x['Hạn'] && x['Hạn'] < API.bayGio() && x['Trạng thái'] !== 'Báo xong');
      html += `<a href="#/phieu" class="the" style="display:block;color:inherit;text-decoration:none"><h2>🎫 Phiếu</h2>
        <div class="luoi2"><div><div class="so-lon">${mo.length}</div><div class="mo">đang mở${S.u.nhom === 'Tổ trưởng' ? ` · ${cuaToi.length} của đội` : ''}</div></div>
        <div><div class="so-lon" style="color:var(--do)">${mo.filter((x) => x['Mức độ'] === 'Khẩn cấp').length}</div><div class="mo">khẩn cấp · ${qh.length} quá hạn</div></div></div></a>`;
    }
    const cl = (d.pb || []).filter((x) => x['Hết cách ly'] >= hn && +x['Cách ly dài nhất (ngày)'] > 0);
    if (cl.length) html += `<div class="canh-bao">⚠️ Đang cách ly thuốc: ${cl.map((x) => esc(G.tenVT(x['Mã vị trí'], x['Vị trí chi tiết'] || x['Cụm'])) + ' đến ' + G.ngayVN(x['Hết cách ly'])).join('; ')}</div>`;

    if (q('dinhky')) {
      const tienDo = {}; (d.tick || []).forEach((r) => { if (String(r['Lần'] || '1') === '1') tienDo[r['Mã việc']] = (tienDo[r['Mã việc']] || 0) + 1; });
      html += G.theDinhKy(tienDo);
    }
    if (q('homnay') >= 3 && d.rac30) {
      const hom = (d.rac || []).reduce((a, x) => a + +x['kg rác thu gom'], 0); const ky_ = d.rac30.reduce((a, x) => a + +x['kg rác thu gom'], 0);
      html += `<div class="the"><h2>♻️ Rác hữu cơ</h2><div class="luoi2"><div><div class="so-lon">${G.so(hom)}</div><div class="mo">kg hôm nay</div></div><div><div class="so-lon">${G.so(ky_)}</div><div class="mo">kg kỳ ${esc(k.ten)}</div></div></div></div>`;
    }
    m.innerHTML = `<p style="margin:0 0 12px">Chào ${esc(S.u.ten)} 👋</p>` + html;
    m.querySelectorAll('[data-buoi]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('diemDanh.tuDiem', { buoi: b.dataset.buoi }); bao('Đã ghi có mặt buổi ' + b.dataset.buoi.toLowerCase()); }, b); });
    if (S.dm.coThoiTiet && G.veThoiTiet) G.veThoiTiet(m.querySelector('#thoiTiet'));
  }

  G.theDinhKy = function (tienDo) {
    const k = S.dm.ky; const tu = new Date(k.tu), den = new Date(k.den);
    const troiQua = Math.min(1, Math.max(0, (Date.now() - tu) / (den - tu + 864e5)));
    const nVT = S.dm.vitri.filter((v) => v.ap === 'Có').length;
    return `<div class="the"><div class="hang" style="margin-bottom:6px"><h2 class="gian" style="margin:0">8 đầu việc định kỳ · ${esc(k.ten)}</h2><span class="mo">${G.ngayVN(k.tu).slice(0, 5)}–${G.ngayVN(k.den).slice(0, 5)}</span></div>
      <p class="mo" style="margin:0 0 10px">Đã qua ${Math.round(troiQua * 100)}% kỳ. Thanh cam/đỏ là đang chậm so với thời gian.</p>
      ${S.dm.dauviec.filter((v) => /^DV0[1-8]$/.test(v.ma)).map((v) => {
        const n = tienDo[v.ma] || 0; const p = nVT ? n / nVT : 0; const tre = troiQua - p;
        return `<a href="#/dinhky/${v.ma}" style="display:block;color:inherit;text-decoration:none;margin-bottom:10px">
          <div class="hang" style="font-size:13px;margin-bottom:4px"><span class="gian">${esc(v.ten)}</span><b>${n}/${nVT}</b></div>
          <div class="thanh ${tre > 0.25 ? 'do' : tre > 0.1 ? 'cam' : ''}"><i style="width:${Math.round(p * 100)}%"></i></div></a>`;
      }).join('')}</div>`;
  };

  /* ================= VIỆC (trung tâm) ================= */
  async function manViec() {
    const m = G.khung('Việc', 'Chọn đầu việc cần cập nhật');
    let html = '';
    if (q('dinhky')) {
      html += `<h2 style="font-size:15px;margin:0 0 8px">Hằng ngày</h2>
        <a class="the-viec" href="#/tuoi"><span class="bt">💧</span><span class="gian"><b>Tưới nước sân vườn</b><span class="mo">Từng vị trí: Đã tưới / Không cần (mưa) / Chưa tưới được</span></span>›</a>
        <a class="the-viec" href="#/cum/DV10"><span class="bt">🧹</span><span class="gian"><b>Vệ sinh, thu gom rác sân vườn và lối đi</b><span class="mo">Theo cụm</span></span>›</a>
        <a class="the-viec" href="#/cum/DV11"><span class="bt">🌿</span><span class="gian"><b>Nhổ cỏ dại</b><span class="mo">Theo cụm</span></span>›</a>
        ${q('donghonuoc') ? '<a class="the-viec" href="#/donghonuoc"><span class="bt">🔢</span><span class="gian"><b>Đọc 2 đồng hồ nước</b><span class="mo">Chỉ số + ảnh</span></span>›</a>' : ''}
        ${q('vuonuom') ? '<a class="the-viec" href="#/vuonuom"><span class="bt">🌱</span><span class="gian"><b>Vườn ươm cây bụi</b><span class="mo">Tưới, vệ sinh, số ươm, chất cải tạo đất</span></span>›</a>' : ''}
        <h2 style="font-size:15px;margin:16px 0 8px">Định kỳ tháng (kỳ ${esc(S.dm.ky.ten)})</h2>
        <a class="the-viec" href="#/dinhky"><span class="bt">✅</span><span class="gian"><b>8 đầu việc định kỳ</b><span class="mo">Chọn đầu việc → chọn vị trí → ảnh → lưu</span></span>›</a>`;
    }
    if (q('noibo') && G.dsNoiBo) html += `<h2 style="font-size:15px;margin:16px 0 8px">Việc nội bộ</h2>` + G.dsNoiBo();
    m.innerHTML = html || G.trong('Không có việc cho vai này.');
  }

  /* ================= ĐỊNH KỲ: chọn việc → chọn vị trí → ảnh → lưu ================= */
  async function manDinhKy(maViec) {
    const k = S.dm.ky; const nVT = S.dm.vitri.filter((v) => v.ap === 'Có');
    if (!maViec) {
      const m = G.khung('Việc định kỳ', `Bước 1/3 · Chọn đầu việc · kỳ ${k.ten}`, '#/viec');
      const t = await API.goi('docNhieu', { ds: [{ bang: 'TickDinhKy', loc: { 'Kỳ': k.ten } }] });
      const td = {}; t.TickDinhKy.forEach((r) => { if (String(r['Lần'] || '1') === '1') td[r['Mã việc']] = (td[r['Mã việc']] || 0) + 1; });
      const BT = { DV01: '🌱', DV02: '🧪', DV03: '🧪', DV04: '💨', DV05: '💨', DV06: '💨', DV07: '✂️', DV08: '✂️' };
      m.innerHTML = `<p class="mo" style="margin-top:0">Chọn đúng việc đã làm. Sau đó mới chọn vị trí.</p>` + S.dm.dauviec.filter((v) => /^DV0[1-8]$/.test(v.ma)).map((v) => {
        const n = td[v.ma] || 0;
        return `<a class="the-viec" href="#/dinhky/${v.ma}"><span class="bt">${BT[v.ma]}</span><span class="gian"><b>${esc(v.ten)}</b>
          <div class="thanh" style="margin:6px 0 2px"><i style="width:${Math.round(n / nVT.length * 100)}%"></i></div><span class="mo">${n}/${nVT.length} vị trí</span></span>›</a>`;
      }).join('');
      return;
    }
    const viec = S.dm.dauviec.find((v) => v.ma === maViec); if (!viec) { location.hash = '#/dinhky'; return; }
    const ghi = q('dinhky') >= 2;
    const m = G.khung(viec.ten, `Bước 2/3 · Chọn vị trí đã làm`, '#/dinhky');
    const st = manDinhKy.st && manDinhKy.st.viec === maViec ? manDinhKy.st : (manDinhKy.st = { viec: maViec, cum: '', tim: '', chon: {} });
    let ticks = (await API.goi('docNhieu', { ds: [{ bang: 'TickDinhKy', loc: { 'Kỳ': k.ten, 'Mã việc': maViec } }] })).TickDinhKy;
    const cums = [...new Set(nVT.map((v) => v.cum))];
    const ve = () => {
      const lan = {}; ticks.forEach((t) => { lan[t['Mã vị trí']] = Math.max(lan[t['Mã vị trí']] || 0, +t['Lần'] || 1); });
      const ds = nVT.filter((v) => (!st.cum || v.cum === st.cum) && (!st.tim || (v.ten + ' ' + v.kv).toLowerCase().includes(st.tim.toLowerCase())));
      const xong = nVT.filter((v) => lan[v.ma]).length; const soChon = Object.keys(st.chon).length;
      let cu = ''; let html = '';
      ds.forEach((v) => {
        if (v.kv !== cu) { cu = v.kv; html += `<div class="nhom-ten">${esc(cu)}</div>`; }
        const n = lan[v.ma] || 0; const c = st.chon[v.ma];
        html += `<div class="muc ${c ? 'da-chon' : n ? 'da-lam' : ''}" data-vt="${v.ma}" style="cursor:${ghi ? 'pointer' : 'default'}"><span class="chon-vt">${c || n ? '✓' : ''}</span>
          <div class="gian">${esc(v.ten)}${n || c ? `<div class="mo">${n ? 'Đã làm ' + n + ' lần' : ''}${c ? (n ? ' · ' : '') + 'lần này: ' + esc(c) : ''}</div>` : ''}</div></div>`;
      });
      m.innerHTML = `<div class="bang-viec"><div class="gian"><small>Đang cập nhật</small><b>${esc(viec.ten.toUpperCase())}</b><small>${xong}/${nVT.length} vị trí trong kỳ</small></div><a class="nut nho" href="#/dinhky">Đổi việc</a></div>
        <input type="search" id="tim" placeholder="Tìm vị trí, ví dụ: Villa 32" value="${esc(st.tim)}" style="margin-bottom:10px">
        <div class="chon"><button data-c="" class="${!st.cum ? 'dang' : ''}">Tất cả</button>${cums.map((c) => `<button data-c="${esc(c)}" class="${st.cum === c ? 'dang' : ''}">${esc(c)}</button>`).join('')}</div>
        ${ghi && st.cum ? `<button class="nut nho" id="caCum" style="margin-bottom:8px">Chọn cả cụm ${esc(st.cum)} (vị trí chưa làm)</button>` : ''}
        <div class="ds" style="margin-bottom:90px">${html || '<div class="muc mo">Không có vị trí phù hợp</div>'}</div>
        ${ghi ? `<div class="thanh-duoi"><button class="nut chinh" id="tiep" ${soChon ? '' : 'disabled'}>${soChon ? `Tiếp tục · ${soChon} vị trí đã chọn →` : 'Chạm vào vị trí đã làm để chọn'}</button></div>` : ''}`;
      m.querySelectorAll('[data-c]').forEach((b) => { b.onclick = () => { st.cum = b.dataset.c; ve(); }; });
      const tim = m.querySelector('#tim');
      tim.oninput = () => { st.tim = tim.value; clearTimeout(ve.t); ve.t = setTimeout(() => { ve(); const t2 = m.querySelector('#tim'); t2.focus(); t2.setSelectionRange(t2.value.length, t2.value.length); }, 350); };
      const cc = m.querySelector('#caCum'); if (cc) cc.onclick = () => { nVT.filter((v) => v.cum === st.cum && !lan[v.ma]).forEach((v) => { st.chon[v.ma] = 'Lần đầu'; }); ve(); };
      if (ghi) m.querySelectorAll('[data-vt]').forEach((r) => {
        r.onclick = async () => {
          const ma = r.dataset.vt;
          if (st.chon[ma]) { delete st.chon[ma]; return ve(); }
          if (!lan[ma]) { st.chon[ma] = 'Lần đầu'; return ve(); }
          const l = await G.chonDS(`Đã làm ${lan[ma]} lần. Làm thêm vì:`, LY_DO_THEM);
          if (l) { st.chon[ma] = l.ten; ve(); }
        };
      });
      const tiep = m.querySelector('#tiep'); if (tiep) tiep.onclick = buocLuu;
    };
    const buocLuu = () => {
      const ds = Object.keys(st.chon);
      hop(`Bước 3/3 · Ảnh và lưu`, `<div class="the" style="background:var(--xanh-nhat);border-color:var(--xanh)"><b>${esc(viec.ten)}</b><div class="mo">${ds.length} vị trí: ${ds.slice(0, 12).map((x) => esc((G.vt(x) || {}).ten || x)).join(', ')}${ds.length > 12 ? '…' : ''}</div></div>
        <div class="o" style="margin-bottom:12px"><span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Ảnh hiện trường sau khi làm</span><div id="anh"></div></div>
        ${G.oMoTa('gc', 'Ghi chú')}
        <button class="nut chinh rong" id="luu">Lưu ${ds.length} vị trí</button>`, (o, dong) => {
        const anh = G.oAnh(o.querySelector('#anh'), { batBuoc: true, toiDa: 6 }); G.ganMic(o);
        o.querySelector('#luu').onclick = (e) => chay(async () => {
          const a = anh.kiemTra();
          await API.goi('dinhKy.luu', { viec: maViec, anh: a, ghiChu: o.querySelector('#gc').value,
            ds: ds.map((vt) => ({ vt, kv: (G.vt(vt) || {}).kv, lyDo: st.chon[vt] === 'Lần đầu' ? '' : st.chon[vt] })) });
          dong(); bao(`Đã lưu ${ds.length} vị trí · ${viec.ten}`); st.chon = {};
          ticks = (await API.goi('docNhieu', { ds: [{ bang: 'TickDinhKy', loc: { 'Kỳ': k.ten, 'Mã việc': maViec } }] })).TickDinhKy; ve();
        }, e.target);
      });
    };
    ve();
  }

  /* ================= TƯỚI NƯỚC ================= */
  const TT_TUOI = ['Đã tưới', 'Không cần (mưa)', 'Chưa tưới được'];
  async function manTuoi() {
    const hn = API.ngay(); const ghi = q('dinhky') >= 2;
    const m = G.khung('Tưới nước sân vườn', G.ngayVN(hn), '#/viec');
    const cu = (await API.goi('docNhieu', { ds: [{ bang: 'Tuoi', loc: { 'Ngày': hn } }] })).Tuoi;
    const st = { cum: '', doi: {} }; const goc = {}; cu.forEach((r) => { goc[r['Mã vị trí']] = r['Trạng thái']; });
    const nVT = S.dm.vitri.filter((v) => v.ap === 'Có'); const cums = [...new Set(nVT.map((v) => v.cum))];
    const gt = (ma) => st.doi[ma] || goc[ma] || '';
    const ve = () => {
      const ds = nVT.filter((v) => !st.cum || v.cum === st.cum);
      const dem = (t) => nVT.filter((v) => gt(v.ma) === t).length; const soDoi = Object.keys(st.doi).length;
      let k_ = ''; let html = '';
      ds.forEach((v) => {
        if (v.kv !== k_) { k_ = v.kv; html += `<div class="nhom-ten">${esc(k_)}</div>`; }
        html += `<div class="muc"><div class="gian">${esc(v.ten)}</div><div class="tt3b">${TT_TUOI.map((t) => `<button data-vt="${v.ma}" data-t="${t}" class="${gt(v.ma) === t ? 'dang' : ''}" ${ghi ? '' : 'disabled'}>${t === 'Không cần (mưa)' ? 'Mưa' : t === 'Chưa tưới được' ? 'Chưa' : 'Đã tưới'}</button>`).join('')}</div></div>`;
      });
      m.innerHTML = `<div class="the" style="padding:12px"><div class="luoi2" style="grid-template-columns:repeat(3,1fr);text-align:center">
          <div><b style="font-size:20px;color:var(--xanh)">${dem('Đã tưới')}</b><div class="mo">đã tưới</div></div><div><b style="font-size:20px;color:#2E6DA4">${dem('Không cần (mưa)')}</b><div class="mo">mưa</div></div>
          <div><b style="font-size:20px;color:var(--do)">${dem('Chưa tưới được')}</b><div class="mo">chưa tưới</div></div></div><p class="mo" style="margin:8px 0 0;text-align:center">${nVT.length - Object.keys(Object.assign({}, goc, st.doi)).length} vị trí chưa ghi</p></div>
        <div class="chon"><button data-c="" class="${!st.cum ? 'dang' : ''}">Tất cả</button>${cums.map((c) => `<button data-c="${esc(c)}" class="${st.cum === c ? 'dang' : ''}">${esc(c)}</button>`).join('')}</div>
        ${ghi ? `<div class="nhom-nut" style="margin-bottom:10px"><button class="nut nho" data-ca="Đã tưới">${st.cum ? 'Cả cụm' : 'Tất cả'} chưa ghi: Đã tưới</button><button class="nut nho" data-ca="Không cần (mưa)">${st.cum ? 'Cả cụm' : 'Tất cả'} chưa ghi: Mưa</button></div>` : ''}
        <div class="ds" style="margin-bottom:90px">${html}</div>
        ${ghi ? `<div class="thanh-duoi"><button class="nut chinh" id="luu" ${soDoi ? '' : 'disabled'}>${soDoi ? `Lưu ${soDoi} vị trí` : 'Chọn trạng thái rồi bấm lưu'}</button></div>` : ''}`;
      m.querySelectorAll('[data-c]').forEach((b) => { b.onclick = () => { st.cum = b.dataset.c; ve(); }; });
      m.querySelectorAll('[data-ca]').forEach((b) => { b.onclick = () => { nVT.filter((v) => (!st.cum || v.cum === st.cum) && !gt(v.ma)).forEach((v) => { st.doi[v.ma] = b.dataset.ca; }); ve(); }; });
      m.querySelectorAll('[data-t]').forEach((b) => { b.onclick = () => { st.doi[b.dataset.vt] = b.dataset.t; ve(); }; });
      const l = m.querySelector('#luu');
      if (l) l.onclick = () => {
        const chua = Object.keys(st.doi).filter((x) => st.doi[x] === 'Chưa tưới được');
        const luu = async (lyDo) => {
          await API.goi('ghiNhieu', { bang: 'Tuoi', thay: ['Ngày', 'Mã vị trí'], dong: Object.keys(st.doi).map((vt) => ({ 'Ngày': hn, 'Mã vị trí': vt, 'Trạng thái': st.doi[vt], 'Người ghi': '', 'Giờ': API.bayGio().slice(11, 16), 'Hôm nay mưa': st.doi[vt] === 'Không cần (mưa)' ? 'Có' : '', 'Lý do': st.doi[vt] === 'Chưa tưới được' ? lyDo || '' : '' })) });
          Object.assign(goc, st.doi); st.doi = {}; bao('Đã lưu tưới nước'); ve();
        };
        if (!chua.length) return chay(() => luu(), l);
        G.chonDS(`${chua.length} vị trí chưa tưới được. Lý do:`, ['Hư hệ thống tưới', 'Thiếu nước', 'Thiếu người', 'Khu vực có khách', 'Khác']).then((x) => x && chay(() => luu(x.ten), l));
      };
    };
    ve();
  }

  /* ================= VIỆC THEO CỤM (vệ sinh, nhổ cỏ) ================= */
  async function manTheoCum(maViec) {
    if (!/^DV1[01]$/.test(maViec || '')) maViec = 'DV10';
    const hn = API.ngay(); const ghi = q('dinhky') >= 2;
    const m = G.khung(dvTen(maViec), `${G.ngayVN(hn)} · theo cụm`, '#/viec');
    const cu = (await API.goi('docNhieu', { ds: [{ bang: 'ViecHangNgay', loc: { 'Ngày': hn, 'Mã việc': maViec } }] })).ViecHangNgay;
    const xong = {}; cu.forEach((r) => { xong[r['Cụm']] = r; });
    const chon = {};
    const ve = () => {
      const n = Object.keys(chon).length;
      m.innerHTML = `<div class="bang-viec"><div class="gian"><small>Đang cập nhật</small><b>${esc(dvTen(maViec).toUpperCase())}</b><small>${Object.keys(xong).length}/${CUM().length} cụm hôm nay</small></div><a class="nut nho" href="#/cum/${maViec === 'DV10' ? 'DV11' : 'DV10'}">Đổi việc</a></div>
        <div class="ds" style="margin-bottom:90px">${CUM().map((c) => `<div class="muc ${chon[c] ? 'da-chon' : xong[c] ? 'da-lam' : ''}" data-c="${esc(c)}" style="cursor:pointer"><span class="chon-vt">${chon[c] || xong[c] ? '✓' : ''}</span>
          <div class="gian"><b>${esc(c)}</b>${xong[c] ? `<div class="mo">${esc(xong[c]['Người ghi'])} lúc ${esc(xong[c]['Giờ'])}${xong[c]['Ảnh'] ? ' · có ảnh' : ''}</div>` : ''}</div></div>`).join('')}</div>
        ${ghi ? `<div class="thanh-duoi"><button class="nut chinh" id="tiep" ${n ? '' : 'disabled'}>${n ? `Tiếp tục · ${n} cụm →` : 'Chạm vào cụm đã làm xong'}</button></div>` : ''}`;
      if (ghi) m.querySelectorAll('[data-c]').forEach((r) => { r.onclick = () => { const c = r.dataset.c; if (chon[c]) delete chon[c]; else chon[c] = 1; ve(); }; });
      const t = m.querySelector('#tiep');
      if (t) t.onclick = () => hop('Lưu · ' + dvTen(maViec), `<p><b>${Object.keys(chon).map(esc).join(', ')}</b></p><div class="o" style="margin-bottom:12px"><span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Ảnh (không bắt buộc)</span><div id="anh"></div></div>
        ${G.oMoTa('gc', 'Ghi chú')}<button class="nut chinh rong" id="luu">Lưu</button>`, (o, dong) => {
        const anh = G.oAnh(o.querySelector('#anh'), { toiDa: 4 }); G.ganMic(o);
        o.querySelector('#luu').onclick = (e) => chay(async () => {
          const a = anh.ds();
          const r = await API.goi('ghiNhieu', { bang: 'ViecHangNgay', thay: ['Ngày', 'Mã việc', 'Cụm'], dong: Object.keys(chon).map((c) => ({ 'Ngày': hn, 'Mã việc': maViec, 'Cụm': c, 'Trạng thái': 'Xong', 'Ảnh': a, 'Ghi chú': o.querySelector('#gc').value, 'Người ghi': '', 'Giờ': API.bayGio().slice(11, 16) })) });
          r.forEach((x) => { xong[x['Cụm']] = x; }); Object.keys(chon).forEach((c) => delete chon[c]); dong(); bao('Đã lưu'); ve();
        }, e.target);
      });
    };
    ve();
  }

  /* ================= ĐIỂM DANH ================= */
  async function manDiemDanh() {
    if (S.u.nhom === 'Quản lý nhà thầu') {
      const m0 = G.khung('Điểm danh', 'Tự điểm danh');
      m0.innerHTML = `<div class="the"><h2>Tự điểm danh hôm nay</h2><p class="mo" style="margin-top:0">Bấm khi có mặt tại resort. Không cần ảnh, không cần vị trí. App nhắc lúc 8h00 và 14h30.</p>
        <div class="nhom-nut"><button class="nut chinh" data-buoi="Sáng">Có mặt sáng</button><button class="nut chinh" data-buoi="Chiều">Có mặt chiều</button></div></div>
        <p class="mo">Điểm danh công nhân do hai tổ trưởng thực hiện.</p>`;
      m0.querySelectorAll('[data-buoi]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('diemDanh.tuDiem', { buoi: b.dataset.buoi }); bao('Đã ghi có mặt buổi ' + b.dataset.buoi.toLowerCase()); }, b); });
      return;
    }
    const m = G.khung('Điểm danh', S.u.doi || (q('diemdanh') >= 3 ? 'Duyệt công từng buổi' : ''));
    const st = manDiemDanh.st || (manDiemDanh.st = { ngay: API.ngay(), buoi: new Date().getHours() < 12 ? 'Sáng' : 'Chiều' });
    if (q('diemdanh') < 3) st.ngay = API.ngay();
    const d = await API.goi('docNhieu', { ds: [{ bang: 'DiemDanh', loc: { 'Ngày': st.ngay, 'Buổi': st.buoi } }, { bang: 'DuyetCong', loc: { 'Ngày': st.ngay, 'Buổi': st.buoi } }] });
    const rows = d.DiemDanh; const duyet = d.DuyetCong;
    const cn = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ' && x.doi !== 'Quản lý nhà thầu' && !/Quản lý nhà thầu/.test(x.cd));
    const tenCN = (ma) => ((S.dm.congnhan || []).find((x) => x.ma === ma) || {}).ten || ma;
    const xemCu = st.ngay !== API.ngay();
    const dau = `<div class="hang" style="margin-bottom:10px">${q('diemdanh') >= 3 ? `<input type="date" id="ngay" value="${st.ngay}" max="${API.ngay()}" style="max-width:170px">` : `<b style="white-space:nowrap">Hôm nay ${G.ngayVN(st.ngay).slice(0, 5)}</b>`}
      <div class="chon gian" style="margin:0">${['Sáng', 'Chiều'].map((b) => `<button data-b="${b}" class="${st.buoi === b ? 'dang' : ''}">${b}</button>`).join('')}</div></div>`;
    const ganDau = () => {
      m.querySelectorAll('[data-b]').forEach((b) => { b.onclick = () => { st.buoi = b.dataset.b; manDiemDanh(); }; });
      const ng = m.querySelector('#ngay'); if (ng) ng.onchange = (e) => { if (e.target.value) { st.ngay = e.target.value > API.ngay() ? API.ngay() : e.target.value; manDiemDanh(); } };
    };
    const TT = 'Trạng thái (Có mặt/Vắng/Về sớm)';
    if (q('diemdanh') >= 3) {
      const nhom = {}; rows.forEach((r) => { (nhom[r['Đội']] = nhom[r['Đội']] || []).push(r); });
      const tsCo = rows.filter((r) => r[TT] === 'Có mặt').length;
      m.innerHTML = dau + `<p class="mo">Tổng buổi ${st.buoi.toLowerCase()}: <b>${tsCo}</b> có mặt · ${G.so(tsCo * 0.5)} công</p>` + (Object.keys(nhom).length ? Object.keys(nhom).map((doi) => {
        const rs = nhom[doi]; const du = duyet.find((x) => x['Đội'] === doi) || {};
        const co = rs.filter((r) => r[TT] === 'Có mặt').length; const khac = rs.filter((r) => r[TT] !== 'Có mặt');
        return `<div class="the"><div class="hang"><h3 class="gian">${esc(doi)}${doi === 'Quản lý nhà thầu' && rs[0] ? ' · ' + esc(rs[0]['Họ tên'] || tenCN(rs[0]['Mã CN'])) : ''}</h3>${du['Khóa'] === 'Có' ? '<span class="chip xanh">Đã duyệt · khóa</span>' : '<span class="chip cam">Chờ duyệt</span>'}</div>
          <p class="mo">${du['Người gửi'] ? (doi === 'Quản lý nhà thầu' ? `<b>${esc(du['Người gửi'])}</b> tự điểm danh lúc ${esc(String(du['Giờ gửi'] || '').slice(11, 16))}` : `Gửi bởi <b>${esc(du['Người gửi'])}</b> lúc ${esc(String(du['Giờ gửi'] || '').slice(11, 16))}`) : '<b style="color:var(--do)">Chưa gửi điểm danh</b>'} · Có mặt <b>${co}</b>/${rs.length} · <b>${G.so(co * 0.5)}</b> công${du['Ghi chú'] ? `<br><b style="color:var(--cam)">${esc(du['Ghi chú'])}</b>` : ''}</p>
          ${du['Ảnh tập thể'] ? `<div>${G.xemAnh(du['Ảnh tập thể'])}</div>` : (doi !== 'Quản lý nhà thầu' ? '<p class="mo" style="color:var(--do)">Chưa có ảnh tập thể</p>' : '')}
          ${khac.length ? `<div class="ds">${khac.map((r) => `<div class="muc"><div class="gian">${esc(r['Họ tên'] || tenCN(r['Mã CN']))}${r[TT] === 'Về sớm' ? `<div class="mo">Về lúc ${esc(r['Giờ về'])} · ${esc(r['Lý do'])} · tính 0 công</div>` : ''}</div><span class="chip ${r[TT] === 'Vắng' ? 'do' : 'cam'}">${esc(r[TT])}</span></div>`).join('')}</div>` : '<p class="mo">Đủ người.</p>'}
          ${du['Khóa'] === 'Có' || xemCu ? '' : !du['Người gửi'] ? '<button class="nut rong" disabled>Chưa gửi điểm danh, chưa duyệt được</button>' : (doi !== 'Quản lý nhà thầu' && !du['Ảnh tập thể']) ? `<button class="nut rong" disabled>Chưa có ảnh tập thể, chưa duyệt được</button><button class="nut nho rong" data-nhac="${esc(doi)}" style="margin-top:6px">📤 Nhắc tổ trưởng gửi ảnh tập thể</button>` : `<button class="nut chinh rong" data-duyet="${esc(doi)}">Duyệt và khóa buổi ${st.buoi.toLowerCase()}</button>`}</div>`;
      }).join('') : G.trong(`Chưa đội nào gửi điểm danh buổi ${st.buoi.toLowerCase()} ngày ${G.ngayVN(st.ngay)}.`))
        + (!xemCu && rows.some((r) => r['Trạng thái duyệt'] !== 'Đã duyệt') ? `<button class="nut chinh rong" id="khoaHet" style="margin-top:8px">Duyệt và khóa cả buổi ${st.buoi.toLowerCase()} (mọi đội)</button>` : '')
        + (xemCu ? '<p class="mo">Ngày cũ chỉ để xem. Sửa công ngày cũ dùng Phiếu sửa công trong Báo cáo → Bảng công.</p>' : `<button class="nut rong" id="suaTT" style="margin-top:8px">✏️ Anh điểm danh / sửa trực tiếp</button>`)
        + `<p class="mo">Buổi đã khóa thì tổ trưởng không sửa được nữa. Chỉ anh sửa, mọi lần sửa đều ghi nhật ký (người, giờ, giá trị cũ → mới, lý do).</p>`;
      m.querySelectorAll('[data-duyet]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('diemDanh.duyet', { ngay: st.ngay, buoi: st.buoi, doi: b.dataset.duyet }); bao('Đã duyệt, công buổi này đã khóa'); manDiemDanh(); }, b); });
      m.querySelectorAll('[data-nhac]').forEach((b) => { b.onclick = () => G.guiZalo('📸 ' + b.dataset.nhac + ': gửi ảnh tập thể đầu ca buổi ' + st.buoi.toLowerCase() + ' ' + G.ngayVN(st.ngay) + ' trên GreenLog để Trưởng bộ phận duyệt công.'); });
      const kh = m.querySelector('#khoaHet'); if (kh) kh.onclick = () => chay(async () => { const kq = await API.goi('diemDanh.duyet', { ngay: st.ngay, buoi: st.buoi }); bao('Đã khóa: ' + (kq.doi || []).join(', ') + ((kq.boQua || []).length ? ' · chưa có ảnh nên chưa khóa: ' + kq.boQua.join(', ') : '')); manDiemDanh(); }, kh);
      const sTT = m.querySelector('#suaTT'); if (sTT) sTT.onclick = () => suaTrucTiep(st, rows, cn);
      return ganDau();
    }
    const doiKhac = /cơ động/i.test(S.u.doi) ? 'Đội khu vực' : 'Đội cơ động';
    st.doiDD = st.doiDD || S.u.doi; const thay = st.doiDD !== S.u.doi;
    const cuaDoi = cn.filter((x) => (thay ? String(x.doi).toLowerCase() === doiKhac.toLowerCase() : String(x.doi).toLowerCase() === String(S.u.doi).toLowerCase()));
    const daGui = duyet.find((x) => x['Đội'] === st.doiDD); const khoa = daGui && daGui['Khóa'] === 'Có';
    const guiKhac = thay && daGui && daGui['Người gửi'] !== S.u.ten;
    const tt = {}; const chan = {}; // chan[ma] = lý do không sửa được
    cuaDoi.forEach((x) => { tt[x.ma] = { tt: thay && /tổ trưởng/i.test(x.cd || '') ? 'Vắng' : 'Có mặt' }; });
    rows.forEach((r) => {
      const ma = r['Mã CN']; if (!tt[ma]) return;
      tt[ma] = { tt: r[TT], gioVe: r['Giờ về'], lyDo: r['Lý do'] };
      if (r['Trạng thái duyệt'] === 'Đã duyệt') chan[ma] = '🔒 Đã khóa';
      else if (r['Người ghi'] !== S.u.ten) chan[ma] = 'Đã được ' + r['Người ghi'] + ' điểm danh';
    });
    if (khoa || guiKhac) cuaDoi.forEach((x) => { chan[x.ma] = chan[x.ma] || (khoa ? '🔒 Đã khóa' : 'Đã được ' + daGui['Người gửi'] + ' điểm danh'); });
    const sua = cuaDoi.filter((x) => !chan[x.ma]);
    const ve = () => {
      let cu = ''; let html = '';
      cuaDoi.forEach((x) => {
        const n = x.doi || 'Chưa phân đội'; if (n !== cu) { cu = n; html += `<div class="nhom-ten">${esc(cu)}</div>`; }
        const t = tt[x.ma];
        html += `<div class="muc" style="${chan[x.ma] ? 'opacity:.6' : ''}"><div class="gian"><div>${esc(x.ten)}</div><div class="mo">${esc(x.cd || '')}${t.tt === 'Về sớm' ? ` · về ${esc(t.gioVe)} · ${esc(t.lyDo)}` : ''}${chan[x.ma] ? ` · <b>${esc(chan[x.ma])}</b>` : ''}</div></div>
          <div class="tt3">${[['co', 'Có mặt', 'Có'], ['vang', 'Vắng', 'Vắng'], ['som', 'Về sớm', 'Về sớm']].map((b) => `<button class="${b[0]} ${t.tt === b[1] ? 'dang' : ''}" data-ma="${x.ma}" data-tt="${b[1]}" ${chan[x.ma] ? 'disabled' : ''}>${b[2]}</button>`).join('')}</div></div>`;
      });
      const co = sua.filter((x) => tt[x.ma].tt === 'Có mặt').length;
      m.innerHTML = dau + `<div class="chon"><button data-dd="${esc(S.u.doi)}" class="${!thay ? 'dang' : ''}">${esc(S.u.doi)} (đội tôi)</button><button data-dd="${esc(doiKhac)}" class="${thay ? 'dang' : ''}">Điểm danh giúp ${esc(doiKhac)}</button></div>`
        + (thay ? `<div class="canh-bao">Dùng khi tổ trưởng ${esc(doiKhac)} nghỉ. Danh sách là nhân viên ${esc(doiKhac)}; tổ trưởng của đội đó đã để sẵn Vắng. Trưởng bộ phận sẽ thấy ghi chú "điểm danh giúp".${cuaDoi.length ? '' : '<br><b>Chưa có công nhân nào được xếp vào ' + esc(doiKhac) + '.</b> Trưởng bộ phận xếp đội trong mục Công nhân.'}</div>` : '')
        + (cuaDoi.length || thay ? '' : `<div class="canh-bao">Chưa có công nhân nào được xếp vào ${esc(S.u.doi)}. Trưởng bộ phận xếp đội trong mục Công nhân.</div>`)
        + (khoa ? '<div class="canh-bao" style="background:var(--xanh-nhat);color:var(--xanh)">Trưởng bộ phận đã duyệt và khóa buổi này. Cần sửa thì báo Trưởng bộ phận.</div>' : daGui && !guiKhac ? '<div class="canh-bao">Đã gửi · chờ Trưởng bộ phận duyệt. Sửa rồi gửi lại được.</div>' : '')
        + (daGui && daGui['Ảnh tập thể'] ? `<div class="mo">Ảnh tập thể đã gửi:</div><div>${G.xemAnh(daGui['Ảnh tập thể'])}</div>` : '')
        + `<p class="mo">Mặc định mọi người <b>Có mặt</b>. Chỉ cần bấm người Vắng hoặc Về sớm.</p><div class="ds" style="margin-bottom:90px">${html || '<div class="muc mo">Không có công nhân</div>'}</div>`
        + (khoa || !sua.length ? '' : `<div class="thanh-duoi"><button class="nut chinh" id="gui">Gửi điểm danh ${st.buoi.toLowerCase()} · ${co}/${sua.length} có mặt</button></div>`);
      ganDau();
      m.querySelectorAll('[data-dd]').forEach((b) => { b.onclick = () => { st.doiDD = b.dataset.dd; manDiemDanh(); }; });
      m.querySelectorAll('[data-tt]').forEach((b) => {
        b.onclick = () => {
          const ma = b.dataset.ma;
          if (b.dataset.tt !== 'Về sớm') { tt[ma] = { tt: b.dataset.tt }; return ve(); }
          hop('Về sớm', `<label class="o"><span>Giờ về</span><input type="time" id="gv" value="${new Date().toTimeString().slice(0, 5)}"></label>
            <label class="o"><span>Lý do</span><input type="text" id="ld" placeholder="Ví dụ: việc gia đình"></label>
            <p class="mo">Về sớm tính 0 công cho buổi này, Trưởng bộ phận sẽ xác nhận.</p><button class="nut chinh rong" id="ok">Xong</button>`, (o, dong) => {
            o.querySelector('#ok').onclick = () => { tt[ma] = { tt: 'Về sớm', gioVe: o.querySelector('#gv').value, lyDo: o.querySelector('#ld').value }; dong(); ve(); };
          });
        };
      });
      const g = m.querySelector('#gui');
      if (g) g.onclick = () => {
        const sang = st.buoi === 'Sáng'; const daCoAnh = daGui && daGui['Ảnh tập thể'];
        hop(`Gửi điểm danh ${st.buoi.toLowerCase()} · ${st.doiDD}`, `<p style="margin-top:0"><b>${co}</b>/${sua.length} có mặt${sua.length - co ? ` · ${sua.length - co} vắng / về sớm` : ''}</p>
          <div class="o" style="margin-bottom:12px"><span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Ảnh tập thể đầu ca ${st.buoi.toLowerCase()} ${!daCoAnh ? '(bắt buộc)' : '(đã có, chụp lại nếu cần)'}</span><div id="anhTT"></div></div>
          <button class="nut chinh rong" id="ok">Gửi Trưởng bộ phận duyệt</button>`, (o, dong) => {
          const anh = G.oAnh(o.querySelector('#anhTT'), { batBuoc: !daCoAnh, toiDa: 3 }); void sang;
          o.querySelector('#ok').onclick = (e) => chay(async () => {
            const a = anh.kiemTra();
            await API.goi('diemDanh.gui', { ngay: st.ngay, buoi: st.buoi, doi: st.doiDD, anh: a.length ? a : API.dsAnh(daGui && daGui['Ảnh tập thể']), ds: sua.map((x) => Object.assign({ ma: x.ma }, tt[x.ma])) });
            dong(); bao('Đã gửi, chờ Trưởng bộ phận duyệt'); manDiemDanh();
          }, e.target);
        });
      };
    };
    ve();
  }

  /* Trưởng bộ phận điểm danh / sửa trực tiếp (kể cả buổi đã khóa), có nhật ký */
  function suaTrucTiep(st, rows, cn) {
    const TT = 'Trạng thái (Có mặt/Vắng/Về sớm)';
    const cu = {}; rows.forEach((r) => { cu[r['Mã CN']] = { tt: r[TT], gioVe: r['Giờ về'], lyDo: r['Lý do'] }; });
    const moi = {};
    hop(`Sửa điểm danh ${st.buoi.toLowerCase()} ${G.ngayVN(st.ngay)}`, `<p class="mo" style="margin-top:0">Chỉ những người anh bấm đổi mới được lưu. Người chưa ai điểm danh hiện "chưa có".</p><div class="ds" id="dsS"></div>
      <label class="o"><span>Lý do sửa *</span><input type="text" id="lyDo" placeholder="Ví dụ: tổ trưởng ghi nhầm"></label><button class="nut chinh rong" id="luu">Lưu thay đổi</button>`, (o, dong) => {
      const ve = () => {
        o.querySelector('#dsS').innerHTML = cn.map((x) => { const t = moi[x.ma] || cu[x.ma] || {}; return `<div class="muc" style="${moi[x.ma] ? 'background:var(--cam-nhat)' : ''}"><div class="gian"><div>${esc(x.ten)}</div><div class="mo">${esc(x.doi || 'Chưa phân đội')}${cu[x.ma] ? '' : ' · chưa có'}</div></div>
          <div class="tt3">${[['co', 'Có mặt', 'Có'], ['vang', 'Vắng', 'Vắng'], ['som', 'Về sớm', 'Sớm']].map((b) => `<button class="${b[0]} ${t.tt === b[1] ? 'dang' : ''}" data-ma="${x.ma}" data-tt="${b[1]}">${b[2]}</button>`).join('')}</div></div>`; }).join('');
        o.querySelectorAll('[data-tt]').forEach((b) => { b.onclick = () => { moi[b.dataset.ma] = { tt: b.dataset.tt, gioVe: b.dataset.tt === 'Về sớm' ? new Date().toTimeString().slice(0, 5) : '', lyDo: '' }; ve(); }; });
      };
      ve();
      o.querySelector('#luu').onclick = (e) => chay(async () => {
        const ds = Object.keys(moi).map((ma) => Object.assign({ ma }, moi[ma])); if (!ds.length) throw new Error('Chưa đổi người nào');
        const ly = o.querySelector('#lyDo').value.trim(); if (!ly) throw new Error('Nhập lý do sửa');
        await API.goi('diemDanh.gui', { ngay: st.ngay, buoi: st.buoi, ds, lyDo: ly }); dong(); bao(`Đã sửa ${ds.length} người, có ghi nhật ký`); manDiemDanh();
      }, e.target);
    }, true);
  }

  /* ================= PHIẾU GIAO VIỆC ================= */
  const MAU_TT = { 'Mới': 'cam', 'Đang xử lý': '', 'Báo xong': 'xanh', 'Bị trả lại': 'do', 'Đã duyệt': 'xanh' };
  async function manPhieu(moMa) {
    const st = manPhieu.st || (manPhieu.st = { tab: 'mo', cuaToi: S.u.nhom === 'Tổ trưởng' });
    const m = G.khung('Phiếu giao việc', 'Lỗi cảnh quan, sự cố cần xử lý');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'Phieu', gioiHan: 400 }] })).Phieu.reverse();
    const TAB = { mo: ['Mới', 'Đang xử lý', 'Bị trả lại'], cho: ['Báo xong'], xong: ['Đã duyệt'] };
    const cua = (p) => !st.cuaToi || !p['Giao cho'] || p['Giao cho'] === S.u.doi || p['Giao cho'] === S.u.ten || p['Người nhận'] === S.u.ten;
    const loc = ds.filter((p) => TAB[st.tab].includes(p['Trạng thái']) && cua(p));
    const tre = (p) => p['Hạn'] && p['Hạn'] < API.bayGio() && p['Trạng thái'] !== 'Đã duyệt' && p['Trạng thái'] !== 'Báo xong';
    m.innerHTML = `${q('phieu') >= 2 ? `<div class="nhom-nut" style="margin-bottom:12px"><button class="nut chinh" id="tao">＋ Phiếu giao việc</button>${G.taoPhieuTrong ? '<button class="nut" id="taoTrong">🌱 Phiếu trồng dặm, cải tạo</button>' : ''}</div>` : ''}
      <div class="chon">${[['mo', 'Đang mở'], ['cho', 'Chờ duyệt'], ['xong', 'Đã xong']].map((t) => `<button data-t="${t[0]}" class="${st.tab === t[0] ? 'dang' : ''}">${t[1]} (${ds.filter((p) => TAB[t[0]].includes(p['Trạng thái']) && cua(p)).length})</button>`).join('')}</div>
      ${S.u.nhom === 'Tổ trưởng' ? `<label class="mo" style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><input type="checkbox" id="cuaToi" ${st.cuaToi ? 'checked' : ''}> Chỉ phiếu giao cho ${esc(S.u.doi)} / tôi</label>` : ''}
      ${q('phieu') >= 3 && st.tab === 'cho' && loc.length > 1 ? `<button class="nut rong" id="duyetHet" style="margin-bottom:10px">Duyệt hết ${loc.length} phiếu đã xem ảnh</button>` : ''}
      <div class="ds">${loc.length ? loc.map((p) => `<div class="muc" data-ma="${esc(p['Mã phiếu'])}" style="cursor:pointer;${tre(p) ? 'box-shadow:inset 4px 0 0 var(--do)' : ''}"><div class="gian"><div><b>${esc(p['Loại lỗi'])}</b></div>
        <div class="mo">📍 ${esc(G.tenVT(p['Mã vị trí'], p['Vị trí khác']))}</div><div class="mo">${p['Giao cho'] ? 'Giao: ' + esc(p['Giao cho']) + ' · ' : ''}hạn ${esc(G.gioVN(p['Hạn']))}${tre(p) ? ' · <b style="color:var(--do)">quá hạn</b>' : ''}</div></div>
        <div style="text-align:right"><span class="chip ${MAU_MUC[p['Mức độ']]}">${esc(p['Mức độ'])}</span><br><span class="chip ${MAU_TT[p['Trạng thái']]}" style="margin-top:4px">${esc(p['Trạng thái'])}</span></div></div>`).join('')
        : '<div class="muc mo">Không có phiếu</div>'}</div>`;
    m.querySelectorAll('[data-t]').forEach((b) => { b.onclick = () => { st.tab = b.dataset.t; manPhieu(); }; });
    const ct = m.querySelector('#cuaToi'); if (ct) ct.onchange = () => { st.cuaToi = ct.checked; manPhieu(); };
    m.querySelectorAll('[data-ma]').forEach((r) => { r.onclick = () => chiTietPhieu(ds.find((p) => p['Mã phiếu'] === r.dataset.ma)); });
    const t = m.querySelector('#tao'); if (t) t.onclick = () => G.taoPhieu({ sau: (r) => { manPhieu(); hoiGuiZalo(r.ma); } });
    const tt_ = m.querySelector('#taoTrong'); if (tt_) tt_.onclick = () => G.taoPhieuTrong({ sau: (r) => { manPhieu(); hoiGuiZalo(r.ma); } });
    if (moMa) { const p = ds.find((x) => x['Mã phiếu'] === moMa); if (p) chiTietPhieu(p); else bao('Không thấy phiếu ' + moMa + ' (đã xóa hoặc chưa đồng bộ)', true); history.replaceState(null, '', '#/phieu'); }
    const dh = m.querySelector('#duyetHet'); if (dh) dh.onclick = () => chay(async () => { if (!(await G.xacNhan(`Duyệt ${loc.length} phiếu?`, 'Duyệt hết'))) return; for (const p of loc) await API.goi('phieu.chuyen', { ma: p['Mã phiếu'], hd: 'duyet' }); bao('Đã duyệt ' + loc.length + ' phiếu'); manPhieu(); }, dh);
  }

  G.GIAO_CHO = () => ['Đội cơ động', 'Đội khu vực', 'Nhân viên nội bộ'].concat((S.dm.nguoi || []).filter((n) => n.nhom !== 'Trưởng bộ phận').map((n) => n.ten));
  G.taoPhieu = function (opt) {
    opt = opt || {};
    let muc = opt.muc || 'Trung bình';
    const HAN = { 'Khẩn cấp': 'Hạn xử lý 2 giờ', 'Cao': 'Hạn xử lý 24 giờ', 'Trung bình': 'Hạn xử lý 3 ngày', 'Thấp': 'Hạn xử lý 7 ngày' };
    hop(opt.tieuDe || 'Tạo phiếu giao việc', `
      <label class="o"><span>1. Lỗi / việc cần làm</span><div id="oLoi"></div><small class="mo">Chọn nhóm lỗi → chọn lỗi cụ thể, hoặc gõ để tìm nhanh</small></label>
      <label class="o"><span>2. Vị trí</span><div id="oVT"></div><small class="mo">Chọn cụm → chọn vị trí, hoặc gõ để tìm nhanh</small></label>
      <label class="o"><span>3. Mức độ</span><div id="muc"></div><small class="mo" id="hanMo"></small></label>
      <label class="o"><span>4. Giao cho</span><div id="giao"></div></label>
      <div class="o" style="margin-bottom:12px"><span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">5. Ảnh hiện trạng</span><div id="anh"></div></div>
      ${G.oMoTa('mt')}
      <label class="o"><span>Nguồn</span><select id="nguon">${S.dm.nguonPhieu.map((x) => `<option ${x === (opt.nguon || '') ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
      <button class="nut chinh rong" id="luu">Tạo phiếu</button>`, (o, dong) => {
      const datMuc = (x) => { muc = x; o.querySelectorAll('#muc [data-v]').forEach((b) => b.classList.toggle('dang', b.dataset.v === x)); o.querySelector('#hanMo').textContent = HAN[x]; };
      G.chips(o.querySelector('#muc'), MUC, muc, datMuc); datMuc(muc);
      const loi = G.oChon(o.querySelector('#oLoi'), 'Bấm để chọn lỗi', G.chonLoi, opt.loi);
      loi.doi = (l) => { if (l.muc && MUC.includes(l.muc)) datMuc(l.muc); };
      const vt = G.oChon(o.querySelector('#oVT'), 'Bấm để chọn vị trí', () => G.chonViTri(), opt.vt);
      const giao = G.chips(o.querySelector('#giao'), G.GIAO_CHO(), opt.giao || '');
      const anh = G.oAnh(o.querySelector('#anh'), { toiDa: 4 }); G.ganMic(o);
      o.querySelector('#luu').onclick = (e) => chay(async () => {
        if (!loi.gt) throw new Error('Chọn lỗi / việc cần làm'); if (!vt.gt) throw new Error('Chọn vị trí');
        const r = await API.goi('phieu.tao', { loai: loi.gt.ten, nhom: loi.gt.nhom || 'Khác', muc, vt: vt.gt.ma || '', vtKhac: vt.gt.ma ? '' : vt.gt.ten, giao: giao.gt, nguon: o.querySelector('#nguon').value,
          moTa: o.querySelector('#mt').value, anh: anh.ds(), maTT: opt.maTT, maSK: opt.maSK, maDA: opt.maDA, maLL: opt.maLL });
        dong(); bao('Đã tạo phiếu ' + r.ma); if (opt.sau) opt.sau(r);
      }, e.target);
    });
  };

  G.textPhieu = (p) => `🎫 Phiếu ${p['Mã phiếu']} · ${p['Mức độ']}\n${p['Loại lỗi']}\n📍 ${G.tenVT(p['Mã vị trí'], p['Vị trí khác'])}${p['Giao cho'] ? '\nGiao: ' + p['Giao cho'] : ''} · hạn ${G.gioVN(p['Hạn'])}\nTrạng thái: ${p['Trạng thái']}${p['Mô tả'] ? '\n' + p['Mô tả'] : ''}`;
  async function hoiGuiZalo(ma) {
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'Phieu', gioiHan: 400 }] })).Phieu; const p = ds.find((x) => x['Mã phiếu'] === ma); if (!p) return;
    hop('Đã tạo phiếu ' + ma, `<p class="mo" style="margin-top:0">Gửi phiếu qua Zalo cho ${G.esc(p['Giao cho'] || 'người nhận')}? Bấm 📤 rồi chọn Zalo → nhóm hoặc người.</p><pre style="white-space:pre-wrap;font:inherit;background:var(--nen);padding:10px;border-radius:10px">${G.esc(G.textPhieu(p))}</pre>${G.nutZalo()}<button class="nut rong" id="boQua" style="margin-top:8px">Để sau</button>`, (o, dong) => {
      o.querySelector('#zalo').onclick = () => G.guiZalo(G.textPhieu(p), 'phieu/' + ma);
      o.querySelector('#boQua').onclick = dong;
    });
  }
  function chiTietPhieu(p) {
    const duyet = q('phieu') >= 3; const ghi = q('phieu') >= 2; const tt = p['Trạng thái'];
    hop(p['Loại lỗi'], `<div class="hang" style="margin-bottom:6px;flex-wrap:wrap"><span class="chip ${MAU_MUC[p['Mức độ']]}">${esc(p['Mức độ'])}</span><span class="chip ${MAU_TT[tt]}">${esc(tt)}</span><span class="mo">${esc(p['Mã phiếu'])}</span></div>
      <p class="mo" style="margin-top:0">📍 ${esc(G.tenVT(p['Mã vị trí'], p['Vị trí khác']))}<br>Tạo bởi ${esc(p['Người tạo'])} lúc ${esc(G.gioVN(p['Giờ tạo']))} · hạn ${esc(G.gioVN(p['Hạn']))}
      ${p['Giao cho'] ? `<br>Giao cho: <b>${esc(p['Giao cho'])}</b>` : ''}${p['Người nhận'] ? `<br>Người nhận: ${esc(p['Người nhận'])} lúc ${esc(G.gioVN(p['Giờ nhận']))}` : ''}${+p['Số lần trả lại'] ? `<br><b style="color:var(--do)">Đã bị trả lại ${p['Số lần trả lại']} lần</b>` : ''}</p>
      ${p['Mô tả'] ? `<p>${esc(p['Mô tả'])}</p>` : ''}
      ${p['Ảnh trước'] ? `<div class="mo">Ảnh trước</div><div>${G.xemAnh(p['Ảnh trước'])}</div>` : ''}
      ${p['Chi tiết trồng'] && G.moTaTrong ? G.moTaTrong(p) : ''}
      ${p['Ảnh trong'] ? `<div class="mo">Ảnh trong khi trồng</div><div>${G.xemAnh(p['Ảnh trong'])}</div>` : ''}
      ${p['Ảnh sau'] ? `<div class="mo">Ảnh sau khi xử lý</div><div>${G.xemAnh(p['Ảnh sau'])}</div>` : ''}
      <div id="hanhDong" style="margin-top:14px"></div>`, (o, dong) => {
      const hd = o.querySelector('#hanhDong');
      const lam = (body, msg) => (e) => chay(async () => { await API.goi('phieu.chuyen', Object.assign({ ma: p['Mã phiếu'] }, body)); dong(); bao(msg); G.taiLai(); }, e.target);
      if (ghi && (tt === 'Mới' || (tt === 'Bị trả lại' && !p['Người nhận']))) {
        hd.innerHTML = '<button class="nut chinh rong">Nhận việc</button>'; hd.firstChild.onclick = lam({ hd: 'nhan' }, 'Đã nhận việc');
      } else if (ghi && (tt === 'Đang xử lý' || tt === 'Bị trả lại')) {
        const trong = !!p['Chi tiết trồng'];
        hd.innerHTML = '<b>Báo xong</b>' + (trong ? '<p class="mo" style="margin:4px 0 8px">Ảnh trong khi trồng (bắt buộc)</p><div id="anhTrong"></div>' : '') + '<p class="mo" style="margin:4px 0 8px">Ảnh sau khi xử lý (bắt buộc): chụp trực tiếp, chọn ảnh có sẵn trong máy, hoặc dán ảnh đã sao chép.</p><div id="anhSau"></div><button class="nut chinh rong" style="margin-top:10px" id="xong">Báo xong</button>';
        const anh = G.oAnh(hd.querySelector('#anhSau'), { batBuoc: true, toiDa: 4 }); const anhT = trong ? G.oAnh(hd.querySelector('#anhTrong'), { batBuoc: true, toiDa: 4 }) : null;
        hd.querySelector('#xong').onclick = (e) => chay(async () => { const at = anhT ? anhT.kiemTra() : []; const a = anh.kiemTra(); await API.goi('phieu.chuyen', { ma: p['Mã phiếu'], hd: 'xong', anh: a, anhTrong: at }); dong(); bao('Đã báo xong, chờ Trưởng bộ phận duyệt'); G.taiLai(); }, e.target);
      }
      if (duyet && tt === 'Báo xong') {
        hd.innerHTML = '<div class="nhom-nut"><button class="nut" data-x="tra">Trả lại</button><button class="nut chinh" data-x="duyet">Duyệt</button></div>';
        hd.querySelector('[data-x=duyet]').onclick = lam({ hd: 'duyet' }, 'Đã duyệt');
        hd.querySelector('[data-x=tra]').onclick = async (e) => { const g = await G.hoi('Lý do trả lại'); if (g !== null) lam({ hd: 'traLai', ghiChu: g }, 'Đã trả lại')(e); };
      }
      { const z = h(G.nutZalo('zaloP')); z.onclick = () => G.guiZalo(G.textPhieu(p), 'phieu/' + p['Mã phiếu']); hd.appendChild(z); }
      if (duyet && G.lapLaiTu) { const b = h('<button class="nut rong" style="margin-top:8px">🔁 Lặp lại việc này</button>'); b.onclick = () => { dong(); G.lapLaiTu(p); }; hd.appendChild(b); }
    }, true);
  }
  G.chiTietPhieu = chiTietPhieu;

  /* ================= THÊM: mọi phân hệ ================= */
  async function manThem() {
    const m = G.khung('Tất cả chức năng', S.u.vaiTro || S.u.nhom);
    const ten = ['', 'Xem', 'Ghi', 'Duyệt'];
    const o = Object.keys(G.man).map((k) => Object.assign({ k }, G.man[k])).filter((x) => !x.an && (typeof x.ph === 'function' ? x.ph() : q(x.ph) >= (x.cap || 1)));
    const nhom = {}; o.forEach((x) => { (nhom[x.nhom || 'Khác'] = nhom[x.nhom || 'Khác'] || []).push(x); });
    m.innerHTML = Object.keys(nhom).map((n) => `<h2 style="font-size:14px;margin:4px 0 8px;color:var(--mo)">${esc(n)}</h2><div class="luoi-o">${nhom[n].map((x) => `<a href="#/${x.k}"><span class="bt">${x.bt}</span>${esc(x.ten)}</a>`).join('')}</div>`).join('')
      + `<div class="the"><h2>${esc(S.u.ten)}</h2><p class="mo" style="margin:0 0 8px">${esc(S.u.nhom)}${S.u.doi ? ' · ' + esc(S.u.doi) : ''}</p>
        <details><summary class="mo">Quyền của tôi</summary><p class="mo">${Object.keys(S.u.quyen).filter((k) => S.u.quyen[k]).map((k) => `${k}: ${ten[S.u.quyen[k]]}`).join(' · ')}</p></details></div>
      ${G.theCaiDat ? G.theCaiDat() : ''}
      ${API.thu() ? '<button class="nut rong" id="xoa" style="margin-bottom:10px">Xóa dữ liệu chạy thử</button>' : ''}
      <button class="nut rong" id="ra">${API.thu() ? 'Đổi vai / thoát chạy thử' : 'Đăng xuất'}</button>
      <p class="mo" style="text-align:center;margin-top:16px">GreenLog ${esc(window.GL_CONFIG.PHIEN_BAN)}</p>`;
    const x = m.querySelector('#xoa'); if (x) x.onclick = async () => { if (await G.xacNhan('Xóa hết dữ liệu đã thử trên máy này?', 'Xóa')) { API.xoaDuLieuThu(); bao('Đã xóa'); } };
    m.querySelector('#ra').onclick = G.dangXuat; if (G.ganCaiDat) G.ganCaiDat(m);
    m.querySelectorAll('.luoi-o a').forEach((a) => { const x = G.man[a.getAttribute('href').replace('#/', '')]; if (x && x.ic && G.ic) a.querySelector('.bt').innerHTML = G.ic(x.ic, 40); });
  }

  G.batDau = batDau; G.manHomNayGoc = manHomNay;
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
