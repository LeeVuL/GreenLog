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
  const apBC = () => { if (!BC) return; BC.length = 0; DU.filter((b) => !(laPhap() && laNB(b))).forEach((b) => BC.push(b)); };
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
})();
