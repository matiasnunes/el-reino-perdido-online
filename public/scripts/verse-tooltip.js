// verse-tooltip.js
// Un tooltip único reutilizable para todas las citas bíblicas.
// Los datos vienen de window.__VERSES__ inyectado por ArticleLayout.astro.

(function initVerseTooltip() {
  const verses = window.__VERSES__;
  if (!verses) return;

  // ── Crear el elemento tooltip único ─────────────────────────────────────
  const tooltip = document.createElement('div');
  tooltip.id = 'verse-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.setAttribute('aria-hidden', 'true');
  tooltip.innerHTML = '<span class="vt-ref"></span><span class="vt-text"></span>';
  document.body.appendChild(tooltip);

  const vtRef  = tooltip.querySelector('.vt-ref');
  const vtText = tooltip.querySelector('.vt-text');
  let hideTimer = null;
  let activeRef = null;

  // ── Mostrar ──────────────────────────────────────────────────────────────
  function show(el, x, y) {
    const ref  = el.dataset.ref;
    const text = verses[ref];
    if (!text) return;

    clearTimeout(hideTimer);
    activeRef = ref;
    vtRef.textContent  = ref;
    vtText.textContent = text;
    tooltip.setAttribute('aria-hidden', 'false');
    tooltip.classList.add('vt-visible');
    position(x, y);
  }

  // ── Ocultar ──────────────────────────────────────────────────────────────
  function hide() {
    tooltip.classList.remove('vt-visible');
    tooltip.setAttribute('aria-hidden', 'true');
    activeRef = null;
  }

  // ── Posicionar sin salirse de pantalla ───────────────────────────────────
  function position(x, y) {
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 14;

    let left = x + gap;
    let top  = y - th / 2;

    if (left + tw > vw - gap) left = x - tw - gap;
    if (top + th  > vh - gap) top  = vh - th - gap;
    if (top < gap)            top  = gap;

    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
  }

  // ── Detectar touch ───────────────────────────────────────────────────────
  const isTouch = () =>
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // ── Eventos desktop: hover ───────────────────────────────────────────────
  document.addEventListener('mouseover', function(e) {
    if (isTouch()) return;
    const el = e.target.closest('[data-ref]');
    if (!el) return;
    clearTimeout(hideTimer);
    show(el, e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', function(e) {
    if (isTouch()) return;
    if (!tooltip.classList.contains('vt-visible')) return;
    position(e.clientX, e.clientY);
  });

  document.addEventListener('mouseout', function(e) {
    if (isTouch()) return;
    const el = e.target.closest('[data-ref]');
    if (!el) return;
    hideTimer = setTimeout(hide, 150);
  });

	// ── Eventos mobile: tap de un solo toque ────────────────────────────────
	document.addEventListener('touchend', function(e) {
	  if (!isTouch()) return;
	
	  const el = e.target.closest('[data-ref]');
	
	  if (el) {
	    e.preventDefault();
	
	    const ref = el.dataset.ref;
	    const rect = el.getBoundingClientRect();
	    const x = rect.left + rect.width / 2;
	    const y = rect.top;
	
	    if (tooltip.classList.contains('vt-visible') && activeRef === ref) {
	      hide();
	    } else {
	      show(el, x, y);
	    }
	
	    return;
	  }
	
	  if (!tooltip.contains(e.target)) hide();
	}, { passive: false });
	
	// Respaldo para algunos casos donde el tap termine disparando click
	document.addEventListener('click', function(e) {
	  if (!isTouch()) return;
	
	  const el = e.target.closest('[data-ref]');
	  if (el) {
	    e.preventDefault();
	    return;
	  }
	
	  if (!tooltip.contains(e.target)) hide();
	});

  // ── Teclado: foco y Escape ───────────────────────────────────────────────
  document.addEventListener('focusin', function(e) {
    const el = e.target.closest('[data-ref]');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    show(el, rect.right, rect.top + rect.height / 2);
  });

  document.addEventListener('focusout', function(e) {
    const el = e.target.closest('[data-ref]');
    if (!el) return;
    hideTimer = setTimeout(hide, 150);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') hide();
  });
})();
