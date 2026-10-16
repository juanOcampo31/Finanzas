// ═══════════════════════════════════════════════════════════════════════════════
// UI KIT — helpers de markup. Todos devuelven strings HTML con clases de ui-kit.css
// y CERO style="" (salvo variables CSS como --p de un anillo). Si mañana quieres
// cambiar cómo se ve una fila, una card o un sheet, lo cambias en ui-kit.css (o aquí)
// y se actualizan todas las pantallas que lo usan.
//
// Cargar después de format-utils.js (usa icon(), esc() y cop()).
// Convención: cada helper recibe UN objeto de opciones (más legible que 9 posicionales).
// ═══════════════════════════════════════════════════════════════════════════════
const ui = (function(){
  const h = (s) => (s == null ? '' : String(s));
  const cls = (...c) => c.filter(Boolean).join(' ');
  const on = (js) => (js ? ' onclick="' + js + '"' : '');

  // Monto con "$" pequeño, igual en todas las pantallas (antes: cop(), .qcard-cur, .nom-resumen-cur...)
  function money(v, { sign = false, cur = true } = {}) {
    const n = Math.round(Number(v) || 0);
    const s = (sign && n > 0 ? '+' : n < 0 ? '-' : '') ;
    return s + (cur ? '<span class="cur">$</span>' : '$') + Math.abs(n).toLocaleString('es-CO');
  }

  // ── PLANTILLA DE PESTAÑA ─────────────────────────────────────────────────────
  // ui.page({ title:'Agenda', sub:'3 pendientes', action:ui.iconBtn(...), body:[...] })
  function page({ title, sub, action, body = [] }) {
    const head = title ? '<header class="ui-page-head"><div><div class="ui-page-title">' + esc(title) + '</div>'
      + (sub ? '<div class="ui-page-sub">' + sub + '</div>' : '') + '</div>' + h(action) + '</header>' : '';
    return '<div class="ui-page">' + head + [].concat(body).join('') + '</div>';
  }

  // ── CARD Y SECCIONES ─────────────────────────────────────────────────────────
  // ui.card({ title, action, raised, body, add:{label, onclick} })
  function card({ title, action, raised, body = '', add }) {
    return '<section class="' + cls('ui-card', raised && 'ui-card--raised') + '">'
      + (title ? '<div class="ui-card-head"><span class="ui-card-title">' + esc(title) + '</span>' + h(action) + '</div>' : '')
      + [].concat(body).join('')
      + (add ? '<div class="ui-card-add"' + on(add.onclick) + '>' + icon('plus', 15) + esc(add.label) + '</div>' : '')
      + '</section>';
  }
  // Cabecera de sección dentro de una card: ui.section({ title:'Deducciones', tone:'red', value:-180000, rows:[...] })
  function section({ title, tone, value, rows = [] }) {
    const t = tone ? ' t-' + ({ grn: 'pos', red: 'neg', amb: 'warn', acc: 'acc' }[tone] || tone) : '';
    return '<div class="ui-sec-head"><span class="ui-sec-title' + t + '"><span class="ui-dot"></span>' + esc(title) + '</span>'
      + (value != null ? '<span class="ui-sec-val t-num' + t + '">' + (typeof value === 'number' ? money(value, { cur: false }) : value) + '</span>' : '')
      + '</div>' + [].concat(rows).join('');
  }

  // ── HERO DE MONTO ────────────────────────────────────────────────────────────
  // ui.hero({ label:'Neto del mes', aside:'30 días · 2 pagos', value:1300000, tone, sub, extra })
  function hero({ label, aside, value, tone, sub, extra = '' }) {
    return '<div class="ui-hero"><div class="ui-hero-top"><span class="t-eyebrow">' + esc(label) + '</span>'
      + (aside ? '<span class="t-meta">' + aside + '</span>' : '') + '</div>'
      + '<div class="ui-hero-val' + (tone ? ' t-' + tone : '') + '">' + money(value) + '</div>'
      + (sub ? '<div class="ui-hero-sub">' + sub + '</div>' : '') + extra + '</div>';
  }

  // ── STAT TILES ───────────────────────────────────────────────────────────────
  // ui.tile({ label, value, sub, tone, on, onclick, big })
  function tile({ label, value, sub, tone, on: isOn, onclick, big }) {
    return '<div class="' + cls('ui-tile', onclick && 'is-selectable', isOn && 'is-on') + '"' + on(onclick) + '>'
      + '<div class="ui-tile-lbl">' + label + '</div>'
      + '<div class="' + cls('ui-tile-val', big && 'ui-tile-val--lg', tone && 't-' + tone) + '">' + (typeof value === 'number' ? money(value) : value) + '</div>'
      + (sub ? '<div class="ui-tile-sub">' + sub + '</div>' : '') + '</div>';
  }
  // ui.stats([tile,...], { inline:true })  → inline = dentro de una card, separadas por línea
  function stats(tiles, { inline } = {}) {
    return '<div class="' + cls('ui-stats', inline && 'ui-stats--inline') + '" style="--cols:' + tiles.length + '">' + tiles.join('') + '</div>';
  }

  // ── FILA DE LISTA (la pieza más reutilizada) ─────────────────────────────────
  // ui.row({
  //   lead: ui.ico('card','acc') | ui.check({on,onclick}) | '',
  //   title:'Arriendo', badges:[ui.badge('Vencido','red')], meta:'Débito · 5 oct',
  //   amount:-1200000, amountTone:'neg', amountSub:'Pag: $1.000.000',
  //   end:'html libre a la derecha', chevron:true,
  //   state:'done'|'today'|'warn', dense, nested, onclick
  // })
  function row(o) {
    const amt = o.amount != null
      ? '<div class="ui-row-amt' + (o.amountTone ? ' t-' + o.amountTone : '') + '">' + (typeof o.amount === 'number' ? money(o.amount, { cur: false, sign: o.amountTone === 'pos' }) : o.amount) + '</div>'
        + (o.amountSub ? '<div class="ui-row-amt-sub">' + o.amountSub + '</div>' : '')
      : '';
    return '<div class="' + cls('ui-row', !o.onclick && 'ui-row--static', o.dense && 'ui-row--dense', o.nested && 'ui-row--nested', o.state && 'is-' + o.state) + '"' + on(o.onclick) + '>'
      + (o.lead ? '<div class="ui-row-lead">' + o.lead + '</div>' : '')
      + '<div class="ui-row-main"><div class="ui-row-title"><span>' + esc(o.title) + '</span>' + (o.badges || []).join('') + '</div>'
      + (o.meta ? '<div class="ui-row-meta">' + o.meta + '</div>' : '') + '</div>'
      + ((amt || o.end) ? '<div class="ui-row-end">' + amt + h(o.end) + '</div>' : '')
      + (o.chevron ? '<span class="ui-row-chev">' + icon('chevronRight', 16) + '</span>' : '')
      + '</div>';
  }
  const ico = (name, tone = 'acc') => '<div class="ui-ico ui-ico--' + tone + '">' + icon(name, 17) + '</div>';
  // El onclick del check debe hacer event.stopPropagation() si la fila también es clicable
  const check = ({ on: isOn, warn, onclick }) => '<button type="button" class="' + cls('ui-check', isOn && 'is-on', warn && 'is-warn') + '"' + on('event.stopPropagation();' + onclick) + ' aria-pressed="' + !!isOn + '"><i>' + (isOn ? icon('check', 14) : warn ? '!' : '') + '</i></button>';

  // ── BADGE / CHIP / SEGMENTED / SWITCH ────────────────────────────────────────
  const badge = (txt, tone) => '<span class="ui-badge' + (tone ? ' ui-badge--' + tone : '') + '">' + txt + '</span>';
  // ui.chips([{label, on, onclick, icon}])
  const chips = (items) => '<div class="ui-chips">' + items.map(c => '<button type="button" class="' + cls('ui-chip', c.on && 'is-on') + '"' + on(c.onclick) + '>' + (c.icon ? icon(c.icon, 14) : '') + esc(c.label) + '</button>').join('') + '</div>';
  // ui.segmented([{label, on, onclick, tone:'neg'|'pos'}], { money:true })
  const segmented = (items, { money: m } = {}) => '<div class="' + cls('ui-seg', m && 'ui-seg--money') + '" role="tablist">' + items.map(s => '<button type="button" role="tab" class="' + (s.on ? 'is-on' : '') + '"' + (s.tone ? ' data-tone="' + s.tone + '"' : '') + on(s.onclick) + ' aria-selected="' + !!s.on + '">' + esc(s.label) + '</button>').join('') + '</div>';
  const toggle = ({ id, on: isOn, onclick }) => '<button type="button" ' + (id ? 'id="' + id + '" ' : '') + 'class="' + cls('ui-switch', isOn && 'is-on') + '" role="switch" aria-checked="' + !!isOn + '"' + on(onclick) + '></button>';

  // ── BOTONES ──────────────────────────────────────────────────────────────────
  // ui.btn({ label, kind:'primary'|'secondary'|'ghost'|'danger'|'danger-soft', icon, block, sm, onclick, disabled })
  const btn = (b) => '<button type="button" class="' + cls('ui-btn', 'ui-btn--' + (b.kind || 'primary'), b.block && 'ui-btn--block', b.sm && 'ui-btn--sm') + '"' + on(b.onclick) + (b.disabled ? ' disabled' : '') + (b.id ? ' id="' + b.id + '"' : '') + '>' + (b.icon ? icon(b.icon, 16) : '') + esc(b.label) + '</button>';
  const iconBtn = (name, onclick, { danger, label } = {}) => '<button type="button" class="' + cls('ui-iconbtn', danger && 'ui-iconbtn--danger') + '"' + on(onclick) + ' aria-label="' + esc(label || name) + '">' + icon(name, 18) + '</button>';
  const link = (label, onclick, iconName) => '<button type="button" class="ui-link"' + on(onclick) + '>' + esc(label) + (iconName ? icon(iconName, 14) : '') + '</button>';

  // ── SHEET: la plantilla de TODOS los modales ─────────────────────────────────
  // ui.sheet({
  //   title, onClose:'closeModal()', onDelete,      // cabecera estándar  X | título | papelera
  //   lead:'texto explicativo',                    // opcional
  //   body:[...],                                  // campos, cards, callouts
  //   primary:{label,onclick,kind}, secondary:{label,onclick}   // footer estándar
  // })
  function sheet(o) {
    const del = o.onDelete ? iconBtn('trash', o.onDelete, { danger: true, label: 'Eliminar' }) : '<span></span>';
    const foot = o.primary
      ? '<div class="ui-sheet-foot">' + btn({ ...o.primary, kind: o.primary.kind || 'primary', block: true })
        + btn({ label: (o.secondary && o.secondary.label) || 'Cancelar', onclick: (o.secondary && o.secondary.onclick) || o.onClose || 'closeModal()', kind: 'ghost', block: true }) + '</div>'
      : '';
    return '<div class="ui-sheet">'
      + '<div class="ui-sheet-head">' + iconBtn('x', o.onClose || 'closeModal()', { label: 'Cerrar' }) + '<div class="ui-sheet-title">' + esc(o.title) + '</div>' + del + '</div>'
      + (o.lead ? '<p class="ui-sheet-lead">' + o.lead + '</p>' : '')
      + [].concat(o.body || []).join('') + foot + '</div>';
  }
  // Confirmación (eliminar, reemplazar backup, borrar mes...): ui.confirm({ title, text, confirm:'Eliminar', onConfirm, danger:true })
  const confirm = ({ title, text, confirm: label, onConfirm, danger, callout }) => sheet({
    title, lead: text, body: callout ? [calloutHtml(callout, danger ? 'danger' : 'warn')] : [],
    primary: { label: label || 'Confirmar', onclick: onConfirm, kind: danger ? 'danger' : 'primary' }
  });
  // Lista de opciones (recuperar acceso, eliminar recordatorio, cuota manual): ui.actionSheet({ title, lead, actions:[{icon,title,meta,onclick,tone}] })
  const actionSheet = ({ title, lead, actions }) => sheet({
    title, lead, body: [card({ body: actions.map(a => row({ lead: ico(a.icon, a.tone || 'neutral'), title: a.title, meta: a.meta, onclick: a.onclick, chevron: true })) })],
    primary: null
  }) ;
  // Picker de lista (forma de pago, marca, grupo, crédito, movimiento TC)
  const picker = ({ title, items, extra }) => sheet({
    title, body: [card({ body: items.map(it => row({ title: it.label, meta: it.meta, end: it.selected ? '<span class="t-acc">' + icon('check', 18) + '</span>' : (it.right || ''), onclick: it.onclick })), add: extra })]
  });

  // ── CAMPOS ───────────────────────────────────────────────────────────────────
  // ui.field({ id, label, type, value, placeholder, hint, attrs })
  const field = (f) => '<div class="ui-field">' + (f.label ? '<label for="' + f.id + '">' + esc(f.label) + '</label>' : '')
    + '<input class="ui-input" id="' + f.id + '" type="' + (f.type || 'text') + '" value="' + esc(f.value == null ? '' : f.value) + '"'
    + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + h(f.attrs) + '>'
    + (f.hint ? '<div class="ui-field-hint">' + f.hint + '</div>' : '') + '</div>';
  // Monto grande (mismo que valorBlockHtml / stdFormNombreValorHtml)
  const amountInput = ({ id, value, sub, tone, oninput }) => '<div class="ui-amount"' + (tone ? ' style="--amount-acc:var(--' + tone + ')"' : '') + '>'
    + '<div class="ui-amount-box"><span>$</span><input id="' + id + '" type="text" inputmode="numeric" value="' + moneyInputFmt(value) + '" oninput="maskMoneyInput(this);' + h(oninput) + '"></div>'
    + (sub ? '<div class="t-meta">' + esc(sub) + '</div>' : '') + '</div>';
  function calloutHtml(text, tone) {
    const ic = { warn: 'alertTriangle', danger: 'alertTriangle' }[tone] || 'info';
    return '<div class="ui-callout' + (tone ? ' ui-callout--' + tone : '') + '">' + icon(ic, 16) + '<div>' + text + '</div></div>';
  }
  const kv = (pairs) => '<div class="ui-inset">' + pairs.map(p => '<div class="ui-kv"><span>' + esc(p[0]) + '</span><span' + (p[2] ? ' class="t-' + p[2] + '"' : '') + '>' + p[1] + '</span></div>').join('') + '</div>';

  // ── PROGRESO / ANILLO / VACÍO ────────────────────────────────────────────────
  const progress = (parts) => '<div class="ui-progress">' + [].concat(parts).map(p => '<i class="' + (p.tone || '') + '" style="width:' + Math.max(0, Math.min(100, p.pct)) + '%"></i>').join('') + '</div>';
  const ring = ({ pct, label, sub, tone }) => '<div class="ui-ring" style="--p:' + Math.round(pct) + (tone ? ';--c:var(--' + tone + ')' : '') + '"><div>' + label + (sub ? '<small>' + sub + '</small>' : '') + '</div></div>';
  const empty = ({ icon: ic = 'clipboard', title, text, action }) => '<div class="ui-empty">' + ico(ic, 'neutral') + '<div class="ui-empty-title">' + esc(title) + '</div>'
    + (text ? '<div class="ui-empty-text">' + text + '</div>' : '') + (action ? btn({ ...action, kind: 'secondary', sm: true }) : '') + '</div>';

  return { money, page, card, section, hero, tile, stats, row, ico, check, badge, chips, segmented, toggle,
           btn, iconBtn, link, sheet, confirm, actionSheet, picker, field, amountInput, callout: calloutHtml, kv,
           progress, ring, empty };
})();

// ═══════════════════════════════════════════════════════════════════════════════
// PUENTE DE MIGRACIÓN: los stdForm* actuales delegan en el kit. Con solo cargar este
// archivo, Gasto, Ingreso, Tarjeta, Deducción y Agenda heredan el nuevo estilo sin
// tocar sus llamadas. Después se reemplazan una a una por ui.sheet(...).
// ═══════════════════════════════════════════════════════════════════════════════
function stdFormHeaderHtml(titulo, onCancel, delOnclick) {
  return '<div class="ui-sheet-head">' + ui.iconBtn('x', onCancel || 'closeModal()', { label: 'Cerrar' })
    + '<div class="ui-sheet-title">' + esc(titulo) + '</div>'
    + (delOnclick ? ui.iconBtn('trash', delOnclick, { danger: true, label: 'Eliminar' }) : '<span></span>') + '</div>';
}
function stdFormRowHtml(iconName, bgVar, fgVar, label, valor, onclickAttr) {
  const tone = (String(fgVar).match(/--(acc|grn|red|amb|pur)/) || [, 'acc'])[1];
  return ui.row({ lead: ui.ico(iconName, tone), title: label, end: '<span class="t-meta">' + esc(valor) + '</span>', chevron: true, onclick: onclickAttr });
}
function stdFormActionRowHtml(iconName, bgVar, fgVar, label, onclickAttr) {
  const tone = (String(fgVar).match(/--(acc|grn|red|amb|pur)/) || [, 'acc'])[1];
  return ui.row({ lead: ui.ico(iconName, tone), title: label, onclick: onclickAttr });
}
function stdFormCardHtml(rowsHtml) { return rowsHtml ? ui.card({ body: rowsHtml }) : ''; }
function stdFormFooterHtml(saveOnclick, saveLabel, cancelOnclick) {
  return '<div class="ui-sheet-foot">' + ui.btn({ label: saveLabel || 'Guardar', onclick: saveOnclick, block: true })
    + ui.btn({ label: 'Cancelar', onclick: cancelOnclick || 'closeModal()', kind: 'ghost', block: true }) + '</div>';
}
function stdFormHeroCardHtml(innerHtml) { return '<div class="ui-card ui-card--raised"><div class="ui-hero">' + innerHtml + '</div></div>'; }
function stdFormDateFieldHtml(id, label, value, onchange, type) {
  return ui.field({ id, label, type: type || 'date', value, attrs: onchange ? ' onchange="' + onchange + '"' : '' });
}
// Botón destructivo: reemplaza los 12+ `class="bpri" style="background:var(--red);color:#fff"`
// Buscar/reemplazar:  class="bpri" style="background:var(--red);color:#fff"  →  class="ui-btn ui-btn--danger"
