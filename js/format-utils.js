// ── Íconos de línea (estilo Feather: stroke, sin relleno) ──────────────────────
// Estándar único para todos los íconos de la UI: reemplaza emojis y glifos de
// texto (▲✎🗑️📅 etc.) por SVGs consistentes. Uso: icon('trash', 16).
const ICONS = {
  card:'<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  dollar:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  trendUp:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  swap:'<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  bank:'<line x1="3" y1="21" x2="21" y2="21"/><line x1="5" y1="21" x2="5" y2="10"/><line x1="9" y1="21" x2="9" y2="10"/><line x1="15" y1="21" x2="15" y2="10"/><line x1="19" y1="21" x2="19" y2="10"/><polygon points="12 2 21 9 3 9"/>',
  info:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clipboard:'<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  arrowDownCircle:'<circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/>',
  arrowUpCircle:'<circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/>',
  arrowDown:'<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
  arrowUp:'<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
  arrowRight:'<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  fileText:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  paperclip:'<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  key:'<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
  undo:'<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
  refresh:'<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  chevronUp:'<polyline points="18 15 12 9 6 15"/>',
  chevronDown:'<polyline points="6 9 12 15 18 9"/>',
  chevronRight:'<polyline points="9 18 15 12 9 6"/>',
  dots:'<circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>',
  check:'<polyline points="20 6 9 17 4 12"/>',
  checkCircle:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  alertTriangle:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  minus:'<line x1="5" y1="12" x2="19" y2="12"/>',
  plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  calculator:'<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
  percent:'<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  barChart:'<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  externalLink:'<path d="M7 17L17 7"/><path d="M8 7h9v9"/>'
};
function icon(name, size){
  size=size||15;
  const path=ICONS[name];
  if(!path) return '';
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
}
// Ícono en línea previo a un texto (ej. dentro de un botón), alineado con la baseline del texto.
function btnIcon(name, size){
  return '<span style="display:inline-flex;vertical-align:middle;position:relative;top:-1px;margin-right:6px">'+icon(name,size||14)+'</span>';
}
// ── Máscara de moneda para inputs (sin símbolo $, solo puntos de miles) ────────
// Los campos de dinero usan type="text" + inputmode="numeric" (un <input type="number">
// nativo no admite puntos de miles) y llaman a esto en su "oninput" para formatear mientras
// se escribe. moneyVal() hace el camino inverso al leer el valor guardado.
function moneyInputFmt(v){
  // 0 se trata igual que vacío (mismo criterio que usaban estos campos antes: "valor||''"),
  // así un gasto nuevo no arranca con un "0" que haya que borrar para empezar a escribir.
  return v?Math.round(v).toLocaleString('es-CO'):'';
}
function maskMoneyInput(el){
  const digits=el.value.replace(/\D/g,'');
  el.value=digits?Number(digits).toLocaleString('es-CO'):'';
  el.setSelectionRange(el.value.length, el.value.length);
}
function setMoneyValue(el, v){
  if(!el) return;
  el.value=moneyInputFmt(v);
}
// Si desmarcas "Pagado" sin cerrar el formulario de un gasto ligado a un crédito, "Pagaste $X"
// (debajo de Valor) debe desaparecer al toque en vez de quedar colgado hasta guardar y reabrir
// — el dato en sí (pagado_real) solo se limpia de verdad al guardar (sincronizarCreditoDesdeGasto).
function togglePagadoRealLine(estaPagado){
  const line=document.getElementById('g-pagado-real-line');
  if(line) line.style.display=estaPagado?'':'none';
}
// Campo "Estado" del formulario de gasto: dos tarjetas deseleccionables, mutuamente
// excluyentes, para un dato de tres valores (null "sin definir" | 'sinpagar' | 'pagado') — ver
// comentario junto a estadoSectionHtml en openGasto. Tocar la tarjeta ya activa la apaga
// (vuelve a null); tocar la otra la activa y apaga la que estuviera prendida. Nunca hay un
// estado imposible ni ambigüedad entre "no lo he revisado" y "decidí que está pendiente".
// Elegir "Sin pagar" en Q1 (donde la tarjeta ya dice "Mover a Q2", ver labelSinPagar en
// openGasto) guarda el formulario de inmediato — mismo saveG de siempre — así que abre directo
// el diálogo "¿Mover a Q2?" (ofrecerCopiarQ2, sin cambios en esa lógica) sin necesidad de un
// botón aparte para confirmarlo. Solo pasa al SELECCIONAR (no al desmarcar la tarjeta activa).
function seleccionarEstadoGasto(valor,wh,eid,pid){
  const hidden=document.getElementById('g-estado');
  if(!hidden) return;
  const actual=hidden.value||null;
  const nuevo=(actual===valor)?null:valor;
  hidden.value=nuevo||'';
  pintarEstadoGasto(nuevo,wh);
  if(nuevo==='sinpagar' && wh==='q1') saveG(eid,wh,pid);
}
function pintarEstadoGasto(valor,wh){
  const BASE={background:'#0B1526',borderColor:'#22304F',titulo:'#94A3B8'};
  const ON_SINPAGAR={background:'#2A1D06',borderColor:'#F59E0B',titulo:'#FBBF24'};
  const ON_PAGADO={background:'#062B33',borderColor:'#22D3EE',titulo:'#67E8F9'};
  const cardSP=document.getElementById('g-card-sinpagar'), tituloSP=document.getElementById('g-card-sinpagar-titulo');
  const cardPD=document.getElementById('g-card-pagado'), tituloPD=document.getElementById('g-card-pagado-titulo');
  const estiloSP=valor==='sinpagar'?ON_SINPAGAR:BASE;
  const estiloPD=valor==='pagado'?ON_PAGADO:BASE;
  if(cardSP){ cardSP.style.background=estiloSP.background; cardSP.style.borderColor=estiloSP.borderColor; }
  if(tituloSP) tituloSP.style.color=estiloSP.titulo;
  if(cardPD){ cardPD.style.background=estiloPD.background; cardPD.style.borderColor=estiloPD.borderColor; }
  if(tituloPD){ tituloPD.style.color=estiloPD.titulo; tituloPD.textContent=(valor==='pagado')?'Pagado':'Pagar'; }
  togglePagadoRealLine(valor==='pagado');
}
// Para un gasto ligado a un crédito: mientras escribes en "Valor" no se te pisa el campo (ver
// comentario en openGasto/saveG), pero si lo que llevas escrito ya no coincide con la cuota fija
// del crédito, se muestra "Cuota original: $X" como referencia — sin modificar nada, solo para
// que no pierdas de vista cuál es la cuota real mientras registras un pago distinto. Si además
// escribiste más que la cuota (p.ej. cuota 120, escribes 140), al lado se muestra "Pago extra:
// $20" con la diferencia — mismo criterio que usa saveG al guardar (solo cuenta si es mayor).
// Escribir más que la cuota es, en sí, la señal de que se pagó: la tarjeta "Pagado" del campo
// Estado se selecciona en vivo (mismo criterio que saveG al guardar), sin esperar a guardar y
// reabrir el formulario. No se desmarca sola si vuelves a bajar el valor — eso lo decide el
// usuario a mano, tocando la tarjeta.
function mostrarCuotaOriginalSiCambia(el,cuotaValor,wh){
  const digits=(el.value||'').replace(/\D/g,'');
  const typed=digits?parseInt(digits):0;
  const line=document.getElementById('g-cuota-original-line');
  if(!line) return;
  line.style.display=(typed!==cuotaValor)?'':'none';
  const extraSpan=document.getElementById('g-pago-extra-span');
  if(extraSpan){
    if(typed>cuotaValor){
      extraSpan.style.display='';
      extraSpan.textContent=' · Pago extra: '+cop(typed-cuotaValor);
    } else {
      extraSpan.style.display='none';
    }
  }
  if(typed>cuotaValor){
    const hidden=document.getElementById('g-estado');
    if(hidden && hidden.value!=='pagado'){
      hidden.value='pagado';
      pintarEstadoGasto('pagado',wh);
    }
  }
}
function moneyVal(id){
  const el=document.getElementById(id);
  if(!el) return 0;
  const digits=(el.value||'').replace(/\D/g,'');
  return digits?parseInt(digits):0;
}
function uid()  { return Math.random().toString(36).slice(2,9); }
function fmtD(d) {
  if (!d) return '';
  const [,m,day] = d.split('-');
  return parseInt(day)+' '+['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][parseInt(m)-1];
}
function toast(msg, ms) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove('show'), ms||2200);
}

// ── Fechas de pago ────────────────────────────────────────────────────────────
function isFest(d) { return FE.has(d.toISOString().slice(0,10)); }
function isWknd(d) { return d.getDay()===0||d.getDay()===6; }
function prevBiz(d) {
  let x=new Date(d); x.setDate(x.getDate()-1);
  while(isWknd(x)||isFest(x)) x.setDate(x.getDate()-1);
  return x;
}
function getPago(año,mi) {
  let q1=new Date(año,mi,15);
  if(isWknd(q1)||isFest(q1)) { q1=prevBiz(q1); }
  let q2=new Date(año,mi+1,0);
  while(isWknd(q2)||isFest(q2)) q2=prevBiz(q2);
  return {q1,q2};
}
function diasHasta(dt) {
  const h=new Date(); h.setHours(0,0,0,0);
  const t=new Date(dt); t.setHours(0,0,0,0);
  return Math.round((t-h)/86400000);
}
function diasStatus(dias){
  if(dias<0)       return {cls:'urgent',dcls:'du',txt:'pagado'};
  if(dias===0)     return {cls:'urgent',dcls:'du',txt:'¡Hoy!'};
  if(dias<=3)      return {cls:'urgent',dcls:'du',txt:'en '+dias+(dias===1?' día':' días')};
  if(dias<=7)      return {cls:'soon',  dcls:'ds',txt:'en '+dias+' días'};
  return           {cls:'ok',     dcls:'do',txt:'en '+dias+' días'};
}

function renderPagosBanner(q1dt,q2dt,mInfo){
  const d1=diasHasta(q1dt), d2=diasHasta(q2dt);
  const s1=diasStatus(d1), s2=diasStatus(d2);
  const f1=q1dt.toLocaleDateString('es-CO',{day:'numeric',month:'short'});
  const f2=q2dt.toLocaleDateString('es-CO',{day:'numeric',month:'short'});

  const icBank='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="21" x2="21" y2="21"/><line x1="5" y1="21" x2="5" y2="10"/><line x1="9" y1="21" x2="9" y2="10"/><line x1="15" y1="21" x2="15" y2="10"/><line x1="19" y1="21" x2="19" y2="10"/><polygon points="12 2 21 9 3 9"/></svg>';
  const icInfo='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  const icCal='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

  // Créditos: suma de TODAS las cuotas cuya fecha cae en el mes visible, sin filtrar
  // por "pagado". Las cuotas de deducción de nómina se marcan pagadas de inmediato al
  // crear/avanzar la deducción (ver saveDed/avanzarDeduccionesCredito), así que filtrar
  // por pagos[] las dejaba fuera del total aunque sí correspondan a este mes.
  // Un crédito quincenal aporta sus 2 cuotas del mes; uno mensual, solo 1.
  var creditoIds=Object.keys(creditos);
  var credLinea2='Sin créditos';
  if(creditoIds.length>0){
    var sumaCuotas=0, hayCuotasMes=false;
    creditoIds.forEach(function(cid){
      var cr=creditos[cid];
      var amort=calcAmortizacion(cr);
      amort.rows.forEach(function(row){
        var fecha=new Date(row.fecha+'T12:00:00');
        if(mInfo && fecha.getFullYear()===mInfo.año && fecha.getMonth()===mInfo.mes){
          sumaCuotas += row.valorCuota;
          hayCuotasMes=true;
        }
      });
    });
    credLinea2 = hayCuotasMes ? cop(sumaCuotas) : 'Al día';
  }

  function miniCard(icon,label,fecha,sub,onclick,dcls){
    return '<div class="pcard-mini" onclick="'+onclick+'">'
      +'<div class="pcard-mini-ic">'+icon+'</div>'
      +'<div class="pcard-mini-lbl">'+label+(sub?' <span class="pcard-mini-sub'+(dcls?' '+dcls:'')+'">'+sub+'</span>':'')+'</div>'
      +'<div class="pcard-mini-val">'+(fecha||'')+'</div>'
      +'</div>';
  }

  // Tarjeta combinada Q1+Q2 — ocupa 2 columnas, dividida en mitades
  const pagosCombo='<div class="pcard-mini pcard-mini-double" onclick="togglePCal(\'cal-combo\')">'
    +'<div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0">'
    +'<div class="pcard-mini-ic">'+icCal+'</div>'
    +'<div class="pcard-mini-lbl">Pago Q1 <span class="pcard-mini-sub'+(s1.dcls?' '+s1.dcls:'')+'">'+s1.txt+'</span></div>'
    +'<div class="pcard-mini-val">'+f1+'</div>'
    +'</div>'
    +'<div style="width:1px;background:var(--brd2);align-self:stretch;margin:2px 4px"></div>'
    +'<div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0">'
    +'<div class="pcard-mini-ic">'+icCal+'</div>'
    +'<div class="pcard-mini-lbl">Pago Q2 <span class="pcard-mini-sub'+(s2.dcls?' '+s2.dcls:'')+'">'+s2.txt+'</span></div>'
    +'<div class="pcard-mini-val">'+f2+'</div>'
    +'</div>'
    +'</div>';

  return '<div class="pcard-grid">'
    +pagosCombo
    +miniCard(icBank,'Créditos',credLinea2,null,'openCreditosMenu()','')
    +miniCard(icInfo,'Info general','Ver',null,'openInfoGeneral()','')
    +'</div>'
    +'<div class="pcard-cal" id="cal-combo" style="display:none;margin:0 16px 8px">'+buildMonthCal(q1dt,q2dt)+'</div>';
}

function togglePCal(id){
  const el=document.getElementById(id);
  if(!el) return;
  const open=el.style.display==='none';
  el.style.display=open?'block':'none';
}

function buildMonthCal(q1dt, q2dt){
  const año=q1dt.getFullYear(), mes=q1dt.getMonth();
  const p1=q1dt.getDate(), p2=q2dt.getDate();
  const hoy=new Date(); hoy.setHours(0,0,0,0);
  const diasMes=new Date(año,mes+1,0).getDate();
  let primerDia=new Date(año,mes,1).getDay();
  primerDia=primerDia===0?6:primerDia-1;
  const dows=['L','M','X','J','V','S','D'];
  const mesNombre=q1dt.toLocaleDateString('es-CO',{month:'long',year:'numeric'});
  let html='<div style="text-align:center;font-size:11px;font-weight:600;color:var(--mut);margin-bottom:4px;text-transform:capitalize">'+mesNombre+'</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;font-size:11px">';
  dows.forEach(function(d){
    html+='<div style="text-align:center;color:var(--mut);padding:2px 0;font-weight:600;font-size:10px">'+d+'</div>';
  });
  for(var i=0;i<primerDia;i++) html+='<div></div>';
  for(var d=1;d<=diasMes;d++){
    const isP1=d===p1, isP2=d===p2;
    const isToday=hoy.getFullYear()===año&&hoy.getMonth()===mes&&hoy.getDate()===d;
    const isPast=new Date(año,mes,d)<hoy;
    const fechaActual=new Date(año,mes,d);
    const esFestivo=isFest(fechaActual);
    var bg='transparent', color=isPast?'rgba(148,163,184,.3)':'var(--mut)', fw='400', border='none', br='3px', dotColor=null;
    if(esFestivo && !isP1 && !isP2){ color=isPast?'rgba(248,113,113,.4)':'var(--red)'; dotColor='var(--red)'; }
    if(isP1&&isP2){
      color='var(--pur)'; fw='700'; dotColor='var(--pur)';
    } else if(isP1){
      // Q1 always cyan regardless of past
      color='var(--acc)'; fw='700'; dotColor='var(--acc)';
    } else if(isP2){
      color=isPast?'rgba(52,211,153,.5)':'var(--grn)'; fw='700'; dotColor=isPast?'rgba(52,211,153,.5)':'var(--grn)';
    } else if(isToday){
      border='1px solid var(--acc)'; color='var(--acc)'; fw='600'; br='50%';
    }
    var dayDot=dotColor?'<div style="width:3px;height:3px;border-radius:50%;background:'+dotColor+';margin:0 auto;margin-top:-2px"></div>':'';
    html+='<div style="text-align:center;line-height:22px;height:22px;border-radius:'+br+';background:'+bg+';border:'+border+';color:'+color+';font-weight:'+fw+'">'+d+dayDot+'</div>';
  }
  html+='</div>';
  // Compact legend
  html+='<div style="display:flex;gap:8px;margin-top:6px;font-size:10px;color:var(--mut);align-items:center;flex-wrap:wrap">'
    +'<span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:var(--acc);display:inline-block"></span>Q1 ('+p1+')</span>'
    +'<span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:var(--grn);display:inline-block"></span>Q2 ('+p2+')</span>'
    +'<span style="display:inline-flex;align-items:center;gap:3px"><span style="width:6px;height:6px;border-radius:50%;background:var(--red);display:inline-block"></span>Festivo</span>'
    +'</div>';
  return html;
}

