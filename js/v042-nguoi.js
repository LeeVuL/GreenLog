/* GreenLog 0.4.2 · mục 80 ảnh đại diện · mục 81 xuất danh mục cây, thuốc */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, chay, bao } = G;
  let AV = null;
  const napAV = async () => { if (AV) return AV; AV = {}; try { (await G.doc('AnhDaiDien')).forEach((r) => { AV[r['Tên']] = r['Ảnh'] ? API.anhUrl(Array.isArray(r['Ảnh']) ? r['Ảnh'][0] : String(r['Ảnh']).split('|')[0]) : ''; }); } catch (e) { /* chưa có bảng */ } return AV; };
  G.anhNguoi = (ten) => (AV && AV[ten]) || '';
  G.avatar = (ten, px) => { const u = G.anhNguoi(ten); px = px || 32; if (!u && G.tenHT && G.tenHT(ten) !== ten) ten = 'TB'; return u ? `<img class="av-img" src="${esc(u)}" alt="" style="width:${px}px;height:${px}px">` : `<span class="av-chu" style="width:${px}px;height:${px}px;font-size:${Math.round(px * 0.45)}px">${esc((String(ten || '?').split(' ').pop() || '?')[0])}</span>`; };
  const gan = () => { const b = document.getElementById('nutTk'); if (!b || !S.u) return; const u = G.anhNguoi(S.u.ten); if (!u && G.laAnhVu() && !b.querySelector('img')) b.textContent = 'TB'; if (u && !b.querySelector('img')) b.innerHTML = `<img src="${esc(u)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`; };
  const khungFn = G.khung;
  G.khung = function (...a) { const m = khungFn.apply(this, a); napAV().then(gan); if (/^#\/them\/?$/.test(location.hash)) [300, 900, 1800].forEach((t) => setTimeout(() => theTK(), t)); return m; };

  /* cắt ảnh vuông: kéo để căn, thanh trượt để phóng to */
  const catAnh = (file) => new Promise((ok, loi) => { const img = new Image(); img.onload = () => {
    G.hop('Căn ảnh đại diện', `<div style="display:flex;justify-content:center"><canvas id="cv" width="280" height="280" style="border-radius:50%;touch-action:none;background:#EEF2EE;max-width:100%"></canvas></div>
      <label class="o"><span>Phóng to</span><input type="range" id="zm" min="1" max="3" step="0.05" value="1"></label><p class="mo">Kéo ảnh để đưa khuôn mặt vào giữa khung tròn.</p><button class="nut chinh rong" id="l">Dùng ảnh này</button>`, (o, dong) => {
      const cv = o.querySelector('#cv'); const c = cv.getContext('2d'); const co = Math.min(img.width, img.height); let z = 1, dx = 0, dy = 0, keo = null;
      const ve = () => { const s = co / z; const x = Math.max(0, Math.min(img.width - s, (img.width - s) / 2 - dx)); const y = Math.max(0, Math.min(img.height - s, (img.height - s) / 2 - dy)); c.clearRect(0, 0, 280, 280); c.drawImage(img, x, y, s, s, 0, 0, 280, 280); };
      o.querySelector('#zm').oninput = (e) => { z = +e.target.value; ve(); };
      cv.onpointerdown = (e) => { keo = [e.clientX, e.clientY, dx, dy]; cv.setPointerCapture(e.pointerId); };
      cv.onpointermove = (e) => { if (!keo) return; const k = co / z / 280; dx = keo[2] + (e.clientX - keo[0]) * k; dy = keo[3] + (e.clientY - keo[1]) * k; ve(); };
      cv.onpointerup = () => { keo = null; };
      ve();
      o.querySelector('#l').onclick = () => { const out = document.createElement('canvas'); out.width = out.height = 256; out.getContext('2d').drawImage(cv, 0, 0, 280, 280, 0, 0, 256, 256); dong(); ok(out.toDataURL('image/jpeg', 0.85)); };
    }); }; img.onerror = loi; img.src = URL.createObjectURL(file); });
  const chonFile = () => new Promise((ok) => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = () => ok(i.files[0]); i.click(); });
  const luuAV = async (ten, anh) => { await API.goi('ghiNhieu', { bang: 'AnhDaiDien', thay: ['Tên'], dong: [{ 'Tên': ten, 'Ảnh': anh, 'Người sửa': S.u.ten, 'Giờ sửa': API.bayGio() }] }); AV = null; await napAV(); };
  G.doiAnhDaiDien = (ten) => G.hop('Ảnh đại diện', `<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">${G.avatar(ten, 72)}<b>${esc(ten)}</b></div>
    <div class="nhom-nut" style="flex-wrap:wrap"><button class="nut chinh" id="chon">📷 Chụp / chọn ảnh</button><button class="nut" id="dan">📋 Dán ảnh</button>${G.anhNguoi(ten) ? '<button class="nut" id="xoa">Xóa ảnh</button>' : ''}</div>`, (o, dong) => {
    const xuly = async (f) => { if (!f) return; const anh = await catAnh(f); await chay(async () => { const id = API.taiAnh ? await API.taiAnh(anh) : anh; await luuAV(ten, id || anh); dong(); bao('Đã đổi ảnh đại diện'); G.taiLai(); }); };
    o.querySelector('#chon').onclick = async () => xuly(await chonFile());
    o.querySelector('#dan').onclick = async () => { try { const it = await navigator.clipboard.read(); for (const x of it) { const t = x.types.find((y) => y.startsWith('image/')); if (t) return xuly(await x.getType(t)); } bao('Chưa có ảnh trong bộ nhớ tạm', true); } catch (e) { bao('Máy không cho dán ảnh, hãy chọn từ máy', true); } };
    const x = o.querySelector('#xoa'); if (x) x.onclick = () => chay(async () => { await luuAV(ten, ''); dong(); bao('Đã xóa ảnh'); G.taiLai(); }, x);
  });
  /* màn Thêm: thẻ tài khoản; Trưởng bộ phận đổi ảnh cho mọi người */
  const theTK = async () => { const m = document.getElementById('noiDung'); if (!m || m.querySelector('.the-tk') || m.querySelector('.dang-tai')) return; await napAV(); if (m.querySelector('.the-tk')) return;
    const ds = G.laAnhVu() ? [...new Set([S.u.ten].concat((S.dm.nguoi || []).map((x) => x.ten)).concat((S.dm.congnhan || []).filter((x) => x.tt !== 'Đã nghỉ').map((x) => x.ten)).filter(Boolean))] : [S.u.ten];
    m.insertAdjacentHTML('afterbegin', `<div class="the the-tk"><div style="display:flex;align-items:center;gap:12px">${G.avatar(S.u.ten, 56)}<div class="gian"><b>${esc(S.u.ten)}</b><div class="mo">${esc(S.u.vaiTro || S.u.nhom || '')}</div></div><button class="nut nho" data-av="${esc(S.u.ten)}">Đổi ảnh đại diện</button></div>
      ${ds.length > 1 ? `<details style="margin-top:10px"><summary class="mo">Ảnh đại diện của mọi người (${ds.length - 1})</summary><div class="ds">${ds.slice(1).map((t) => `<div class="muc" style="gap:10px">${G.avatar(t, 36)}<div class="gian">${esc(t)}</div><button class="nut nho" data-av="${esc(t)}">Đổi</button></div>`).join('')}</div></details>` : ''}</div>`);
    m.querySelectorAll('[data-av]').forEach((b) => { b.onclick = () => G.doiAnhDaiDien(b.dataset.av); });
  };

  /* ---------- mục 81: xuất danh mục cây trồng, thuốc phân ---------- */
  const nutXuat = (m, fn) => { if (m.querySelector('.nut-xuatdm')) return; const b = G.h('<button class="nut nut-xuatdm" style="margin:0 0 10px">⬇ Xuất dữ liệu</button>'); b.onclick = fn; m.insertBefore(b, m.firstChild); };
  const dangLoc = (m) => { const o = m.querySelector('input[type=search], input[placeholder*="Tìm"]'); return o ? o.value.trim().toLowerCase() : ''; };
  const cayFn = G.man.danhmuccay && G.man.danhmuccay.fn;
  if (cayFn) G.man.danhmuccay.fn = async (...a) => { await cayFn(...a); if (a[0]) return; const m = document.getElementById('noiDung'); if (!m) return;
    nutXuat(m, async () => { const d = await G.anhDM(); const q = dangLoc(m); const cay = (S.dm.cay || []).filter((c) => !q || JSON.stringify(c).toLowerCase().includes(q));
      const cot = ['Tên Việt', 'Tên Anh', 'Tên khoa học', 'Nhóm', 'Dịch hại thường gặp', 'Thuốc đề xuất', 'Số ảnh', 'Link ảnh'];
      const dong = cay.map((c) => { const an = ((d.cay || {})[c.ten] || {}).anh || []; return [c.ten, c.en || c.tenEn || '', c.kh || c.khoaHoc || '', c.nhom || '', [].concat(c.dichHai || c.sau || c.dh || []).join(', '), [].concat(c.thuoc || []).join(', '), an.length, an.map((x) => x.url).join(' | ')]; });
      const anh = cay.flatMap((c) => (((d.cay || {})[c.ten] || {}).anh || []).map((x, i) => ({ ten: `${c.ten}_${x.goc || i + 1}`, url: x.url })));
      G.xuatChon({ ten: 'DanhMucCay_' + API.ngay(), tieuDe: `Danh mục cây trồng${q ? ' (lọc: ' + q + ')' : ''}`, cot, dong, anh,
        pdfHtml: `<h2>Danh mục cây trồng</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${cay.map((c) => { const an = ((d.cay || {})[c.ten] || {}).anh || []; return `<div style="border:1px solid #ccd;border-radius:8px;padding:8px;break-inside:avoid">${an[0] ? `<img src="${esc(an[0].url)}" style="width:100%;height:140px;object-fit:cover;border-radius:6px">` : ''}<b>${esc(c.ten)}</b><div style="font-size:11px;color:#556"><i>${esc(c.kh || c.khoaHoc || '')}</i> · ${esc(c.nhom || '')}</div></div>`; }).join('')}</div>` }); }); };
  const thuocFn = G.man.thuoc && G.man.thuoc.fn;
  if (thuocFn) G.man.thuoc.fn = async (...a) => { await thuocFn(...a); if (a[0]) return; const m = document.getElementById('noiDung'); if (!m) return;
    nutXuat(m, async () => { const d = await G.anhDM(); const q = dangLoc(m); const ds = (S.dm.thuoc || []).filter((t) => !q || JSON.stringify(t).toLowerCase().includes(q));
      const cot = ['Tên', 'Nhóm', 'Hoạt chất', 'ĐVT', 'Liều / bình 16 L', 'Cách ly (ngày)', 'Bảo hộ', 'Link ảnh'];
      const anhT = (t) => (G.anhThuocDong ? G.anhThuocDong(d, t.ten) : ((d.thuoc || {})[t.ten] || {}).anh || []);
      const dong = ds.map((t) => [t.ten, t.nhom || '', t.hoatChat || t.hc || '', t.dvt || '', t.lieu16 || '', t.cachLy || '', [].concat(t.baoHo || []).join(', '), anhT(t).map((x) => x.url).join(' | ')]);
      const anh = ds.flatMap((t) => anhT(t).map((x, i) => ({ ten: `${t.ten}_${i + 1}`, url: x.url })));
      G.xuatChon({ ten: 'DanhMucThuocPhan_' + API.ngay(), tieuDe: `Danh mục thuốc, phân${q ? ' (lọc: ' + q + ')' : ''}`, cot, dong, anh }); }); };
})();
