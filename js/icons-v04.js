/* GreenLog 0.4 · biểu tượng riêng cho từng mục (mục 58), cùng nét với bộ cũ */
(function () {
  const S = 'stroke="#2A3A30" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"';
  const nen = '<rect x="1" y="1" width="62" height="62" rx="14" fill="#EEF2EE"/>';
  const svg = (ten, body) => `<svg viewBox="0 0 64 64" role="img" aria-label="${ten}">${nen}${body}</svg>`;
  const lich = (y) => `<rect x="10" y="${y}" width="44" height="38" rx="5" fill="#FFFFFF" ${S}/><path d="M10 ${y + 10} h44" ${S}/><path d="M20 ${y - 4} v8 M44 ${y - 4} v8" ${S}/>`;
  const IC = {
    // loa + tờ ghi chú
    nhac_nho: svg('Nhắc nhở', `<rect x="36" y="14" width="18" height="22" rx="3" fill="#FFFFFF" ${S}/><path d="M40 21 h10 M40 26 h10 M40 31 h6" ${S}/>
      <path d="M12 30 h6 l14 -9 v26 l-14 -9 h-6 z" fill="#C9A86A" ${S}/><path d="M18 38 l3 10 h5 l-3 -10" fill="#FFFFFF" ${S}/><path d="M36 42 q4 3 0 7" fill="none" ${S}/>`),
    // lịch tháng + vòng mũi tên lặp
    dinh_ky_thang: svg('Kế hoạch định kỳ tháng', `${lich(14)}<path d="M24 38 a8 8 0 1 1 3 6.2" fill="none" stroke="#2C5A41" stroke-width="2.4" stroke-linecap="round"/><path d="M23 46 l4 -1.8 l-1 -4.2" fill="none" stroke="#2C5A41" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="40" y="29" width="7" height="6" rx="1.5" fill="#5E9E6E"/><rect x="40" y="39" width="7" height="6" rx="1.5" fill="#C9A86A"/>`),
    // lịch + "20→19" + ổ khóa
    ky_dinh_ky: svg('Kỳ định kỳ', `${lich(14)}<text x="15" y="38" font-family="Arial" font-size="9" font-weight="700" fill="#2C5A41">20→19</text>
      <rect x="36" y="40" width="14" height="11" rx="2" fill="#C9A86A" ${S}/><path d="M39 40 v-3 a4 4 0 0 1 8 0 v3" fill="none" ${S}/>`),
    // màn chiếu + biểu đồ cột
    slide_tuan: svg('Slide họp tuần', `<path d="M10 13 h44" ${S}/><rect x="13" y="15" width="38" height="26" rx="2" fill="#FFFFFF" ${S}/><path d="M32 41 v8 M26 53 l6 -4 l6 4" ${S}/>
      <rect x="19" y="30" width="5" height="7" fill="#5E9E6E"/><rect x="27" y="25" width="5" height="12" fill="#2C5A41"/><rect x="35" y="21" width="5" height="16" fill="#C9E265" stroke="#2C5A41" stroke-width=".6"/><path d="M43 33 l3 -6" ${S}/>`),
    // chồng sách + tờ hướng dẫn 1-2-3
    sop: svg('Thư viện SOP', `<rect x="10" y="42" width="30" height="7" rx="1.5" fill="#2C5A41" ${S}/><rect x="12" y="35" width="28" height="7" rx="1.5" fill="#5E9E6E" ${S}/><rect x="10" y="28" width="30" height="7" rx="1.5" fill="#C9A86A" ${S}/>
      <rect x="34" y="12" width="20" height="28" rx="2" fill="#FFFFFF" ${S}/><text x="37" y="21" font-family="Arial" font-size="6" font-weight="700" fill="#2C5A41">1</text><text x="37" y="29" font-family="Arial" font-size="6" font-weight="700" fill="#2C5A41">2</text><text x="37" y="37" font-family="Arial" font-size="6" font-weight="700" fill="#2C5A41">3</text>
      <path d="M42 19 h9 M42 27 h9 M42 35 h7" ${S}/>`),
    // sách mở có hình lá
    danh_muc_cay: svg('Danh mục cây trồng', `<path d="M8 18 q12 -4 24 2 v30 q-12 -6 -24 -2 z" fill="#FFFFFF" ${S}/><path d="M56 18 q-12 -4 -24 2 v30 q12 -6 24 -2 z" fill="#FFFFFF" ${S}/>
      <path d="M14 38 q0 -12 12 -14 q0 12 -12 14 z" fill="#5E9E6E" ${S}/><path d="M14 38 l9 -10" ${S}/><path d="M38 26 h12 M38 31 h12 M38 36 h9 M38 41 h11" ${S}/>`),
    // phong bì + biểu đồ đi lên
    bao_cao_gm: svg('Báo cáo tháng gửi GM', `<rect x="9" y="22" width="40" height="28" rx="3" fill="#FFFFFF" ${S}/><path d="M9 24 l20 14 l20 -14" fill="none" ${S}/>
      <circle cx="46" cy="19" r="10" fill="#C9E265" stroke="#2C5A41" stroke-width="1.1"/><path d="M40 23 l4 -4 l3 3 l5 -6" fill="none" stroke="#2C5A41" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M49 16 h3 v3" fill="none" stroke="#2C5A41" stroke-width="1.8" stroke-linecap="round"/>`),
    // bìa hồ sơ + con dấu + chữ ký
    ho_so: svg('Hồ sơ cuối kỳ', `<path d="M9 18 h16 l4 5 h26 v27 a3 3 0 0 1 -3 3 h-40 a3 3 0 0 1 -3 -3 z" fill="#C9A86A" ${S}/><rect x="15" y="27" width="34" height="22" rx="2" fill="#FFFFFF" ${S}/>
      <circle cx="41" cy="40" r="6" fill="none" stroke="#B8574F" stroke-width="1.6"/><path d="M38.5 40 h5 M41 37.5 v5" stroke="#B8574F" stroke-width="1.2"/><path d="M19 33 h16 M19 38 h10 M19 44 q4 -4 6 0 t6 0" fill="none" ${S}/>`),
    // bảng ô vuông có ô tích, ô khóa
    phan_quyen_viec: svg('Phân quyền theo đầu việc', `<rect x="10" y="12" width="44" height="40" rx="4" fill="#FFFFFF" ${S}/><path d="M10 25 h44 M10 38 h44 M25 12 v40 M40 12 v40" ${S}/>
      <path d="M28 18 l3 3 l5 -6" fill="none" stroke="#2C5A41" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M43 31 l3 3 l5 -6" fill="none" stroke="#2C5A41" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="29" y="43" width="8" height="6" rx="1" fill="#C9A86A" ${S}/><path d="M31 43 v-2 a2 2 0 0 1 4 0 v2" fill="none" ${S}/><path d="M14 18 h7 M14 31 h7 M14 44 h7" ${S}/>`),
    // chậu cây trong khung nhà kính
    vuon_uom_nt: svg('Vườn ươm nội thất', `<path d="M10 30 l22 -16 l22 16 v22 h-44 z" fill="#FFFFFF" ${S}/><path d="M10 30 h44 M32 14 v16 M21 22 v30 M43 22 v30" stroke="#9FB8A8" stroke-width="1"/>
      <path d="M26 42 h12 l-2 9 h-8 z" fill="#C9A86A" ${S}/><path d="M32 42 v-8" ${S}/><path d="M32 36 q-7 -1 -8 -8 q7 1 8 8 z M32 34 q6 -1 7 -8 q-6 1 -7 8 z" fill="#5E9E6E" ${S}/>`),
    // bản đồ khu có ghim + đồng hồ: toàn bộ phận hôm nay
    toan_bp: svg('Hôm nay toàn bộ phận', `<path d="M9 18 l14 -5 l18 5 l14 -5 v33 l-14 5 l-18 -5 l-14 5 z" fill="#FFFFFF" ${S}/><path d="M23 13 v33 M41 18 v33" stroke="#9FB8A8" stroke-width="1"/>
      <path d="M17 30 a4 4 0 1 1 8 0 c0 4 -4 8 -4 8 s-4 -4 -4 -8 z" fill="#2C5A41"/><path d="M33 24 a4 4 0 1 1 8 0 c0 4 -4 8 -4 8 s-4 -4 -4 -8 z" fill="#C9A86A"/>
      <circle cx="47" cy="44" r="7" fill="#C9E265" stroke="#2C5A41" stroke-width="1.1"/><path d="M47 40 v4 l3 2" fill="none" stroke="#2C5A41" stroke-width="1.4" stroke-linecap="round"/>`),
  };
  window.GL_IC = Object.assign(window.GL_IC || {}, IC);
  const G = window.GL; if (G && G.IC) Object.assign(G.IC, IC);
  const gan = () => {
    const M = (window.GL || {}).man || {};
    const map = { nhacnho: 'nhac_nho', khthang: 'dinh_ky_thang', kydinhky: 'ky_dinh_ky', slidetuan: 'slide_tuan', sop: 'sop', danhmuccay: 'danh_muc_cay', baocaogm: 'bao_cao_gm', hoso: 'ho_so', quyenviec: 'phan_quyen_viec' };
    Object.keys(map).forEach((k) => { if (M[k]) M[k].ic = map[k]; });
  };
  window.GL_IC_GAN = gan; document.addEventListener('DOMContentLoaded', gan);
})();
