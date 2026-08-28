// ── Navegación de meses (tabs superiores, ventana de 3) ─────────────────────────
// Muestra siempre como máximo 3 meses: anterior, activo (centrado) y siguiente.
// El botón "+" (círculo punteado) solo reemplaza al mes "siguiente" cuando el mes
// activo YA es el último; mientras el último mes solo se ve como "siguiente" (sin
// estar centrado), la flecha ">" sigue visible para poder centrarlo. La flecha
// "<" nunca se oculta (evita el salto de layout al llegar al primer mes); ahí
// simplemente se deshabilita porque no hay mes anterior. El punto indica qué tan
// pagado está cada mes (mismo criterio que el modal "Seleccionar mes"): verde
// 75-100%, ámbar 25-75%, rojo <25%, gris si aún no tiene gastos.
//
// Los gastos con presupuesto NEGATIVO ("saldo a favor") se excluyen del total: toggleP()
// bloquea marcarlos como pagados (no hay deuda que pagar), así que si se incluyeran en el
// total, el % de avance del mes nunca podría llegar a 100% aunque el usuario marcara
// realmente todo lo demás como pagado.
//
// Un gasto marcado "sinpagar" (checkbox "Mover a Q2" en Q1, o "Sin pagar (recordatorio)" en
// Q2) SÍ cuenta en el total, pero se toma como ya "pagado" para esta quincena — no va a
// pagarse aquí (se movió a Q2, o quedó solo como recordatorio), así que no tiene sentido que
// arrastre el % hacia abajo esperando una acción que nunca va a pasar en este mes.
//
// Los subgastos de un grupo vinculado a tarjeta (esGrupo+tcCardId) son solo informativos —
// registran QUÉ se compró con la tarjeta, pero esa deuda no se "paga" marcando cada compra
// individualmente (eso es un adelanto opcional, ver calcTotalGrupoAware): se paga de una vez
// al pagar la tarjeta. Si se contaran como cualquier gasto suelto, se quedarían pendientes
// para siempre y arrastrarían el % del mes hacia abajo aunque el usuario no tenga nada
// realmente atrasado — por eso se excluyen del cálculo igual que el grupo mismo.
//
// Estado null ("sin definir", el gasto todavía no se ha revisado): pagado_flag y sinpagar
// quedan ambos en false para ese gasto (ver setGastoEstado), así que este cálculo lo cuenta
// como pendiente — decisión explícita: "no lo he revisado" no debe adelantar el % de avance
// del mes, a diferencia de "sinpagar" (decisión YA tomada de que no se paga acá, ver arriba).
function calcPctPagadoMes(mes){
  const q1=mes.q1_gastos||[], q2=mes.q2_gastos||[];
  const tcGrupoIds=new Set([...q1,...q2].filter(function(g){return g.esGrupo&&g.tcCardId;}).map(function(g){return g.id;}));
  const conQuincena=[
    ...q1.map(function(g){return {g:g,which:'Q1'};}),
    ...q2.map(function(g){return {g:g,which:'Q2'};})
  ].filter(function(x){
    if(x.g.esGrupo) return false;
    if(x.g.parentId && tcGrupoIds.has(x.g.parentId)) return false;
    return (x.g.presupuesto||0)>=0;
  });
  const total=conQuincena.reduce(function(a,x){return a+Math.abs(x.g.presupuesto||0);},0);
  const pagado=conQuincena.filter(function(x){return x.g.pagado_flag||x.g.sinpagar;}).reduce(function(a,x){return a+Math.abs(x.g.presupuesto||0);},0);
  const pct=total>0?Math.round(pagado/total*100):0;
  // Detalle de qué falta exactamente para el 100% — antes había que abrir la consola del
  // navegador para averiguar qué gasto seguía sin marcar y arrastraba el % hacia abajo.
  const pendientes=conQuincena.filter(function(x){return !(x.g.pagado_flag||x.g.sinpagar);})
    .map(function(x){return {id:x.g.id,nombre:nombreGasto(x.g),presupuesto:x.g.presupuesto,which:x.which};});
  return {total:total,pagado:pagado,pct:pct,pendientes:pendientes};
}
// Quincena que debería quedar seleccionada en Inicio al pararse sobre un mes: si es el mes
// real de hoy, la quincena en curso según la fecha (1-15 → Q1, 16-fin de mes → Q2); para
// cualquier otro mes (pasado o futuro) no hay "quincena en curso" que inferir, así que siempre
// Q1. Se usa tanto al navegar entre meses (goToMonth) como al crear/importar un mes y en el
// arranque de la app (ver homeQAutoDone en render()).
function homeQParaMes(mes){
  const hoy=new Date();
  if(mes && mes.año===hoy.getFullYear() && MESES.indexOf(mes.nombre)===hoy.getMonth()){
    return hoy.getDate()<=15?'q1':'q2';
  }
  return 'q1';
}
function renderMonthTabs(){
  const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  const idx=keys.indexOf(curM);
  const lastKey=keys[keys.length-1];
  const isLast=curM===lastKey;
  const prevKey=idx>0?keys[idx-1]:null;
  const nextKey=isLast?null:keys[idx+1];

  function dotColorFor(k){
    const r=calcPctPagadoMes(db[k]);
    return r.total===0?'var(--brd2)':r.pct>=75?'var(--grn)':r.pct>=25?'var(--amb)':'var(--red)';
  }

  function monthBtn(k){
    const mes=db[k];
    const active=k===curM;
    return '<button onclick="goToMonth('+k+')" data-mk="'+k+'" style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:4px 8px 6px;border-bottom:2px solid '+(active?'var(--acc)':'transparent')+'">'
      +'<span style="font-size:11px;font-weight:'+(active?'800':'600')+';color:'+(active?'var(--txt)':'var(--mut)')+';white-space:nowrap">'+mes.nombre.slice(0,3)+'</span>'
      +'<span style="width:8px;height:8px;border-radius:50%;background:'+dotColorFor(k)+';flex-shrink:0"></span>'
      +'</button>';
  }

  function arrowBtn(dir,targetKey){
    const disabled=targetKey===null;
    const path=dir==='left'?'<polyline points="15 18 9 12 15 6"/>':'<polyline points="9 18 15 12 9 6"/>';
    return '<button'+(disabled?' disabled':' onclick="goToMonth('+targetKey+')"')+' aria-label="'+(dir==='left'?'Mes anterior':'Mes siguiente')+'" style="flex-shrink:0;background:none;border:none;cursor:'+(disabled?'default':'pointer')+';color:'+(disabled?'var(--brd2)':'var(--mut)')+';padding:4px 2px;display:flex;align-items:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg></button>';
  }

  const addBtn='<button onclick="openNewMonth()" data-mk="add" title="Nuevo mes" aria-label="Crear nuevo mes" style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:4px 8px 6px;border-bottom:2px solid transparent">'
    +'<span style="width:24px;height:24px;border-radius:50%;border:1.5px dashed var(--mut);display:flex;align-items:center;justify-content:center;color:var(--mut);flex-shrink:0">'
    +'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
    +'</span>'
    +'</button>';

  let html='';
  html+=arrowBtn('left',prevKey);
  if(prevKey!==null) html+=monthBtn(prevKey);
  html+=monthBtn(curM);
  if(isLast){
    html+=addBtn;
  } else {
    html+=monthBtn(nextKey);
    // Sin mes anterior que mostrar (estamos en el primero): se agrega un mes más
    // a la derecha para que siempre se vean 3 meses en la ventana, no solo 2.
    if(prevKey===null && idx+2<=keys.length-1) html+=monthBtn(keys[idx+2]);
    html+=arrowBtn('right',nextKey);
  }
  return html;
}

// ── Render principal ──────────────────────────────────────────────────────────
function render() {
  const m=getM();
  // Al abrir la app (una sola vez por sesión), si el mes activo es el mes real de hoy,
  // Inicio arranca mostrando la quincena en curso (1-15 → Q1, 16-fin de mes → Q2) en vez
  // de asumir siempre Q1 — después de este arranque, la selección manual del usuario manda.
  if(!homeQAutoDone){
    homeQAutoDone=true;
    homeQ=homeQParaMes(m);
  }
  const homeActive = curTab===0;
  document.getElementById('mtabs').innerHTML = renderMonthTabs();
  localStorage.setItem('fin26m', curM);

  const mi = MESES.indexOf(m.nombre);
  const {q1,q2} = getPago(m.año, mi>=0?mi:0);
  // El banner de pagos y el resumen del mes (pills/desgloses) quedaron reemplazados por
  // los paneles propios de cada pestaña (tarjetas Q en Inicio/Ingresos, tc-mini en Tarjeta),
  // así que se ocultan siempre — se dejan sin borrar por si se quiere reactivar el detalle.
  const pbannerEl=document.getElementById('pbanner');
  pbannerEl.style.display = 'none';

  const nom = getNom(m);
  const n1=netoQ1(m), n2=netoQ2(m);
  const bas1=basicoQ1(m), bas2=basicoQ2(m);
  const gastosQ1=calcTotalQuincena(m,'q1');
  const gastosQ2=calcTotalQuincena(m,'q2');
  const tGas=gastosQ1+gastosQ2;
  const tc=Object.values(m.tarjetas||{}).flatMap(function(t){return t.movimientos||[];});
  const tcSaldo=tc.filter(x=>x.tipo==='Compra').reduce((a,x)=>a+Math.abs(x.valor||0),0)
              -tc.filter(x=>x.tipo==='Abono').reduce((a,x)=>a+Math.abs(x.valor||0),0);
  // El disponible por quincena vive también en el Resumen del mes (siempre visible, sin
  // importar la pestaña activa) además del badge "Disp" dentro de cada pestaña Q1/Q2.
  const dispQ1=calcDisponibleQuincena(m,'q1');
  const dispQ2=calcDisponibleQuincena(m,'q2');
  const dispQ1Cls=dispQ1>=0?'sg':'sr';
  const dispQ2Cls=dispQ2>=0?'sg':'sr';
  const vencQ1=calcVencidosQuincena(m,'q1');
  const vencQ2=calcVencidosQuincena(m,'q2');
  const alertaHtml=' <span title="Cuota de crédito vencida" style="color:var(--amb);display:inline-block;vertical-align:-2px">'+icon('alertTriangle',12)+'</span>';
  // Total de ingresos del mes = suma de los ingresos registrados en ambas quincenas
  // (pestaña Ingresos), no el neto de nómina.
  const ingQ1=calcIngresosQuincena(m,'q1'), ingQ2=calcIngresosQuincena(m,'q2');
  const tIngresos=ingQ1+ingQ2;
  // Chevron (▲ abierto / ▼ cerrado) y marca visual del pill actualmente seleccionado/expandido.
  const chv=function(key){ return icon(statBreakdownOpen[key]?'chevronUp':'chevronDown',9); };
  const selSt=function(key){ return statBreakdownOpen[key]?'box-shadow:inset 0 0 0 1.5px var(--acc);background:var(--surf2)':''; };
  // Cada pill navega a su pestaña (selectStat) y además despliega su propio desglose
  // in-place, quedando marcado como seleccionado mientras esté expandido.
  function pillHtml(key,tabIdx,label,valHtml){
    var onclick=tabIdx==null?'toggleStatBreakdown(\''+key+'\')':'selectStat(\''+key+'\','+tabIdx+')';
    return '<div class="stat" onclick="'+onclick+'" style="cursor:pointer;'+selSt(key)+'">'
      +'<div class="slbl" style="display:flex;justify-content:space-between;align-items:center">'+label+'<span style="font-size:8px">'+chv(key)+'</span></div>'
      +valHtml+'</div>';
  }

  document.getElementById('summary').innerHTML=
    pillHtml('basico',3,'Básico mes','<div class="sval sb">'+cop(nom.basico_total)+'</div>')
    +pillHtml('ingresos',1,'Ingresos','<div class="sval sg">'+cop(tIngresos)+'</div>')
    +pillHtml('gastos',null,'Gastos','<div class="sval sr">'+cop(tGas)+'</div>')
    +pillHtml('tarjeta',2,'Tarjeta','<div class="sval sa">'+cop(tcSaldo)+'</div>')
    +pillHtml('dispQ1',0,'Disponible Q1','<div class="sval '+dispQ1Cls+'">'+(dispQ1<0?'-':'')+cop(Math.abs(dispQ1))+(vencQ1.length?alertaHtml:'')+'</div>')
    +pillHtml('dispQ2',0,'Disponible Q2','<div class="sval '+dispQ2Cls+'">'+(dispQ2<0?'-':'')+cop(Math.abs(dispQ2))+(vencQ2.length?alertaHtml:'')+'</div>');

  document.getElementById('summary').style.display = 'none';
  const summaryBarEl = document.getElementById('summaryBar');
  if (summaryBarEl) summaryBarEl.style.display = 'none';
  const chevEl = document.getElementById('summary-chevron');
  if (chevEl) chevEl.innerHTML = icon(summaryOpen ? 'chevronUp' : 'chevronDown', 13);

  // Fila simple de 2 líneas (label izq. / valor der.) para los desgloses — mismo estándar
  // visual .trow/.tlbl/.tval que ya usa el resto de la app.
  function breakdownRow(label, value, color, borderBottom){
    return '<div class="trow" style="background:none;padding:6px 0;'+(borderBottom?'border-bottom:1px solid var(--brd)':'')+'">'
      +'<span class="tlbl">'+label+'</span>'
      +'<span class="tval" style="font-size:13px;color:'+color+'">'+value+'</span></div>';
  }
  const basicoBreakdownHtml=breakdownRow('Básico Q1',cop(bas1),'var(--grn)',true)+breakdownRow('Básico Q2',cop(bas2),'var(--grn)',false);
  const ingresosBreakdownHtml=breakdownRow('Ingresos Q1',cop(ingQ1),'var(--grn)',true)+breakdownRow('Ingresos Q2',cop(ingQ2),'var(--grn)',false);
  const gastosBreakdownHtml=breakdownRow('Gastos Q1',cop(gastosQ1),'var(--red)',true)+breakdownRow('Gastos Q2',cop(gastosQ2),'var(--red)',false);
  function vencidosRowsHtml(venc){
    return venc.map(function(v,i){
      return breakdownRow('<span style="display:inline-flex;align-items:center;gap:4px;vertical-align:middle">'+icon('alertTriangle',12)+esc(v.nombre)+'</span> · cuota '+v.numCuota+'/'+v.cuotasTotal,cop(v.valorCuota),'var(--red)',i<venc.length-1);
    }).join('');
  }
  const dispQ1BreakdownHtml=breakdownRow('Neto Q1',cop(n1),'var(--grn)',true)+breakdownRow('Gastos Q1',cop(gastosQ1),'var(--red)',vencQ1.length>0)+vencidosRowsHtml(vencQ1);
  const dispQ2BreakdownHtml=breakdownRow('Neto Q2',cop(n2),'var(--grn)',true)+breakdownRow('Gastos Q2',cop(gastosQ2),'var(--red)',vencQ2.length>0)+vencidosRowsHtml(vencQ2);
  [['basico',basicoBreakdownHtml],['ingresos',ingresosBreakdownHtml],['gastos',gastosBreakdownHtml],['dispQ1',dispQ1BreakdownHtml],['dispQ2',dispQ2BreakdownHtml]].forEach(function(pair){
    var key=pair[0], html=pair[1];
    var el=document.getElementById(STAT_BREAKDOWN_DOM_IDS[key]);
    if(el){
      el.innerHTML=html;
      el.style.display='none';
    }
  });

  // Carrusel de tarjetas (pendiente + disponible de cada una), oculto por defecto y
  // desplegado al tocar el bloque "Tarjeta" del resumen — evita saturar la vista compacta.
  const tcIdsAll=listTCIds(m);
  const tcBreakdownHtml=tcIdsAll.length?(
    '<div style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Tarjetas</div>'
    +'<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch">'
    +tcIdsAll.map(function(tid){
      var card=m.tarjetas[tid];
      var saldoTc=calcTCSaldo(m,tid);
      var marca=card.info&&card.info.marca;
      var cupo=card.info&&card.info.cupo;
      var dispTc=cupo?cupo-saldoTc:null;
      var showDisp=!!cupo;
      var lbl=showDisp?'Disponible':'Pendiente';
      var val=showDisp?dispTc:saldoTc;
      var valColor=showDisp?(val>=0?'var(--grn)':'var(--red)'):'var(--red)';
      return '<div onclick="event.stopPropagation();goToTarjeta(\''+tid+'\')" style="flex-shrink:0;width:136px;background:var(--surf2);border-radius:12px;padding:10px 12px;border-left:3px solid '+tcBrandColor(marca)+';cursor:pointer">'
        +'<div style="min-height:16px;margin-bottom:12px">'+tcBrandBadgeHtml(marca)+'</div>'
        +'<div style="font-size:12px;font-weight:700;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:8px">'+esc(card.nombre)+'</div>'
        +'<div style="font-size:9px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em">'+lbl+'</div>'
        +'<div style="font-size:13px;font-weight:700;color:'+valColor+'">'+(val<0?'-':'')+cop(Math.abs(val))+'</div>'
        +'</div>';
    }).join('')
    +'</div>'
  ):'<div style="padding:8px 0;font-size:12px;color:var(--mut)">Sin tarjetas</div>';
  const tcBreakdownEl=document.getElementById('tcBreakdown');
  if(tcBreakdownEl){
    tcBreakdownEl.innerHTML=tcBreakdownHtml;
    tcBreakdownEl.style.display='none';
  }

  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',i===curTab));
  // If month picker modal is open, refresh its content
  const mbg=document.getElementById('mbg');
  if(mbg&&mbg.classList.contains('open')){
    const mtitle=document.getElementById('mc')?.querySelector('.mtitle');
    if(mtitle&&mtitle.textContent==='Seleccionar mes') openMonthPicker();
  }
  const el=document.getElementById('scroll');
  el.classList.toggle('scroll-home', homeActive||curTab===3||curTab===4);
  if      (curTab===0) el.innerHTML=renderInicio(m);
  else if (curTab===1) el.innerHTML=renderIngresos(m);
  else if (curTab===2) el.innerHTML=renderTC(m);
  else if (curTab===3) el.innerHTML=renderNom(m);
  else                 el.innerHTML=renderCreditos(m);
}

// ── Gastos ───────────────────────────────────────────────────────────────────
function toggleGFilter(which){
  gFilterOpen[which]=!gFilterOpen[which];
  render();
}

function setGSort(which,s){
  gSort[which]=s;
  render();
}

function sortGastos(gastos,which,subMap){
  var s=gSort[which]||'orden';
  var arr=gastos.slice(); // shallow copy to avoid mutating original

  // Orden secundario según selección del usuario
  if(s==='nombre')  arr.sort(function(a,b){return a.nombre.localeCompare(b.nombre,'es');});
  else if(s==='monto-asc')  arr.sort(function(a,b){return Math.abs(a.presupuesto||0)-Math.abs(b.presupuesto||0);});
  else if(s==='monto-desc') arr.sort(function(a,b){return Math.abs(b.presupuesto||0)-Math.abs(a.presupuesto||0);});
  else if(s==='metodo') arr.sort(function(a,b){return (a.metodo||'').localeCompare(b.metodo||'','es');});
  // 'orden' = mantiene el orden original como base

  // Marcar/desmarcar un gasto como pagado ya NO lo mueve de posición — antes este sort
  // primario forzaba también a los pagados al fondo (junto con los "sin pagar"), lo que hacía
  // que la fila saltara de lugar apenas se tocaba el check. Se conserva solo el hundimiento de
  // los "sin pagar" (mover a Q2/recordatorio): ese sí sigue siendo un cambio de estado real de
  // la quincena, no un simple check, y agruparlos al fondo evita que se mezclen con lo vigente.
  function esSinPagar(x){
    if(x.sinpagar) return 1;
    if(x.esGrupo){
      var subs=(subMap&&subMap[x.id])||[];
      return subs.length>0 && subs.every(function(sg){return sg.sinpagar;}) ? 1 : 0;
    }
    return 0;
  }
  arr.sort(function(a,b){
    return esSinPagar(a)-esSinPagar(b);
  });

  return arr;
}

function setGFiltro(which,f){
  gFiltro[which]=f;
  render();
}

// Monto total de un método de pago dentro de una quincena (o el total general si m==='todos')
// — usado tanto por la pastilla de filtro siempre visible como por el panel expandible.
function montoMetodoFiltro(m,topGastosAll,total){
  if(m==='todos') return total;
  return topGastosAll.filter(function(g){return !g.esGrupo&&g.metodo===m&&!g.sinpagar;}).reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);
}
function pillMetodoBtn(m,which,activeFiltro,mTotal,extraStyle){
  var active=m===activeFiltro;
  var label=m==='todos'?'Todos':esc(m);
  return '<button class="g-pill-'+which+'" data-f="'+esc(m)+'" onclick="setGFiltro(\''+which+'\',\''+escJS(m)+'\')" style="flex-shrink:0;padding:'+extraStyle+';border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap;background:'+(active?'var(--acc)':'var(--surf2)')+';color:'+(active?'#0F172A':'var(--mut)')+';">'+label+(mTotal>0?' <span style="opacity:.7">'+cop(mTotal)+'</span>':'')+'</button>';
}
// ── Vista Inicio ───────────────────────────────────────────────────────────────
const DOW_ABBR=['dom','lun','mar','mié','jue','vie','sáb'];
const MESES_ABBR_MIN=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function selectHomeQ(q){
  homeQ=q;
  render();
}

// Panel de tarjetas Q1/Q2 (compartido entre Inicio e Ingresos) — misma tarjeta visual,
// pero el valor grande y su etiqueta son configurables (disponible vs. ingresos).

function buildQCardsHtml(m,activeQ,selectFn,valueLbl,valueQ1,valueQ2,vencQ1,vencQ2){
  const mi=MESES.indexOf(m.nombre);
  const miSafe=mi>=0?mi:0;
  const {q1,q2}=getPago(m.año,miSafe);
  const ultimoDia=new Date(m.año,miSafe+1,0).getDate();
  const rangoQ1='1–15 '+MESES_ABBR_MIN[miSafe];
  const rangoQ2='16–'+ultimoDia+' '+MESES_ABBR_MIN[miSafe];

  function pagoInfo(dt){
    const d=diasHasta(dt), st=diasStatus(d);
    return {fecha:DOW_ABBR[dt.getDay()]+' '+dt.getDate(), sub:st.txt};
  }
  const pagoQ1=pagoInfo(q1), pagoQ2=pagoInfo(q2);

  function qCard(qKey,label,rango,val,pago,venc){
    const active=activeQ===qKey;
    const negIcon=val<0?'<span title="Disponible negativo" style="color:var(--red);display:inline-flex;vertical-align:-2px;margin-left:5px">'+icon('alertTriangle',13)+'</span>':'';
    const vencIcon=(!negIcon&&venc&&venc.length)?'<span title="Cuota de crédito vencida" style="color:var(--amb);display:inline-flex;vertical-align:-2px;margin-left:5px">'+icon('alertTriangle',13)+'</span>':'';
    const sepHtml='<div class="qcard-sep"></div>';
    const pagoTxtColor=active?'var(--acc)':'var(--txt)';
    // Solo la palabra "pagado" del sub-texto (fecha de pago ya en el pasado) se pinta de rojo.
    const pagoSubStyle=pago.sub==='pagado'?' style="color:var(--red)"':'';
    return '<div class="qcard'+(active?' active':'')+'" onclick="'+selectFn+'(\''+qKey+'\')">'
      +'<div class="qcard-top"><span class="qcard-lbl'+(active?' active':'')+'">'+label+'</span><span class="qcard-range">'+rango+'</span></div>'
      +'<div class="qcard-disp-lbl">'+valueLbl+'</div>'
      +'<div class="qcard-disp-val"><span class="qcard-cur">$</span>'+(val<0?'-':'')+Math.abs(Math.round(val)).toLocaleString('es-CO')+negIcon+vencIcon+'</div>'
      +sepHtml
      +'<div class="qcard-pago-row"><span class="qcard-dot'+(active?' active':'')+'"></span><span class="qcard-pago-txt" style="color:'+pagoTxtColor+'">Pago '+pago.fecha+'</span><span class="qcard-pago-sub"'+pagoSubStyle+'>'+pago.sub+'</span></div>'
      +'</div>';
  }
  return '<div class="qcards">'+qCard('q1','Q1',rangoQ1,valueQ1,pagoQ1,vencQ1)+qCard('q2','Q2',rangoQ2,valueQ2,pagoQ2,vencQ2)+'</div>';
}

// Mini-tarjeta compacta de crédito (compartida entre Inicio y la pestaña Tarjeta).
function buildTcMiniHtml(m,tid,onclickAttr,pickerHtml){
  const card=m.tarjetas[tid];
  if(!card) return '';
  const info=card.info||{};
  const saldo=calcTCSaldo(m,tid);
  const cupo=info.cupo;
  const dispTc=cupo?Math.max(cupo-saldo,0):null;
  var fechaPagoTxt='';
  if(info.fechaPago){
    const fp=new Date(info.fechaPago+'T12:00:00');
    fechaPagoTxt=DOW_ABBR[fp.getDay()]+' '+fp.getDate()+' '+MESES_ABBR_MIN[fp.getMonth()];
  }
  var fechaCorteTxt='';
  if(info.fechaCorte){
    const fc=new Date(info.fechaCorte+'T12:00:00');
    fechaCorteTxt=fc.getDate()+' '+MESES_ABBR_MIN[fc.getMonth()];
  }
  var footParts=[];
  if(dispTc!=null) footParts.push('Cupo libre <span style="color:var(--grn)">'+cop(dispTc)+'</span>');
  if(fechaCorteTxt) footParts.push('Corte '+fechaCorteTxt);
  return '<div class="tc-mini"'+(onclickAttr?' onclick="'+onclickAttr+'"':'')+'>'
    +(pickerHtml||'')
    +'<div class="tc-mini-row">'
    +'<div class="tc-mini-chip">'+(info.marca?esc(info.marca.slice(0,4).toUpperCase()):'TC')+'</div>'
    +'<div class="tc-mini-mid">'
    +'<div class="tc-mini-name">'+esc(card.nombre||('Tarjeta '+(info.marca||'')))+'</div>'
    +(fechaPagoTxt?'<div class="tc-mini-due">Paga antes del <span style="color:var(--amb)">'+fechaPagoTxt+'</span></div>':'')
    +'</div>'
    +'<div class="tc-mini-right"><div class="tc-mini-lbl">SALDO</div><div class="tc-mini-val">'+cop(saldo)+'</div></div>'
    +(onclickAttr?'<div class="tc-mini-chev">'+icon('chevronRight',16)+'</div>':'')
    +'</div>'
    +(footParts.length?'<div class="tc-mini-foot">'+footParts.join(' · ')+'</div>':'')
    +'</div>';
}

// Pastillas para elegir qué tarjeta mostrar — compartidas entre Inicio y la pestaña
// Tarjeta (misma variable curTC, así la selección queda sincronizada entre ambas vistas).
// El botón "＋ Nueva" solo se incluye cuando showNew=true (solo en la pestaña Tarjeta).
function buildTcPickerHtml(m,tcIds,activeTid,showNew){
  if(tcIds.length<2 && !showNew) return '';
  const pillsHtml=tcIds.map(function(tid){
    var t=m.tarjetas[tid];
    var active=tid===activeTid;
    var cardSaldo=calcTCSaldo(m,tid);
    return '<button onclick="event.stopPropagation();selectTC(\''+tid+'\')" style="flex-shrink:0;padding:5px 12px;border-radius:20px;border:none;cursor:pointer;font-size:12px;font-weight:600;white-space:nowrap;background:'+(active?'var(--acc)':'var(--surf2)')+';color:'+(active?'#06202B':'var(--mut)')+'">'+esc(t.nombre)+' <span style="opacity:.75">'+cop(cardSaldo)+'</span></button>';
  }).join('');
  const newBtn=showNew?'<button onclick="event.stopPropagation();openNewCard()" style="flex-shrink:0;padding:5px 12px;border-radius:20px;border:1px dashed var(--brd2);background:none;cursor:pointer;font-size:12px;font-weight:600;color:var(--acc)">＋ Nueva</button>':'';
  return '<div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:6px;scrollbar-width:none;-webkit-overflow-scrolling:touch">'+pillsHtml+newBtn+'</div>';
}

function renderInicio(m){
  const qcardsHtml=buildQCardsHtml(m,homeQ,'selectHomeQ','DISPONIBLE',calcDisponibleQuincena(m,'q1'),calcDisponibleQuincena(m,'q2'),calcVencidosQuincena(m,'q1'),calcVencidosQuincena(m,'q2'));

  // Tarjeta de crédito (reutiliza los mismos datos de la pestaña Tarjeta y la selección
  // actual de tarjeta, curTC, para mostrar la misma que se eligió ahí o desde el picker)
  const tcIds=listTCIds(m);
  const homeTid=(curTC&&m.tarjetas[curTC])?curTC:tcIds[0];
  const tcHtml=tcIds.length?buildTcMiniHtml(m,homeTid,'sw(2)',buildTcPickerHtml(m,tcIds,homeTid,false)):'';

  const list=homeQ==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
  const listHtml=renderGastos(list,homeQ);

  return '<div class="home-view">'+qcardsHtml+tcHtml+listHtml+'</div>';
}

function renderGastos(gastos,which) {
  if(!gastos.length) return '<div class="empty"><div class="eic" style="display:flex;justify-content:center;color:var(--mut)">'+icon('clipboard',36)+'</div><p>Sin gastos. Toca + para agregar.</p></div>';

  // Collect unique methods for filter pills
  var metodos=['todos'];
  gastos.forEach(function(g){
    if(g.metodo&&metodos.indexOf(g.metodo)<0) metodos.push(g.metodo);
    // Also from subgastos (they have parentId)
  });
  var activeFiltro=gFiltro[which]||'todos';

  const subMap={};
  const topGastosAll=[];
  for(const g of gastos){
    if(g.parentId){ if(!subMap[g.parentId]) subMap[g.parentId]=[]; subMap[g.parentId].push(g); }
    else topGastosAll.push(g);
  }

  // Apply method filter — groups shown only if metodo or any subgasto matches
  var topGastosFiltered=activeFiltro==='todos'?topGastosAll:topGastosAll.filter(function(g){
    if(!g.esGrupo) return g.metodo===activeFiltro;
    // For groups: show if group metodo matches OR any subgasto metodo matches
    if(g.metodo===activeFiltro) return true;
    return (subMap[g.id]||[]).some(function(s){return s.metodo===activeFiltro;});
  });
  const topGastos=sortGastos(topGastosFiltered,which,subMap);

  const activos=topGastosAll.filter(function(x){return !x.sinpagar;});
  const total=calcTotalGrupoAware(activos, subMap, which==='q1');
  const pagado=activos.reduce(function(a,x){
    if(x.esGrupo){
      // "pagado" de un grupo siempre se calcula sumando sus subgastos ya pagados (nunca la
      // base) — así que un grupo vinculado a tarjeta en Q1 ya solo suma lo que sí es un gasto
      // real ahí (ej. "Gasolina" pagada con la tarjeta), consistente con calcTotalGrupoAware.
      var paid=(subMap[x.id]||[]).filter(function(s){return !s.sinpagar&&s.pagado_flag;}).reduce(function(b,s){return b+Math.abs(s.presupuesto||0);},0);
      return a+paid;
    }
    return x.pagado_flag?a+Math.abs(x.presupuesto||0):a;
  },0);
  const sinPagarTotal=topGastosAll.filter(function(x){return x.sinpagar;}).reduce(function(a,x){return a+Math.abs(x.presupuesto||0);},0);
  const sinPagarCount=topGastosAll.filter(function(x){return x.sinpagar;}).length;
  // "N de M pagados": el denominador (topGastosAll.length) SÍ incluye los gastos marcados
  // "sinpagar" (mover a Q2 / recordatorio) — así que estos deben contar como pagados aquí
  // también (ya se movieron/no se van a finalizar en esta quincena), o el badge nunca llega
  // a "M de M" aunque todo lo demás esté realmente pagado.
  const pagadosCount=topGastosAll.filter(function(x){
    if(x.sinpagar) return true;
    return x.esGrupo?(subMap[x.id]||[]).filter(function(s){return !s.sinpagar;}).every(function(s){return s.pagado_flag;})&&(subMap[x.id]||[]).length>0:x.pagado_flag;
  }).length;
  const pct=total>0?Math.round(pagado/total*100):0;
  const bc=pct<40?'pbok':pct<75?'pbw':'pbo';
  const netoQ=which==='q1'?netoQ1(getM()):netoQ2(getM());
  const disp=netoQ-total;

  // Badges de cuota/mensualidad/vencido/comprobante — compartidos entre la fila normal
  // (buildGastoRowHtml) y la fila de subgasto (buildSubRow): antes solo la fila normal los
  // calculaba, así que un gasto ligado a un crédito perdía el badge "N/M · mes" (y "Vencido")
  // en cuanto se movía a un grupo, porque los subgastos se pintan con buildSubRow.
  function buildGastoBadges(g){
    var cuotaBadge='',mensBadge='',vencidoBadge='',compBadge='',hoyFlag=false;
    if(g.mensualidad){
      var mp2=g.mensualidad.split('-');
      var mNames=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      var mLabel=mNames[parseInt(mp2[1])-1];
      mensBadge='<span style="font-size:10px;font-weight:600;background:var(--pur-d);color:var(--pur);padding:1px 6px;border-radius:10px;margin-left:4px;vertical-align:middle">'+mLabel+'</span>';
    }
    compBadge=g.comprobante&&g.pagado_flag?'<span style="font-size:10px;color:var(--mut);margin-left:4px;display:inline-flex;align-items:center;gap:3px;vertical-align:middle">'+icon('paperclip',11)+esc(g.comprobante)+'</span>':'';
    if(g.cuotas_total>0&&g.cuota_actual>0){
      var cuotaColor=g.pagado_flag?'var(--grn)':'var(--amb)';
      var cuotaLbl=g.cuota_actual+'/'+g.cuotas_total;
      if(g.creditoId && creditos[g.creditoId]){
        var crRef=creditos[g.creditoId];
        var rowRef=calcAmortizacion(crRef).rows[g.numCuota-1];
        if(rowRef){
          var mesesAbrev=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
          cuotaLbl+=' · '+mesesAbrev[new Date(rowRef.fecha+'T12:00:00').getMonth()];
          if(!g.pagado_flag && !g.sinpagar){
            var diasCuota=diasHasta(rowRef.fecha+'T12:00:00');
            if(diasCuota<0){
              vencidoBadge='<span style="font-size:9px;font-weight:700;background:var(--red-d);color:var(--red);padding:1px 6px;border-radius:10px;margin-left:4px;vertical-align:middle">Vencido</span>';
              hoyFlag=true;
            } else if(diasCuota===0){
              hoyFlag=true;
            }
          }
        }
      }
      cuotaBadge='<span style="font-size:10px;font-weight:600;background:var(--surf2);color:'+cuotaColor+';padding:1px 6px;border-radius:10px;margin-left:4px;vertical-align:middle">'+cuotaLbl+'</span>';
    }
    return {cuotaBadge:cuotaBadge,mensBadge:mensBadge,vencidoBadge:vencidoBadge,compBadge:compBadge,hoyFlag:hoyFlag};
  }

  function buildSubRow(s,wh){
    var sp=s.pagado_flag,st=s.sinpagar;
    var sd=(s.pagado_real!=null&&s.pagado_real!==s.presupuesto)?s.presupuesto-s.pagado_real:null;
    var sdh=sd!==null?' · <span style="color:var(--'+(sd>0?'grn':'red')+')\">'+(sd>0?'Sobró':'Faltó')+' '+cop(Math.abs(sd))+'</span>':'';
    var badges=buildGastoBadges(s);
    var chkCls=sp?'paid':st?'nopag':(badges.hoyFlag?'hoy':'');
    var nameCls=sp?'pd':st?'np':'';
    var amtCls=sp?'pa':'';
    var nopagBadge=st?'<span class="nopag-badge">Sin pagar</span>':'';
    var subMeta=sp?'pagado · '+esc(s.metodo||''):(esc(s.metodo||'')+(badges.hoyFlag?' · <span style="color:var(--red);font-weight:700">hoy</span>':''));
    var chkTxt=sp?icon('check',11):st?icon('arrowRight',11):'';
    return '<div class="g-sub-row'+(st?' row-aplazado':'')+'">'
      +'<div class="gchk '+chkCls+'" onclick="toggleP(event,\''+s.id+'\',\''+wh+'\')">'+chkTxt+'</div>'
      +'<div class="ginfo" onclick="editGasto(\''+s.id+'\',\''+wh+'\')" style="cursor:pointer">'
      +'<div class="gname '+nameCls+'">'+esc(nombreGasto(s))+badges.cuotaBadge+badges.vencidoBadge+badges.mensBadge+nopagBadge+'</div>'
      +'<div class="gmeta">'+subMeta+sdh+badges.compBadge+'</div></div>'
      +'<div style="text-align:right"><div class="gamt '+amtCls+'" onclick="editGasto(\''+s.id+'\',\''+wh+'\')" style="cursor:pointer'+(s.presupuesto<0?';color:var(--grn)':'')+'">'+(s.presupuesto<0?'+':'')+cop(s.presupuesto)+'</div></div>'
      +'</div>'
  }

  var gastoRowGiCounter=0; // índice único para ids de DOM (gg-/gc-)
  function buildGastoRowHtml(g){
    var gi=gastoRowGiCounter++;
    if(g.esGrupo){
      var subs=subMap[g.id]||[];
      // Base del grupo: si tiene presupuesto propio (ej. saldo tarjeta), usarlo; si no, sumar subgastos
      var base=(g.presupuesto!==null&&g.presupuesto!==undefined&&g.tcLinked)?g.presupuesto:(g.presupuesto>0?g.presupuesto:0);
      var subsPagados=subs.filter(function(s){return s.pagado_flag&&!s.sinpagar;}).reduce(function(a,s){return a+Math.abs(s.presupuesto||0);},0);
      var subsPendientes=subs.filter(function(s){return !s.pagado_flag&&!s.sinpagar;}).reduce(function(a,s){return a+Math.abs(s.presupuesto||0);},0);
      // Si tiene base propia: pendiente = base - pagado; si no: pendiente = suma subgastos no pagados
      var totalGrupo=g.tcLinked?base:(base>0?base:subsPendientes+subsPagados);
      var pendiente=base>0?base-subsPagados:subsPendientes;
      var allPaid=subs.length>0&&subs.filter(function(s){return !s.sinpagar;}).every(function(s){return s.pagado_flag;});
      var countBadge=subs.length>0?'<span class="tc-count">'+subs.length+'</span>':'';
      // Igual que en sortGastos: marcar/desmarcar un subgasto como pagado ya no lo mueve de
      // posición dentro del grupo, solo "sin pagar" sigue hundiéndose al fondo.
      var subsOrdenados=subs.slice().sort(function(a,b){
        var va=a.sinpagar?1:0;
        var vb=b.sinpagar?1:0;
        return va-vb;
      });
      var subRowsHtml=subsOrdenados.map(function(s){return buildSubRow(s,which);}).join('');
      var addBtn='<div class="g-sub-add" onclick="openGasto(null,\''+which+'\',\''+g.id+'\')">＋ Agregar al grupo</div>';

      var deudaRow='';
      var grpChk=allPaid?'paid':'';
      var grpTxt=allPaid?icon('check',11):'';
      // Mostrar lo pagado si hay subgastos pagados
      var pendienteHtml=subsPagados>0
        ?'<div style="font-size:10px;color:var(--grn);margin-top:1px">Pag: '+cop(subsPagados)+'</div>'
        :'';
      return '<div class="g-group g-drag-item" data-gid="'+g.id+'" onpointerdown="startDragGasto(event,\''+g.id+'\',\''+which+'\')">'
        +'<div class="g-group-head" onclick="toggleGG(\''+g.id+'\',\'gg-'+gi+'\',\'gc-'+gi+'\')">'
        +'<div class="gchk '+grpChk+'" onclick="toggleGrupoPagado(event,\''+g.id+'\',\''+which+'\')">'+grpTxt+'</div>'
        +'<div class="ginfo"><div class="gname">'+esc(nombreGasto(g))+countBadge+(g.tcLinked?'<span style="display:inline-flex;vertical-align:middle;color:var(--acc);margin-left:5px">'+icon('refresh',11)+'</span>':'')+' </div><div class="gmeta">'+esc(g.metodo||'')+'</div></div>'
        +'<div style="text-align:right;display:flex;align-items:center;gap:6px">'
        +'<div><div class="gamt '+(g.tcLinked&&totalGrupo<0?'a':'')+'">'+(g.tcLinked&&totalGrupo<0?'-':'')+cop(Math.abs(totalGrupo))+'</div>'+pendienteHtml+'</div>'
        +'<button onclick="event.stopPropagation();editGasto(\''+g.id+'\',' +'\''+which+'\');" style="background:none;border:none;color:var(--mut);padding:4px 6px;cursor:pointer;flex-shrink:0;display:flex;align-items:center">'+icon('edit',15)+'</button>'
        +'<div class="g-chevron" id="gc-'+gi+'" style="display:flex">'+icon('chevronRight',16)+'</div></div>'
        +'</div>'
        +'<div id="gg-'+gi+'" style="display:'+(gGroupOpen[g.id]?'block':'none')+'"><div class="g-sub-wrap">'+subRowsHtml+deudaRow+addBtn+'</div></div>'
        +'</div>';
    }
    var p=g.pagado_flag,tras=g.sinpagar;
    var diff=(g.pagado_real!=null&&g.pagado_real!==g.presupuesto)?g.presupuesto-g.pagado_real:null;
    var dh=diff!==null?' · <span style="color:var(--'+(diff>0?'grn':'red')+')\">'+(diff>0?'Sobró':'Faltó')+' '+cop(Math.abs(diff))+'</span>':'';
    var gCls=(tras?'grow-nopag':'')+(g.id===lastCreatedId?' gnew':'');
    var badgesG=buildGastoBadges(g);
    var cuotaBadge=badgesG.cuotaBadge, mensBadge=badgesG.mensBadge, vencidoBadge=badgesG.vencidoBadge, compBadge=badgesG.compBadge, hoyFlag=badgesG.hoyFlag;
    var chkCls=p?'paid':tras?'nopag':(hoyFlag?'hoy':'');
    var namCls=p?'pd':tras?'np':'';
    var amtCls=p?'pa':'';
    var nopag=tras?'<span class="nopag-badge">Sin pagar</span>':'';
    var chkTxt=p?icon('check',11):tras?icon('arrowRight',11):'';
    var metaBase=p?'pagado · '+esc(g.metodo||''):(esc(g.metodo||'')+(hoyFlag?' · <span style="color:var(--red);font-weight:700">hoy</span>':''));
    var realLine=g.pagado_real!=null&&g.pagado_real!==g.presupuesto?'Real: '+cop(g.pagado_real):esc(g.metodo||'');
    var rowCls='grow g-drag-item '+gCls+(hoyFlag&&!p&&!tras?' row-hoy':'');
    return '<div class="'+rowCls+'" data-gid="'+g.id+'" onclick="editGasto(\''+g.id+'\',\''+which+'\')" onpointerdown="startDragGasto(event,\''+g.id+'\',\''+which+'\')">'
      +'<div class="gchk '+chkCls+'" onclick="toggleP(event,\''+g.id+'\',\''+which+'\')">'+ chkTxt +'</div>'
      +'<div class="ginfo"><div class="gname '+namCls+'">'+esc(nombreGasto(g))+cuotaBadge+vencidoBadge+mensBadge+nopag+'</div><div class="gmeta">'+metaBase+dh+compBadge+'</div></div>'
      +'<div style="text-align:right"><div class="gamt '+amtCls+'"'+(g.presupuesto<0?' style="color:var(--grn)"':'')+'>'+(g.presupuesto<0?'+':'')+cop(g.presupuesto)+'</div><div class="gmth">'+realLine+'</div></div>'
      +'</div>';
  }

  var rows=topGastos.map(function(g){ return buildGastoRowHtml(g); }).join('');

  var pendienteQ=Math.max(total-pagado,0);
  var spNote=sinPagarTotal>0?'<span style="color:var(--amb);font-size:11px;font-weight:500;margin-left:6px">· '+cop(sinPagarTotal)+' sin pagar</span>':'';
  var dispColor=disp>=0?'grn':'red';
  var dispTxt=(disp<0?'-':'')+cop(disp);
  var qLabel=which==='q1'?'1':'2';

  // Filter pills by método — la pastilla siempre visible y la del panel expandido mostraban
  // exactamente el mismo cálculo de mTotal y casi el mismo botón, copiado dos veces (solo el
  // padding y el borde scroll-snap cambiaban); ahora ambas usan montoMetodoFiltro/pillMetodoBtn.
  var pillsHtml='<div style="position:relative"><div style="display:flex;gap:6px;overflow-x:auto;padding:8px 14px 6px 14px;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory">'
    +metodos.map(function(m){
      return pillMetodoBtn(m,which,activeFiltro,montoMetodoFiltro(m,topGastosAll,total),'4px 10px;scroll-snap-align:start');
    }).join('')+'</div></div>';

  // Collapsible filter + sort panel
  var isOpen=gFilterOpen[which]||false;
  var activeSort=gSort[which]||'orden';
  var hasBadge=(activeFiltro!=='todos'||activeSort!=='orden');

  var panelHtml='';
  if(isOpen){
    var sortOpts=[{k:'orden',lbl:'Orden'},{k:'nombre',lbl:'Nombre'},
      {k:'monto-desc',lbl:'Mayor $'},{k:'monto-asc',lbl:'Menor $'},{k:'metodo',lbl:'F. Pago'}];
    var filterPills=metodos.map(function(m){
      return pillMetodoBtn(m,which,activeFiltro,montoMetodoFiltro(m,topGastosAll,total),'3px 9px');
    }).join('');
    var sortPills=sortOpts.map(function(opt){
      var isA=opt.k===activeSort;
      return '<button onclick="setGSort(\''+which+'\',\''+opt.k+'\')" style="flex-shrink:0;padding:3px 9px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap;background:'+(isA?'var(--acc)':'var(--surf2)')+';color:'+(isA?'#0F172A':'var(--mut)')+';">'+opt.lbl+'</button>';
    }).join('');
    panelHtml='<div style="border-bottom:1px solid var(--brd);background:var(--bg);padding:6px 0">'
      +'<div style="padding:0 14px 4px"><div style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Filtrar</div>'
      +'<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none">'+filterPills+'</div></div>'
      +'<div style="padding:6px 14px 2px"><div style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Ordenar</div>'
      +'<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none">'+sortPills+'</div></div>'
      +'</div>';
  }
  var sortPillsHtml=panelHtml;

  var filterBtnHtml='<button onclick="toggleGFilter(\''+which+'\')" style="background:none;border:1px solid var(--brd2);border-radius:20px;padding:2px 8px;font-size:10px;cursor:pointer;color:var(--mut);display:flex;align-items:center;gap:4px;flex-shrink:0">'
    +(hasBadge?'<span style="width:5px;height:5px;border-radius:50%;background:var(--acc);display:inline-block"></span>':'')
    +'Filtrar '+icon(isOpen?'chevronUp':'chevronDown',10)
    +'</button>';
  var noteFilterRow='<div class="glist-note-row'+(sinPagarCount>0?' has-note':'')+'">'
    +(sinPagarCount>0?'<span class="glist-note-txt">'+sinPagarCount+' sin pagar · '+cop(sinPagarTotal)+'</span>':'<span></span>')
    +filterBtnHtml
    +'</div>';

  return '<div class="glist-card">'
    +'<div class="glist-head">'
    +'<span class="glist-title"><span style="color:var(--acc)">Gastos Q'+qLabel+'</span> · '+topGastosAll.length+'</span>'
    +'<span class="glist-sub">'+pagadosCount+' de '+topGastosAll.length+' pagados</span>'
    +'</div>'
    +'<div class="glist-totals">'
    +'<div class="glist-tot"><div class="glist-tot-lbl">TOTAL Q'+qLabel+'</div><div class="glist-tot-val" style="color:var(--txt)">'+cop(total)+'</div></div>'
    +'<div class="glist-div"></div>'
    +'<div class="glist-tot"><div class="glist-tot-lbl">PAGADO</div><div class="glist-tot-val" style="color:var(--grn)">'+cop(pagado)+'</div></div>'
    +'<div class="glist-div"></div>'
    +'<div class="glist-tot"><div class="glist-tot-lbl">POR PAGAR</div><div class="glist-tot-val" style="color:var(--red)">'+cop(pendienteQ)+'</div></div>'
    +'</div>'
    +'<div class="pw"><div class="pb '+bc+'" style="width:'+pct+'%"></div></div>'
    +noteFilterRow
    +sortPillsHtml
    +'<div style="height:1px;background:var(--brd);margin:0 0 4px"></div>'
    +'<div id="glist-rows-'+which+'">'+rows+'</div>'
    +resumenQuincenaHtml(pagado,pendienteQ)
    +'</div>';
}
// Pie de la lista de gastos de una quincena — mismo formato que "Resumen del periodo" de la
// pestaña Tarjeta (anillo compras/abonos), aquí con pagado (verde) vs por pagar (rojo).
function resumenQuincenaHtml(pagado,pendiente){
  const totalQ=pagado+pendiente;
  if(totalQ<=0) return '';
  const pagadoDeg=(pagado/totalQ)*360;
  const icSwap='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
  return '<div style="display:flex;align-items:center;gap:12px;padding:14px;border-top:1px solid var(--brd)">'
    +'<div style="width:34px;height:34px;border-radius:10px;background:var(--acc-d);color:var(--acc);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+icSwap+'</div>'
    +'<div style="flex:1;min-width:0">'
    +'<div style="font-size:11px;color:var(--mut);margin-bottom:3px">Resumen de la quincena</div>'
    +'<div style="font-size:13px"><span style="color:var(--mut)">Pagado</span> <span style="font-weight:600;color:var(--grn)">'+cop(pagado)+'</span>'
    +'<span style="color:var(--mut);margin:0 5px">|</span><span style="color:var(--mut)">Por pagar</span> <span style="font-weight:600;color:var(--red)">'+cop(pendiente)+'</span></div>'
    +'</div>'
    +'<div style="position:relative;width:44px;height:44px;flex-shrink:0">'
    +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient(var(--grn) '+pagadoDeg+'deg,var(--red) 0deg)"></div>'
    +'<div style="position:absolute;inset:8px;border-radius:50%;background:var(--surf)"></div>'
    +'</div>'
    +'</div>';
}
// ── CALENDARIO ───────────────────────────────────────────────────────────────
let calSelDay = null;



function toggleGG(groupId,wrapId,chevId){
  gGroupOpen[groupId]=!gGroupOpen[groupId];
  const w=document.getElementById(wrapId),ch=document.getElementById(chevId);
  if(!w||!ch) return;
  const open=gGroupOpen[groupId];
  w.style.display=open?'block':'none';
  ch.style.transform=open?'rotate(90deg)':'rotate(0)';
  ch.style.color=open?'var(--acc)':'var(--mut)';
}

function convertirGrupo(id,which){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id); if(!g)return;
  window._cvtId=id; window._cvtWhich=which;
  const isLinked=!!g.tcCardId;
  // "Monto base manual" solo se precarga al EDITAR un grupo que ya tenía uno — al convertir un
  // gasto normal en grupo por primera vez, su valor no debe quedar aquí (eso lo congelaría como
  // total fijo): se preserva como el primer subgasto del grupo, ver saveConvertir(). Si se
  // precargara igual, "Convertir" sin tocar nada dejaría el grupo en modo "monto fijo" y agregar
  // gastos después no movería el total mostrado.
  const baseVal=(!isLinked&&g.esGrupo&&g.presupuesto)?g.presupuesto:'';
  const fieldStyle=isLinked?'opacity:.4;pointer-events:none':'';
  const tcIds=listTCIds(m);
  const cardOptStyle=isLinked?'':'opacity:.4;pointer-events:none';
  const cardOpts=tcIds.map(function(tid){
    var card=m.tarjetas[tid];
    var saldo=calcTCSaldo(m,tid);
    var sel=(g.tcCardId===tid)?' selected':'';
    return '<option value="'+tid+'"'+sel+'>'+esc(card.nombre)+' ('+cop(saldo)+')</option>';
  }).join('');
  openModal('<div class="mtitle">'+(g.esGrupo?'Editar grupo':'Convertir en grupo')+'</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Los subgastos pagados se descuentan del total mostrando el saldo pendiente.</p>'
    +'<div class="cbx-row"><input type="checkbox" id="grp-linked"'+(isLinked?' checked':'')
    +' onchange="var f=document.getElementById(\'grp-base-field\');var c=document.getElementById(\'grp-card-field\');'
    +'f.style.opacity=this.checked?\'0.4\':\'1\';f.style.pointerEvents=this.checked?\'none\':\'auto\';'
    +'c.style.opacity=this.checked?\'1\':\'0.4\';c.style.pointerEvents=this.checked?\'auto\':\'none\';">'
    +'<label for="grp-linked" style="font-size:13px;color:var(--acc)">Vincular saldo de tarjeta</label></div>'
    +'<div class="field" id="grp-card-field" style="'+cardOptStyle+'">'
    +'<label>Tarjeta vinculada</label>'
    +'<select id="grp-card">'+cardOpts+'</select></div>'
    +'<div class="field" id="grp-base-field" style="'+fieldStyle+'">'
    +'<label>Monto base manual</label>'
    +'<input id="grp-base" type="text" inputmode="numeric" value="'+moneyInputFmt(baseVal)+'" placeholder="Ej: 1.209.417" oninput="maskMoneyInput(this)"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveConvertir()">'+(g.esGrupo?'Guardar':'Convertir')+'</button>'
    +'</div>');
}
function saveConvertir(){
  const id=window._cvtId, which=window._cvtWhich;
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id); if(!g)return;
  const linkedEl=document.getElementById('grp-linked');
  const linked=linkedEl?linkedEl.checked:false;
  const esConversionNueva=!g.esGrupo; // false si esto es "Editar grupo/base" sobre uno ya existente
  const valorOriginal=g.presupuesto;
  g.esGrupo=true;
  if(linked){
    const cardSel=document.getElementById('grp-card');
    const tcId=cardSel?cardSel.value:listTCIds(m)[0];
    g.tcCardId=tcId;
    g.tcLinked=true; // legacy compat flag
    g.presupuesto=calcTCSaldo(m,tcId);
    syncTCGrupo(m); // creates Abono TC automatically
  } else {
    g.tcCardId=null;
    g.tcLinked=false;
    g.presupuesto=moneyVal('grp-base');
    // Al convertir un gasto normal en grupo por primera vez, el valor que ya tenía no
    // desaparece: se preserva como su primer subgasto, para que el grupo pase a sumar sus
    // subgastos (modo normal) en vez de quedar "congelado" con ese valor como monto fijo. Si el
    // usuario además escribió un "monto base manual", ambos conviven (base fija + subgastos),
    // igual que ya funcionaba antes para un grupo existente con base propia.
    if(esConversionNueva && valorOriginal>0){
      list.push({id:uid(),nombre:g.nombre,presupuesto:valorOriginal,metodo:g.metodo,pagado_real:null,estado:null,pagado_flag:false,sinpagar:false,parentId:g.id});
    }
  }
  save();closeModal();render();toast(nombreGasto(g)+' convertido en grupo');
}
// ── Tarjeta ───────────────────────────────────────────────────────────────────
function renderTC(m) {
  if(!m.tarjetas) m.tarjetas={};
  const tcIds=listTCIds(m);
  if(tcIds.length===0){
    // Crear primera tarjeta automáticamente
    getTC(m,'tc1'); save();
    return renderTC(getM());
  }
  if(!curTC || !m.tarjetas[curTC]) curTC=tcIds[0];

  const t=getTC(m,curTC);
  const tc=t.movimientos||[];
  const info=t.info||{fechaCorte:null,fechaPago:null,cupo:null};
  const sugerida=calcFechaSugerida(info.fechaPago);
  const tcOpen=tcInfoOpen;

  function fmtInfoDate(s){
    if(!s) return '<span style="color:var(--mut);font-style:italic">No definida</span>';
    const d=new Date(s+'T12:00:00');
    return d.toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'});
  }

  // ── Selector de tarjetas (píldoras, compartido con el picker de Inicio) —
  // va dentro del mismo panel tc-mini, igual que en Inicio.
  var cardPills=buildTcPickerHtml(m,tcIds,curTC,true);
  const tcMiniHtml=buildTcMiniHtml(m,curTC,null,cardPills);

  const compras=tc.filter(function(x){return x.tipo==='Compra';}).reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
  const abonos =tc.filter(function(x){return x.tipo==='Abono';}).reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
  const saldo=compras-abonos;

  const cupoDisp=info.cupo?info.cupo-saldo:null;
  const cupoRows=info.cupo
    ?'<div class="nrow"><span class="nlbl">Cupo total</span><span class="nval g">'+cop(info.cupo)+'</span></div>'
     +'<div class="nrow" style="background:rgba(0,0,0,.15)"><span class="nlbl">Cupo disponible</span>'
     +'<span class="nval" style="color:var(--'+(cupoDisp>=0?'grn':'red')+')">'+cop(cupoDisp)+'</span></div>'
    :'';
  const fechaRows=''
    +'<div class="nrow"><span class="nlbl">Fecha de corte</span><span class="nval">'+fmtInfoDate(info.fechaCorte)+'</span></div>'
    +'<div class="nrow"><span class="nlbl">Fecha de pago</span><span class="nval">'+fmtInfoDate(info.fechaPago)+'</span></div>'
    +'<div class="nrow" style="background:rgba(0,0,0,.15)"><span class="nlbl">Fecha sugerida de pago</span>'
    +'<span class="nval" style="color:var(--acc)">'+(sugerida?fmtInfoDate(sugerida):'<span style="color:var(--mut);font-style:italic">Define fecha de pago</span>')+'</span></div>';
  const infoBody=tcOpen?(cupoRows+fechaRows
    +'<div class="trow" style="justify-content:flex-end;border-top:1px solid var(--brd)">'
    +'<button class="nedit" style="padding:4px 12px;font-size:12px;color:var(--red)" onclick="confirmDeleteCard(\''+curTC+'\')">Eliminar tarjeta</button>'
    +'</div>'):'';

  const headerCard='<div class="card" style="padding:12px 14px;margin-bottom:10px">'
    +'<div style="display:flex;align-items:center;justify-content:space-between">'
    +'<span style="font-size:12px;font-weight:700;color:var(--mut)">Información de la tarjeta</span>'
    +'<button onclick="toggleTCInfo()" style="background:none;border:none;color:var(--mut);cursor:pointer;padding:2px 8px;flex-shrink:0;display:flex;align-items:center">'+icon('dots',18)+'</button>'
    +'</div>'
    +(tcOpen?'<div style="margin-top:8px;border-top:1px solid var(--brd);padding-top:6px">'+infoBody+'</div>':'')
    +'</div>';

  // Créditos marcados como "compra diferida a cuotas" de esta tarjeta (cr.tcVinculada===curTC)
  // — solo informativo/de seguimiento: no afecta el saldo de la tarjeta (que sigue siendo
  // compras−abonos como siempre), pero antes no había ningún lugar donde ver, junto a la
  // tarjeta, qué cuotas fijas diferidas están corriendo sobre ella.
  var creditosVinculados=Object.keys(creditos).filter(function(cid){return creditos[cid].tcVinculada===curTC;});
  var creditosVinculadosHtml='';
  if(creditosVinculados.length){
    var filas=creditosVinculados.map(function(cid){
      var cr=creditos[cid];
      var estado=calcEstadoCredito(cr);
      return '<div onclick="creditoDetalleDesdeModal=false;openCreditoDetalle(\''+cid+'\')" style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-bottom:1px solid var(--brd);cursor:pointer">'
        +'<div><div style="font-size:12px;font-weight:600;color:var(--txt)">'+esc(cr.nombre)+'</div>'
        +'<div style="font-size:10px;color:var(--mut);margin-top:1px">'+estado.pagadasVisual+'/'+estado.amort.rows.length+' cuotas pagadas</div></div>'
        +'<div style="font-size:13px;font-weight:700;color:var(--txt)">'+cop(estado.saldoActual)+'</div>'
        +'</div>';
    }).join('');
    creditosVinculadosHtml='<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 4px 8px"><span style="font-size:15px;font-weight:700;color:var(--txt)">Compras diferidas a cuotas</span></div>'
      +'<div class="card" style="margin-bottom:10px">'+filas+'</div>';
  }

  if(!tc.length) return tcMiniHtml+headerCard+creditosVinculadosHtml+'<div class="empty"><div class="eic" style="display:flex;justify-content:center;color:var(--mut)">'+icon('card',36)+'</div><p>Sin movimientos. Toca + para agregar.</p></div>';

  var grupos={};
  var sorted=[...tc].sort(function(a,b){return a.fecha>b.fecha?-1:a.fecha<b.fecha?1:0;});
  sorted.forEach(function(x){
    var key=x.descripcion||'Sin descripción';
    if(!grupos[key]) grupos[key]=[];
    grupos[key].push(x);
  });
  var gruposArr=Object.entries(grupos).map(function(entry){
    var nombre=entry[0], items=entry[1];
    var neto=items.reduce(function(a,x){return a+(x.tipo==='Abono'?-Math.abs(x.valor||0):Math.abs(x.valor||0));},0);
    var total=Math.abs(neto);
    var tipo=neto<0?'Abono':'Compra';
    var firstFecha=items[0]?items[0].fecha:'';
    return {nombre:nombre,items:items,total:total,tipo:tipo,firstFecha:firstFecha};
  }).sort(function(a,b){return a.firstFecha>b.firstFecha?-1:a.firstFecha<b.firstFecha?1:0;});

  var grupoRows=gruposArr.map(function(g,gi){
    var zero=g.total===0;
    var ab=g.tipo==='Abono';
    var detalles=g.items.map(function(x){
      var xAb=x.tipo==='Abono';
      return '<div class="tc-detail" onclick="editTC(\''+x.id+'\')">'
        +'<div style="font-size:12px;color:var(--mut)">'+fmtD(x.fecha)+'</div>'
        +'<div style="font-size:12px;font-weight:600;color:var(--'+(xAb?'grn':'red')+')">'+(xAb?'-':'+')+cop(Math.abs(x.valor||0))+'</div>'
        +'</div>';
    }).join('');
    var countBadge=g.items.length>1?'<span class="tc-count">'+g.items.length+'</span>':'';
    var dateRange=g.items.length===1?fmtD(g.items[0].fecha):fmtD(g.items[0].fecha)+' – '+fmtD(g.items[g.items.length-1].fecha);
    return '<div class="tc-group" id="tcg-'+gi+'">'
      +'<div class="tc-group-head" onclick="toggleTCG('+gi+')">'
      +(zero?'<div class="tcic" style="background:var(--brd);color:var(--mut)">'+icon('minus',14)+'</div>':'<div class="tcic '+(ab?'a':'c')+'">'+icon(ab?'arrowDown':'arrowUp',14)+'</div>')
      +'<div style="flex:1;min-width:0">'
      +'<div class="tcdesc">'+esc(g.nombre)+countBadge+'</div>'
      +'<div class="tcdate">'+dateRange+'</div>'
      +'</div>'
      +'<div style="text-align:right;display:flex;align-items:center;gap:8px">'
      +(zero?'<div class="tcval" style="color:var(--mut)">'+cop(0)+'</div>':'<div class="tcval '+(ab?'a':'c')+'">'+(ab?'-':'+')+cop(g.total)+'</div>')
      +'<div class="tc-chevron" id="tcc-'+gi+'" style="display:flex">'+icon('chevronRight',16)+'</div>'
      +'</div>'
      +'</div>'
      +'<div class="tc-detail-wrap" id="tcd-'+gi+'" style="display:none">'+detalles+'</div>'
      +'</div>';
  }).join('');

  const periodoTotal=compras+abonos;
  const comprasDeg=periodoTotal>0?(compras/periodoTotal)*360:0;
  const icSwap='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
  const resumenRow='<div style="display:flex;align-items:center;gap:12px;padding:14px;border-top:1px solid var(--brd)">'
    +'<div style="width:34px;height:34px;border-radius:10px;background:var(--acc-d);color:var(--acc);display:flex;align-items:center;justify-content:center;flex-shrink:0">'+icSwap+'</div>'
    +'<div style="flex:1;min-width:0">'
    +'<div style="font-size:11px;color:var(--mut);margin-bottom:3px">Resumen del periodo</div>'
    +'<div style="font-size:13px"><span style="color:var(--mut)">Compras</span> <span style="font-weight:600;color:var(--red)">'+cop(compras)+'</span>'
    +'<span style="color:var(--mut);margin:0 5px">|</span><span style="color:var(--mut)">Abonos</span> <span style="font-weight:600;color:var(--grn)">- '+cop(abonos)+'</span></div>'
    +'</div>'
    +(periodoTotal>0?('<div style="position:relative;width:44px;height:44px;flex-shrink:0">'
      +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient(var(--red) '+comprasDeg+'deg,var(--grn) 0deg)"></div>'
      +'<div style="position:absolute;inset:8px;border-radius:50%;background:var(--surf)"></div>'
      +'</div>'):'')
    +'</div>';

  return tcMiniHtml+headerCard+creditosVinculadosHtml
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 4px 8px">'
    +'<span style="font-size:15px;font-weight:700;color:var(--txt)">Movimientos</span>'
    +'</div>'
    +'<div class="card">'
    +grupoRows
    +resumenRow
    +'</div>';
}

function selectTC(tid){
  curTC=tid;
  render();
}

// Marcas disponibles para el "logo" simple mostrado en el carrusel de tarjetas del resumen.
const TC_MARCAS=['Ninguna','Visa','Mastercard','Amex'];
function openNewCard(){
  const marcaOpts=TC_MARCAS.map(function(mk){return '<option value="'+mk+'">'+mk+'</option>';}).join('');
  openModal('<div class="mtitle">Nueva tarjeta</div>'
    +'<div class="field"><label>Nombre de la tarjeta</label>'
    +'<input id="newcard-nombre" placeholder="Ej: BBVA, Falabella, Visa..."></div>'
    +'<div class="field"><label>Marca (opcional)</label><select id="newcard-marca">'+marcaOpts+'</select></div>'
    +'<div class="field"><label>Últimos 4 dígitos (opcional)</label>'
    +'<input id="newcard-ultimos4" maxlength="4" inputmode="numeric" placeholder="Ej: 9537"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveNewCard()">Crear</button>'
    +'</div>');
}
function saveNewCard(){
  const nombre=document.getElementById('newcard-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  const marcaSel=document.getElementById('newcard-marca');
  const marca=marcaSel&&marcaSel.value!=='Ninguna'?marcaSel.value:null;
  const ultimos4=(document.getElementById('newcard-ultimos4').value||'').trim().replace(/\D/g,'').slice(-4)||null;
  const m=getM();
  const tid='tc'+(Object.keys(m.tarjetas||{}).length+1)+'_'+Date.now();
  if(!m.tarjetas) m.tarjetas={};
  m.tarjetas[tid]={id:tid,nombre:nombre,movimientos:[],info:{fechaCorte:null,fechaPago:null,cupo:null,marca:marca,ultimos4:ultimos4}};
  curTC=tid;
  save();closeModal();render();toast('Tarjeta creada');
}
function confirmDeleteCard(tid){
  const m=getM();
  const ids=listTCIds(m);
  if(ids.length<=1){
    showAlert('Debe quedar al menos una tarjeta.');
    return;
  }
  const card=m.tarjetas[tid];
  openModal('<div class="mtitle">¿Eliminar '+esc(card.nombre)+'?</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Se eliminarán los movimientos de esta tarjeta. Los gastos vinculados quedarán sin tarjeta asociada. Esta acción <b style="color:var(--red)">no se puede deshacer</b>.</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="deleteCard(\''+tid+'\')">Eliminar</button>'
    +'</div>');
}
function deleteCard(tid){
  const m=getM();
  delete m.tarjetas[tid];
  // Unlink gastos pointing to this card
  [m.q1_gastos||[],m.q2_gastos||[]].forEach(function(list){
    list.forEach(function(g){ if(g.tcCardId===tid){ g.tcCardId=null; } });
  });
  const ids=listTCIds(m);
  curTC=ids[0]||null;
  save();closeModal();render();toast('Tarjeta eliminada');
}

function toggleTCG(gi) {
  const wrap=document.getElementById('tcd-'+gi);
  const chev=document.getElementById('tcc-'+gi);
  const open=wrap.style.display==='none';
  wrap.style.display=open?'block':'none';
  chev.style.transform=open?'rotate(90deg)':'rotate(0deg)';
  chev.style.color=open?'var(--acc)':'var(--mut)';
}

// ── Ingresos adicionales ─────────────────────────────────────────────────────
// Dos cuentas fijas (Q1 y Q2, una por quincena) donde se registran ingresos aparte de la
// nómina (ej. freelance, ventas, arriendo). El total de cada quincena se agrupa en una sola
// deducción tipo "Suma" bloqueada en Nómina (ver syncIngresosDed), así que ya queda incluido
// en el Neto y el Disponible de esa quincena sin sumarlo dos veces.
function renderIngresos(m){
  const lista=(m.ingresos&&m.ingresos[curIngQ])||[];
  const total=lista.reduce(function(a,x){return a+Math.abs(x.valor||0);},0);
  const qLabel=curIngQ==='q1'?'Q1':'Q2';

  var qcardsHtml=buildQCardsHtml(m,curIngQ,'selectIngQ','INGRESOS',calcIngresosQuincena(m,'q1'),calcIngresosQuincena(m,'q2'));
  var noteRow='<div style="padding:8px 14px 2px;font-size:11px;color:var(--mut)">Se suma automáticamente al Disponible '+qLabel+' (como deducción de Nómina, no editable ahí).</div>';

  if(!lista.length){
    return qcardsHtml+noteRow+'<div class="empty"><div class="eic" style="display:flex;justify-content:center;color:var(--mut)">'+icon('arrowDownCircle',36)+'</div><p>Sin ingresos en '+qLabel+'. Toca + para agregar.</p></div>';
  }

  var sorted=[...lista].sort(function(a,b){return (b.fecha||'')>(a.fecha||'')?1:-1;});
  var rows=sorted.map(function(x){
    return '<div class="grow" onclick="editIngreso(\''+x.id+'\',\''+curIngQ+'\')">'
      +'<div class="ginfo"><div class="gname">'+esc(x.nombre)+'</div><div class="gmeta">'+fmtD(x.fecha)+'</div></div>'
      +'<div style="text-align:right"><div class="gamt" style="color:var(--grn)">+'+cop(x.valor)+'</div></div>'
      +'</div>';
  }).join('');

  return qcardsHtml+noteRow+'<div class="card">'
    +'<div class="chead"><span class="ctitle">Ingresos '+qLabel+'</span>'
    +'<span class="badge bg">'+cop(total)+'</span></div>'
    +rows
    +'</div>';
}
function selectIngQ(which){
  curIngQ=which;
  document.getElementById('scroll').innerHTML=renderIngresos(getM());
}
function openIngresoModal(g,which){
  const isE=!!g;
  const eid=isE?g.id:'';
  const wh=which||curIngQ;
  const hoy=new Date().toISOString().slice(0,10);
  openModal('<div class="mtitle">'+(isE?'Editar ingreso':'Nuevo ingreso')+'</div>'
    +'<div class="field"><label>Nombre</label><input id="ing-n" value="'+(isE?esc(g.nombre):'')+'" placeholder="Freelance, Venta, Arriendo..."></div>'
    +'<div class="field"><label>Valor</label><input id="ing-v" type="text" inputmode="numeric" value="'+moneyInputFmt(isE?g.valor:0)+'" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Fecha</label><input id="ing-f" type="date" value="'+(isE?(g.fecha||hoy):hoy)+'"></div>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveIngreso(\''+eid+'\',\''+wh+'\')">Guardar</button></div>'
    +(isE?'<button class="bdel" onclick="delIngreso(\''+eid+'\',\''+wh+'\')">Eliminar ingreso</button>':''));
}
function saveIngreso(id,which){
  const m=getM();
  if(!m.ingresos) m.ingresos={q1:[],q2:[]};
  const list=m.ingresos[which];
  const nombre=document.getElementById('ing-n').value.trim();
  const valor=moneyVal('ing-v');
  const fecha=document.getElementById('ing-f').value||new Date().toISOString().slice(0,10);
  if(!nombre){showAlert('Escribe un nombre');return;}
  let ing;
  if(id){
    ing=list.find(function(x){return x.id===id;});
    if(ing){ing.nombre=nombre;ing.valor=valor;ing.fecha=fecha;}
  } else {
    ing={id:uid(),nombre,valor,fecha};
    list.push(ing);
  }
  syncIngresosDed(m,which);
  save();closeModal();render();toast(id?'Ingreso actualizado':'Ingreso agregado');
}
function editIngreso(id,which){
  const m=getM();
  const g=(m.ingresos&&m.ingresos[which]||[]).find(function(x){return x.id===id;});
  if(g) openIngresoModal(g,which);
}
function delIngreso(id,which){
  showConfirm('¿Eliminar este ingreso?',function(){
    const m=getM();
    m.ingresos[which]=(m.ingresos[which]||[]).filter(function(x){return x.id!==id;});
    syncIngresosDed(m,which);
    save();closeModal();render();toast('Ingreso eliminado');
  });
}

