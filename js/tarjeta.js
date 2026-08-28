// ── CRUD Tarjeta ──────────────────────────────────────────────────────────────
function openTCModal(tc){
  const isE=tc!==null;
  const t=tc||{descripcion:'',tipo:'Compra',fecha:new Date().toISOString().slice(0,10),valor:0,saldo:null};
  tcTipo=t.tipo;
  const eid=isE?t.id:'';
  const cCls=t.tipo==='Compra'?' sc':'', aCls=t.tipo==='Abono'?' sa':'';
  const valStr=moneyInputFmt(Math.abs(t.valor||0));
  // A diferencia de los demás campos, aquí el 0 es un saldo resultante válido y distinto de
  // "vacío" (sin definir), así que no se usa moneyInputFmt (que trata 0 como vacío).
  const saldoStr=t.saldo!=null?Math.round(t.saldo).toLocaleString('es-CO'):'';
  const delBtn=isE?'<button class="bdel" onclick="delTC(\''+eid+'\')">Eliminar movimiento</button>':'';
  openModal('<div class="mtitle">'+(isE?'Editar movimiento':'Nuevo movimiento')+'</div>'
    +'<div class="trow2">'
    +'<button class="topt'+cCls+'" id="oc" onclick="setTC(\'Compra\')">'+btnIcon('arrowUp',13)+'Compra</button>'
    +'<button class="topt'+aCls+'" id="oa" onclick="setTC(\'Abono\')">'+btnIcon('arrowDown',13)+'Abono</button>'
    +'</div>'
    +'<div class="field"><label>Descripción</label><input id="tc-d" value="'+esc(t.descripcion)+'" placeholder="Gasolina, UNE..."></div>'
    +'<div class="field"><label>Valor</label><input id="tc-v" type="text" inputmode="numeric" value="'+valStr+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Fecha</label><input id="tc-f" type="date" value="'+t.fecha+'"></div>'
    +'<div class="field"><label>Saldo resultante (opcional)</label><input id="tc-s" type="text" inputmode="numeric" value="'+saldoStr+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveTC(\''+eid+'\')">Guardar</button></div>'
    +delBtn);
}
function setTC(tipo){
  tcTipo=tipo;
  document.getElementById('oc').className='topt'+(tipo==='Compra'?' sc':'');
  document.getElementById('oa').className='topt'+(tipo==='Abono'?' sa':'');
}
function calcFechaSugerida(fechaPagoStr){
  // La fecha de pago se guarda con un día fijo (ej. día 15).
  // La fecha sugerida = último día del mes en que cae la Q2 del mes actual del gasto.
  // Ej: mes actual = Junio, pago el día 15 → sugerida = último día de Junio (30 jun)
  // porque el pago del siguiente mes (15 Jul) se debe hacer con Q2 de Junio.
  if(!fechaPagoStr) return null;
  const fp = new Date(fechaPagoStr+'T12:00:00');
  const diaFP = fp.getDate(); // día del mes en que se paga (ej. 15)

  // Get current month from the active month in the app
  const MESES_IDX = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesActual = db && db[curM] ? MESES_IDX.indexOf(db[curM].nombre) : new Date().getMonth();
  const añoActual = db && db[curM] ? db[curM].año : new Date().getFullYear();

  // Payment date this cycle: same day, but in the NEXT month relative to current month
  // because Q2 of current month pays for next month's bill
  var mesPago = mesActual + 1; // next month (0-indexed)
  var añoPago = añoActual;
  if(mesPago > 11){ mesPago = 0; añoPago++; }

  // Fecha sugerida = último día de MES ACTUAL (= Q2 del mes actual)
  const ultimoDiaMesActual = new Date(añoActual, mesActual + 1, 0).getDate();
  const sug = new Date(añoActual, mesActual, ultimoDiaMesActual);
  return sug.toISOString().slice(0,10);
}

function toggleSummary(){
  summaryOpen=!summaryOpen;
  document.getElementById('summary').style.display = summaryOpen ? 'grid' : 'none';
  document.getElementById('summary-chevron').innerHTML = icon(summaryOpen ? 'chevronUp' : 'chevronDown', 13);
  Object.keys(STAT_BREAKDOWN_DOM_IDS).forEach(function(key){
    var el=document.getElementById(STAT_BREAKDOWN_DOM_IDS[key]);
    if(el) el.style.display=(summaryOpen&&statBreakdownOpen[key])?'block':'none';
  });
}
function toggleStatBreakdown(key){
  // Solo un pill del Resumen del mes puede estar expandido a la vez: al abrir uno
  // (ej. Q1), se colapsan los demás (ej. Tarjeta) en vez de acumularse todos abiertos.
  var opening=!statBreakdownOpen[key];
  Object.keys(statBreakdownOpen).forEach(function(k){ statBreakdownOpen[k]=false; });
  statBreakdownOpen[key]=opening;
  render();
}
// Igual que toggleStatBreakdown, pero además navega a la pestaña asociada al pill —
// así el pill queda "marcado" (desplegado + resaltado) y a la vez lleva a su pestaña.
function selectStat(key,tabIdx){
  var opening=!statBreakdownOpen[key];
  Object.keys(statBreakdownOpen).forEach(function(k){ statBreakdownOpen[k]=false; });
  statBreakdownOpen[key]=opening;
  curTab=tabIdx;
  if(key==='dispQ1') homeQ='q1';
  else if(key==='dispQ2') homeQ='q2';
  render();
}
// Selecciona la tarjeta tocada en el carrusel del resumen y salta directo a la pestaña Tarjeta.
function goToTarjeta(tid){
  curTC=tid;
  sw(2);
}
function goToIngresos(which){
  curIngQ=which;
  sw(1);
}
// "Logo" simple (sin imágenes externas, todo CSS/texto) para cada marca de tarjeta.
function tcBrandBadgeHtml(marca){
  if(marca==='Visa') return '<div style="font-style:italic;font-weight:800;font-size:14px;color:#fff;letter-spacing:.3px">VISA</div>';
  if(marca==='Mastercard') return '<div style="display:flex;align-items:center">'
    +'<div style="width:16px;height:16px;border-radius:50%;background:#EB001B"></div>'
    +'<div style="width:16px;height:16px;border-radius:50%;background:#F79E1B;margin-left:-7px;opacity:.85"></div></div>';
  if(marca==='Amex') return '<div style="display:inline-block;background:#2E77BC;color:#fff;font-weight:700;font-size:9px;padding:2px 5px;border-radius:3px;letter-spacing:.3px">AMEX</div>';
  return '';
}
function tcBrandColor(marca){
  if(marca==='Visa') return '#3B5FE0';
  if(marca==='Mastercard') return '#F79E1B';
  if(marca==='Amex') return '#2E77BC';
  return 'var(--acc)';
}

function toggleTCInfo(){
  tcInfoOpen=!tcInfoOpen;
  document.getElementById('scroll').innerHTML=renderTC(getM());
}

function editTCInfo(){
  const m=getM(), t=getTC(m), info=t.info||{fechaCorte:null,fechaPago:null,cupo:null,marca:null,ultimos4:null};
  const marcaActual=info.marca||'Ninguna';
  const marcaOpts=TC_MARCAS.map(function(mk){return '<option value="'+mk+'"'+(mk===marcaActual?' selected':'')+'>'+mk+'</option>';}).join('');
  openModal('<div class="mtitle">Editar tarjeta</div>'
    +'<div class="field"><label>Nombre de la tarjeta</label>'
    +'<input id="tci-nombre" value="'+esc(t.nombre)+'" placeholder="Ej: BBVA, Falabella..."></div>'
    +'<div class="field"><label>Marca (opcional)</label><select id="tci-marca">'+marcaOpts+'</select></div>'
    +'<div class="field"><label>Últimos 4 dígitos (opcional)</label>'
    +'<input id="tci-ultimos4" maxlength="4" inputmode="numeric" value="'+(info.ultimos4||'')+'" placeholder="Ej: 9537"></div>'
    +'<div class="field"><label>Cupo total</label>'
    +'<input id="tci-cupo" type="text" inputmode="numeric" value="'+moneyInputFmt(info.cupo)+'" placeholder="Ej: 5.000.000" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Fecha de corte</label>'
    +'<input id="tci-corte" type="date" value="'+(info.fechaCorte||'')+'"></div>'
    +'<div class="field"><label>Fecha de pago</label>'
    +'<input id="tci-pago" type="date" value="'+(info.fechaPago||'')+'"></div>'
    +'<p style="font-size:12px;color:var(--mut);margin-top:4px;line-height:1.5">'
    +'La <b style="color:var(--txt)">fecha sugerida</b> se calcula automáticamente como la quincena (día 15 o fin de mes) inmediatamente anterior a tu fecha de pago.</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveTCInfo()">Guardar</button>'
    +'</div>');
}
function saveTCInfo(){
  const m=getM(); const t=getTC(m);
  const nombre=document.getElementById('tci-nombre').value.trim();
  if(nombre) t.nombre=nombre;
  const marcaSel=document.getElementById('tci-marca');
  t.info.marca=marcaSel&&marcaSel.value!=='Ninguna'?marcaSel.value:null;
  t.info.ultimos4=(document.getElementById('tci-ultimos4').value||'').trim().replace(/\D/g,'').slice(-4)||null;
  t.info.cupo=moneyVal('tci-cupo')||null;
  t.info.fechaCorte=document.getElementById('tci-corte').value||null;
  t.info.fechaPago=document.getElementById('tci-pago').value||null;
  save();closeModal();render();toast('Tarjeta actualizada');
}

function calcTCSaldo(m, tcId){
  tcId = tcId || 'tc1';
  var t = (m.tarjetas && m.tarjetas[tcId]) || {movimientos:[]};
  var tc = t.movimientos || [];
  var compras=tc.filter(function(x){return x.tipo==='Compra';}).reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
  var abonos =tc.filter(function(x){return x.tipo==='Abono';}).reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
  return Math.round((compras-abonos)*100)/100;
}
// Sincroniza TODOS los grupos vinculados a cualquier tarjeta (en Q1 y en Q2, si existen en
// ambas). El "Abono TC" (el pago real) solo se crea/actualiza en Q2, porque la fecha sugerida
// de pago siempre cae ahí (ver calcFechaSugerida: siempre es el último día del mes). Si el
// mismo grupo también existe en Q1 (por ejemplo para llevar el seguimiento del saldo ahí),
// su presupuesto se sigue sincronizando, pero no genera su propio "Abono TC" — y si quedó uno
// de una versión anterior de la app (que sí los creaba en ambas quincenas), se elimina.
function syncTCGrupo(m){
  [{which:'q1',list:m.q1_gastos||[]},{which:'q2',list:m.q2_gastos||[]}].forEach(function(entry){
    var which=entry.which, list=entry.list;
    var gruposLigados=list.filter(function(g){return g.esGrupo&&g.tcCardId;});
    if(which==='q1'){
      gruposLigados.forEach(function(g){
        var idx=list.findIndex(function(s){return s.parentId===g.id&&s.nombre==='Abono TC';});
        if(idx>=0) list.splice(idx,1);
      });
    }
    gruposLigados.forEach(function(g){
      var saldo=calcTCSaldo(m, g.tcCardId);
      g.presupuesto=saldo;
      if(which!=='q2') return;
      var abonoGasto=list.find(function(s){return s.parentId===g.id&&s.nombre==='Abono TC';});
      if(abonoGasto){
        if(!abonoGasto.pagado_flag) abonoGasto.presupuesto=saldo;
      } else {
        list.push({
          id:uid(),nombre:'Abono TC',presupuesto:saldo,
          metodo:g.metodo||'BBVA',pagado_real:null,estado:null,pagado_flag:false,
          sinpagar:false,parentId:g.id,esGrupo:false,tcLinked:false,
          cuotas_total:0,cuota_actual:0
        });
      }
    });
  });
}
function getTC(m, tcId){
  tcId = tcId || curTC || 'tc1';
  if(!m.tarjetas) m.tarjetas = {};
  if(!m.tarjetas[tcId]) m.tarjetas[tcId] = {id:tcId, nombre:'Tarjeta', movimientos:[], info:{fechaCorte:null,fechaPago:null,cupo:null,marca:null,ultimos4:null}};
  return m.tarjetas[tcId];
}
function listTCIds(m){
  return Object.keys(m.tarjetas||{});
}
function saveTC(id){
  const m=getM(); const t=getTC(m);
  const desc=document.getElementById('tc-d').value.trim();
  const val=moneyVal('tc-v');
  const fecha=document.getElementById('tc-f').value;
  const saldo=document.getElementById('tc-s').value!==''?moneyVal('tc-s'):null;
  if(!desc){showAlert('Escribe una descripción');return;}
  const valor=tcTipo==='Abono'?-Math.abs(val):Math.abs(val);
  if(id){const mv=t.movimientos.find(x=>x.id===id);if(mv){mv.descripcion=desc;mv.tipo=tcTipo;mv.valor=valor;mv.fecha=fecha;mv.saldo=saldo;}}
  else t.movimientos.push({id:uid(),descripcion:desc,tipo:tcTipo,valor,fecha,saldo});
  syncTCGrupo(m);
  save();closeModal();render();toast(id?'Movimiento actualizado':'Movimiento agregado');
}
function delTC(id){
  showConfirm('¿Eliminar este movimiento?',function(){
    const m=getM(); const t=getTC(m);
    t.movimientos=(t.movimientos||[]).filter(x=>x.id!==id);
    syncTCGrupo(m);
    save();closeModal();render();toast('Eliminado');
  });
}
function editTC(id){
  const m=getM(),t=getTC(m),mv=(t.movimientos||[]).find(x=>x.id===id);
  if(mv){tcTipo=mv.tipo;openTCModal(mv);}
}

// ── Editar básico y bonos ─────────────────────────────────────────────────────
function editBasico(){
  const m=getM(), n=getNom(m);
  const mi=MESES.indexOf(m.nombre), dias=mi>=0?diasQ2(m.año,mi):15;
  const infoTxt='Q1 = básico ÷ 2 &nbsp;·&nbsp; Q2 = básico ÷ 30 × '+dias+' días ('+m.nombre+')';
  openModal('<div class="mtitle">Editar básico y bonos</div>'
    +'<p style="font-size:12px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Ingresa los valores <b style="color:var(--txt)">totales del mes</b>. Los bonos son solo informativos.<br><br>'
    +'<b style="color:var(--txt)">'+infoTxt+'</b></p>'
    +'<div class="field"><label>Básico total mes</label>'
    +'<input id="b-bt" type="text" inputmode="numeric" value="'+moneyInputFmt(n.basico_total)+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Bonos total mes (solo informativo)</label>'
    +'<input id="b-bon" type="text" inputmode="numeric" value="'+moneyInputFmt(n.bonos_total)+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveBasico()">Guardar</button></div>');
}
function saveBasico(){
  const m=getM(),n=m.nomina;
  const bt =moneyVal('b-bt');
  const bon=moneyVal('b-bon');
  n.basico_total=bt; n.bonos_total=bon;
  // Q1 y Q2 se calculan automáticamente con la fórmula
  n.basico_q1=basicoQ1({nombre:m.nombre,año:m.año,nomina:{basico_total:bt}});
  n.basico_q2=basicoQ2({nombre:m.nombre,año:m.año,nomina:{basico_total:bt}});
  n.bonos_q1=Math.round(bon/2); n.bonos_q2=Math.round(bon/2);
  save();closeModal();render();toast('Nómina actualizada');
}

