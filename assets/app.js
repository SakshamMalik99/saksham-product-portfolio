// Mobile menu and current-page marker. Nothing else runs on scroll.
const head = document.querySelector('.site-head');
const btn = document.querySelector('.menu-btn');
if (head && btn) {
  btn.addEventListener('click', () => {
    const open = head.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
const page = location.pathname.split('/').pop() || 'index.html';
const current = page.startsWith('case-study') ? 'work.html' : page;
document.querySelectorAll('.navlinks a').forEach((a) => {
  if (a.getAttribute('href') === current) {
    a.classList.add('active');
    a.setAttribute('aria-current', 'page');
  }
});
