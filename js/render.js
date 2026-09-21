// Fase 2 de la migración a una arquitectura más modular: este archivo se dividió (antes tenía
// 1330 líneas) — solo queda la navegación de meses, el header (identidad/selector de mes) y el
// render() principal (el dispatcher que decide qué pestaña dibujar). El resto vive en archivos
// por dominio: render-gastos.js, render-inicio.js, render-tarjeta.js, render-ingresos.js.

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
// ── Header: identidad del perfil + selector de mes ──────────────────────────────
// Reemplaza las antiguas pestañas de mes (ventana de 3) y el botón "⋮": una sola fila con
// el bloque de identidad (avatar/nombre/quincena seleccionada, pulsable → menú de usuario) a
// la izquierda y una pastilla de mes (pulsable → lista completa de meses) a la derecha. Los
// paneles que abren no son overlays: viven en el flujo normal del documento (#userMenuPanel/
// #monthPanel en index.html, justo debajo de #headerRow) y empujan el contenido hacia abajo.
function mesTienePendientes(k){
  const r=calcPctPagadoMes(db[k]);
  return r.total>0 && r.pagado<r.total;
}
// Iniciales para el avatar: primera letra del nombre + primera del apellido; un solo nombre
// (sin espacios) da una sola letra. Nunca se inventa un "?" — sin nombre, el avatar queda vacío.
function inicialesPerfil(nombre){
  const partes=(nombre||'').trim().split(/\s+/).filter(Boolean);
  if(!partes.length) return '';
  if(partes.length===1) return partes[0][0].toUpperCase();
  return (partes[0][0]+partes[partes.length-1][0]).toUpperCase();
}
// "María Fernanda Rodríguez" -> "María Fernanda R.": todas las palabras completas salvo la
// última, reducida a su inicial — evita nombres largos empujando la pastilla de mes sin tener
// que reducir el tamaño de letra. La elipsis del CSS (ver renderHeaderTop) cubre el resto.
function nombreCortoPerfil(nombre){
  const limpio=(nombre||'').trim();
  const partes=limpio.split(/\s+/).filter(Boolean);
  if(partes.length<=2) return limpio;
  return partes.slice(0,-1).join(' ')+' '+partes[partes.length-1][0].toUpperCase()+'.';
}
// Texto del subtítulo — se recalcula con la quincena seleccionada (homeQ, misma fuente de
// verdad que ya resaltan las tarjetas Q1/Q2) y su fecha de pago real del mes activo.
// diasHasta() ya calcula a medianoche local (ver format-utils.js), no por diferencia de ms.
function textoDiasAlPago(qLabel,fechaPagoDt){
  const d=diasHasta(fechaPagoDt);
  if(d>1) return qLabel+' · '+d+' días al pago';
  if(d===1) return qLabel+' · mañana es el pago';
  if(d===0) return qLabel+' · hoy es el pago';
  const f=fechaPagoDt.toLocaleDateString('es-CO',{day:'numeric',month:'short'});
  return qLabel+' · pago del '+f;
}
function toggleHeaderUserMenu(){
  headerUserMenuOpen=!headerUserMenuOpen;
  if(headerUserMenuOpen) headerMonthPanelOpen=false;
  render();
}
function toggleHeaderMonthPanel(){
  headerMonthPanelOpen=!headerMonthPanelOpen;
  if(headerMonthPanelOpen) headerUserMenuOpen=false;
  render();
}
// "Tocar fuera para cerrar": el <div class="scroll"> (todo el contenido debajo del header)
// llama a esto en su onclick — ver index.html. No interfiere con los demás onclick de adentro
// (siguen disparando normalmente por burbujeo); si ningún panel está abierto, no hace nada.
function closeHeaderPanels(){
  if(headerUserMenuOpen||headerMonthPanelOpen){
    headerUserMenuOpen=false; headerMonthPanelOpen=false;
    render();
  }
}
function renderHeaderTop(m){
  const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});

  const nombre=(perfilNombre||'').trim();
  const iniciales=inicialesPerfil(nombre);
  const nombreMostrado=nombre?nombreCortoPerfil(nombre):'Configura tu nombre';
  const avatarHtml=iniciales
    ?'<div style="width:40px;height:40px;border-radius:20px;background:var(--acc-d);border:1.5px solid var(--acc);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="color:var(--acc);font-size:14px;font-weight:800">'+esc(iniciales)+'</span></div>'
    :'<div style="width:40px;height:40px;border-radius:20px;background:transparent;border:1.5px solid var(--brd2);flex-shrink:0"></div>';

  const qSel=homeQ==='q2'?'q2':'q1';
  const mi=MESES.indexOf(m.nombre);
  const {q1,q2}=getPago(m.año, mi>=0?mi:0);
  const subtitulo=textoDiasAlPago(qSel==='q1'?'Q1':'Q2', qSel==='q1'?q1:q2);

  // Mismo criterio que chevronMesHtml: caja fija, centrada, que solo rota — nunca cambia de
  // ancho ni de posición al abrir/cerrar (antes intercambiaba los caracteres ⌄/⌃, que "saltaban").
  const chevronUserHtml='<span style="display:flex;align-items:center;justify-content:center;width:14px;height:14px;flex-shrink:0;color:var(--mut);transform:rotate('+(headerUserMenuOpen?'180deg':'0deg')+');transition:transform .15s ease">'+icon('chevronDown',13)+'</span>';

  const identidadHtml='<div onclick="toggleHeaderUserMenu()" style="display:flex;align-items:center;gap:11px;min-width:0;flex:1;cursor:pointer;padding:3px 8px 3px 3px;margin-left:-3px;border-radius:24px;background:var(--bg-2)">'
    +avatarHtml
    +'<div style="min-width:0;flex:1">'
    +'<div style="display:flex;align-items:center;gap:6px;min-width:0">'
    +'<span style="font-size:16px;font-weight:800;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">'+esc(nombreMostrado)+'</span>'
    +chevronUserHtml
    +'</div>'
    +'<div style="font-size:11.5px;font-weight:600;color:var(--acc);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(subtitulo)+'</div>'
    +'</div>'
    +'</div>';

  const otroMesConPendientes=keys.some(function(k){return k!==curM && mesTienePendientes(k);});
  const dotPastilla=otroMesConPendientes?'<span style="width:6px;height:6px;border-radius:50%;background:var(--amb);flex-shrink:0"></span>':'';
  // Ícono en vez de intercambiar caracteres ⌄/⌃: con las flechas de texto, el glifo cambiaba de
  // ancho/posición al abrir y cerrar (se veía "saltar"). Acá el contenedor queda fijo (mismo
  // tamaño siempre, centrado) y solo se rota con CSS — la flecha queda estática, solo gira.
  const chevronMesHtml='<span style="display:flex;align-items:center;justify-content:center;width:14px;height:14px;flex-shrink:0;color:var(--mut);transform:rotate('+(headerMonthPanelOpen?'180deg':'0deg')+');transition:transform .15s ease">'+icon('chevronDown',13)+'</span>';
  const pastillaHtml='<div onclick="toggleHeaderMonthPanel()" style="display:flex;align-items:center;gap:6px;padding:8px 11px;background:var(--surf2);border:1px solid var(--brd2);border-radius:12px;cursor:pointer;flex-shrink:0">'
    +'<span style="font-size:13.5px;font-weight:800;color:var(--txt);white-space:nowrap">'+esc(m.nombre.slice(0,3))+'</span>'
    +chevronMesHtml
    +dotPastilla
    +'</div>';

  return identidadHtml+pastillaHtml;
}
// Menú de usuario: mismas opciones que antes vivían en el botón "⋮" (openOverflowMenu), menos
// "Eliminar mes" (ahora es una papelera por fila dentro del selector de mes, ver
// renderHeaderMonthPanel) y "Cerrar sesión" (no hay un login tradicional en esta app — la
// sesión de Google, si hay una, se cierra desde Perfil, ver backupNubeSectionHtml).
function renderHeaderUserMenu(){
  if(!headerUserMenuOpen) return '';
  const user=(typeof syncUsuarioActual==='function')?syncUsuarioActual():null;
  const sesionHtml=user
    ?('<div style="padding:13px 16px;border-bottom:1px solid var(--brd)">'
      +'<div style="font-size:11px;font-weight:700;color:var(--mut);letter-spacing:.08em">SESIÓN ACTIVA</div>'
      +'<div style="font-size:13px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px">'+esc(user.email||user.displayName||'')+'</div>'
      +'</div>')
    :'';
  function fila(label,accion,color){
    return '<div onclick="headerUserMenuOpen=false;'+accion+'" style="padding:13px 16px;font-size:14px;font-weight:600;color:'+(color||'var(--txt)')+';border-top:1px solid var(--brd);cursor:pointer">'+esc(label)+'</div>';
  }
  const filas=fila('Mi perfil','openSecurityMenu()')
    +fila('Catálogos','openCatalogosMenu()')
    +fila('Información general','openInfoGeneral()')
    +fila('Seguridad','openSeguridadMenu()');
  return '<div style="margin:0 16px 14px;background:var(--surf2);border:1px solid var(--brd2);border-radius:16px;overflow:hidden">'+sesionHtml+filas+'</div>';
}
// Selector de mes: la lista reemplaza a las antiguas pestañas — mismo punto ámbar de "tiene
// pendientes" que antes vivía en cada pestaña (ver mesTienePendientes), "+ Nuevo mes" al final
// en vez del botón "+" que vivía al final de las pestañas, y una papelera por fila (en vez de
// la antigua entrada "Eliminar mes" del menú de usuario, ver confirmDeleteMonth en
// catalogos.js) para borrar ese mes puntual — oculta si solo queda uno, porque siempre debe
// quedar al menos un mes en la app.
function renderHeaderMonthPanel(){
  if(!headerMonthPanelOpen) return '';
  const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  const puedeBorrar=keys.length>1;
  const filas=keys.map(function(k){
    const mes=db[k];
    const activo=k===curM;
    const pend=mesTienePendientes(k);
    const trashBtn=puedeBorrar
      ?'<button onclick="event.stopPropagation();headerMonthPanelOpen=false;confirmDeleteMonth('+k+')" style="background:none;border:none;color:var(--red);padding:4px;cursor:pointer;display:flex;align-items:center;flex-shrink:0">'+icon('trash',15)+'</button>'
      :'';
    return '<div onclick="headerMonthPanelOpen=false;goToMonth('+k+')" style="padding:13px 16px;min-height:44px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid var(--brd);cursor:pointer;background:'+(activo?'var(--acc-d)':'transparent')+'">'
      +'<span style="font-size:14px;font-weight:'+(activo?'700':'600')+';color:'+(activo?'var(--txt)':'var(--mut)')+';flex:1;min-width:0">'+esc(mes.nombre)+' '+mes.año+'</span>'
      +(pend?'<span style="width:6px;height:6px;border-radius:50%;background:var(--amb);flex-shrink:0"></span>':'')
      +trashBtn
      +'</div>';
  }).join('');
  const nuevoMesBtn='<div onclick="headerMonthPanelOpen=false;openNewMonth()" style="padding:13px 16px;border-top:1px solid var(--brd);cursor:pointer;color:var(--acc);font-size:13px;font-weight:600">+ Nuevo mes</div>';
  return '<div style="margin:0 16px 14px;background:var(--surf2);border:1px solid var(--brd2);border-radius:16px;overflow:hidden">'+filas+nuevoMesBtn+'</div>';
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
  // Misma lógica que Inicio (ver homeQParaMes arriba), aplicada a la pestaña Nómina: arranca
  // en la quincena en curso según la fecha de hoy, no siempre en Q1.
  if(!curNomQAutoDone){
    curNomQAutoDone=true;
    curNomQ=homeQParaMes(m);
  }
  const homeActive = curTab===0;
  document.getElementById('headerRow').innerHTML = renderHeaderTop(m);
  const userMenuEl=document.getElementById('userMenuPanel');
  userMenuEl.innerHTML = renderHeaderUserMenu();
  userMenuEl.style.display = headerUserMenuOpen?'block':'none';
  const monthPanelEl=document.getElementById('monthPanel');
  monthPanelEl.innerHTML = renderHeaderMonthPanel();
  monthPanelEl.style.display = headerMonthPanelOpen?'block':'none';
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

  // La barra inferior solo muestra 4 botones (Inicio/Nómina/Agenda/Más) — Ingresos, Tarjeta y
  // Créditos viven detrás de "Más" (ver openMasMenu, ui-core.js), así que ya no hay una
  // correspondencia 1:1 entre posición del botón y curTab: cada botón declara en data-tabs
  // qué valores de curTab lo dejan "activo" (el de "Más" lista varios, separados por coma).
  document.querySelectorAll('.tab').forEach(function(t){
    var tabs=(t.dataset.tabs||'').split(',').map(Number);
    t.classList.toggle('active',tabs.indexOf(curTab)>=0);
  });
  // Punto ámbar de la pestaña Agenda (ver index.html): se actualiza acá, en cada render(), en
  // vez de solo al entrar a esa pestaña — así avisa aunque el usuario esté en cualquier otra.
  const agendaDotEl=document.getElementById('agendaTabDot');
  if(agendaDotEl && typeof agEntradasProximos7==='function'){
    agendaDotEl.style.display=agEntradasProximos7(m).length>0?'block':'none';
  }
  const el=document.getElementById('scroll');
  // Inicio y Créditos ya NO usan el modo "scroll-home" (encabezado fijo + scroll interno
  // propio): ambos se apoyan en .glist-card, que dejó de tener su propio flex/scroll (ver
  // style.css) — sin sacarlos de scroll-home, su lista quedaba sin ninguna forma de
  // desplazarse (overflow-y:hidden por fuera y sin scroll propio por dentro). Ahora se
  // comportan como Tarjeta/Ingresos: toda la pantalla se desplaza junto. Nómina sigue en
  // scroll-home porque .nom-lists sí conserva su propio scroll interno.
  el.classList.toggle('scroll-home', curTab===3);
  if      (curTab===0) el.innerHTML=renderInicio(m);
  else if (curTab===1) el.innerHTML=renderIngresos(m);
  else if (curTab===2) el.innerHTML=renderTC(m);
  else if (curTab===3) el.innerHTML=renderNom(m);
  else if (curTab===4) el.innerHTML=renderCreditos(m);
  else                 el.innerHTML=renderAgenda(m);
}

