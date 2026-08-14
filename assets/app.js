
const bar=document.querySelector('.progress');
addEventListener('scroll',()=>{if(bar){const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(scrollY/h*100)+'%'}});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
const path=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.navlinks a').forEach(a=>{if(a.getAttribute('href')===path)a.classList.add('active')});
