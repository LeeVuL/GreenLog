/* GreenLog – giao diện. Không cần cài đặt hay biên dịch: mở index.html là chạy. */
(function () {
  const API = window.GL_API;
  const $app = document.getElementById('app');
  const S = { dm: null, u: null }; // dữ liệu dùng chung sau khi khởi động
  const MUC = ['Khẩn cấp', 'Cao', 'Trung bình', 'Thấp'];
  const MAU_MUC = { 'Khẩn cấp': 'do', 'Cao': 'cam', 'Trung bình': '', 'Thấp': '' };
  const LY_DO_THEM = ['Làm lại vì chưa đạt', 'Theo yêu cầu', 'Khác'];

  /* ---------- tiện ích ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  function bao(msg, loi) {
    const b = h(`<div class="bao${loi ? ' loi' : ''}">${esc(msg)}</div>`);
    document.body.appendChild(b); setTimeout(() => b.remove(), loi ? 4500 : 2200);
  }
  async function chay(fn, nut) {
    if (nut) nut.disabled = true;
    try { return await fn(); } catch (e) { bao(e.message || String(e), true); } finally { if (nut) nut.disabled = false; }
  }
  function hop(html, onMo) {
    const lop = h(`<div class="lop-phu"><div class="hop">${html}</div></div>`);
    lop.addEventListener('click', (e) => { if (e.target === lop) lop.remove(); });
    document.body.appendChild(lop);
    const dong = () => lop.remove();
    if (onMo) onMo(lop.querySelector('.hop'), dong);
    return dong;
  }
  const ngayVN = (d) => { const p = String(d).split(' ')[0].split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d; };
  const hanVN = (v) => { const m = String(v).match(/^\d{4}-(\d{2})-(\d{2}) (\d{2}:\d{2})/); return m ? `${m[2]}/${m[1]} ${m[3]}` : v; };
  const thu = () => ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][new Date().getDay()];
  const q = (ph) => (S.u && S.u.quyen[ph]) || 0;
  const tenVT = (ma) => { const v = S.dm.vitri.find((x) => x.ma === ma); return v ? `${v.ten} · ${v.kv}` : (ma || ''); };

  /* nén ảnh về cạnh dài 1280px, JPEG ~0.7 (chế độ chạy thử nhỏ hơn để lưu trên máy) */
  function nenAnh(file) {
    return new Promise((ok, loi) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = API.thu() ? 800 : 1280; const k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          ok(c.toDataURL('image/jpeg', API.thu() ? 0.6 : 0.72));
        };
        img.onerror = () => loi(new Error('Không đọc được ảnh'));
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }
  /* ô ảnh: Chụp ảnh + Dán ảnh (dán từ Zalo/bộ nhớ tạm) */
  function oAnh(goc, onCo) {
    goc.innerHTML = `<div class="o-anh"><button type="button" data-a="chup">📷 Chụp / chọn ảnh</button><button type="button" class="phu" data-a="dan">📋 Dán ảnh</button></div>
      <input type="file" accept="image/*" capture="environment" class="an"><img class="xem-anh an" alt="">`;
    const inp = goc.querySelector('input'); const xem = goc.querySelector('img');
    const dat = async (f) => { const d = await nenAnh(f); xem.src = d; xem.classList.remove('an'); onCo(d); };
    goc.querySelector('[data-a=chup]').onclick = () => inp.click();
    inp.onchange = () => inp.files[0] && chay(() => dat(inp.files[0]));
    goc.querySelector('[data-a=dan]').onclick = () => chay(async () => {
      if (!navigator.clipboard || !navigator.clipboard.read) throw new Error('Máy này chưa cho dán ảnh trực tiếp. Hãy dùng nút Chụp / chọn ảnh.');
      const items = await navigator.clipboard.read();
      for (const it of items) { const t = it.types.find((x) => x.startsWith('image/')); if (t) return dat(await it.getType(t)); }
      throw new Error('Bộ nhớ tạm chưa có ảnh');
    });
  }
  /* nút micro: đọc thành chữ (tiếng Việt) */
  function gangMic(nut, o) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { nut.remove(); return; }
    nut.onclick = () => {
      const r = new SR(); r.lang = 'vi-VN'; r.interimResults = false;
      nut.textContent = '⏺ Đang nghe…';
      r.onresult = (e) => { o.value = (o.value ? o.value + ' ' : '') + e.results[0][0].transcript; };
      r.onend = () => { nut.textContent = '🎤 Nói'; };
      r.onerror = () => { nut.textContent = '🎤 Nói'; bao('Không nghe rõ, thử lại', true); };
      r.start();
    };
  }

  /* ---------- khung ---------- */
  const MENU = [
    { k: '', ten: 'Hôm nay', bt: '🏠', ph: 'homnay' },
    { k: 'diemdanh', ten: 'Điểm danh', bt: '🧑‍🤝‍🧑', ph: 'diemdanh' },
    { k: 'dinhky', ten: 'Định kỳ', bt: '✅', ph: 'dinhky' },
    { k: 'phieu', ten: 'Phiếu', bt: '🎫', ph: 'phieu' },
    { k: 'them', ten: 'Thêm', bt: '☰', ph: null },
  ];
  function khung(tieuDe, phu) {
    const tuyen = location.hash.replace(/^#\/?/, '').split('/')[0];
    $app.innerHTML = `
      ${API.thu() ? '<div class="bang-thu">Chế độ chạy thử · dữ liệu mẫu, chỉ lưu trên máy này</div>' : ''}
      <header class="dau"><img src="icons/icon-192.png" alt=""><div class="tieude"><b>${esc(tieuDe)}</b><small>${esc(phu || '')}</small></div>
        <button class="nut-tron" id="nutTk">${esc(S.u.ten.split(' ').pop())}</button></header>
      <main id="noiDung"><div class="dang-tai">Đang tải…</div></main>
      <nav class="duoi">${MENU.filter((m) => !m.ph || q(m.ph)).map((m) => `<a href="#/${m.k}" class="${tuyen === m.k ? 'dang' : ''}"><span class="bt">${m.bt}</span>${m.ten}</a>`).join('')}</nav>`;
    document.getElementById('nutTk').onclick = () => { location.hash = '#/them'; };
    return document.getElementById('noiDung');
  }

  /* ---------- đăng nhập ---------- */
  function manVao() {
    $app.innerHTML = `<div class="vao"><img class="logo" src="icons/GreenLog_Logo_Ngang.svg" alt="GreenLog">
      <div class="hop-vao">
        ${API.coThat() ? `<p class="mo">Đăng nhập bằng Gmail đã đăng ký với anh Vũ</p><div id="nutGoogle" style="display:flex;justify-content:center;margin-bottom:18px"></div><hr style="border:0;border-top:1px solid var(--vien2);margin:18px 0">` : ''}
        <p class="mo"><b>Chạy thử</b> với dữ liệu mẫu, chọn vai để xem mỗi người thấy gì:</p>
        <div class="chon-nguoi">${API.nguoiThu.map((n, i) => `<button class="nut" data-i="${i}">👤 ${esc(n.ten)} <span class="mo" style="margin-left:auto">${esc(n.nhom)}</span></button>`).join('')}</div>
      </div></div>`;
    $app.querySelectorAll('[data-i]').forEach((b) => { b.onclick = async () => { await API.vaoThu(+b.dataset.i); batDau(); }; });
    if (API.coThat()) {
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = () => {
        google.accounts.id.initialize({ client_id: window.GL_CONFIG.CLIENT_ID, callback: (r) => chay(async () => { await API.dangNhapGoogle(r.credential); batDau(); }) });
        google.accounts.id.renderButton(document.getElementById('nutGoogle'), { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'signin_with', locale: 'vi' });
      };
      document.head.appendChild(s);
    }
  }

  async function batDau() {
    if (!API.daDangNhap()) return manVao();
    $app.innerHTML = '<div class="dang-tai">Đang tải dữ liệu…</div>';
    try { S.dm = await API.goi('khoiDong'); S.u = S.dm.user; }
    catch (e) { bao(e.message, true); API.dangXuat(); return manVao(); }
    window.onhashchange = dieuHuong; dieuHuong();
  }
  function dieuHuong() {
    const t = location.hash.replace(/^#\/?/, '').split('/')[0];
    const man = { '': manHomNay, diemdanh: manDiemDanh, dinhky: manDinhKy, phieu: manPhieu, them: manThem }[t] || manHomNay;
    window.scrollTo(0, 0);
    chay(man);
  }

  /* ================= HÔM NAY ================= */
  async function manHomNay() {
    const m = khung('Hôm nay', `${thu()}, ${ngayVN(API.ngay())}`);
    const d = await API.goi('homNay');
    const k = d.ky; const tu = new Date(k.tu), den = new Date(k.den);
    const troiQua = Math.min(1, Math.max(0, (Date.now() - tu) / (den - tu + 864e5)));
    const dk = q('dinhky') ? `<div class="the"><div class="hang" style="margin-bottom:10px"><h2 class="gian" style="margin:0">8 đầu việc định kỳ · ${esc(k.ten)}</h2><span class="mo">${ngayVN(k.tu)}–${ngayVN(k.den)}</span></div>
      <p class="mo" style="margin:0 0 10px">Đã qua ${Math.round(troiQua * 100)}% kỳ. Thanh cam/đỏ là đang chậm so với thời gian.</p>
      ${S.dm.dauviec.map((v) => {
        const n = d.tienDo[v.ma] || 0; const p = d.soViTri ? n / d.soViTri : 0; const tre = troiQua - p;
        return `<a href="#/dinhky/${v.ma}" style="display:block;color:inherit;text-decoration:none;margin-bottom:10px">
          <div class="hang" style="font-size:13px;margin-bottom:4px"><span class="gian">${esc(v.ten)}</span><b>${n}/${d.soViTri}</b></div>
          <div class="thanh ${tre > 0.25 ? 'do' : tre > 0.1 ? 'cam' : ''}"><i style="width:${Math.round(p * 100)}%"></i></div></a>`;
      }).join('')}</div>` : '';
    const ph = q('phieu') ? `<a href="#/phieu" class="the" style="display:block;color:inherit;text-decoration:none"><h2>Phiếu</h2>
      <div class="luoi2"><div><div class="so-lon">${d.phieuMo}</div><div class="mo">đang mở</div></div>
      <div><div class="so-lon" style="color:var(--do)">${d.phieuKhan}</div><div class="mo">khẩn cấp</div></div></div>
      ${q('phieu') >= 3 && d.phieuChoDuyet ? `<p style="margin:10px 0 0"><span class="chip cam">${d.phieuChoDuyet} phiếu chờ anh duyệt</span></p>` : ''}</a>` : '';
    let dd = '';
    if (S.u.nhom === 'Quản lý nhà thầu') {
      dd = `<div class="the"><h2>Tự điểm danh</h2><p class="mo" style="margin-top:0">Bấm khi có mặt tại resort. Không cần ảnh.</p>
        <div class="nhom-nut"><button class="nut chinh" data-buoi="Sáng">Có mặt buổi sáng</button><button class="nut chinh" data-buoi="Chiều">Có mặt buổi chiều</button></div></div>`;
    } else if (q('diemdanh')) {
      const ds = d.diemDanh;
      const dong = (b) => { const x = ds.filter((y) => y.buoi === b); return x.length ? x.map((y) => `<span class="chip ${y.duyet ? 'xanh' : 'cam'}">${esc(b)} · ${esc(y.doi)} · ${y.duyet ? 'đã duyệt' : 'chờ duyệt'}</span>`).join(' ') : `<span class="chip">${esc(b)} · chưa gửi</span>`; };
      dd = `<a href="#/diemdanh" class="the" style="display:block;color:inherit;text-decoration:none"><h2>Điểm danh hôm nay</h2><div style="display:flex;flex-wrap:wrap;gap:6px">${dong('Sáng')} ${dong('Chiều')}</div></a>`;
    }
    m.innerHTML = `<p style="margin:0 0 12px">Chào ${esc(S.u.ten)} 👋</p>${dd}${ph}${dk}`;
    m.querySelectorAll('[data-buoi]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('diemDanh.tuDiem', { buoi: b.dataset.buoi }); bao('Đã ghi có mặt buổi ' + b.dataset.buoi.toLowerCase()); }, b); });
  }

  /* ================= ĐIỂM DANH ================= */
  async function manDiemDanh() {
    if (S.u.nhom === 'Quản lý nhà thầu') {
      const m0 = khung('Điểm danh', 'Tự điểm danh');
      m0.innerHTML = `<div class="the"><h2>Tự điểm danh hôm nay</h2><p class="mo" style="margin-top:0">Bấm khi có mặt tại resort. Không cần ảnh, không cần vị trí. Nhắc lúc 8h00 và 14h30.</p>
        <div class="nhom-nut"><button class="nut chinh" data-buoi="Sáng">Có mặt buổi sáng</button><button class="nut chinh" data-buoi="Chiều">Có mặt buổi chiều</button></div></div>
        <p class="mo">Điểm danh công nhân do hai tổ trưởng thực hiện.</p>`;
      m0.querySelectorAll('[data-buoi]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('diemDanh.tuDiem', { buoi: b.dataset.buoi }); bao('Đã ghi có mặt buổi ' + b.dataset.buoi.toLowerCase()); }, b); });
      return;
    }
    const m = khung('Điểm danh', S.u.doi || (q('diemdanh') >= 3 ? 'Duyệt công từng buổi' : ''));
    const st = manDiemDanh.st || (manDiemDanh.st = { ngay: API.ngay(), buoi: new Date().getHours() < 12 ? 'Sáng' : 'Chiều' });
    const d = await API.goi('diemDanh.lay', { ngay: st.ngay, buoi: st.buoi });
    const cn = (S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ' && x.cd !== 'Quản lý nhà thầu (tự điểm danh)' && x.doi !== 'Quản lý nhà thầu');
    const dau = `<div class="hang" style="margin-bottom:10px"><input type="text" id="ngay" value="${ngayVN(st.ngay)}" readonly style="max-width:140px" title="Ngày">
      <div class="chon gian" style="margin:0">${['Sáng', 'Chiều'].map((b) => `<button data-b="${b}" class="${st.buoi === b ? 'dang' : ''}">${b}</button>`).join('')}</div></div>`;

    if (q('diemdanh') >= 3) { // anh Vũ: duyệt
      const nhom = {};
      d.rows.forEach((r) => { (nhom[r.doi] = nhom[r.doi] || []).push(r); });
      const tenCN = (ma) => (cn.concat(S.dm.congnhan || []).find((x) => x.ma === ma) || {}).ten || ma;
      m.innerHTML = dau + (Object.keys(nhom).length ? Object.keys(nhom).map((doi) => {
        const rs = nhom[doi]; const du = d.duyet.find((x) => x.doi === doi) || {};
        const co = rs.filter((r) => r.tt === 'Có mặt').length;
        const khac = rs.filter((r) => r.tt !== 'Có mặt');
        return `<div class="the"><div class="hang"><h3 class="gian">${esc(doi)}</h3>${du.khoa ? '<span class="chip xanh">Đã duyệt · khóa</span>' : '<span class="chip cam">Chờ duyệt</span>'}</div>
          <p class="mo">Gửi bởi ${esc(du.nguoiGui || '')} · Có mặt <b>${co}</b>/${rs.length} · Công buổi này: <b>${(co * 0.5).toLocaleString('vi-VN')}</b></p>
          ${khac.length ? `<div class="ds">${khac.map((r) => `<div class="muc"><div class="gian">${esc(tenCN(r.ma))}${r.tt === 'Về sớm' ? `<div class="mo">Về lúc ${esc(r.gioVe)} · ${esc(r.lyDo)} · tính 0 công</div>` : ''}</div><span class="chip ${r.tt === 'Vắng' ? 'do' : 'cam'}">${esc(r.tt)}</span></div>`).join('')}</div>` : '<p class="mo">Đủ người.</p>'}
          ${du.khoa ? '' : `<button class="nut chinh rong" data-duyet="${esc(doi)}">Duyệt và khóa buổi ${st.buoi.toLowerCase()}</button>`}</div>`;
      }).join('') : `<div class="the mo">Chưa đội nào gửi điểm danh buổi ${st.buoi.toLowerCase()} ngày ${ngayVN(st.ngay)}.</div>`);
      m.querySelectorAll('[data-duyet]').forEach((b) => { b.onclick = () => chay(async () => { await API.goi('diemDanh.duyet', { ngay: st.ngay, buoi: st.buoi, doi: b.dataset.duyet }); bao('Đã duyệt, công buổi này đã khóa'); manDiemDanh(); }, b); });
    } else { // tổ trưởng: điểm danh đội mình (+ người chưa phân đội)
      const cuaDoi = cn.filter((x) => x.doi === S.u.doi || !x.doi);
      const daGui = d.duyet.find((x) => x.doi === S.u.doi);
      const tt = {}; cuaDoi.forEach((x) => { tt[x.ma] = { tt: 'Có mặt' }; });
      d.rows.forEach((r) => { if (tt[r.ma]) tt[r.ma] = { tt: r.tt, gioVe: r.gioVe, lyDo: r.lyDo }; });
      const khoa = daGui && daGui.khoa;
      const ve = () => {
        const nhomTen = (x) => (x.doi ? x.doi : 'Chưa phân đội');
        let cu = ''; let html = '';
        cuaDoi.forEach((x) => {
          if (nhomTen(x) !== cu) { cu = nhomTen(x); html += `<div class="nhom-ten">${esc(cu)}</div>`; }
          const t = tt[x.ma];
          html += `<div class="muc"><div class="gian"><div>${esc(x.ten)}</div><div class="mo">${esc(x.cd || '')}${t.tt === 'Về sớm' ? ` · về ${esc(t.gioVe)} · ${esc(t.lyDo)}` : ''}</div></div>
            <div class="tt3">${[['co', 'Có mặt', 'Có'], ['vang', 'Vắng', 'Vắng'], ['som', 'Về sớm', 'Về sớm']].map((b) => `<button class="${b[0]} ${t.tt === b[1] ? 'dang' : ''}" data-ma="${x.ma}" data-tt="${b[1]}" ${khoa ? 'disabled' : ''}>${b[2]}</button>`).join('')}</div></div>`;
        });
        const co = Object.values(tt).filter((t) => t.tt === 'Có mặt').length;
        m.innerHTML = dau + (khoa ? '<div class="the"><span class="chip xanh">Anh Vũ đã duyệt và khóa buổi này</span></div>' : daGui ? '<div class="the"><span class="chip cam">Đã gửi · chờ anh Vũ duyệt. Sửa rồi gửi lại được.</span></div>' : '')
          + `<div class="ds">${html}</div>` + (khoa ? '' : `<button class="nut chinh rong" id="gui">Gửi điểm danh buổi ${st.buoi.toLowerCase()} · ${co}/${cuaDoi.length} có mặt</button>`);
        ganDau();
        m.querySelectorAll('[data-tt]').forEach((b) => {
          b.onclick = () => {
            const ma = b.dataset.ma;
            if (b.dataset.tt !== 'Về sớm') { tt[ma] = { tt: b.dataset.tt }; return ve(); }
            hop(`<h2>Về sớm</h2><label class="o"><span>Giờ về</span><input type="time" id="gv" value="${new Date().toTimeString().slice(0, 5)}"></label>
              <label class="o"><span>Lý do</span><input type="text" id="ld" placeholder="Ví dụ: việc gia đình"></label>
              <p class="mo">Về sớm tính 0 công cho buổi này, anh Vũ sẽ xác nhận.</p><button class="nut chinh rong" id="ok">Xong</button>`, (o, dong) => {
              o.querySelector('#ok').onclick = () => { tt[ma] = { tt: 'Về sớm', gioVe: o.querySelector('#gv').value, lyDo: o.querySelector('#ld').value }; dong(); ve(); };
            });
          };
        });
        const g = m.querySelector('#gui');
        if (g) g.onclick = () => chay(async () => {
          await API.goi('diemDanh.gui', { ngay: st.ngay, buoi: st.buoi, ds: Object.keys(tt).map((ma) => Object.assign({ ma }, tt[ma])) });
          bao('Đã gửi, chờ anh Vũ duyệt'); manDiemDanh();
        }, g);
      };
      ve();
      return;
    }
    ganDau();
    function ganDau() {
      m.querySelectorAll('[data-b]').forEach((b) => { b.onclick = () => { st.buoi = b.dataset.b; manDiemDanh(); }; });
      const n = m.querySelector('#ngay');
      n.onclick = () => {
        const v = prompt('Ngày (dd/mm/yyyy)', ngayVN(st.ngay)); if (!v) return;
        const p = v.split('/'); if (p.length !== 3) return bao('Sai định dạng ngày', true);
        st.ngay = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`; manDiemDanh();
      };
    }
  }

  /* ================= ĐỊNH KỲ ================= */
  async function manDinhKy() {
    const st = manDinhKy.st || (manDinhKy.st = { viec: 'DV01', cum: '', tim: '' });
    const maTuUrl = location.hash.split('/')[2]; if (maTuUrl) st.viec = maTuUrl;
    const k = S.dm.ky;
    const m = khung('Việc định kỳ', `Kỳ ${k.ten} · ${ngayVN(k.tu)}–${ngayVN(k.den)}`);
    let ticks = await API.goi('dinhKy.lay', {});
    const vt = S.dm.vitri.filter((v) => v.ap === 'Có');
    const cums = [...new Set(vt.map((v) => v.cum))];
    const ghi = q('dinhky') >= 2;
    const ve = () => {
      const lan = {}; ticks.filter((t) => t.viec === st.viec).forEach((t) => { lan[t.vt] = Math.max(lan[t.vt] || 0, +t.lan || 1); });
      const ds = vt.filter((v) => (!st.cum || v.cum === st.cum) && (!st.tim || (v.ten + ' ' + v.kv).toLowerCase().includes(st.tim.toLowerCase())));
      const xong = vt.filter((v) => lan[v.ma]).length;
      let cu = ''; let html = '';
      ds.forEach((v) => {
        if (v.kv !== cu) { cu = v.kv; html += `<div class="nhom-ten">${esc(cu)}</div>`; }
        const n = lan[v.ma] || 0;
        html += `<div class="muc"><div class="gian">${esc(v.ten)}</div><button class="tick ${n > 1 ? 'them' : n ? 'xong' : ''}" data-vt="${v.ma}" ${ghi ? '' : 'disabled'}>${n > 1 ? '×' + n : '✓'}</button></div>`;
      });
      m.innerHTML = `<div class="chon">${S.dm.dauviec.map((v) => `<button data-v="${v.ma}" class="${st.viec === v.ma ? 'dang' : ''}">${esc(v.ten)}</button>`).join('')}</div>
        <div class="the" style="padding:12px"><div class="hang" style="margin-bottom:6px"><b class="gian">${esc(S.dm.dauviec.find((v) => v.ma === st.viec).ten)}</b><b>${xong}/${vt.length}</b></div>
        <div class="thanh"><i style="width:${Math.round(xong / vt.length * 100)}%"></i></div></div>
        <input type="search" id="tim" placeholder="Tìm vị trí, ví dụ: Villa 32" value="${esc(st.tim)}" style="margin-bottom:10px">
        <div class="chon"><button data-c="" class="${!st.cum ? 'dang' : ''}">Tất cả</button>${cums.map((c) => `<button data-c="${esc(c)}" class="${st.cum === c ? 'dang' : ''}">${esc(c)}</button>`).join('')}</div>
        <div class="ds">${html || '<div class="muc mo">Không có vị trí phù hợp</div>'}</div>`;
      m.querySelectorAll('[data-v]').forEach((b) => { b.onclick = () => { st.viec = b.dataset.v; history.replaceState(null, '', '#/dinhky'); ve(); }; });
      m.querySelectorAll('[data-c]').forEach((b) => { b.onclick = () => { st.cum = b.dataset.c; ve(); }; });
      const tim = m.querySelector('#tim');
      tim.oninput = () => { st.tim = tim.value; clearTimeout(ve.t); ve.t = setTimeout(() => { ve(); const t2 = m.querySelector('#tim'); t2.focus(); t2.setSelectionRange(t2.value.length, t2.value.length); }, 300); };
      m.querySelectorAll('[data-vt]').forEach((b) => {
        b.onclick = () => {
          const ma = b.dataset.vt;
          const tick = (lyDo) => chay(async () => {
            await API.goi('dinhKy.tick', { viec: st.viec, vt: ma, lyDo });
            ticks = await API.goi('dinhKy.lay', {}); ve();
          }, b);
          if (!lan[ma]) return tick();
          const cuaToi = ticks.some((t) => t.viec === st.viec && t.vt === ma && t.ngay === API.ngay() && t.nguoi === S.u.ten);
          hop(`<h2>${esc(tenVT(ma))}</h2><p class="mo" style="margin-top:0">Đã làm ${lan[ma]} lần trong kỳ. Lần đầu mới tính vào tiến độ; làm thêm được ghi vào báo cáo "Việc làm thêm ngoài tần suất".</p>
            ${LY_DO_THEM.map((l) => `<button class="nut rong" style="margin-bottom:8px" data-l="${l}">Làm thêm · ${l}</button>`).join('')}
            ${cuaToi ? '<button class="nut do rong" id="bo">Bỏ đánh dấu vừa đánh nhầm</button>' : ''}`, (o, dong) => {
            o.querySelectorAll('[data-l]').forEach((x) => { x.onclick = () => { dong(); tick(x.dataset.l); }; });
            const bo = o.querySelector('#bo');
            if (bo) bo.onclick = () => chay(async () => { await API.goi('dinhKy.boTick', { viec: st.viec, vt: ma }); dong(); ticks = await API.goi('dinhKy.lay', {}); ve(); }, bo);
          });
        };
      });
    };
    ve();
  }

  /* ================= PHIẾU ================= */
  const MAU_TT = { 'Mới': 'cam', 'Đang xử lý': '', 'Báo xong': 'xanh', 'Bị trả lại': 'do', 'Đã duyệt': 'xanh' };
  async function manPhieu() {
    const st = manPhieu.st || (manPhieu.st = { tab: 'mo' });
    const m = khung('Phiếu', 'Lỗi cảnh quan, sự cố cần xử lý');
    const ds = await API.goi('phieu.ds');
    const TAB = { mo: ['Mới', 'Đang xử lý', 'Bị trả lại'], cho: ['Báo xong'], xong: ['Đã duyệt'] };
    const loc = ds.filter((p) => TAB[st.tab].includes(p.tt));
    m.innerHTML = `${q('phieu') >= 2 ? '<button class="nut chinh rong" id="tao" style="margin-bottom:12px">＋ Tạo phiếu</button>' : ''}
      <div class="chon">${[['mo', 'Đang mở'], ['cho', 'Chờ duyệt'], ['xong', 'Đã xong']].map((t) => `<button data-t="${t[0]}" class="${st.tab === t[0] ? 'dang' : ''}">${t[1]} (${ds.filter((p) => TAB[t[0]].includes(p.tt)).length})</button>`).join('')}</div>
      <div class="ds">${loc.length ? loc.map((p) => `<div class="muc" data-ma="${esc(p.ma)}" style="cursor:pointer"><div class="gian"><div><b>${esc(p.loai)}</b></div>
        <div class="mo">${esc(p.vt ? tenVT(p.vt) : p.vtKhac)} · hạn ${esc(hanVN(p.han))}</div></div>
        <div style="text-align:right"><span class="chip ${MAU_MUC[p.muc]}">${esc(p.muc)}</span><br><span class="chip ${MAU_TT[p.tt]}" style="margin-top:4px">${esc(p.tt)}</span></div></div>`).join('')
        : '<div class="muc mo">Không có phiếu</div>'}</div>`;
    m.querySelectorAll('[data-t]').forEach((b) => { b.onclick = () => { st.tab = b.dataset.t; manPhieu(); }; });
    m.querySelectorAll('[data-ma]').forEach((r) => { r.onclick = () => chiTietPhieu(ds.find((p) => p.ma === r.dataset.ma)); });
    const t = m.querySelector('#tao'); if (t) t.onclick = taoPhieu;
  }

  function taoPhieu() {
    const nhom = [...new Set(S.dm.loi.map((l) => l.nhom))];
    let anh = ''; let muc = 'Trung bình';
    hop(`<h2>Tạo phiếu</h2>
      <label class="o"><span>Loại lỗi</span><select id="loai"><option value="">— Chọn —</option>${nhom.map((n) => `<optgroup label="${esc(n)}">${S.dm.loi.filter((l) => l.nhom === n).map((l) => `<option>${esc(l.ten)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <label class="o"><span>Mức độ</span><div class="chon" id="muc">${MUC.map((x) => `<button type="button" data-m="${x}">${x}</button>`).join('')}</div></label>
      <label class="o"><span>Vị trí</span><input type="text" id="vt" list="dsvt" placeholder="Gõ để tìm, ví dụ: Villa 32"><datalist id="dsvt">${S.dm.vitri.map((v) => `<option value="${esc(v.ten + ' · ' + v.kv)}">`).join('')}</datalist></label>
      <label class="o"><span>Mô tả thêm (không bắt buộc)</span><textarea id="mt"></textarea><button type="button" class="nut nho" id="mic" style="margin-top:6px">🎤 Nói</button></label>
      <div class="o" style="margin-bottom:14px"><span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Ảnh hiện trạng</span><div id="anh"></div></div>
      <button class="nut chinh rong" id="luu">Tạo phiếu</button>`, (o, dong) => {
      const datMuc = (x) => { muc = x; o.querySelectorAll('[data-m]').forEach((b) => b.classList.toggle('dang', b.dataset.m === x)); };
      datMuc(muc);
      o.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => datMuc(b.dataset.m); });
      o.querySelector('#loai').onchange = (e) => { const l = S.dm.loi.find((x) => x.ten === e.target.value); if (l && MUC.includes(l.muc)) datMuc(l.muc); };
      gangMic(o.querySelector('#mic'), o.querySelector('#mt'));
      oAnh(o.querySelector('#anh'), (d) => { anh = d; });
      o.querySelector('#luu').onclick = (e) => chay(async () => {
        const loai = o.querySelector('#loai').value; if (!loai) throw new Error('Chọn loại lỗi');
        const go = o.querySelector('#vt').value.trim(); if (!go) throw new Error('Nhập vị trí');
        const v = S.dm.vitri.find((x) => (x.ten + ' · ' + x.kv) === go);
        const r = await API.goi('phieu.tao', { loai, nhom: (S.dm.loi.find((x) => x.ten === loai) || {}).nhom, muc, vt: v ? v.ma : '', vtKhac: v ? '' : go, moTa: o.querySelector('#mt').value, anh });
        dong(); bao('Đã tạo phiếu ' + r.ma); manPhieu();
      }, e.target);
    });
  }

  function chiTietPhieu(p) {
    let anh = '';
    const duyet = q('phieu') >= 3; const ghi = q('phieu') >= 2;
    hop(`<div class="hang" style="margin-bottom:6px"><h2 class="gian" style="margin:0">${esc(p.loai)}</h2><span class="chip ${MAU_MUC[p.muc]}">${esc(p.muc)}</span></div>
      <p class="mo" style="margin-top:0">${esc(p.ma)} · ${esc(p.vt ? tenVT(p.vt) : p.vtKhac)}<br>Tạo bởi ${esc(p.tao)} lúc ${esc(p.gioTao)} · hạn ${esc(hanVN(p.han))}
      ${p.nhan ? `<br>Người nhận: ${esc(p.nhan)}` : ''}${+p.traLai ? `<br>Đã bị trả lại ${p.traLai} lần` : ''}</p>
      ${p.moTa ? `<p>${esc(p.moTa)}</p>` : ''}
      <div class="luoi2">${p.anhTruoc ? `<div><div class="mo">Trước</div><img class="xem-anh" src="${esc(API.anhUrl(p.anhTruoc))}" alt=""></div>` : ''}
      ${p.anhSau ? `<div><div class="mo">Sau</div><img class="xem-anh" src="${esc(API.anhUrl(p.anhSau))}" alt=""></div>` : ''}</div>
      <div id="hanhDong" style="margin-top:14px"></div>`, (o, dong) => {
      const hd = o.querySelector('#hanhDong');
      const lam = (action, body, msg) => (e) => chay(async () => { await API.goi(action, Object.assign({ ma: p.ma }, body || {})); dong(); bao(msg); manPhieu(); }, e.target);
      if (ghi && (p.tt === 'Mới' || p.tt === 'Bị trả lại') && !(p.tt === 'Bị trả lại' && p.nhan)) {
        hd.innerHTML = '<button class="nut chinh rong">Nhận việc</button>'; hd.firstChild.onclick = lam('phieu.nhan', null, 'Đã nhận việc');
      } else if (ghi && (p.tt === 'Đang xử lý' || p.tt === 'Bị trả lại')) {
        hd.innerHTML = '<div id="anhSau"></div><button class="nut chinh rong" style="margin-top:10px">Báo xong</button>';
        oAnh(hd.querySelector('#anhSau'), (d) => { anh = d; });
        hd.lastChild.onclick = (e) => { if (!anh) return bao('Chụp ảnh sau khi xử lý', true); lam('phieu.xong', { anh }, 'Đã báo xong, chờ anh Vũ duyệt')(e); };
      } else if (duyet && p.tt === 'Báo xong') {
        hd.innerHTML = '<div class="nhom-nut"><button class="nut" data-x="tra">Trả lại</button><button class="nut chinh" data-x="duyet">Duyệt</button></div>';
        hd.querySelector('[data-x=duyet]').onclick = lam('phieu.duyet', null, 'Đã duyệt');
        hd.querySelector('[data-x=tra]').onclick = (e) => { const g = prompt('Lý do trả lại'); if (g !== null) lam('phieu.traLai', { ghiChu: g }, 'Đã trả lại')(e); };
      }
    });
  }

  /* ================= THÊM ================= */
  async function manThem() {
    const m = khung('Thêm', S.u.vaiTro || S.u.nhom);
    const SAP = [['kehoach', '📅 Lịch, kế hoạch tuần / tháng'], ['sukien', '🎉 Sự kiện'], ['duan', '🏗️ Dự án'], ['phunbon', '🧪 Nhật ký phun, bón'],
      ['phieu', '🐛 Hồ sơ dịch hại · Sổ trồng cây'], ['tuantra', '🚶 Tuần tra'], ['noibo', '🥬 Việc nội bộ'], ['vuonuom', '🌱 Vườn ươm cây bụi'],
      ['donghonuoc', '💧 Đồng hồ nước'], ['congnhan', '👷 Công nhân'], ['ai', '🔍 AI nhận diện cây, sâu bệnh'], ['baocao', '📊 Báo cáo'], ['danhmuc', '⚙️ Danh mục, phân quyền']];
    const ten = ['', 'Xem', 'Ghi', 'Duyệt'];
    m.innerHTML = `<div class="the"><h2>${esc(S.u.ten)}</h2><p class="mo" style="margin:0">${esc(S.u.nhom)}${S.u.doi ? ' · ' + esc(S.u.doi) : ''}</p></div>
      <div class="ds"><div class="nhom-ten">Phân hệ khác · đang hoàn thiện</div>
      ${SAP.filter((s) => q(s[0])).map((s) => `<div class="muc"><div class="gian">${s[1]}</div><span class="chip">${ten[q(s[0])]}</span></div>`).join('')}</div>
      ${API.thu() ? '<button class="nut rong" id="xoa" style="margin-bottom:10px">Xóa dữ liệu chạy thử</button>' : ''}
      <button class="nut rong" id="ra">${API.thu() ? 'Đổi vai / thoát chạy thử' : 'Đăng xuất'}</button>
      <p class="mo" style="text-align:center;margin-top:16px">GreenLog ${esc(window.GL_CONFIG.PHIEN_BAN)}</p>`;
    const x = m.querySelector('#xoa'); if (x) x.onclick = () => { if (confirm('Xóa hết điểm danh, đánh dấu, phiếu đã thử trên máy này?')) { API.xoaDuLieuThu(); bao('Đã xóa'); } };
    m.querySelector('#ra').onclick = () => { API.dangXuat(); window.onhashchange = null; S.u = null; history.replaceState(null, '', location.pathname); manVao(); };
  }

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  batDau();
})();
