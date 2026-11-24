/* GreenLog · Ảnh danh mục cây (Pl@ntNet, CC-BY-SA) và ảnh bao bì thuốc (trang chính thức của hãng) · mục 54, 56 */
(function () {
  const G = window.GL; const { esc } = G;
  const GOC = { toan_cay: 'Toàn cây', la: 'Lá', than: 'Thân, vỏ', goc: 'Gốc', hoa: 'Hoa', qua: 'Quả', khac: 'Khác', bao_bi: 'Bao bì' };
  const BAT_BUOC = ['toan_cay', 'la', 'than'];
  let DATA = null;
  const API = window.GL_API;
  // mục 71: ảnh anh tự cập nhật (bảng AnhDanhMuc) ghi đè ảnh có sẵn
  G.anhDM = async () => {
    if (DATA) return DATA;
    try { DATA = await (await fetch('data/anh-thu.json', { cache: 'no-cache' })).json(); } catch (e) { DATA = { cay: {}, thuoc: {} }; }
    DATA.cay = DATA.cay || {}; DATA.thuoc = DATA.thuoc || {};
    try { (await G.doc('AnhDanhMuc')).forEach((r) => { let a = []; try { a = JSON.parse(r['Ảnh'] || '[]'); } catch (e) { /* bỏ qua */ } const k = r['Loại'] === 'Thuốc' ? 'thuoc' : 'cay';
      if (!a.length) { delete DATA[k][r['Tên']]; return; } DATA[k][r['Tên']] = Object.assign({}, DATA[k][r['Tên']] || {}, { anh: a.map((x) => Object.assign({}, x, { url: API.anhUrl(x.url) })), tuSua: r['Người sửa'] + ' · ' + String(r['Giờ sửa'] || '').slice(0, 10) }); }); } catch (e) { /* chưa có bảng */ }
    return DATA;
  };
  G.suaAnhDuoc = () => G.qv('CN13') >= 2;
  const timThuoc = (d, ten) => { const t = String(ten || '').trim().toLowerCase(); const ks = Object.keys(d.thuoc || {}); return ks.find((k) => k.toLowerCase() === t) || ks.find((k) => t.startsWith(k.toLowerCase().split(' ')[0])); };
  const the = (a, ten) => `<figure style="margin:0;width:150px"><img src="${esc(a.url)}" alt="${esc(ten)} · ${esc(GOC[a.goc] || a.goc)}" loading="lazy" referrerpolicy="no-referrer" style="width:150px;height:150px;object-fit:cover;border-radius:12px;background:#EEF2EE;cursor:zoom-in" onclick="GL.phongAnh && GL.phongAnh(this.src)"><figcaption class="mo" style="font-size:11px">${esc(GOC[a.goc] || a.goc)}${a.tacGia ? ' · © ' + esc(a.tacGia) : a.nguon ? ' · ' + esc(a.nguon) : ''}</figcaption></figure>`;
  G.boAnhCay = async (ten) => {
    const d = await G.anhDM(); const c = d.cay[ten]; if (!c) return `<div class="the"><h2>Ảnh nhận diện</h2><p class="mo">Chưa có ảnh. Cần tối thiểu: toàn cây, lá, thân/vỏ (hoa, quả khi có).</p>${G.suaAnhDuoc() ? `<button class="nut nho chinh" data-sua-anh="Cây" data-ten="${esc(ten)}">＋ Thêm ảnh</button>` : ''}</div>`;
    const co = new Set(c.anh.map((a) => a.goc)); const thieu = BAT_BUOC.filter((g) => !co.has(g) && !(g === 'than' && co.has('goc')));
    return `<div class="the"><div class="hang"><h2 class="gian">Ảnh nhận diện</h2><span class="chip ${thieu.length ? 'cam' : 'xanh'}">${thieu.length ? 'Thiếu: ' + thieu.map((g) => GOC[g]).join(', ') : 'Đủ ảnh'}</span></div>
      <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px">${c.anh.map((a) => the(a, ten)).join('')}</div>
      <p class="mo" style="font-size:11px;margin-top:6px">${c.tuSua ? 'Cập nhật: ' + esc(c.tuSua) : `Nguồn: <a href="${esc(c.nguon)}" target="_blank" rel="noopener">Pl@ntNet</a> · giấy phép CC-BY-SA`}</p>${G.suaAnhDuoc() ? `<button class="nut nho" data-sua-anh="Cây" data-ten="${esc(ten)}">✏️ Sửa ảnh</button>` : ''}</div>`;
  };
  G.anhThuoc = async (ten) => { const d = await G.anhDM(); const t = timThuoc(d, ten); return t ? d.thuoc[t] : null; };

  /* gắn vào trang chi tiết cây */
  const cayGoc = G.man.danhmuccay && G.man.danhmuccay.fn;
  if (cayGoc) G.man.danhmuccay = Object.assign(G.man.danhmuccay, { fn: async (ma) => {
    await cayGoc(ma); if (!ma) { // danh sách: dấu "Đủ ảnh"
      const d = await G.anhDM(); const m = document.getElementById('noiDung'); if (!m) return;
      m.querySelectorAll('a.muc, .muc').forEach((a) => { const b = a.querySelector('b'); if (b && d.cay[b.textContent.trim()] && !a.querySelector('.chip-anh')) b.insertAdjacentHTML('afterend', ' <span class="chip xanh chip-anh" style="font-size:11px">📷</span>'); });
      return; }
    const m = document.getElementById('noiDung'); if (!m) return; const c0 = (G.S.dm.cay || []).find((x) => x.ma === decodeURIComponent(ma)); const h = document.querySelector('h1'); const ten = c0 ? c0.ten : h ? h.textContent.trim() : '';
    const box = m.querySelector('.the'); if (box) box.insertAdjacentHTML('afterend', await G.boAnhCay(ten)); ganSua(m);
  } });
  /* gắn ảnh bao bì vào danh mục thuốc, phân */
  const thuocGoc = G.man.thuoc && G.man.thuoc.fn;
  if (thuocGoc) G.man.thuoc = Object.assign(G.man.thuoc, { fn: async (...a) => {
    await thuocGoc(...a); const m = document.getElementById('noiDung'); if (!m) return; const d = await G.anhDM();
    m.querySelectorAll('.muc').forEach((r) => { const b = r.querySelector('b'); if (!b) return; const ten = b.textContent.trim(); const k = timThuoc(d, ten);
      if (k && !r.querySelector('img')) r.insertAdjacentHTML('afterbegin', `<img src="${esc(d.thuoc[k].anh[0].url)}" alt="${esc(k)}" referrerpolicy="no-referrer" style="width:56px;height:56px;object-fit:contain;border-radius:8px;background:#fff;margin-right:8px;cursor:zoom-in" onclick="event.preventDefault();event.stopPropagation();GL.phongAnh && GL.phongAnh(this.src)" title="${esc(d.thuoc[k].anh[0].ghiChu || '')}">`);
      if (G.suaAnhDuoc() && !r.querySelector('[data-sua-anh]')) b.insertAdjacentHTML('afterend', ` <button class="nut nho" style="padding:2px 8px;font-size:12px" data-sua-anh="Thuốc" data-ten="${esc(ten)}">${k ? '✏️ Ảnh' : '＋ Ảnh'}</button>`); });
    ganSua(m);
  } });

  /* ---------- mục 71: anh tự thêm, sửa ảnh cây và thuốc (link ảnh trên web, dán, chọn từ máy) ---------- */
  function ganSua(m) { m.querySelectorAll('[data-sua-anh]').forEach((b) => { b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); suaAnh(b.dataset.suaAnh, b.dataset.ten); }; }); }
  async function suaAnh(loai, ten) {
    const d = await G.anhDM(); const goc = loai === 'Thuốc' ? (d.thuoc[timThuoc(d, ten)] || {}) : (d.cay[ten] || {});
    let ds = (goc.anh || []).map((a) => ({ url: a.url, goc: a.goc || (loai === 'Thuốc' ? 'bao_bi' : 'toan_cay'), tacGia: a.tacGia || '', nguon: a.nguon || a.ghiChu || '' }));
    const goi = loai === 'Thuốc' ? ['bao_bi', 'khac'] : ['toan_cay', 'la', 'than', 'goc', 'hoa', 'qua', 'khac'];
    G.hop(`Ảnh ${loai === 'Thuốc' ? 'sản phẩm' : 'cây'} · ${ten}`, `<p class="mo" style="margin-top:0">Dán link ảnh trên web (bấm giữ ảnh → Sao chép địa chỉ hình ảnh), hoặc dán / chọn ảnh từ máy. ${loai === 'Cây' ? 'Nên có: toàn cây, lá, thân/vỏ; thêm hoa, quả khi có.' : 'Nên có: mặt trước bao bì, nhãn.'}</p>
      <div class="hang" style="gap:6px"><input type="url" id="link" placeholder="https://… link ảnh" style="flex:1"><button type="button" class="nut chinh" id="them">Thêm</button></div>
      <div id="tai" style="margin-top:8px"></div><div id="ds" style="margin-top:10px"></div>
      <button type="button" class="nut chinh rong" id="luu" style="margin-top:10px">Lưu ảnh</button>`, (o, dong) => {
      const a = G.oAnh(o.querySelector('#tai'), { toiDa: 6, tuyChon: true }); const cam = o.querySelector('[data-a=chup]'); if (cam) cam.remove();
      const ve = () => { o.querySelector('#ds').innerHTML = ds.length ? ds.map((x, i) => `<div class="the" style="display:flex;gap:10px;padding:8px;margin-bottom:8px"><img src="${esc(x.url)}" referrerpolicy="no-referrer" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:10px;background:#EEF2EE;flex:none">
          <div class="gian" style="min-width:0"><select data-g="${i}" style="margin-bottom:4px">${goi.map((g) => `<option value="${g}" ${x.goc === g ? 'selected' : ''}>${GOC[g]}</option>`).join('')}</select><input data-n="${i}" value="${esc(x.nguon || x.tacGia)}" placeholder="Nguồn / tác giả (không bắt buộc)">
          <div class="nhom-nut" style="margin-top:4px"><button type="button" class="nut nho" data-len="${i}" ${i ? '' : 'disabled'}>↑</button><button type="button" class="nut nho" data-xuong="${i}" ${i < ds.length - 1 ? '' : 'disabled'}>↓</button><button type="button" class="nut nho" data-xoa="${i}">✕ Xóa</button></div></div></div>`).join('') : '<p class="mo">Chưa có ảnh.</p>';
        o.querySelectorAll('[data-g]').forEach((s) => { s.onchange = () => { ds[+s.dataset.g].goc = s.value; }; });
        o.querySelectorAll('[data-n]').forEach((s) => { s.oninput = () => { ds[+s.dataset.n].nguon = s.value; ds[+s.dataset.n].tacGia = ''; }; });
        o.querySelectorAll('[data-len]').forEach((b) => { b.onclick = () => { const i = +b.dataset.len; [ds[i - 1], ds[i]] = [ds[i], ds[i - 1]]; ve(); }; });
        o.querySelectorAll('[data-xuong]').forEach((b) => { b.onclick = () => { const i = +b.dataset.xuong; [ds[i + 1], ds[i]] = [ds[i], ds[i + 1]]; ve(); }; });
        o.querySelectorAll('[data-xoa]').forEach((b) => { b.onclick = () => { ds.splice(+b.dataset.xoa, 1); ve(); }; }); };
      o.querySelector('#them').onclick = () => { const u = o.querySelector('#link').value.trim(); if (!/^https:\/\//.test(u)) return G.bao('Link ảnh phải bắt đầu bằng https://', true);
        let nguon = ''; try { nguon = new URL(u).hostname.replace(/^www\./, ''); } catch (e) { /* bỏ qua */ }
        ds.push({ url: u, goc: goi[Math.min(ds.length, goi.length - 1)], nguon }); o.querySelector('#link').value = ''; ve(); };
      o.querySelector('#luu').onclick = (e) => G.chay(async () => {
        const may = a.ds().map((u) => ({ url: u, goc: goi[0], nguon: 'Ảnh từ máy' }));
        const tat = ds.concat(may).map((x) => ({ url: x.url, goc: x.goc, nguon: x.nguon || '', tacGia: x.tacGia || '' }));
        await API.goi('ghiNhieu', { bang: 'AnhDanhMuc', thay: ['Loại', 'Tên'], dong: [{ 'Loại': loai, 'Tên': ten, 'Ảnh': JSON.stringify(tat), 'Người sửa': G.S.u.ten, 'Giờ sửa': API.bayGio() }] });
        DATA = null; dong(); G.bao('Đã lưu ảnh'); G.taiLai();
      }, e.target);
      ve();
    }, true);
  }
})();
