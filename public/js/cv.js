(() => {
  const target = document.querySelector('#skill');
  if (!target) return;
  if (!('IntersectionObserver' in window)) { target.classList.add('in'); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  io.observe(target);
})();

(() => {
  const box = document.querySelector('.avatar[data-swap]');
  const v = box && box.querySelector('.avatar-video');
  if (!v) return;

  const ms = parseInt(box.dataset.swap, 10) || 5000;
  const showPhoto = () => { box.classList.add('is-photo'); v.pause(); };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { showPhoto(); return; }

  let timer;
  const start = () => { clearTimeout(timer); timer = setTimeout(showPhoto, ms); };

  v.addEventListener('playing', start, { once: true });
  v.addEventListener('error', showPhoto);
  if (!v.paused && v.currentTime > 0) start();

  const p = v.play();
  if (p && p.catch) p.catch(showPhoto);
})();