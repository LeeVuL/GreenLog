/* GreenLog – việc nội bộ (bãi biển, vườn rau, thu hoạch, cây nội thất, rác hữu cơ, compost, máy sàng cát, vườn ươm), đồng hồ nước, vườn ươm sân vườn */
(function () {
  const API = window.GL_API; const G = window.GL; const S = G.S; const { esc, q } = G;
  const diem = (loai) => S.dm.diemkhac.filter((x) => x.loai === loai);
  const BUOI = ['Sáng', 'Chiều'];

  G.dsNoiBo = () => [
    ['bien', '🏖️', 'Vệ sinh bãi biển', 'kg rác + ảnh cân, sáng và chiều'], ['ktbien', '👀', 'Kiểm tra bãi biển', 'Sáng và chiều'],
    ['vuonrau', '🥬', 'Chăm sóc vườn rau', 'Checklist 7 vườn, đo pH, nhiệt độ, ppm'], ['thuhoach', '🧺', 'Thu hoạch vườn rau', 'Cây, kg, ảnh cân'],
    ['noithat', '🪴', 'Tưới cây nội thất', 'Mỗi điểm 2 ngày/lần, nhập số chậu'], ['vuonuomnt', '🌱', 'Vườn ươm cây nội thất', 'Tưới, vệ sinh, mô tả'],
    ['rac', '♻️', 'Thu gom rác hữu cơ', '1 số tổng kg + ảnh cân'], ['compost', '🟫', 'Phân compost tuần hoàn', 'kg phân ra lò'],
    ['may', '🚜', 'Máy sàng cát', 'Vận hành, bảo trì Kubota / Sand Man'], ['hangrao', '🧹', 'Rác bên kia hàng rào', 'Thứ Sáu hằng tuần'],
  ].map((x) => `<a class="the-viec" href="#/nb/${x[0]}"><span class="bt">${x[1]}</span><span class="gian"><b>${x[2]}</b><span class="mo">${x[3]}</span></span>›</a>`).join('');

  const hn = () => API.ngay();
  const NB = {
    bien: () => G.manSo({ tieuDe: 'Vệ sinh bãi biển', bang: 'VeSinhBien', lui: '#/viec', loc: { 'Ngày': { tu: G.congNgay(hn(), -6) } }, nutMoi: 'Ghi vệ sinh bãi biển',
      truong: [{ k: 'Buổi', nhan: 'Buổi', loai: 'chips', ds: BUOI.concat('Bên kia hàng rào'), gt: new Date().getHours() < 12 ? 'Sáng' : 'Chiều', bb: true }, { k: 'kg rác', nhan: 'Số kg rác', loai: 'so', bb: true }, { k: 'Ảnh', nhan: 'Ảnh cân', loai: 'anh', bb: true, toiDa: 3 }],
      luu: (v) => API.goi('ghi', { bang: 'VeSinhBien', dong: Object.assign({ 'Ngày': '', 'Người ghi': '' }, v) }),
      dong: (r) => `<div class="gian"><b>${G.ngayVN(r['Ngày'])} · ${esc(r['Buổi'])}</b><div class="mo">${esc(r['Người ghi'])}</div></div><b>${G.so(r['kg rác'])} kg</b>` }),
    ktbien: () => G.manSo({ tieuDe: 'Kiểm tra bãi biển', bang: 'KiemTraBien', lui: '#/viec', loc: { 'Ngày': { tu: G.congNgay(hn(), -6) } }, nutMoi: 'Ghi kiểm tra',
      truong: [{ k: 'Buổi', nhan: 'Buổi', loai: 'chips', ds: BUOI, gt: new Date().getHours() < 12 ? 'Sáng' : 'Chiều', bb: true }, { k: 'Đoạn bãi', nhan: 'Đoạn bãi', loai: 'nhieu', ds: diem('Bãi biển').map((x) => x.ten) },
        { k: 'Tình trạng', nhan: 'Tình trạng', loai: 'chips', ds: ['Sạch', 'Có rác trôi dạt', 'Có rong, tảo', 'Cần sàng cát', 'Khác'], bb: true }, { k: 'Ảnh', nhan: 'Ảnh', loai: 'anh', toiDa: 3 }, { k: 'Ghi chú', nhan: 'Ghi chú', loai: 'mota' }],
      luu: (v) => API.goi('ghi', { bang: 'KiemTraBien', dong: Object.assign({ 'Ngày': '', 'Người ghi': '' }, v) }),
      dong: (r) => `<div class="gian"><b>${G.ngayVN(r['Ngày'])} · ${esc(r['Buổi'])}</b><div class="mo">${esc(r['Đoạn bãi'])} ${esc(r['Ghi chú'])}</div></div><span class="chip ${r['Tình trạng'] === 'Sạch' ? 'xanh' : 'cam'}">${esc(r['Tình trạng'])}</span>` }),
    thuhoach: () => G.manSo({ tieuDe: 'Thu hoạch vườn rau', bang: 'ThuHoach', lui: '#/viec', loc: { 'Ngày': { tu: S.dm.ky.tu } }, nutMoi: 'Ghi thu hoạch',
      truong: () => [{ k: 'Vườn', nhan: '1. Khu vực thu hoạch', loai: 'chips', ds: diem('Vườn rau').map((x) => x.ten), bb: true },
        { k: 'Tên cây', nhan: '2. Loại nông sản', loai: 'chips', ds: S.dm.caytrong, bb: true }, { k: 'kg', nhan: 'Số kg', loai: 'so', bb: true }, { k: 'Bếp nhận', nhan: 'Nguồn / bếp nhận', loai: 'chips', ds: ['Nhân viên nội bộ', 'Bếp tự hái', 'Bếp lạnh', 'Bếp nóng', 'Islander', 'Aura', 'Sky Bistro'] }, { k: 'Ảnh cân', nhan: 'Ảnh cân', loai: 'anh', bb: true, toiDa: 3 }],
      luu: async (v) => { await G.chanCachLyVuonRau(); const vu = diem('Vườn rau').find((x) => x.ten === v['Vườn']) || {}; return API.goi('ghi', { bang: 'ThuHoach', dong: Object.assign({ 'Ngày': '', 'Mã vườn': vu.ma || '', 'Mã cây': '', 'Người ghi': '' }, v) }); },
      dau: (ds) => { const theo = {}; ds.forEach((r) => { theo[r['Vườn'] || 'Chưa ghi vườn'] = (theo[r['Vườn'] || 'Chưa ghi vườn'] || 0) + (+r.kg || 0); });
        return `<div class="the"><div class="so-lon">${G.so(ds.reduce((a, r) => a + +r.kg, 0))} kg</div><div class="mo">kỳ ${esc(S.dm.ky.ten)}${Object.keys(theo).length ? ' · ' + Object.keys(theo).map((k) => `${esc(k)}: ${G.so(theo[k])} kg`).join(' · ') : ''}</div></div>`; },
      dong: (r) => `<div class="gian"><b>${esc(r['Tên cây'])}</b><div class="mo">${G.ngayVN(r['Ngày'])} · ${esc(r['Vườn'] || '')} · ${esc(r['Bếp nhận'])}</div></div><b>${G.so(r.kg)} kg</b>` }),
    rac: () => G.manSo({ tieuDe: 'Thu gom rác hữu cơ', bang: 'RacHuuCo', lui: '#/viec', loc: { 'Ngày': { tu: S.dm.ky.tu } }, nutMoi: 'Ghi rác hữu cơ hôm nay',
      dau: (ds) => `<div class="the luoi2"><div><div class="so-lon">${G.so(ds.filter((r) => r['Ngày'] === hn()).reduce((a, r) => a + +r['kg rác thu gom'], 0))}</div><div class="mo">kg hôm nay</div></div><div><div class="so-lon">${G.so(ds.reduce((a, r) => a + +r['kg rác thu gom'], 0))}</div><div class="mo">kg kỳ ${esc(S.dm.ky.ten)}</div></div></div>`,
      truong: [{ nhan: 'Một số tổng cho 7 nguồn: ' + diem('Nguồn rác hữu cơ').map((x) => x.ten).join(', '), loai: 'ghichu' }, { k: 'kg rác thu gom', nhan: 'Tổng kg', loai: 'so', bb: true }, { k: 'Ảnh', nhan: 'Ảnh cân', loai: 'anh', bb: true, toiDa: 3 }],
      luu: (v) => API.goi('ghi', { bang: 'RacHuuCo', dong: Object.assign({ 'Ngày': '', 'Người ghi': '' }, v) }),
      dong: (r) => `<div class="gian"><b>${G.ngayVN(r['Ngày'])}</b><div class="mo">${esc(r['Người ghi'])}</div></div><b>${G.so(r['kg rác thu gom'])} kg</b>` }),
    compost: () => G.manSo({ tieuDe: 'Phân compost tuần hoàn', bang: 'PhanCompost', lui: '#/viec', loc: { 'Ngày': { tu: G.congNgay(hn(), -90) } }, nutMoi: 'Ghi phân compost',
      truong: [{ k: 'Phân compost tuần hoàn (kg)', nhan: 'Số kg', loai: 'so', bb: true }, { k: 'Ảnh', nhan: 'Ảnh', loai: 'anh', toiDa: 3 }, { k: 'Ghi chú', nhan: 'Ghi chú (dùng ở đâu)', loai: 'mota' }],
      luu: (v) => API.goi('ghi', { bang: 'PhanCompost', dong: Object.assign({ 'Ngày': '', 'Người ghi': '' }, v) }),
      dong: (r) => `<div class="gian"><b>${G.ngayVN(r['Ngày'])}</b><div class="mo">${esc(r['Ghi chú'])}</div></div><b>${G.so(r['Phân compost tuần hoàn (kg)'])} kg</b>` }),
    may: () => G.manSo({ tieuDe: 'Máy sàng cát', bang: 'MaySangCat', lui: '#/viec', loc: { 'Ngày': { tu: G.congNgay(hn(), -60) } }, nutMoi: 'Ghi chạy máy / bảo trì',
      dau: () => `<p class="mo">Lịch bảo trì: Kubota ngày 9, 19, 29 · Sand Man ngày 10, 20, 30 (tháng 2 lùi theo cuối tháng).</p>`,
      truong: [{ k: 'Máy', nhan: 'Máy', loai: 'chips', ds: diem('Máy sàng cát').map((x) => x.ten), bb: true }, { k: 'Bảo trì', nhan: 'Loại', loai: 'chips', ds: ['Vận hành', 'Bảo trì định kỳ', 'Sửa chữa'], gt: 'Vận hành', bb: true },
        { k: 'Giờ bắt đầu', nhan: 'Giờ bắt đầu', loai: 'gio' }, { k: 'Giờ kết thúc', nhan: 'Giờ kết thúc', loai: 'gio' }, { k: 'Đoạn bãi', nhan: 'Đoạn bãi', loai: 'nhieu', ds: diem('Bãi biển').map((x) => x.ten) },
        { k: 'Nhiên liệu (lít)', nhan: 'Nhiên liệu (lít)', loai: 'so' }, { k: 'Ảnh', nhan: 'Ảnh', loai: 'anh', bb: true, toiDa: 3 }, { k: 'Ghi chú', nhan: 'Ghi chú', loai: 'mota' }],
      luu: (v) => API.goi('ghi', { bang: 'MaySangCat', dong: Object.assign({ 'Ngày': '', 'Người ghi': '' }, v) }),
      dong: (r) => `<div class="gian"><b>${esc(r['Máy'])} · ${esc(r['Bảo trì'])}</b><div class="mo">${G.ngayVN(r['Ngày'])} ${esc(r['Giờ bắt đầu'])}–${esc(r['Giờ kết thúc'])} · ${esc(r['Đoạn bãi'])}</div></div>${r['Nhiên liệu (lít)'] ? `<b>${G.so(r['Nhiên liệu (lít)'])} L</b>` : ''}` }),
    hangrao: () => { location.hash = '#/nb/bien'; },
    vuonuomnt: () => manVuonUom('Vườn ươm cây nội thất'),
    noithat: manNoiThat,
    vuonrau: manVuonRau,
  };
  G.man.nb = { fn: (loai) => (NB[loai] || NB.bien)(), an: true };

  /* chặn thu hoạch khi vườn rau đang cách ly thuốc */
  G.chanCachLyVuonRau = async () => {
    const d = await API.goi('docNhieu', { ds: [{ bang: 'NhatKyPhunBon', loc: { 'Hết cách ly': { tu: API.ngay() } } }] }).catch(() => ({ NhatKyPhunBon: [] }));
    const x = d.NhatKyPhunBon.find((r) => /vườn rau|vị /i.test((r['Cụm'] || '') + ' ' + (r['Vị trí chi tiết'] || '')) && +r['Cách ly dài nhất (ngày)'] > 0);
    if (x) throw new Error('Vườn rau đang cách ly thuốc đến ' + G.ngayVN(x['Hết cách ly']) + '. Chưa được thu hoạch.');
  };

  /* ---- cây nội thất: 10 điểm, mỗi điểm 2 ngày/lần ---- */
  async function manNoiThat() {
    const m = G.khung('Tưới cây nội thất', 'Mỗi điểm 2 ngày/lần', '#/viec');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'CayNoiThat', loc: { 'Ngày': { tu: G.congNgay(API.ngay(), -14) } } }] })).CayNoiThat;
    const cuoi = {}; ds.forEach((r) => { if (!cuoi[r['Mã điểm']] || r['Ngày'] > cuoi[r['Mã điểm']]['Ngày']) cuoi[r['Mã điểm']] = r; });
    const ghi = q('noibo') >= 2;
    m.innerHTML = `<div class="ds">${diem('Cây nội thất').map((p) => {
      const c = cuoi[p.ma]; const songay = c ? Math.round((new Date(API.ngay()) - new Date(c['Ngày'])) / 864e5) : 99;
      return `<div class="muc"><div class="gian"><b>${esc(p.ten)}</b><div class="mo">${c ? `Lần cuối ${G.ngayVN(c['Ngày'])} · ${esc(c['Số chậu tưới'])} chậu` : 'Chưa có'}</div></div>
        ${songay >= 2 ? '<span class="chip cam">Đến hạn</span>' : '<span class="chip xanh">Đã tưới</span>'}${ghi ? `<button class="nut nho" data-p="${p.ma}">Ghi</button>` : ''}</div>`;
    }).join('')}</div>`;
    m.querySelectorAll('[data-p]').forEach((b) => {
      b.onclick = () => G.hop((diem('Cây nội thất').find((x) => x.ma === b.dataset.p) || {}).ten, '<label class="o"><span>Số chậu đã tưới</span><input type="number" id="sc" inputmode="numeric"></label><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
        o.querySelector('#l').onclick = (e) => G.chay(async () => { const n = o.querySelector('#sc').value; if (!n) throw new Error('Nhập số chậu'); await API.goi('ghi', { bang: 'CayNoiThat', dong: { 'Ngày': '', 'Mã điểm': b.dataset.p, 'Số chậu tưới': n, 'Người ghi': '' } }); dong(); G.bao('Đã lưu'); manNoiThat(); }, e.target);
      });
    });
  }

  /* ---- vườn rau: checklist theo mô hình ---- */
  const NGUONG = { // từ trang NguongCanhBao (tạm, hiệu chỉnh sau 1 tháng)
    'Nhiệt độ bể chứa (°C)': [null, 30], 'Nhiệt độ tháp trồng (°C)': [null, 30], 'pH bể chứa': [5, 7], 'pH tháp trồng': [5, 7],
    'Dinh dưỡng bể chứa (ppm)': [300, 1250], 'Dinh dưỡng tháp trồng (ppm)': [300, 1250], 'pH đất': [5.5, 7.5], 'Nhiệt độ đất (°C)': [null, 33],
  };
  const TRUONG_VR = {
    'Thủy canh': ['Nhiệt độ bể chứa (°C)', 'Nhiệt độ tháp trồng (°C)', 'pH bể chứa', 'pH tháp trồng', 'Dinh dưỡng bể chứa (ppm)', 'Dinh dưỡng tháp trồng (ppm)'],
    'Đất': ['Nhiệt độ đất (°C)', 'pH đất'], 'Nấm': ['Nhiệt độ bên trong (°C)', 'Nhiệt độ bên ngoài (°C)', 'Độ ẩm (%)'],
  };
  const moHinh = (v) => (/Thanh/.test(v.ten) ? 'Thủy canh' : /Nấm/.test(v.ten) ? 'Nấm' : 'Đất');
  async function manVuonRau() {
    const m = G.khung('Chăm sóc Vị Garden', G.ngayVN(API.ngay()), '#/viec');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'VuonRau', loc: { 'Ngày': API.ngay() } }] })).VuonRau;
    const ghi = q('noibo') >= 2;
    m.innerHTML = `<div class="ds">${diem('Vườn rau').map((v) => {
      const r = ds.filter((x) => x['Mã vườn'] === v.ma); const ngoai = r.filter((x) => x['Ngoài ngưỡng'] === 'Có');
      return `<div class="muc" data-v="${v.ma}" style="cursor:${ghi ? 'pointer' : 'default'}"><span class="chon-vt" style="${r.length ? 'background:var(--xanh);border-color:var(--xanh);color:#fff' : ''}">${r.length ? '✓' : ''}</span><div class="gian"><b>${esc(v.ten)}</b><div class="mo">${moHinh(v)}${r.length ? ' · ' + r.map((x) => esc(x['Trường']) + (x['Giá trị'] !== 'Có' ? ': ' + esc(x['Giá trị']) : '')).join(', ') : ''}</div></div>${ngoai.length ? '<span class="chip do">Ngoài ngưỡng</span>' : ''}</div>`;
    }).join('')}</div><a class="the-viec" href="#/nb/thuhoach"><span class="bt">🧺</span><span class="gian"><b>Ghi thu hoạch</b></span>›</a>`;
    if (ghi) m.querySelectorAll('[data-v]').forEach((d) => {
      d.onclick = () => {
        const v = diem('Vườn rau').find((x) => x.ma === d.dataset.v); const mh = moHinh(v);
        const tr = [{ k: 'viec', nhan: 'Việc đã làm', loai: 'nhieu', ds: ['Tưới nước'].concat(mh === 'Thủy canh' ? [] : ['Cải tạo đất']).concat(['Gieo trồng']) },
          { k: 'cay', nhan: 'Cây gieo trồng (nếu có)', loai: 'chips', ds: S.dm.caytrong }]
          .concat(TRUONG_VR[mh].map((t) => ({ k: t, nhan: t + ' (khi đo)', loai: 'so', phu: NGUONG[t] ? `Ngưỡng báo động: ${NGUONG[t][0] != null ? 'dưới ' + NGUONG[t][0] : ''}${NGUONG[t][0] != null && NGUONG[t][1] != null ? ', ' : ''}${NGUONG[t][1] != null ? 'trên ' + NGUONG[t][1] : ''}` : '' })))
          .concat([{ k: 'khac', nhan: 'Khác', loai: 'mota' }, { k: 'anh', nhan: 'Ảnh vườn (không bắt buộc)', loai: 'anh', toiDa: 3, tuyChon: true }]);
        G.hop(v.ten, '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
          const lay = G.form(o.querySelector('#f'), tr);
          o.querySelector('#l').onclick = (e) => G.chay(async () => {
            const x = lay(); const dong_ = [];
            x.viec.forEach((t) => dong_.push({ 'Trường': t, 'Giá trị': t === 'Gieo trồng' && x.cay ? x.cay : 'Có' }));
            TRUONG_VR[mh].forEach((t) => { if (x[t] !== '') { const n = +x[t]; const g = NGUONG[t]; dong_.push({ 'Trường': t, 'Giá trị': x[t], 'Ngoài ngưỡng': g && ((g[0] != null && n < g[0]) || (g[1] != null && n > g[1])) ? 'Có' : '' }); } });
            if (x.khac) dong_.push({ 'Trường': 'Khác', 'Giá trị': x.khac });
            if (!dong_.length) throw new Error('Chưa có gì để lưu');
            if ((x.anh || []).length) dong_[0]['Ảnh'] = x.anh;
            await API.goi('ghiNhieu', { bang: 'VuonRau', dong: dong_.map((r) => Object.assign({ 'Ngày': '', 'Mã vườn': v.ma, 'Người ghi': '', 'Ngoài ngưỡng': '' }, r)) });
            dong(); G.bao(dong_.some((r) => r['Ngoài ngưỡng'] === 'Có') ? 'Đã lưu · có chỉ số ngoài ngưỡng, anh Vũ sẽ được báo' : 'Đã lưu'); manVuonRau();
          }, e.target);
        });
      };
    });
  }

  /* ---- vườn ươm (nội thất: nội bộ; sân vườn: anh Trường) ---- */
  async function manVuonUom(ten) {
    const noiThat = ten === 'Vườn ươm cây nội thất';
    await G.manSo({ tieuDe: ten, bang: 'VuonUom', lui: noiThat ? '#/viec' : '#/viec', loc: { 'Vườn ươm': ten, 'Ngày': { tu: G.congNgay(API.ngay(), -30) } }, nutMoi: 'Ghi vườn ươm hôm nay',
      coGhi: () => (noiThat ? q('noibo') >= 2 : q('vuonuom') >= 2),
      truong: () => noiThat ? [{ k: 'Việc', nhan: 'Việc đã làm', loai: 'nhieu', ds: ['Tưới', 'Vệ sinh'], bb: true }, { k: 'Mô tả', nhan: 'Mô tả', loai: 'mota' }, { k: 'Ảnh', nhan: 'Ảnh', loai: 'anh', toiDa: 3 }]
        : [{ k: 'Việc', nhan: 'Việc đã làm', loai: 'nhieu', ds: ['Tưới', 'Vệ sinh', 'Ươm mới', 'Xuất cây'], bb: true }, { k: 'Tên cây', nhan: 'Cây (khi ươm / xuất)', loai: 'cay' }, { k: 'Số lượng', nhan: 'Số cây ươm / xuất', loai: 'so' },
          { k: 'ĐVT', nhan: 'ĐVT', loai: 'chips', ds: ['Bầu', 'Chậu', 'Cây', 'Bụi'] }, { k: 'Chất cải tạo đất hữu cơ (bao)', nhan: 'Chất cải tạo đất hữu cơ (bao, 1 bao = 25 kg)', loai: 'so' }, { k: 'Mô tả', nhan: 'Mô tả', loai: 'mota' }, { k: 'Ảnh', nhan: 'Ảnh', loai: 'anh', toiDa: 3 }],
      luu: (v) => API.goi('ghi', { bang: 'VuonUom', dong: Object.assign({ 'Ngày': '', 'Vườn ươm': ten, 'Người ghi': '' }, v, { 'Tên cây': v['Tên cây'] ? v['Tên cây'].ten || v['Tên cây'] : '' }) }),
      dong: (r) => `<div class="gian"><b>${G.ngayVN(r['Ngày'])} · ${esc(r['Việc'])}</b><div class="mo">${r['Tên cây'] ? esc(r['Tên cây']) + ' · ' + esc(r['Số lượng']) + ' ' + esc(r['ĐVT']) + ' · ' : ''}${r['Chất cải tạo đất hữu cơ (bao)'] ? esc(r['Chất cải tạo đất hữu cơ (bao)']) + ' bao · ' : ''}${esc(r['Mô tả'])}</div></div>` });
  }
  G.man.vuonuom = { ten: 'Vườn ươm sân vườn', bt: '🌱', nhom: 'Việc hằng ngày', ph: 'vuonuom', fn: () => manVuonUom('Vườn ươm sân vườn') };

  /* ---- đồng hồ nước ---- */
  G.man.donghonuoc = { ten: 'Đồng hồ nước', bt: '🔢', nhom: 'Việc hằng ngày', ph: 'donghonuoc', fn: async () => {
    const m = G.khung('Đồng hồ nước', 'Đọc hằng ngày, có ảnh', '#/viec');
    const ds = (await API.goi('docNhieu', { ds: [{ bang: 'DongHoNuoc', loc: { 'Ngày': { tu: G.congNgay(API.ngay(), -40) } } }] })).DongHoNuoc;
    const ghi = q('donghonuoc') >= 2;
    m.innerHTML = diem('Đồng hồ nước').map((d) => {
      const r = ds.filter((x) => x['Mã đồng hồ'] === d.ma).sort((a, b) => (a['Ngày'] < b['Ngày'] ? 1 : -1));
      const hom = r.find((x) => x['Ngày'] === API.ngay());
      return `<div class="the"><div class="hang"><h3 class="gian">${esc(d.ten)}</h3>${hom ? '<span class="chip xanh">Đã đọc hôm nay</span>' : '<span class="chip cam">Chưa đọc</span>'}</div>
        <table class="bang" style="margin:8px 0"><tr><th>Ngày</th><th>Chỉ số</th><th>Dùng (m³)</th></tr>${r.slice(0, 7).map((x, i) => `<tr><td>${G.ngayVN(x['Ngày'])}</td><td>${G.so(x['Chỉ số'], 2)}</td><td>${r[i + 1] ? G.so(x['Chỉ số'] - r[i + 1]['Chỉ số'], 2) : ''}</td></tr>`).join('')}</table>
        ${ghi ? `<button class="nut chinh rong" data-d="${d.ma}">Ghi chỉ số hôm nay</button>` : ''}</div>`;
    }).join('');
    m.querySelectorAll('[data-d]').forEach((b) => {
      b.onclick = () => G.hop('Chỉ số ' + diem('Đồng hồ nước').find((x) => x.ma === b.dataset.d).ten, '<div id="f"></div><button class="nut chinh rong" id="l">Lưu</button>', (o, dong) => {
        const lay = G.form(o.querySelector('#f'), [{ k: 'Chỉ số', nhan: 'Chỉ số (m³)', loai: 'so', bb: true }, { k: 'Ảnh', nhan: 'Ảnh mặt đồng hồ', loai: 'anh', bb: true, toiDa: 2 }]);
        o.querySelector('#l').onclick = (e) => G.chay(async () => {
          const v = lay(); const truoc = ds.filter((x) => x['Mã đồng hồ'] === b.dataset.d).sort((a, c) => (a['Ngày'] < c['Ngày'] ? 1 : -1))[0];
          if (truoc && +v['Chỉ số'] < +truoc['Chỉ số'] && !(await G.xacNhan(`Chỉ số nhỏ hơn lần trước (${truoc['Chỉ số']}). Vẫn lưu?`, 'Vẫn lưu'))) return;
          await API.goi('ghiNhieu', { bang: 'DongHoNuoc', thay: ['Ngày', 'Mã đồng hồ'], dong: [Object.assign({ 'Ngày': API.ngay(), 'Mã đồng hồ': b.dataset.d, 'Người đọc': '' }, v)] });
          dong(); G.bao('Đã lưu'); G.taiLai();
        }, e.target);
      });
    });
  } };
  G.man.noibo = { ten: 'Việc nội bộ', bt: '🥬', nhom: 'Việc hằng ngày', ph: 'noibo', fn: () => { location.hash = '#/viec'; } };
})();
