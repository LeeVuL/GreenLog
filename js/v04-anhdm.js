/* GreenLog · Ảnh danh mục cây (Pl@ntNet, CC-BY-SA) và ảnh bao bì thuốc (trang chính thức của hãng) · mục 54, 56 */
(function () {
  const G = window.GL; const { esc } = G;
  const GOC = { toan_cay: 'Toàn cây', la: 'Lá', than: 'Thân, vỏ', goc: 'Gốc', hoa: 'Hoa', qua: 'Quả', khac: 'Khác', bao_bi: 'Bao bì' };
  const BAT_BUOC = ['toan_cay', 'la', 'than'];
  let DATA = null;
  G.anhDM = async () => { if (DATA) return DATA; try { DATA = await (await fetch('data/anh-thu.json', { cache: 'no-cache' })).json(); } catch (e) { DATA = { cay: {}, thuoc: {} }; } return DATA; };
  const the = (a, ten) => `<figure style="margin:0;width:150px"><img src="${esc(a.url)}" alt="${esc(ten)} · ${esc(GOC[a.goc] || a.goc)}" loading="lazy" referrerpolicy="no-referrer" style="width:150px;height:150px;object-fit:cover;border-radius:12px;background:#EEF2EE;cursor:zoom-in" onclick="GL.phongAnh && GL.phongAnh(this.src)"><figcaption class="mo" style="font-size:11px">${esc(GOC[a.goc] || a.goc)}${a.tacGia ? ' · © ' + esc(a.tacGia) : ''}</figcaption></figure>`;
  G.boAnhCay = async (ten) => {
    const d = await G.anhDM(); const c = d.cay[ten]; if (!c) return `<div class="the"><h2>Ảnh nhận diện</h2><p class="mo">Chưa có ảnh. Cần tối thiểu: toàn cây, lá, thân/vỏ (hoa, quả khi có).</p></div>`;
    const co = new Set(c.anh.map((a) => a.goc)); const thieu = BAT_BUOC.filter((g) => !co.has(g) && !(g === 'than' && co.has('goc')));
    return `<div class="the"><div class="hang"><h2 class="gian">Ảnh nhận diện</h2><span class="chip ${thieu.length ? 'cam' : 'xanh'}">${thieu.length ? 'Thiếu: ' + thieu.map((g) => GOC[g]).join(', ') : 'Đủ ảnh'}</span></div>
      <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px">${c.anh.map((a) => the(a, ten)).join('')}</div>
      <p class="mo" style="font-size:11px;margin-top:6px">Nguồn: <a href="${esc(c.nguon)}" target="_blank" rel="noopener">Pl@ntNet</a> · giấy phép CC-BY-SA · ảnh tự chụp tại resort sẽ thay dần</p></div>`;
  };
  G.anhThuoc = async (ten) => { const d = await G.anhDM(); const t = Object.keys(d.thuoc || {}).find((k) => String(ten || '').toLowerCase().startsWith(k.toLowerCase().split(' ')[0])); return t ? d.thuoc[t] : null; };

  /* gắn vào trang chi tiết cây */
  const cayGoc = G.man.danhmuccay && G.man.danhmuccay.fn;
  if (cayGoc) G.man.danhmuccay = Object.assign(G.man.danhmuccay, { fn: async (ma) => {
    await cayGoc(ma); if (!ma) { // danh sách: dấu "Đủ ảnh"
      const d = await G.anhDM(); const m = document.getElementById('noiDung'); if (!m) return;
      m.querySelectorAll('a.muc, .muc').forEach((a) => { const b = a.querySelector('b'); if (b && d.cay[b.textContent.trim()] && !a.querySelector('.chip-anh')) b.insertAdjacentHTML('afterend', ' <span class="chip xanh chip-anh" style="font-size:11px">📷</span>'); });
      return; }
    const m = document.getElementById('noiDung'); if (!m) return; const c0 = (G.S.dm.cay || []).find((x) => x.ma === decodeURIComponent(ma)); const h = document.querySelector('h1'); const ten = c0 ? c0.ten : h ? h.textContent.trim() : '';
    const box = m.querySelector('.the'); if (box) box.insertAdjacentHTML('afterend', await G.boAnhCay(ten));
  } });
  /* gắn ảnh bao bì vào danh mục thuốc, phân */
  const thuocGoc = G.man.thuoc && G.man.thuoc.fn;
  if (thuocGoc) G.man.thuoc = Object.assign(G.man.thuoc, { fn: async (...a) => {
    await thuocGoc(...a); const m = document.getElementById('noiDung'); if (!m) return; const d = await G.anhDM();
    m.querySelectorAll('.muc').forEach((r) => { const b = r.querySelector('b'); if (!b) return; const k = Object.keys(d.thuoc || {}).find((x) => b.textContent.trim().toLowerCase().startsWith(x.toLowerCase().split(' ')[0]));
      if (k && !r.querySelector('img')) r.insertAdjacentHTML('afterbegin', `<img src="${esc(d.thuoc[k].anh[0].url)}" alt="${esc(k)}" referrerpolicy="no-referrer" style="width:56px;height:56px;object-fit:contain;border-radius:8px;background:#fff;margin-right:8px;cursor:zoom-in" onclick="GL.phongAnh && GL.phongAnh(this.src)" title="${esc(d.thuoc[k].anh[0].ghiChu || '')}">`); });
  } });
})();
