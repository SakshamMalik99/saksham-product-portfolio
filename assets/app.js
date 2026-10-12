// Mobile menu, current-page marker, and a few scroll-linked touches.
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

// Case study contents: highlight the section being read
const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      tocLinks.forEach((a) => a.classList.remove('current'));
      const link = byId.get(e.target.id);
      if (link) link.classList.add('current');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
}

const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!calm && 'IntersectionObserver' in window) {
  // Key numbers count up the first time they scroll into view.
  // Only numbers that start below the fold are animated, so nothing visible ever jumps.
  const figures = [...document.querySelectorAll('.figures strong')].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
  const parse = (text) => {
    const m = text.match(/^(\D*?)(\d+)(.*)$/);
    return m ? { pre: m[1], n: parseInt(m[2], 10), post: m[3] } : null;
  };
  const count = (el) => {
    const p = parse(el.dataset.final);
    if (!p || p.n === 0) { el.textContent = el.dataset.final; return; }
    const start = performance.now(), dur = 900;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = p.pre + Math.round(p.n * eased) + p.post;
      if (k < 1) requestAnimationFrame(step); else el.textContent = el.dataset.final;
    };
    requestAnimationFrame(step);
  };
  const numObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { count(e.target); numObs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  figures.forEach((el) => {
    el.dataset.final = el.textContent;
    const p = parse(el.textContent);
    if (p && p.n > 0) el.textContent = p.pre + '0' + p.post;
    numObs.observe(el);
  });

  // Flow steps light up in order the first time they scroll into view
  const flows = [...document.querySelectorAll('.flow')].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
  const flowObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('lit'); flowObs.unobserve(e.target); } });
  }, { threshold: 0.3 });
  flows.forEach((el) => { el.classList.add('armed'); flowObs.observe(el); });
}
