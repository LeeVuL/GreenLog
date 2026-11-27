/* GreenLog 0.4.9 · mục 163–164: màn mở app có chuyển động
   mầm mọc khỏi đất → hai lá xòe → vẽ dấu ✓ → GreenLog → tên khách sạn → bé Mầm thò lên vẫy tay chào đúng tên → mờ vào trang chủ
   lần mở đầu trong ngày ~2,6 giây; các lần sau trong ngày ~0,6 giây; chạm để bỏ qua */
(function () {
  const KS = 'Cảnh quan|Mövenpick Resort Waverly Phu Quoc';
  const CSS = `
#moDau{position:fixed;inset:0;z-index:9999;background:#123524;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;font-family:"Be Vietnam Pro",system-ui,sans-serif;color:#fff;overflow:hidden;transition:opacity .38s ease;padding:24px;text-align:center;-webkit-tap-highlight-color:transparent}
#moDau.het{opacity:0;pointer-events:none}
#moDau .md-logo{width:min(46vw,210px);height:auto;overflow:visible}
#moDau .md-dat{transform-origin:24px 41.5px;transform:scaleX(0);animation:mdDat .35s ease-out .05s forwards}
#moDau .md-than{stroke-dasharray:17;stroke-dashoffset:17;animation:mdVe .45s ease-out .3s forwards}
#moDau .md-la1{transform-origin:24px 29px;transform:scale(0) rotate(25deg);animation:mdLa .45s cubic-bezier(.3,1.5,.5,1) .65s forwards}
#moDau .md-la2{transform-origin:24px 24px;transform:scale(0) rotate(-25deg);animation:mdLa .5s cubic-bezier(.3,1.5,.5,1) .8s forwards}
#moDau .md-tick{stroke-dasharray:12;stroke-dashoffset:12;animation:mdVe .32s ease-out 1.2s forwards}
#moDau h1{margin:22px 0 0;font-size:clamp(34px,10vw,52px);font-weight:800;letter-spacing:.5px;opacity:0;transform:translateY(10px);animation:mdLen .45s ease-out 1.35s forwards}
#moDau h1 b{color:#C9E265;font-weight:800}
#moDau .md-ks span{display:block;white-space:nowrap}#moDau .md-ks span:first-child{font-size:.82em;letter-spacing:2px;text-transform:uppercase;color:#C9E265;margin-bottom:3px}
#moDau .md-ks{margin-top:8px;font-size:clamp(13px,4.1vw,18px);color:#D7E4D3;max-width:340px;line-height:1.4;opacity:0;transform:translateY(8px);animation:mdLen .45s ease-out 1.6s forwards}
#moDau .md-mam{position:absolute;right:max(18px,6vw);bottom:-120px;display:flex;align-items:flex-end;gap:8px;animation:mdTho .55s cubic-bezier(.3,1.4,.5,1) 1.75s forwards}
#moDau .md-mam svg{width:86px;height:86px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.25))}
#moDau .md-tay{transform-origin:82px 60px;animation:mdVay .5s ease-in-out 2.15s 2 alternate}
#moDau .md-noi{order:-1;margin-bottom:62px;background:#fff;color:#123524;font-weight:700;font-size:15px;padding:9px 13px;border-radius:16px 16px 4px 16px;white-space:nowrap;opacity:0;transform:scale(.6);transform-origin:100% 100%;animation:mdNoi .3s ease-out 2.05s forwards;box-shadow:0 4px 12px rgba(0,0,0,.2)}
#moDau .md-bo{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom) + 14px);font-size:12px;color:#7E9A86;opacity:0;animation:mdLen .4s ease-out 1.9s forwards}
#moDau.nhanh *{animation-duration:.01s!important;animation-delay:0s!important}
@keyframes mdDat{to{transform:scaleX(1)}}
@keyframes mdVe{to{stroke-dashoffset:0}}
@keyframes mdLa{to{transform:scale(1) rotate(0)}}
@keyframes mdLen{to{opacity:1;transform:none}}
@keyframes mdTho{to{bottom:calc(env(safe-area-inset-bottom) + 34px)}}
@keyframes mdVay{from{transform:rotate(0)}to{transform:rotate(-28deg)}}
@keyframes mdNoi{to{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion:reduce){#moDau *{animation-duration:.01s!important;animation-delay:0s!important}}`;
  const LOGO = `<svg class="md-logo" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="#C9E265" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <ellipse class="md-dat" cx="24" cy="41.5" rx="9" ry="2.5"/>
    <path class="md-than" d="M24 40V24"/>
    <path class="md-la1" d="M24 29c-7 0-11-4-11-11 7 0 11 4 11 11z"/>
    <path class="md-la2" d="M24 24c0-9 5-14 14-14 0 9-5 14-14 14z" fill="#C9E265"/>
    <path class="md-tick" d="M27.5 18.5l2.5 2.5 4.5-5.5" stroke="#123524" stroke-width="2.4"/></g></svg>`;
  /* bé Mầm (giống ảnh đại diện trợ lý) + một cánh tay để vẫy */
  const MAM = `<svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="48" fill="#1E4A36"/>
    <path class="md-tay" d="M73 60 q12 -4 14 -16" stroke="#C8E05A" stroke-width="6" stroke-linecap="round" fill="none"/>
    <rect x="22" y="36" width="52" height="40" rx="12" fill="#C8E05A"/><circle cx="37" cy="54" r="5" fill="#163A2B"/><circle cx="59" cy="54" r="5" fill="#163A2B"/>
    <path d="M38 66 q10 6 20 0" stroke="#163A2B" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M48 36 v-14" stroke="#C8E05A" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M48 24 c-9 0 -13 -5 -13 -10 c7 0 13 3 13 10z" fill="#7FB23A"/><path d="M48 22 c9 0 13 -5 13 -10 c-7 0 -13 3 -13 10z" fill="#C8E05A"/></svg>`;
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const homNay = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

  /* chạy màn mở đầu; loiChao: "Chào anh Hiệp!" (hoặc rỗng khi chưa đăng nhập); xong(): gọi khi đã mờ hết */
  const chay = (opt) => {
    opt = opt || {};
    if (document.getElementById('moDau')) return;
    if (!document.getElementById('moDauCss')) { const st = document.createElement('style'); st.id = 'moDauCss'; st.textContent = CSS; document.head.appendChild(st); }
    let nhanh = !!opt.nhanh;
    try { if (!opt.luonDayDu && localStorage.getItem('gl_mo_dau') === homNay()) nhanh = true; localStorage.setItem('gl_mo_dau', homNay()); } catch (e) { /* bỏ qua */ }
    const el = document.createElement('div'); el.id = 'moDau'; el.className = nhanh ? 'nhanh' : '';
    el.innerHTML = `${LOGO}<h1>Green<b>Log</b></h1><div class="md-ks">${String(opt.ks || KS).split('|').map((x) => `<span>${esc(x)}</span>`).join('')}</div>
      ${opt.loiChao ? `<div class="md-mam"><div class="md-noi">${esc(opt.loiChao)}</div>${MAM}</div>` : ''}${nhanh ? '' : '<div class="md-bo">Chạm để vào ngay</div>'}`;
    document.body.appendChild(el);
    let xong = false;
    const tat = () => { if (xong) return; xong = true; el.classList.add('het'); setTimeout(() => { el.remove(); if (opt.xong) opt.xong(); }, 400); };
    el.addEventListener('click', tat);
    setTimeout(tat, nhanh ? 650 : 3000);
  };
  window.GL_MO_DAU = chay;

  /* trong app: nạp sớm (đầu <body>), chạy ngay với lời chào đã nhớ, rồi đổi lời chào khi app biết người đăng nhập */
  if (!window.GL_MO_DAU_XEM) {
    const G = () => window.GL;
    const en = () => { try { return localStorage.getItem('gl_lang') === '"en"' || localStorage.getItem('gl_lang') === 'en'; } catch (e) { return false; } };
    const loiChao = () => { try { const g = G(); const u = g && g.S && g.S.u; if (!u) return ''; if (g.lang && g.lang() === 'en') return 'Hi ' + (g.laAnhVu && g.laAnhVu() ? 'Landscape Manager' : String(u.ten).split(' ').pop()) + '!';
      return 'Chào ' + (g.mamGoi ? g.mamGoi() : 'anh ' + String(u.ten).split(' ').pop()) + '!'; } catch (e) { return ''; } };
    const batDau = () => {
      let cu = ''; try { cu = localStorage.getItem('gl_u_chao') || ''; } catch (e) { /* bỏ qua */ }
      chay({ loiChao: cu, ks: en() ? 'Landscape|Mövenpick Resort Waverly Phu Quoc' : KS });
      let n = 0; const t = setInterval(() => { const c = loiChao(); const md = document.getElementById('moDau');
        if (c) { try { localStorage.setItem('gl_u_chao', c); } catch (e) { /* */ }
          const noi = md && md.querySelector('.md-noi'); if (noi) noi.textContent = c; else if (md) md.insertAdjacentHTML('beforeend', `<div class="md-mam"><div class="md-noi">${esc(c)}</div>${MAM}</div>`);
          clearInterval(t); }
        if (++n > 60 || !md) clearInterval(t); }, 50);
    };
    if (document.body) batDau(); else document.addEventListener('DOMContentLoaded', batDau);
  }
})();
