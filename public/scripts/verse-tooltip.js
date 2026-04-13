// verse-tooltip.js

// ── Crear tooltip ───────────────────────────────────────────────────────
const tooltip = document.createElement('div');
tooltip.className = 'vt-tooltip';
tooltip.innerHTML = `
  <div class="vt-content"></div>
`;
document.body.appendChild(tooltip);

const content = tooltip.querySelector('.vt-content');

let activeRef = null;

// ── Datos de ejemplo (reemplazá por tu JSON si querés) ──────────────────
const verses = window.VERSES || {};

// ── Funciones ───────────────────────────────────────────────────────────
function show(el, x, y) {
  const ref = el.dataset.ref;
  const text = verses[ref];

  if (!text) return;

  activeRef = ref;
  content.textContent = text;

  tooltip.classList.add('vt-visible');

  positionTooltip(x, y);
}

function hide() {
  tooltip.classList.remove('vt-visible');
  activeRef = null;
}

function positionTooltip(x, y) {
  const padding = 12;

  tooltip.style.left = '0px';
  tooltip.style.top = '0px';

  const rect = tooltip.getBoundingClientRect();

  let left = x - rect.width / 2;
  let top = y - rect.height - 10;

  // evitar overflow horizontal
  if (left < padding) left = padding;
  if (left + rect.width > window.innerWidth - padding) {
    left = window.innerWidth - rect.width - padding;
  }

  // si no entra arriba, lo ponemos abajo
  if (top < padding) {
    top = y + 14;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

// ── Pointer (tap + click unificado) ─────────────────────────────────────
document.addEventListener('pointerdown', function (e) {
  const el = e.target.closest('[data-ref]');

  // Tap sobre referencia
  if (el) {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    show(el, x, y);
    return;
  }

  // Tap fuera → cerrar
  if (!tooltip.contains(e.target)) {
    hide();
  }
});

// ── Hover SOLO para mouse ───────────────────────────────────────────────
document.addEventListener(
  'pointerenter',
  function (e) {
    if (e.pointerType !== 'mouse') return;

    const el = e.target.closest('[data-ref]');
    if (!el) return;

    const rect = el.getBoundingClientRect();
    show(el, rect.left + rect.width / 2, rect.top);
  },
  true
);

document.addEventListener(
  'pointerleave',
  function (e) {
    if (e.pointerType !== 'mouse') return;

    if (!e.target.closest('[data-ref]')) return;
    hide();
  },
  true
);

// ── Reposicionar en scroll ──────────────────────────────────────────────
window.addEventListener('scroll', function () {
  if (!activeRef) return;

  const el = document.querySelector(`[data-ref="${activeRef}"]`);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  positionTooltip(rect.left + rect.width / 2, rect.top);
});
