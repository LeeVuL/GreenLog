/* GreenLog v0.4 · mục 68: màn có nút Lưu cố định (thanh-duoi) → ẩn menu dưới để không che lưới vị trí */
(function () {
  const kiem = () => { const app = document.getElementById('app'); document.body.classList.toggle('nhap', !!(app && app.querySelector('.thanh-duoi'))); };
  const bat = () => { const app = document.getElementById('app'); if (!app) return setTimeout(bat, 200); new MutationObserver(kiem).observe(app, { childList: true, subtree: true }); kiem(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bat); else bat();
})();
