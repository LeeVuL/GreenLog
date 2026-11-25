/* GreenLog 0.4.2 · chuyển dữ liệu chạy thử trên máy (bản thật: khoiTao04 → chuyen042_) */
(function () {
  const doc = (t) => { try { return JSON.parse(localStorage.getItem('gl_tb_' + t) || '[]'); } catch (e) { return []; } };
  const luu = (t, ds) => localStorage.setItem('gl_tb_' + t, JSON.stringify(ds));
  const CHUYEN = [
    ['va_042_vuonuom', () => { // mục 75: tách vườn ươm cây nội thất; đổi tên vườn ươm cây bụi
      const vu = doc('VuonUom'); const nt = vu.filter((r) => r['Vườn ươm'] === 'Vườn ươm cây nội thất');
      luu('VuonUomNoiThat', doc('VuonUomNoiThat').concat(nt));
      luu('VuonUom', vu.filter((r) => r['Vườn ươm'] !== 'Vườn ươm cây nội thất').map((r) => (r['Vườn ươm'] === 'Vườn ươm sân vườn' ? Object.assign(r, { 'Vườn ươm': 'Vườn ươm cây bụi' }) : r)));
    }],
    ['va_042_tentbp', () => { // mục 79: đổi tên cột và giá trị có tên riêng sang chức danh
      Object.keys(localStorage).filter((k) => k.startsWith('gl_tb_')).forEach((k) => { const v = localStorage.getItem(k); if (!/[Aa]nh Vũ|Chờ anh duyệt/.test(v)) return;
        localStorage.setItem(k, v.replace(/Trả lời của anh Vũ/g, 'Trả lời của Trưởng bộ phận').replace(/[Aa]nh Vũ/g, 'Trưởng bộ phận').replace(/Chờ anh duyệt kết thúc/g, 'Chờ Trưởng bộ phận duyệt kết thúc')); });
      ['gl_dm', 'gl_dm_cache'].forEach((k) => { const v = localStorage.getItem(k); if (v && /[Aa]nh Vũ/.test(v)) localStorage.setItem(k, v.replace(/[Aa]nh Vũ/g, 'Trưởng bộ phận')); });
    }],
  ];
  window.GL_CHUYEN042 = CHUYEN;
  const chay = () => CHUYEN.forEach(([co, fn]) => { if (localStorage.getItem(co)) return; try { fn(); localStorage.setItem(co, '1'); } catch (e) { console.warn(co, e); } });
  chay();
  /* mục 79: không hiện tên Trưởng bộ phận trên màn hình, chỉ hiện chức danh (ô ký hồ sơ in riêng, giữ họ tên) */
  const G = window.GL;
  const tenTBP = () => { const u = ((G.S.dm && G.S.dm.nguoidung) || []).find((x) => x.nhom === 'Trưởng bộ phận'); return (u && u.ten) || 'Lê Vũ'; };
  G.tenHT = (ten) => (ten && ten === tenTBP() ? 'Trưởng bộ phận' : ten);
  const doi = (goc) => { const ten = tenTBP(); if (!ten) return; const w = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT); let n; const ds = [];
    while ((n = w.nextNode())) { if (n.nodeValue.indexOf(ten) >= 0 && !(n.parentElement && n.parentElement.closest('[data-giu-ten], .ky, script, style, textarea'))) ds.push(n); }
    ds.forEach((x) => { x.nodeValue = x.nodeValue.split(ten).join('Trưởng bộ phận'); }); };
  const bat = () => { doi(document.body); new MutationObserver((ms) => ms.forEach((mu) => mu.addedNodes.forEach((x) => { if (x.nodeType === 1) doi(x); else if (x.nodeType === 3 && x.parentElement) doi(x.parentElement); }))).observe(document.body, { childList: true, subtree: true, characterData: false }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bat); else bat();
})();
