/* GreenLog – công cụ giao diện dùng chung */
(function () {
  const API = window.GL_API;
  const G = window.GL = { S: { dm: null, u: null }, man: {} };

  G.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const esc = G.esc;
  G.h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  G.q = (ph) => (G.S.u && G.S.u.quyen[ph]) || 0;
  G.ngayVN = (d) => { const p = String(d || '').split(' ')[0].split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : (d || ''); };
  G.gioVN = (v) => { const m = String(v || '').match(/^\d{4}-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/); return m ? `${m[2]}/${m[1]} ${m[3]}` : (v || ''); };
  G.thu = (d) => ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][(d ? new Date(d) : new Date()).getDay()];
  G.so = (n, k) => Number(n || 0).toLocaleString('vi-VN', { maximumFractionDigits: k == null ? 1 : k });
  G.vt = (ma) => (G.S.dm.vitri.find((x) => x.ma === ma) || null);
  G.tenVT = (ma, khac) => { const v = G.vt(ma); return v ? `${v.ten} · ${v.kv}` : (khac || ma || ''); };
  G.cumCua = (ma) => (G.vt(ma) || {}).cum || '';

  G.bao = function (msg, loi) {
    const b = G.h(`<div class="bao${loi ? ' loi' : ''}">${esc(msg)}</div>`);
    document.body.appendChild(b); setTimeout(() => b.remove(), loi ? 5000 : 2400);
  };
  G.chay = async function (fn, nut) {
    const cu = nut && nut.innerHTML;
    if (nut) { nut.disabled = true; if (nut.tagName === 'BUTTON' && nut.classList.contains('nut')) nut.innerHTML = '⏳ Đang lưu…'; }
    try { return await fn(); } catch (e) { console.error(e); G.bao(e.message || String(e), true); } finally { if (nut && nut.isConnected) { nut.disabled = false; if (cu != null && nut.innerHTML.startsWith('⏳')) nut.innerHTML = cu; } }
  };
  /* cửa sổ trượt từ dưới lên */
  G.hop = function (tieuDe, html, onMo, rong) {
    const lop = G.h(`<div class="lop-phu"><div class="hop${rong ? ' rong' : ''}"><div class="hop-dau"><h2>${esc(tieuDe)}</h2><button class="x" aria-label="Đóng">✕</button></div><div class="hop-than">${html}</div></div></div>`);
    const dong = () => { lop.remove(); document.removeEventListener('keydown', esc_); };
    const esc_ = (e) => { if (e.key === 'Escape') dong(); };
    lop.addEventListener('click', (e) => { if (e.target === lop) dong(); });
    lop.querySelector('.x').onclick = dong;
    document.addEventListener('keydown', esc_);
    document.body.appendChild(lop);
    if (onMo) onMo(lop.querySelector('.hop-than'), dong);
    return dong;
  };
  G.xacNhan = (cau, nut) => new Promise((ok) => {
    G.hop('Xác nhận', `<p>${esc(cau)}</p><div class="nhom-nut"><button class="nut" data-k="0">Không</button><button class="nut chinh" data-k="1">${esc(nut || 'Đồng ý')}</button></div>`, (o, dong) => {
      o.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => { dong(); ok(b.dataset.k === '1'); }; });
    });
  });
  G.hoi = (cau, macDinh) => new Promise((ok) => {
    G.hop(cau, `<input type="text" id="tl" value="${esc(macDinh || '')}"><div class="nhom-nut" style="margin-top:12px"><button class="nut" data-k="0">Hủy</button><button class="nut chinh" data-k="1">Xong</button></div>`, (o, dong) => {
      const i = o.querySelector('#tl'); setTimeout(() => i.focus(), 50);
      o.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => { dong(); ok(b.dataset.k === '1' ? i.value : null); }; });
    });
  });

  /* ---------- Chọn 2 bước: nhóm → mục, có ô tìm nhanh ---------- */
  G.chonHaiBuoc = function (tieuDe, nhom, opt) {
    opt = opt || {};
    return new Promise((ok) => {
      let dangNhom = nhom.length === 1 ? nhom[0] : null; let xong = false; const motNhom = nhom.length === 1;
      G.hop(tieuDe, `<input type="search" class="tim" placeholder="${esc(opt.goiY || 'Gõ để tìm nhanh…')}"><div class="ds2"></div>`, (o, dong) => {
        const tim = o.querySelector('.tim'); const ds = o.querySelector('.ds2');
        const chon = (m) => { xong = true; dong(); ok(m); };
        const ve = () => {
          const t = tim.value.trim().toLowerCase();
          if (t) {
            const kq = [];
            nhom.forEach((n) => n.ds.forEach((m) => { if ((m.ten + ' ' + (m.phu || '') + ' ' + n.ten).toLowerCase().includes(t)) kq.push([n, m]); }));
            ds.innerHTML = kq.length ? kq.slice(0, 80).map(([n, m], i) => `<button class="dong2" data-i="${i}"><b>${esc(m.ten)}</b><small>${esc(n.ten)}${m.phu ? ' · ' + esc(m.phu) : ''}</small></button>`).join('')
              : `<p class="mo">Không thấy. ${opt.choKhac ? 'Bấm nút dưới để dùng đúng chữ vừa gõ.' : ''}</p>`;
            if (opt.choKhac) { const b = G.h(`<button class="nut rong" style="margin-top:8px">Dùng "${esc(tim.value.trim())}"</button>`); b.onclick = () => chon({ ten: tim.value.trim(), khac: true }); ds.appendChild(b); }
            ds.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => chon(kq[+b.dataset.i][1]); });
            return;
          }
          if (!dangNhom) {
            ds.innerHTML = nhom.map((n, i) => `<button class="dong2 nhom" data-n="${i}"><b>${esc(n.ten)}</b><small>${n.ds.length} mục ›</small></button>`).join('');
            ds.querySelectorAll('[data-n]').forEach((b) => { b.onclick = () => { dangNhom = nhom[+b.dataset.n]; ve(); }; });
          } else {
            ds.innerHTML = (motNhom ? '' : `<button class="lui">‹ ${esc(dangNhom.ten)}</button>`) + (opt.caNhom ? `<button class="dong2 ca"><b>Cả ${esc(dangNhom.ten)}</b></button>` : '')
              + dangNhom.ds.map((m, i) => `<button class="dong2" data-i="${i}"><b>${esc(m.ten)}</b>${m.phu ? `<small>${esc(m.phu)}</small>` : ''}</button>`).join('');
            if (!motNhom) ds.querySelector('.lui').onclick = () => { dangNhom = null; ve(); };
            const ca = ds.querySelector('.ca'); if (ca) ca.onclick = () => chon({ caNhom: true, ten: dangNhom.ten, nhom: dangNhom });
            ds.querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => chon(dangNhom.ds[+b.dataset.i]); });
          }
        };
        tim.oninput = ve; ve();
      });
      const kt = setInterval(() => { if (!document.querySelector('.lop-phu .ds2')) { clearInterval(kt); if (!xong) ok(null); } }, 300);
    });
  };
  const nhomTheo = (ds, khoa, map) => { const o = {}; ds.forEach((x) => { const k = khoa(x) || 'Khác'; (o[k] = o[k] || []).push(map(x)); }); return Object.keys(o).map((k) => ({ ten: k, ds: o[k] })); };
  G.chonViTri = (opt) => {
    opt = opt || {};
    let ds = G.S.dm.vitri; if (opt.chiApDung) ds = ds.filter((v) => v.ap === 'Có');
    return G.chonHaiBuoc('Chọn vị trí', nhomTheo(ds, (v) => v.cum, (v) => ({ ma: v.ma, ten: v.ten, phu: v.kv, cum: v.cum, kv: v.kv })), { goiY: 'Tìm vị trí, ví dụ: Villa 32', choKhac: opt.choKhac !== false, caNhom: opt.caNhom });
  };
  G.chonLoi = () => G.chonHaiBuoc('Chọn lỗi', nhomTheo(G.S.dm.loi, (l) => l.nhom, (l) => ({ ten: l.ten, phu: 'Gợi ý: ' + l.muc, muc: l.muc, nhom: l.nhom })), { goiY: 'Tìm lỗi, ví dụ: béc, cỏ dại, cành gãy', choKhac: true });
  G.chonCay = (chiTrong) => G.chonHaiBuoc('Chọn cây', nhomTheo(G.S.dm.cay.filter((c) => !chiTrong || c.trong !== 'Không'), (c) => c.nhom, (c) => ({ ma: c.ma, ten: c.ten, phu: c.kh, nhom: c.nhom })), { goiY: 'Tìm cây, tên Việt hoặc tên khoa học', choKhac: true });
  G.nhomThuoc = (t) => (/thuốc/i.test(t.nhom) && !/phân bón lá/i.test(t.nhom) ? 'Thuốc bảo vệ thực vật' : /lá/i.test(t.nhom) ? 'Phân bón lá, kích thích' : /phân/i.test(t.nhom) ? 'Phân bón gốc' : 'Phụ gia, khác');
  G.chonThuoc = () => G.chonHaiBuoc('Chọn thuốc / phân', nhomTheo(G.S.dm.thuoc.filter((t) => t.tt !== 'Ngưng dùng'), G.nhomThuoc, (t) => ({ ma: t.ma, ten: t.ten, phu: (t.tt === 'Chờ duyệt' ? 'Chờ duyệt · ' : '') + 'cách ly ' + t.cachLy + ' ngày', t })), { goiY: 'Tìm tên thuốc, phân' });
  G.chonDS = (tieuDe, ds) => G.chonHaiBuoc(tieuDe, [{ ten: tieuDe, ds: ds.map((x) => (typeof x === 'string' ? { ten: x } : x)) }]);

  /* ô chọn: nút hiện giá trị đã chọn, bấm mở bộ chọn */
  G.oChon = function (goc, nhan, moBoChon, giaTri) {
    goc.innerHTML = `<button type="button" class="o-chon"><span class="gt ${giaTri ? '' : 'mo'}">${esc(giaTri ? giaTri.ten || giaTri : nhan)}</span><span>›</span></button>`;
    const st = { gt: giaTri || null };
    goc.firstChild.onclick = async () => { const m = await moBoChon(); if (m) { st.gt = m; goc.querySelector('.gt').textContent = m.phu && !m.khac ? `${m.ten} · ${m.phu}` : m.ten; goc.querySelector('.gt').classList.remove('mo'); if (st.doi) st.doi(m); } };
    return st;
  };

  /* ---------- Ảnh: chụp, chọn từ máy (nhiều ảnh), dán ---------- */
  function nenAnh(file) {
    return new Promise((ok, loi) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = API.thu() ? 900 : 1600; const k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          ok(c.toDataURL('image/jpeg', API.thu() ? 0.6 : 0.75));
        };
        img.onerror = () => loi(new Error('Không đọc được ảnh này'));
        img.src = r.result;
      };
      r.onerror = () => loi(new Error('Không đọc được tệp'));
      r.readAsDataURL(file);
    });
  }
  G.oAnh = function (goc, opt) {
    opt = opt || {};
    const toiDa = opt.toiDa || 6; const ds = [];
    goc.innerHTML = `<div class="o-anh3"><button type="button" data-a="chup">📷<br>Chụp ảnh</button><button type="button" data-a="thu">🖼️<br>Chọn từ máy</button><button type="button" data-a="dan">📋<br>Dán ảnh</button></div>
      <input type="file" accept="image/*" capture="environment" class="an" data-i="chup"><input type="file" accept="image/*" multiple class="an" data-i="thu">
      <div class="luoi-anh"></div><p class="mo goi-y" style="margin:6px 0 0">${opt.batBuoc ? 'Bắt buộc ít nhất 1 ảnh. ' : ''}Tối đa ${toiDa} ảnh. Ảnh Zalo: giữ ảnh → Sao chép → bấm Dán ảnh.</p>`;
    const luoi = goc.querySelector('.luoi-anh');
    const ve = () => {
      luoi.innerHTML = ds.map((d, i) => `<div class="anh-nho"><img src="${d}" alt=""><button type="button" data-x="${i}">✕</button></div>`).join('');
      luoi.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { ds.splice(+b.dataset.x, 1); ve(); }; });
    };
    const them = async (files) => {
      for (const f of files) { if (ds.length >= toiDa) { G.bao('Đã đủ ' + toiDa + ' ảnh', true); break; } if (f.type && !f.type.startsWith('image/')) continue; ds.push(await nenAnh(f)); }
      ve();
    };
    goc.querySelectorAll('input[type=file]').forEach((i) => { i.onchange = () => { G.chay(() => them([...i.files])); i.value = ''; }; });
    goc.querySelector('[data-a=chup]').onclick = () => goc.querySelector('[data-i=chup]').click();
    goc.querySelector('[data-a=thu]').onclick = () => goc.querySelector('[data-i=thu]').click();
    goc.querySelector('[data-a=dan]').onclick = () => G.chay(async () => {
      if (!navigator.clipboard || !navigator.clipboard.read) throw new Error('Trình duyệt này chưa cho dán ảnh bằng nút. Dùng "Chọn từ máy" sau khi lưu ảnh về máy.');
      const items = await navigator.clipboard.read(); const fs = [];
      for (const it of items) { const t = it.types.find((x) => x.startsWith('image/')); if (t) fs.push(new File([await it.getType(t)], 'dan.png', { type: t })); }
      if (!fs.length) throw new Error('Bộ nhớ tạm chưa có ảnh. Giữ ảnh trong Zalo → Sao chép, rồi bấm lại.');
      await them(fs);
    });
    // dán bằng Ctrl+V / giữ ô → Dán
    const nghe = (e) => { if (!goc.isConnected) return document.removeEventListener('paste', nghe); const fs = [...(e.clipboardData || {}).files || []].filter((f) => f.type.startsWith('image/')); if (fs.length) { e.preventDefault(); G.chay(() => them(fs)); } };
    document.addEventListener('paste', nghe);
    return { ds: () => ds.slice(), kiemTra: () => { if (opt.batBuoc && !ds.length) throw new Error('Cần ít nhất 1 ảnh'); return ds.slice(); } };
  };
  G.xemAnh = (v) => API.dsAnh(v).map((a) => `<img class="anh-xem" src="${esc(API.anhUrl(a))}" alt="" loading="lazy" onclick="GL.phongAnh(this.src)">`).join('');
  G.phongAnh = (src) => { const l = G.h(`<div class="lop-phu den" style="align-items:center"><img src="${esc(src)}" style="max-width:96vw;max-height:90vh;border-radius:8px"></div>`); l.onclick = () => l.remove(); document.body.appendChild(l); };

  /* nút micro: nói thành chữ (tiếng Việt) */
  G.mic = function (nut, o) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { nut.remove(); return; }
    nut.onclick = () => {
      const r = new SR(); r.lang = 'vi-VN'; r.interimResults = false;
      nut.textContent = '⏺ Đang nghe…';
      r.onresult = (e) => { o.value = (o.value ? o.value + ' ' : '') + e.results[0][0].transcript; };
      r.onend = () => { nut.textContent = '🎤 Nói'; };
      r.onerror = () => { nut.textContent = '🎤 Nói'; G.bao('Không nghe rõ, thử lại', true); };
      r.start();
    };
  };
  G.oMoTa = (id, nhan, bb) => `<label class="o"><span>${esc(nhan || 'Mô tả thêm')}${bb ? '' : ' (không bắt buộc)'}</span><textarea id="${id}"></textarea><button type="button" class="nut nho mic" data-mic="${id}">🎤 Nói</button></label>`;
  G.ganMic = (o) => o.querySelectorAll('[data-mic]').forEach((b) => G.mic(b, o.querySelector('#' + b.dataset.mic)));

  /* chip chọn một */
  G.chips = function (goc, ds, gt, doi) {
    const st = { gt };
    goc.innerHTML = ds.map((x) => `<button type="button" data-v="${esc(x)}" class="${x === gt ? 'dang' : ''}">${esc(x)}</button>`).join('');
    goc.classList.add('chon', 'boc');
    goc.querySelectorAll('[data-v]').forEach((b) => { b.onclick = () => { st.gt = b.dataset.v; goc.querySelectorAll('[data-v]').forEach((y) => y.classList.toggle('dang', y === b)); if (doi) doi(st.gt); }; });
    return st;
  };

  /* tải bảng ra Excel (CSV, mở bằng Excel/Google Sheets) */
  G.taiCSV = function (ten, hang) {
    const csv = '﻿' + hang.map((r) => r.map((c) => { const s = String(c == null ? '' : c); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = ten + '.csv'; a.click();
  };
  G.trong = (msg) => `<div class="the mo" style="text-align:center">${esc(msg)}</div>`;
})();

/* ---------- Biểu mẫu nhanh: mô tả trường → giao diện → giá trị ----------
   loại: chu, so, ngay, gio, ngaygio, chips (ds), nhieu (ds, chọn nhiều), chon (ds, danh sách thả), vitri, cay, loi, anh, mota */
(function () {
  const G = window.GL; const API = window.GL_API; const esc = G.esc;
  G.form = function (goc, truong) {
    const st = {};
    goc.innerHTML = truong.map((t, i) => {
      const nhan = `<span>${esc(t.nhan)}${t.bb ? ' *' : ''}</span>`;
      const gt = t.gt == null ? '' : t.gt;
      switch (t.loai) {
        case 'so': return `<label class="o">${nhan}<input type="number" inputmode="decimal" step="any" data-f="${i}" value="${esc(gt)}" placeholder="${esc(t.goiY || '')}">${t.phu ? `<small class="mo">${esc(t.phu)}</small>` : ''}</label>`;
        case 'ngay': return `<label class="o">${nhan}<input type="date" data-f="${i}" value="${esc(gt || API.ngay())}"></label>`;
        case 'gio': return `<label class="o">${nhan}<input type="time" data-f="${i}" value="${esc(gt)}"></label>`;
        case 'ngaygio': return `<label class="o">${nhan}<input type="datetime-local" data-f="${i}" value="${esc(gt)}"></label>`;
        case 'chon': return `<label class="o">${nhan}<select data-f="${i}"><option value="">— Chọn —</option>${t.ds.map((x) => `<option ${x === gt ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>`;
        case 'chips': case 'nhieu': return `<div class="o">${nhan.replace('<span>', '<span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">')}<div data-f="${i}"></div></div>`;
        case 'vitri': case 'cay': case 'loi': case 'chonds': return `<div class="o">${nhan.replace('<span>', '<span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">')}<div data-f="${i}"></div></div>`;
        case 'anh': return `<div class="o" style="margin-bottom:12px">${nhan.replace('<span>', '<span style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">')}<div data-f="${i}"></div></div>`;
        case 'mota': return `<label class="o">${nhan}<textarea data-f="${i}">${esc(gt)}</textarea><button type="button" class="nut nho mic" data-micf="${i}">🎤 Nói</button></label>`;
        case 'tieude': return `<h3 style="margin:14px 0 8px;font-size:14px">${esc(t.nhan)}</h3>`;
        case 'ghichu': return `<p class="mo">${t.html || esc(t.nhan)}</p>`;
        default: return `<label class="o">${nhan}<input type="text" data-f="${i}" value="${esc(gt)}" placeholder="${esc(t.goiY || '')}"></label>`;
      }
    }).join('');
    truong.forEach((t, i) => {
      const el = goc.querySelector(`[data-f="${i}"]`); if (!el) return;
      if (t.loai === 'chips') st[i] = G.chips(el, t.ds, t.gt || '', t.doi);
      if (t.loai === 'nhieu') {
        const chon = new Set(t.gt || []); el.classList.add('chon', 'boc');
        el.innerHTML = t.ds.map((x) => `<button type="button" data-v="${esc(x)}" class="${chon.has(x) ? 'dang' : ''}">${esc(x)}</button>`).join('');
        el.querySelectorAll('[data-v]').forEach((b) => { b.onclick = () => { if (chon.has(b.dataset.v)) chon.delete(b.dataset.v); else chon.add(b.dataset.v); b.classList.toggle('dang'); }; });
        st[i] = { get gt() { return [...chon]; } };
      }
      if (t.loai === 'vitri') st[i] = G.oChon(el, 'Bấm để chọn vị trí (cụm → vị trí)', () => G.chonViTri(t.opt), t.gt);
      if (t.loai === 'cay') st[i] = G.oChon(el, 'Bấm để chọn cây (nhóm → cây)', () => G.chonCay(true), t.gt);
      if (t.loai === 'loi') st[i] = G.oChon(el, 'Bấm để chọn (nhóm → mục)', G.chonLoi, t.gt);
      if (t.loai === 'chonds') st[i] = G.oChon(el, t.goiY || 'Bấm để chọn', () => G.chonDS(t.nhan, t.ds), t.gt);
      if (t.loai === 'anh') st[i] = G.oAnh(el, { batBuoc: t.bb, toiDa: t.toiDa || 6 });
      if (t.loai === 'mota') G.mic(goc.querySelector(`[data-micf="${i}"]`), el);
    });
    return function lay() {
      const out = {};
      truong.forEach((t, i) => {
        if (!t.k) return;
        const el = goc.querySelector(`[data-f="${i}"]`); let v;
        if (['chips', 'nhieu', 'vitri', 'cay', 'loi', 'chonds'].includes(t.loai)) v = st[i].gt;
        else if (t.loai === 'anh') v = st[i].ds();
        else if (t.loai === 'ngaygio') v = el.value ? el.value.replace('T', ' ') : '';
        else v = el ? el.value.trim() : '';
        const rong = v == null || v === '' || (Array.isArray(v) && !v.length);
        if (t.bb && rong) throw new Error((t.loai === 'anh' ? 'Cần ảnh: ' : 'Chưa điền: ') + t.nhan);
        if (t.loai === 'so' && !rong && isNaN(+v)) throw new Error(t.nhan + ' phải là số');
        out[t.k] = rong ? (t.loai === 'anh' || t.loai === 'nhieu' ? [] : '') : v;
      });
      return out;
    };
  };
  /* màn "sổ ghi" đơn giản: biểu mẫu + danh sách đã ghi */
  G.manSo = async function (c) {
    const m = G.khung(c.tieuDe, c.phu || '', c.lui || '#/them');
    const ghi = c.coGhi ? c.coGhi() : G.q(API.BANG[c.bang][0]) >= 2;
    const loc = typeof c.loc === 'function' ? c.loc() : (c.loc || null);
    const ds = (await API.goi('docNhieu', { ds: [{ bang: c.bang, loc, gioiHan: c.gioiHan || 200 }] }))[c.bang].reverse();
    m.innerHTML = (c.dau ? c.dau(ds) : '') + (ghi ? `<button class="nut chinh rong" id="moi" style="margin-bottom:12px">＋ ${esc(c.nutMoi || 'Ghi mới')}</button>` : '')
      + `<div class="ds">${ds.length ? ds.map((r, i) => `<div class="muc" data-i="${i}" style="${c.chiTiet ? 'cursor:pointer' : ''}">${c.dong(r)}</div>`).join('') : `<div class="muc mo">${esc(c.trong || 'Chưa có dữ liệu')}</div>`}</div>`
      + (c.cuoi ? c.cuoi(ds) : '');
    if (c.chiTiet) m.querySelectorAll('[data-i]').forEach((d) => { d.onclick = () => c.chiTiet(ds[+d.dataset.i]); });
    const moi = m.querySelector('#moi');
    if (moi) moi.onclick = () => G.hop(c.nutMoi || c.tieuDe, '<div id="f"></div><button class="nut chinh rong" id="luu">Lưu</button>', (o, dong) => {
      const lay = G.form(o.querySelector('#f'), typeof c.truong === 'function' ? c.truong() : c.truong);
      o.querySelector('#luu').onclick = (e) => G.chay(async () => { const v = lay(); await c.luu(v); dong(); G.bao('Đã lưu'); G.taiLai(); }, e.target);
    });
    if (c.sau) c.sau(m, ds);
    return m;
  };
  G.tuan = (d) => { d = new Date(d || Date.now()); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() + '-T' + String(Math.ceil(((t - y) / 864e5 + 1) / 7)).padStart(2, '0'); };
  G.dauTuan = (d) => { d = new Date(d || Date.now()); const n = (d.getDay() + 6) % 7; d.setDate(d.getDate() - n); return API.ngay(d); };
  G.congNgay = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return API.ngay(d); };
})();
