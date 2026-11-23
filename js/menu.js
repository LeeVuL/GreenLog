/* GreenLog – mục cho màn "Tất cả chức năng" (các màn chính nằm trong app.js) */
(function () {
  const G = window.GL; const q = G.q; const di = (h) => () => { location.hash = h; };
  Object.assign(G.man, {
    _viec: { ten: 'Việc hằng ngày', bt: '✅', nhom: 'Việc hằng ngày', ph: () => q('dinhky') || q('noibo'), fn: di('#/viec') },
    _tuoi: { ten: 'Tưới nước', bt: '💧', nhom: 'Việc hằng ngày', ph: 'dinhky', fn: di('#/tuoi') },
    _vesinh: { ten: 'Vệ sinh theo cụm', bt: '🧹', nhom: 'Việc hằng ngày', ph: 'dinhky', fn: di('#/cum/DV10') },
    _nhoco: { ten: 'Nhổ cỏ dại', bt: '🌿', nhom: 'Việc hằng ngày', ph: 'dinhky', fn: di('#/cum/DV11') },
    _dinhky: { ten: 'Việc định kỳ', bt: '🗂️', nhom: 'Việc hằng ngày', ph: 'dinhky', fn: di('#/viec') },
    _diemdanh: { ten: 'Điểm danh', bt: '🧑‍🤝‍🧑', nhom: 'Nhân sự', ph: 'diemdanh', fn: di('#/diemdanh') },
    _phieu: { ten: 'Phiếu giao việc', bt: '🎫', nhom: 'Cây xanh', ph: 'phieu', fn: di('#/phieu') },
  });
  if (G._ICMAP) Object.keys(G._ICMAP).forEach((k) => { if (G.man[k]) G.man[k].ic = G.man[k].ic || G._ICMAP[k]; });
  // thứ tự nhóm hiển thị
  const thuTu = ['Việc hằng ngày', 'Cây xanh', 'Kế hoạch', 'Kiểm tra', 'Nhân sự', 'Báo cáo', 'Quản trị'];
  const goc = G.man; const moi = {};
  thuTu.forEach((n) => Object.keys(goc).filter((k) => goc[k].nhom === n).forEach((k) => { moi[k] = goc[k]; }));
  Object.keys(goc).forEach((k) => { if (!moi[k]) moi[k] = goc[k]; });
  G.man = moi;
})();
