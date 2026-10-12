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

// Who I work with: pick a node to see that relationship
const nodes = [...document.querySelectorAll('.bridge-node')];
if (nodes.length) {
  const show = (key) => {
    nodes.forEach((n) => n.setAttribute('aria-pressed', n.dataset.node === key ? 'true' : 'false'));
    document.querySelectorAll('.bridge-detail').forEach((d) => { d.hidden = d.dataset.detail !== key; });
    document.querySelectorAll('.bridge-lines line').forEach((l) => l.classList.toggle('on', l.dataset.for === key));
  };
  nodes.forEach((n) => n.addEventListener('click', () => show(n.dataset.node)));
  show('customers');
}

// Decision lab: re-rank FELT's features with the visitor's weights
const lab = document.querySelector('.lab');
if (lab) {
  const inputs = [...lab.querySelectorAll('input[data-w]')];
  const list = lab.querySelector('.ranking');
  const note = lab.querySelector('.lab-note');
  const items = [...list.children].map((li, idx) => ({ li, idx }));
  const rank = () => {
    const w = {};
    inputs.forEach((inp) => {
      w[inp.dataset.w] = Number(inp.value);
      lab.querySelector(`output[data-out="${inp.dataset.w}"]`).textContent = inp.value + 'x';
    });
    const total = w.i + w.f + w.a + w.e;
    if (total === 0) { note.textContent = 'Give at least one criterion some weight to see a ranking.'; return; }
    const before = [...list.children];
    items.forEach((it) => {
      const d = it.li.dataset;
      it.score = (w.i * d.i + w.f * d.f + w.a * d.a + w.e * d.e) / total;
      it.li.querySelector('b').textContent = it.score.toFixed(2);
    });
    const sorted = [...items].sort((x, y) => (y.score - x.score) || (x.idx - y.idx));
    sorted.forEach((it, pos) => {
      list.appendChild(it.li);
      const moved = before.indexOf(it.li) !== pos;
      if (moved && !calm) { it.li.classList.add('moved'); setTimeout(() => it.li.classList.remove('moved'), 700); }
    });
    const mvpTop = sorted.slice(0, 3).filter((it) => it.li.querySelector('em.mvp')).length;
    const equal = w.i === w.f && w.f === w.a && w.a === w.e;
    note.textContent = equal
      ? 'With equal weights, the top three are exactly the three MVP features.'
      : `MVP features in the top three with these weights: ${mvpTop} of 3.`;
  };
  inputs.forEach((inp) => inp.addEventListener('input', rank));
  lab.querySelector('.lab-reset').addEventListener('click', () => { inputs.forEach((inp) => { inp.value = 1; }); rank(); });
}

if (!calm && 'IntersectionObserver' in window) {
  // Key numbers count up the first time they scroll into view. The real value stays
  // in the page until then, so a fast scroll, a screenshot or a crawler never sees a zero.
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
  }, { threshold: 0.15 });
  figures.forEach((el) => {
    el.dataset.final = el.textContent;
    numObs.observe(el);
  });

  // Flow steps light up in order the first time they scroll into view
  const flows = [...document.querySelectorAll('.flow')].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
  const flowObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('lit'); flowObs.unobserve(e.target); } });
  }, { threshold: 0.3 });
  flows.forEach((el) => { el.classList.add('armed'); flowObs.observe(el); });
}
