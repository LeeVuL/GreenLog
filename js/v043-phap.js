/* GreenLog 0.4.3 – mục 92: anh Pháp (Quản lý nhà thầu) không thấy bất cứ việc nào của 2 nhân viên nội bộ,
   chỉ thấy Kubota đang rảnh hay đang dùng. */
(function () {
  const G = window.GL; const S = G.S; const { esc } = G;
  const laPhap = () => !!(S.u && S.u.nhom === 'Quản lý nhà thầu');
  G.anNoiBo = laPhap;
  const NHOM_NB = ['Bãi biển', 'Compost', 'Cây nội thất', 'Vị Garden'];
  const BANG_NB = ['VeSinhBien', 'KiemTraBien', 'MaySangCat', 'VuonRau', 'ThuHoach', 'CayNoiThat', 'VuonUomNoiThat', 'PhanCompost', 'RacHuuCo', 'KubotaLuot', 'KubotaChuyen'];
  const laNB = (b) => NHOM_NB.includes(b.nhom) || BANG_NB.includes(b.bang) || /nội bộ/i.test(b.ten || '');
  const chan = (lyDo) => { const m = G.khung('Không có quyền', '', '#/'); m.innerHTML = `<div class="the mo">${esc(lyDo)}</div>`; };

  /* báo cáo theo từng việc: bỏ các việc nội bộ */
  const BC = G.BC_VIEC; const DU = BC ? BC.slice() : [];
  const apBC = () => { if (!BC) return; const nb = S.u && S.u.nhom === 'Nhân viên nội bộ'; BC.length = 0; DU.filter((b) => !(laPhap() && laNB(b)) && !(nb && !laNB(b) && b.k !== 'daotao')).forEach((b) => BC.push(b)); };
  if (G.man.bcviec) { const f = G.man.bcviec.fn; G.man.bcviec.fn = async (...a) => { apBC(); return f(...a); }; }
  const khungGoc = G.khung;
  G.khung = function (...a) { const m = khungGoc.apply(this, a); apBC(); return m; };

  /* màn chỉ dành cho nội bộ / Trưởng bộ phận */
  const KHOA = { nb: 'Việc của nhân viên nội bộ', batthuong: 'Việc của nhân viên nội bộ', quyenviec: 'Chỉ Trưởng bộ phận', baocaogm: 'Chỉ Trưởng bộ phận', ketthucca: 'Việc của nhân viên nội bộ', xemca: 'Việc của nhân viên nội bộ' };
  Object.keys(KHOA).forEach((k) => { const x = G.man[k]; if (!x) return; const f = x.fn; x.fn = async (...a) => (laPhap() ? chan(KHOA[k]) : f(...a));
    if (k === 'quyenviec' || k === 'baocaogm') { const ph = x.ph; const cap = x.cap || 1; x.ph = () => !laPhap() && (typeof ph === 'function' ? ph() : G.q(ph) >= cap); } });
  if (G.man.xemviec) { const f = G.man.xemviec.fn; G.man.xemviec.fn = async (...a) => (laPhap() && /^nb/.test(a.join('/')) ? chan('Việc của nhân viên nội bộ') : f(...a)); }

  /* Hôm nay toàn bộ phận: thay cột Nội bộ bằng trạng thái Kubota */
  const hnFn = G.man.homnay.fn;
  G.man.homnay.fn = async (...a) => {
    await hnFn(...a); if (!laPhap()) return;
    const m = document.getElementById('noiDung'); if (!m) return;
    const cot = [...m.querySelectorAll('.luoi-tq > .the')].find((x) => /Nội bộ/.test((x.querySelector('h2') || {}).textContent || ''));
    if (cot) { const t = G.kubotaNgan ? await G.kubotaNgan().catch(() => '—') : '—'; cot.innerHTML = `<h2 style="margin:0 0 8px">🚜 Kubota</h2><div style="font-size:18px">${esc(t)}</div>`; }
  };
  /* Ảnh trong ngày: chỉ ảnh việc nhà thầu */
  if (G.man.anhngay) { const f = G.man.anhngay.fn; G.man.anhngay.fn = async (...a) => { if (laPhap()) G.man.anhngay.loc = 'Nhà thầu'; await f(...a);
    if (laPhap()) { const m = document.getElementById('noiDung'); m && m.querySelectorAll('[data-l]').forEach((b) => b.remove()); } }; }
  /* thẻ "28 loại việc" ở Báo cáo */
  const doiChu = () => { if (!laPhap()) return; const t = 'Từng loại việc nhà thầu: định kỳ, phun/bón, vườn ươm cây bụi, đào tạo…'; document.querySelectorAll('.vao-bcviec .mo').forEach((x) => { if (x.textContent !== t) x.textContent = t; }); };
  new MutationObserver(doiChu).observe(document.body, { childList: true, subtree: true });

  /* mục 97: hai nhân viên nội bộ không thấy việc của nhà thầu */
  const laNBu = () => !!(S.u && S.u.nhom === 'Nhân viên nội bộ');
  G.anNhaThau = laNBu;
  if (G.man.kehoach) { const f = G.man.kehoach.fn; G.man.kehoach.fn = async (...a) => { await f(...a); if (!laNBu()) return; const m = document.getElementById('noiDung'); if (!m) return;
    const h = [...m.querySelectorAll('h3.tieu-nhom')].find((x) => /^A\./.test(x.textContent.trim())); if (!h) return; let n = h.nextElementSibling; h.remove();
    while (n && !(n.matches && n.matches('h3.tieu-nhom'))) { const k = n.nextElementSibling; n.remove(); n = k; } }; }
  const KHOA_NT = { hop: 'Việc của nhà thầu', hoso: 'Việc của nhà thầu', kydinhky: 'Việc của nhà thầu', khthang: 'Việc của nhà thầu', slidetuan: 'Chỉ Trưởng bộ phận', chamdiem: 'Việc của nhà thầu', tuantra: 'Việc của nhà thầu', baocaogm: 'Chỉ Trưởng bộ phận', quyenviec: 'Chỉ Trưởng bộ phận', dot: 'Việc của nhà thầu', dinhky: 'Việc của nhà thầu', tuoi: 'Việc của nhà thầu', cum: 'Việc của nhà thầu', vanchuyen: 'Việc của nhà thầu', donghonuoc: 'Việc của nhà thầu', vuonuom: 'Việc của nhà thầu', batdaungay: 'Việc của nhà thầu', chotngay: 'Việc của nhà thầu', diemdanh: 'Việc của nhà thầu', congnhan: 'Việc của nhà thầu', tuithuoc: 'Việc của nhà thầu', linkviec: 'Việc của nhà thầu' };
  Object.keys(KHOA_NT).forEach((k) => { const x = G.man[k]; if (!x) return; const f = x.fn; x.fn = async (...a) => (laNBu() ? chan(KHOA_NT[k]) : f(...a)); const ph = x.ph; if (ph && typeof ph !== 'function') { const cap = x.cap || 1; x.ph = () => !laNBu() && !(laPhap() && KHOA[k]) && G.q(ph) >= cap; } else if (typeof ph === 'function') x.ph = (...b) => !laNBu() && ph(...b); });
  if (G.man.anhngay) { const f2 = G.man.anhngay.fn; G.man.anhngay.fn = async (...a) => { if (laNBu()) G.man.anhngay.loc = 'Nội bộ'; await f2(...a); if (laNBu()) { const m = document.getElementById('noiDung'); m && m.querySelectorAll('[data-l]').forEach((b) => b.remove()); } }; }
  /* phiếu, báo cáo: bỏ phần nhà thầu khi nội bộ xem */
  const loc2 = () => { if (!laNBu()) return; const h = location.hash;
    if (/^#\/phieu/.test(h)) document.querySelectorAll('#noiDung .the-viec, #noiDung .muc, #noiDung .the-phieu').forEach((x) => { if (/Giao: (Đội cơ động|Đội khu vực|Phan|Phạm|Mai Hòa)/.test(x.textContent) && !/Nội bộ|Hiệp|Nghị/.test(x.textContent)) x.remove(); });
    if (/^#\/baocao$/.test(h)) document.querySelectorAll('#noiDung a, #noiDung .the').forEach((x) => { if (/nhà thầu|Nhà thầu/.test(x.textContent) && !x.querySelector('.vao-bcviec') && x.children.length < 6) x.remove(); }); };
  new MutationObserver(loc2).observe(document.body, { childList: true, subtree: true });
})();
