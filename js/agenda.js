// ── Agenda: recordatorios de pago y tareas, enlazados con los gastos ────────────
// Vive per-mes en m.agenda (ver migrateMonth, auth.js) — solo entradas MANUALES (tareas y
// pagos que el usuario crea a mano). Las automáticas (días de pago, fecha límite de tarjeta) y
// derivadas (gastos "sin pagar" que vencen) se calculan al vuelo en cada render, nunca se
// guardan, para que no puedan desincronizarse de la fuente real (nómina/tarjeta/gastos).
//
// Paleta propia de esta pantalla (igual criterio que IG en catalogos.js): no toca las
// variables CSS globales, así ningún otro modal se ve afectado.
var AG={
  bg1:'#0B1220',bg2:'#0D1729',bg3:'#0B1526',bg4:'#101A2E',bg5:'#111C2E',bg6:'#131E33',
  accBg:'#0E2233',accBg2:'#0E3742',accBg3:'#164E63',
  bd1:'#22304F',bd2:'#26344F',bd3:'#1E2B45',bd4:'#16334A',
  cian:'#22D3EE',cian2:'#67E8F9',
  amb1:'#F59E0B',amb2:'#FBBF24',amb3:'#FCD34D',amb4:'#FEF3C7',amb5:'#78350F',amb6:'#2A1D06',
  indigo:'#A5B4FC',rojo:'#F87171',
  txt1:'#F8FAFC',txt2:'#F1F5F9',txt3:'#E2E8F0',txt4:'#CBD5E1',txt5:'#94A3B8'
};

// Estado de la pantalla (transitorio, no se guarda)
let agFiltro='todo';        // 'todo' | 'dinero' | 'tareas'
let agDiaSel=null;          // fecha 'YYYY-MM-DD' seleccionada en la tira de 10 días o en el calendario, o null
let agMesCompletoAbierto=false; // false = tira de 10 días; true = calendario del mes completo
let agFormTipo='tarea';     // tipo activo en el formulario de creación
let agFormRegistrarGasto=true;
let agFormRepetirActual='nunca';
let agFormGastoExistenteId=null; // gasto YA CREADO al que se enlaza este pago, en vez de crear uno nuevo
let agFormSnapshot=null;         // valores tecleados, para volver del picker de "gasto existente" sin perderlos
// La quincena normalmente se deduce del día de la fecha (1-15 → Q1, 16-fin → Q2), pero eso
// asume que la Q2 ya se pagó justo el día 16 — si un gasto cae, por ejemplo, el 24 pero la Q2
// todavía no se ha pagado, sigue siendo plata de la Q1. null = usar la deducida por fecha;
// 'q1'/'q2' = el usuario la corrigió a mano en el formulario.
let agFormQuincenaManual=null;

// ── Datos ────────────────────────────────────────────────────────────────────
function agendaArr(m){ if(!Array.isArray(m.agenda)) m.agenda=[]; return m.agenda; }
function agQuincenaDeFecha(fecha){
  var day=parseInt((fecha||'').split('-')[2],10)||1;
  return day<=15?'q1':'q2';
}
// La que realmente se usa en el formulario: la deducida por fecha, salvo que el usuario la
// haya corregido a mano (ver agFormQuincenaManual).
function agQuincenaResuelta(fecha){
  return agFormQuincenaManual||agQuincenaDeFecha(fecha);
}
function agSetQuincenaManual(q){
  agFormQuincenaManual=q;
  agFormGastoExistenteId=null; // una asociación a un gasto de la otra quincena ya no aplica
  agActualizarBloqueGasto();
}
function agBuscarGasto(m,gastoId,which){
  var lista=which==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
  return (lista||[]).find(function(x){return x.id===gastoId;});
}
function agBuscarMesPorFecha(fecha){
  var partes=fecha.split('-'); var año=parseInt(partes[0],10); var mi=parseInt(partes[1],10)-1;
  var nombre=MESES[mi];
  var k=Object.keys(db).find(function(kk){return db[kk].año===año&&db[kk].nombre===nombre;});
  return k!=null?db[k]:null;
}

// Automáticas: días de pago de nómina Q1/Q2 y fecha límite de cada tarjeta REAL (ver
// tcEsPlaceholder en tarjeta.js) con saldo pendiente — se recalculan siempre desde la fuente,
// nunca se guardan como agenda para que no puedan quedar desactualizadas.
function agEntradasAutomaticas(m){
  var out=[];
  var mi=MESES.indexOf(m.nombre);
  if(mi<0) return out;
  var pagos=getPago(m.año,mi);
  var fQ1=pagos.q1.toISOString().slice(0,10), fQ2=pagos.q2.toISOString().slice(0,10);
  out.push({id:'auto-pago-q1',origen:'automatico',tipo:'pago',concepto:'Pago de nómina Q1',fecha:fQ1,monto:netoQ1(m),esIngreso:true,gastoPagado:false,which:'q1',color:AG.cian});
  out.push({id:'auto-pago-q2',origen:'automatico',tipo:'pago',concepto:'Pago de nómina Q2',fecha:fQ2,monto:netoQ2(m),esIngreso:true,gastoPagado:false,which:'q2',color:AG.cian});
  (typeof listTCIdsReales==='function'?listTCIdsReales(m):[]).forEach(function(tid){
    var t=m.tarjetas[tid];
    if(t.info&&t.info.fechaPago){
      var saldo=calcTCSaldo(m,tid);
      if(saldo>0){
        out.push({id:'auto-tc-'+tid,origen:'automatico',tipo:'pago',concepto:'Pago '+(t.nombre||'tarjeta'),fecha:t.info.fechaPago,monto:saldo,esIngreso:false,gastoPagado:false,which:agQuincenaDeFecha(t.info.fechaPago),color:AG.amb1});
      }
    }
  });
  return out;
}

// Derivadas: gastos de nivel superior marcados "sin pagar" que siguen sin resolverse — vencen
// al cierre de su propia quincena (día 15 para Q1, último día del mes para Q2).
function agEntradasDerivadas(m){
  var out=[];
  var mi=MESES.indexOf(m.nombre);
  if(mi<0) return out;
  var finMes=new Date(m.año,mi+1,0).getDate();
  ['q1','q2'].forEach(function(which){
    var lista=which==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
    var dia=which==='q1'?15:finMes;
    var fecha=m.año+'-'+String(mi+1).padStart(2,'0')+'-'+String(dia).padStart(2,'0');
    (lista||[]).forEach(function(g){
      if(g.esGrupo||g.parentId) return;
      // Un gasto "sin pagar" que YA nació de un recordatorio manual (g.agendaId) no es una
      // entrada derivada aparte: ya está representado por su propio recordatorio en m.agenda
      // (ver agEntradaManualEnriquecida) — contarlo también acá lo duplicaría en la agenda.
      if(g.agendaId) return;
      if(gastoEstado(g)==='sinpagar'){
        out.push({id:'deriv-'+g.id,origen:'derivado',tipo:'pago',concepto:nombreGasto(g),fecha:fecha,monto:Math.abs(g.presupuesto||0),esIngreso:false,gastoPagado:false,which:which,color:AG.amb1,gastoId:g.id});
      }
    });
  });
  return out;
}

// Manuales: se enriquecen en el momento de leerlas (nunca se guarda el color/estado derivado,
// solo los datos propios) — así un gasto pagado después de crear el recordatorio se refleja
// solo, sin tener que sincronizar ese campo a mano en cada punto que lo cambia.
function agEntradaManualEnriquecida(it,m){
  var out=Object.assign({},it);
  out.origen='manual';
  out.esIngreso=false;
  if(it.tipo==='tarea'){
    out.color=it.tildado?'#475569':AG.indigo;
  } else {
    var gasto=it.gastoId?agBuscarGasto(m,it.gastoId,it.which):null;
    out.gastoPagado=gasto?(gastoEstado(gasto)==='pagado'):false;
    out.color=out.gastoPagado?'#475569':AG.amb1;
  }
  return out;
}

function agEntradasDelMes(m){
  var auto=agEntradasAutomaticas(m);
  var deriv=agEntradasDerivadas(m);
  var man=agendaArr(m).map(function(it){return agEntradaManualEnriquecida(it,m);});
  return auto.concat(deriv,man).sort(function(a,b){return a.fecha<b.fecha?-1:a.fecha>b.fecha?1:0;});
}

// Entradas pendientes en los próximos 7 días (incluye hoy) — usado por el punto ámbar de la
// pestaña Agenda (ver render() en render.js).
function agEntradasProximos7(m){
  return agEntradasDelMes(m).filter(function(e){
    if(e.tipo==='tarea'&&e.tildado) return false;
    if(e.tipo==='pago'&&e.gastoPagado) return false;
    var d=diasHasta(e.fecha+'T12:00:00');
    return d>=0&&d<=7;
  }).sort(function(a,b){return diasHasta(a.fecha+'T12:00:00')-diasHasta(b.fecha+'T12:00:00');});
}

// ── Pantalla principal de la Agenda ─────────────────────────────────────────────
function renderAgenda(m){
  var todas=agEntradasDelMes(m);
  var pendientesDinero=todas.filter(function(e){return e.tipo==='pago'&&!e.esIngreso&&!e.gastoPagado;});
  var pendientesTareas=todas.filter(function(e){return e.tipo==='tarea'&&!e.tildado;});
  var resumen=pendientesDinero.length+' pendiente'+(pendientesDinero.length===1?'':'s')+' · '+pendientesTareas.length+' tarea'+(pendientesTareas.length===1?'':'s');

  var keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  var mesOpts=keys.map(function(k){
    return '<option value="'+k+'"'+(k===curM?' selected':'')+'>'+db[k].nombre.slice(0,3)+' '+db[k].año+'</option>';
  }).join('');

  var headerHtml='<div style="padding:4px 16px 8px;display:flex;align-items:center;justify-content:space-between;gap:10px">'
    +'<div style="min-width:0">'
    +'<div style="font-size:17px;font-weight:800;color:'+AG.txt2+';letter-spacing:-.01em">Agenda</div>'
    +'<div style="font-size:11px;font-weight:600;color:'+AG.cian+'">'+esc(resumen)+'</div>'
    +'</div>'
    +'<div style="position:relative;display:flex;align-items:center;flex-shrink:0">'
    +'<select onchange="curM=parseInt(this.value);agDiaSel=null;render()" style="appearance:none;-webkit-appearance:none;padding:6px 24px 6px 10px;background:'+AG.bg6+';border:1px solid '+AG.bd2+';border-radius:11px;font-size:13px;font-weight:800;color:'+AG.txt2+';outline:none">'+mesOpts+'</select>'
    +'<span style="position:absolute;right:8px;pointer-events:none;color:'+AG.txt5+';display:flex">'+icon('chevronDown',10)+'</span>'
    +'</div>'
    +'</div>';

  function filtroBtn(k,lbl){
    var isA=agFiltro===k;
    return '<button onclick="agFiltro=\''+k+'\';render()" style="flex:1;padding:6px 13px;border-radius:9px;border:none;cursor:pointer;font-size:12px;font-weight:'+(isA?'800':'700')+';background:'+(isA?AG.accBg2:'transparent')+';color:'+(isA?AG.cian2:AG.txt5)+'">'+lbl+'</button>';
  }
  var filtroHtml='<div style="padding:0 16px 8px"><div style="display:flex;background:'+AG.bg4+';border-radius:12px;padding:4px;gap:4px">'
    +filtroBtn('todo','Todo')+filtroBtn('dinero','Dinero')+filtroBtn('tareas','Tareas')
    +'</div></div>';

  var mi=MESES.indexOf(m.nombre);
  var finMes=mi>=0?new Date(m.año,mi+1,0).getDate():30;
  var mesLbl=mi>=0?MESES_ABBR_MIN[mi].toUpperCase():'';
  var hoyReal=new Date();
  var hoyMismoMes=(m.año===hoyReal.getFullYear()&&mi===hoyReal.getMonth());
  var quincenaVigente=hoyMismoMes?(hoyReal.getDate()<=15?'q1':'q2'):null;

  // Un punto por día con evento, compartido entre la tira de 10 días y el calendario del mes.
  function agPuntoDia(fStr){
    var ev=todas.find(function(e){
      if(e.fecha!==fStr) return false;
      if(agFiltro==='dinero') return e.tipo==='pago';
      if(agFiltro==='tareas') return e.tipo==='tarea';
      return true;
    });
    return {tiene:!!ev,color:ev?ev.color:null};
  }

  var hoy=new Date(); hoy.setHours(0,0,0,0);
  var diasBoxes=[];
  for(var i=0;i<10;i++){
    var d=new Date(hoy); d.setDate(d.getDate()+i);
    var fStr=d.toISOString().slice(0,10);
    var activo=agDiaSel===fStr;
    var esHoy=(i===0); // el primer día de la tira SIEMPRE es hoy (ver "var hoy" arriba)
    var pd=agPuntoDia(fStr);
    var punto=pd.tiene?('<span style="width:4px;height:4px;border-radius:50%;background:'+pd.color+';display:inline-block"></span>'):'<span style="width:4px;height:4px;display:inline-block"></span>';
    // "Hoy" se distingue con un borde propio aunque no esté seleccionado (ver esHoy arriba) —
    // antes ningún día quedaba marcado como "hoy" en la tira, solo se veía cuál estaba
    // seleccionado (agDiaSel), que es un estado aparte y no siempre coincide con la fecha real.
    var borde=activo?AG.cian:(esHoy?AG.cian+'88':'transparent');
    diasBoxes.push('<div onclick="agDiaSel='+(activo?'null':("'"+fStr+"'"))+';render()" style="flex:1;padding:5px 0 4px;border-radius:10px;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;background:'+(activo?AG.accBg2:'transparent')+';border:1px solid '+borde+'">'
      +'<span style="font-size:9.5px;font-weight:700;text-transform:uppercase;color:'+(activo?AG.cian2:esHoy?AG.cian:AG.txt5)+'">'+(esHoy?'HOY':DOW_ABBR[d.getDay()])+'</span>'
      +'<span style="font-size:13px;font-weight:800;font-variant-numeric:tabular-nums;color:'+(activo?AG.txt1:esHoy?AG.txt2:AG.txt5)+'">'+d.getDate()+'</span>'
      +punto
      +'</div>');
  }
  // Mismo panel de fondo agrupador que el calendario del mes completo (ver mesGridHtml) — antes
  // cada día tenía su propio fondo suelto, sin nada que los agrupara visualmente como una unidad.
  var tiraHtml='<div style="margin:0 16px 8px;padding:8px 6px;background:'+AG.bg4+';border:1px solid '+AG.bd1+';border-radius:14px;display:flex;gap:4px;overflow-x:auto;scrollbar-width:none">'+diasBoxes.join('')+'</div>';

  // Calendario del mes completo (ver agToggleMesCompleto) — mismo criterio de "hoy"/seleccionado/
  // punto de evento que la tira de 10 días, pero en grilla de 7 columnas para ver el mes entero
  // de un vistazo en vez de solo los próximos 10 días.
  var mesGridHtml='';
  if(agMesCompletoAbierto&&mi>=0){
    var primerDia=new Date(m.año,mi,1);
    var offset=primerDia.getDay();
    var celdas=[];
    for(var b=0;b<offset;b++){ celdas.push('<div></div>'); }
    for(var dNum=1;dNum<=finMes;dNum++){
      var fStr2=new Date(m.año,mi,dNum).toISOString().slice(0,10);
      var activo2=agDiaSel===fStr2;
      var esHoy2=hoyMismoMes&&dNum===hoyReal.getDate();
      var pd2=agPuntoDia(fStr2);
      var punto2=pd2.tiene?('<span style="width:4px;height:4px;border-radius:50%;background:'+pd2.color+';display:block;margin:1px auto 0"></span>'):'<span style="width:4px;height:4px;display:block;margin:1px auto 0"></span>';
      var borde2=activo2?AG.cian:(esHoy2?AG.cian+'88':'transparent');
      celdas.push('<div onclick="agDiaSel='+(activo2?'null':("'"+fStr2+"'"))+';render()" style="height:32px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;background:'+(activo2?AG.accBg2:'transparent')+';border:1px solid '+borde2+'">'
        +'<span style="font-size:11px;font-weight:'+(esHoy2?'800':'600')+';color:'+(activo2?AG.txt1:esHoy2?AG.cian:AG.txt3)+'">'+dNum+'</span>'
        +punto2
        +'</div>');
    }
    var dowHeadHtml=DOW_ABBR.map(function(dw){return '<div style="text-align:center;font-size:8.5px;font-weight:700;color:'+AG.txt5+';text-transform:uppercase;padding-bottom:2px">'+dw+'</div>';}).join('');
    mesGridHtml='<div style="margin:0 16px 8px;padding:7px 6px;background:'+AG.bg4+';border:1px solid '+AG.bd1+';border-radius:14px">'
      +'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px">'+dowHeadHtml+celdas.join('')+'</div></div>';
  }

  var toggleMesHtml='<div style="padding:0 16px 8px;display:flex;justify-content:flex-end">'
    +'<button onclick="agMesCompletoAbierto=!agMesCompletoAbierto;render()" style="background:none;border:none;color:'+AG.cian+';font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:3px;padding:0">'
    +(agMesCompletoAbierto?'Ver menos':'Ver mes completo')+icon(agMesCompletoAbierto?'chevronUp':'chevronDown',11)
    +'</button></div>';

  var filtradas=todas.filter(function(e){
    if(agFiltro==='dinero'&&e.tipo!=='pago') return false;
    if(agFiltro==='tareas'&&e.tipo!=='tarea') return false;
    if(agDiaSel&&e.fecha!==agDiaSel) return false;
    return true;
  });

  function grupoHtml(which){
    var items=filtradas.filter(function(e){return e.which===which;}).sort(function(a,b){return a.fecha<b.fecha?-1:a.fecha>b.fecha?1:0;});
    var dineroTot=items.filter(function(e){return e.tipo==='pago'&&!e.esIngreso&&!e.gastoPagado;}).reduce(function(a,e){return a+(e.monto||0);},0);
    var tareasCount=items.filter(function(e){return e.tipo==='tarea'&&!e.tildado;}).length;
    var partes=[];
    if(dineroTot>0) partes.push(cop(dineroTot));
    if(tareasCount>0) partes.push(tareasCount+' tarea'+(tareasCount===1?'':'s'));
    var subtotalTxt=partes.length?partes.join(' · '):'—';
    var rango=which==='q1'?('1–15 '+mesLbl):('16–'+finMes+' '+mesLbl);
    var esVigente=which===quincenaVigente;
    var head='<div style="padding:0 2px;display:flex;justify-content:space-between;align-items:center;margin:10px 0 6px">'
      +'<span style="font-size:10px;font-weight:800;letter-spacing:.1em;color:'+(esVigente?AG.cian:AG.txt5)+'">'+(which==='q1'?'Q1':'Q2')+' · '+esc(rango)+'</span>'
      +'<span style="font-size:11px;font-weight:700;color:'+AG.txt5+';font-variant-numeric:tabular-nums">'+esc(subtotalTxt)+'</span>'
      +'</div>';
    var rowsHtml=items.length?items.map(agFilaHtml).join(''):'<div style="padding:8px 2px;font-size:12px;color:'+AG.txt5+'">Nada por aquí.</div>';
    return head+rowsHtml;
  }

  var cuerpoHtml='<div style="padding:0 16px 20px">'+grupoHtml('q1')+grupoHtml('q2')+'</div>';
  var calendarioHtml=agMesCompletoAbierto?mesGridHtml:tiraHtml;
  return headerHtml+filtroHtml+toggleMesHtml+calendarioHtml+cuerpoHtml;
}

// Una fila de la agenda (pago o tarea), en cualquiera de sus tres orígenes.
function agFilaHtml(e){
  var d=new Date(e.fecha+'T12:00:00');
  var dias=diasHasta(e.fecha+'T12:00:00');
  var vencePronto=e.tipo==='pago'&&!e.gastoPagado&&dias<=7&&dias>=0;
  var vencido=(dias<0)&&!((e.tipo==='pago'&&e.gastoPagado)||(e.tipo==='tarea'&&e.tildado));
  var tildada=e.tipo==='tarea'&&e.tildado;

  var bg=AG.bg5,bd=AG.bd1,numColor=AG.txt3,tituloColor=AG.txt2,subColor=AG.txt5,dowColor=AG.txt5,barra=e.color;
  if(vencePronto||vencido){ bg=AG.amb6; bd=AG.amb5; numColor=AG.amb2; tituloColor=AG.amb4; subColor=AG.amb3; dowColor=AG.amb3; barra=vencido?AG.rojo:AG.amb1; }
  if(tildada){ bg='#0D1729'; tituloColor=AG.txt5; subColor=AG.txt5; dowColor=AG.txt5; barra='#475569'; bd=AG.bd1; }

  var subTxt=(dias===0?'Hoy':dias<0?('hace '+Math.abs(dias)+' día'+(Math.abs(dias)===1?'':'s')):('en '+dias+' día'+(dias===1?'':'s')))+(e.hora?(' · '+e.hora):'');

  var tituloHtml='<div style="font-size:13.5px;font-weight:700;color:'+tituloColor+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis'+(tildada?';text-decoration:line-through':'')+'">'+esc(e.concepto)+'</div>';

  var slotDerecho;
  if(e.tipo==='pago'){
    var montoColor=e.esIngreso?AG.cian2:AG.txt3;
    var etiquetaTxt=null, etiquetaBg=null, etiquetaColor=null;
    if(e.esIngreso){ etiquetaTxt='INGRESO'; etiquetaBg=AG.accBg2; etiquetaColor=AG.cian2; }
    else if(vencePronto){ etiquetaTxt='EN '+dias+' DÍA'+(dias===1?'':'S'); etiquetaBg=AG.amb5; etiquetaColor=AG.amb4; }
    else if(e.repetir&&e.repetir!=='nunca'){ etiquetaTxt='RECURRENTE'; etiquetaBg=AG.bd3; etiquetaColor=AG.txt5; }
    else if(e.origen==='manual'){ etiquetaTxt='MANUAL'; etiquetaBg=AG.bd3; etiquetaColor=AG.txt5; }
    slotDerecho='<div style="text-align:right;flex-shrink:0">'
      +'<div style="font-size:13.5px;font-weight:800;font-variant-numeric:tabular-nums;color:'+montoColor+'">'+(e.monto?cop(e.monto):'')+'</div>'
      +(etiquetaTxt?'<div style="display:inline-block;margin-top:3px;font-size:9.5px;font-weight:800;letter-spacing:.05em;padding:2px 6px;border-radius:5px;background:'+etiquetaBg+';color:'+etiquetaColor+'">'+etiquetaTxt+'</div>':'')
      +'</div>';
  } else {
    slotDerecho='<div onclick="event.stopPropagation();agToggleTarea(\''+e.id+'\')" style="width:24px;height:24px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;min-height:24px;'
      +(tildada?('background:'+AG.cian+';border:1.5px solid '+AG.cian):('background:transparent;border:1.5px solid #64748B'))+'">'
      +(tildada?'<span style="font-size:12px;font-weight:800;color:#052B33">✓</span>':'')
      +'</div>';
  }

  var clickable=(e.origen==='manual');
  var onclickRow=clickable?(' onclick="agAbrirDetalle(\''+e.id+'\')"'):'';

  return '<div'+onclickRow+' style="padding:8px 12px 8px 0;background:'+bg+';border:1px solid '+bd+';border-radius:13px;display:flex;align-items:center;gap:11px;overflow:hidden;margin-bottom:6px;min-height:40px'+(clickable?';cursor:pointer':'')+'">'
    +'<div style="width:3px;align-self:stretch;border-radius:0 2px 2px 0;background:'+barra+';flex-shrink:0"></div>'
    +'<div style="flex:0 0 34px;text-align:center">'
    +'<div style="font-size:16px;font-weight:800;color:'+numColor+';font-variant-numeric:tabular-nums;line-height:1.1">'+d.getDate()+'</div>'
    +'<div style="font-size:9.5px;font-weight:700;text-transform:uppercase;color:'+dowColor+'">'+DOW_ABBR[d.getDay()]+'</div>'
    +'</div>'
    +'<div style="flex:1 1 auto;min-width:0">'+tituloHtml+'<div style="font-size:11px;color:'+subColor+'">'+subTxt+'</div></div>'
    +slotDerecho
    +'</div>';
}

// ── Tildar una tarea ─────────────────────────────────────────────────────────
function agToggleTarea(id){
  var m=getM();
  var it=agendaArr(m).find(function(x){return x.id===id;});
  if(!it||it.tipo!=='tarea') return;
  it.tildado=!it.tildado;
  save();render();
}

// ── Detalle / eliminar ───────────────────────────────────────────────────────
function agAbrirDetalle(id){
  var m=getM();
  var it=agendaArr(m).find(function(x){return x.id===id;});
  if(!it) return;
  openModal('<div class="mtitle">'+(it.tipo==='tarea'?'Tarea':'Recordatorio')+'</div>'
    +'<p style="font-size:14px;color:var(--txt);font-weight:600;margin-bottom:6px">'+esc(it.concepto)+'</p>'
    +'<p style="font-size:12px;color:var(--mut);margin-bottom:16px">'+fmtD(it.fecha)+(it.hora?(' · '+it.hora):'')+(it.monto?(' · '+cop(it.monto)):'')+(it.gastoId?' · enlazado a un gasto':'')+'</p>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cerrar</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="agConfirmarBorrar(\''+id+'\')">Eliminar</button></div>');
}
function agConfirmarBorrar(id){
  var m=getM();
  var it=agendaArr(m).find(function(x){return x.id===id;});
  if(!it){ closeModal(); return; }
  if(!it.gastoId){
    showConfirm('¿Eliminar '+(it.tipo==='tarea'?'esta tarea':'este recordatorio')+'?',function(){
      m.agenda=agendaArr(m).filter(function(x){return x.id!==id;});
      save();closeModal();render();toast('Eliminado');
    });
    return;
  }
  // Nunca se borra el par en silencio (§6): el gasto puede tener ya un pago real registrado.
  openModal('<div class="mtitle">Recordatorio enlazado</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">Este recordatorio tiene un gasto enlazado. ¿Qué quieres eliminar?</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +'<button class="bcnl" onclick="agBorrarSoloRecordatorio(\''+id+'\')">Solo el recordatorio</button>'
    +'<button class="bcnl" style="color:var(--red)" onclick="agBorrarAmbos(\''+id+'\')">Recordatorio y gasto</button>'
    +'</div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cancelar</button></div>');
}
function agBorrarSoloRecordatorio(id){
  var m=getM();
  var it=agendaArr(m).find(function(x){return x.id===id;});
  if(it&&it.gastoId){
    var gasto=agBuscarGasto(m,it.gastoId,it.which);
    if(gasto) gasto.agendaId=null;
  }
  m.agenda=agendaArr(m).filter(function(x){return x.id!==id;});
  save();closeModal();render();toast('Recordatorio eliminado');
}
function agBorrarAmbos(id){
  var m=getM();
  var it=agendaArr(m).find(function(x){return x.id===id;});
  if(it&&it.gastoId){
    if(it.which==='q1') m.q1_gastos=(m.q1_gastos||[]).filter(function(x){return x.id!==it.gastoId;});
    else m.q2_gastos=(m.q2_gastos||[]).filter(function(x){return x.id!==it.gastoId;});
  }
  m.agenda=agendaArr(m).filter(function(x){return x.id!==id;});
  save();closeModal();render();toast('Recordatorio y gasto eliminados');
}
// Desde delG() (gasto-pickers.js) — el gasto tiene un recordatorio enlazado.
function agConfirmarBorrarGasto(g,which){
  openModal('<div class="mtitle">Gasto enlazado</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">Este gasto tiene un recordatorio enlazado en la Agenda. ¿Qué quieres eliminar?</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +'<button class="bcnl" onclick="agBorrarSoloGasto(\''+g.id+'\',\''+which+'\')">Solo el gasto</button>'
    +'<button class="bcnl" style="color:var(--red)" onclick="agBorrarGastoYRecordatorio(\''+g.id+'\',\''+which+'\')">Gasto y recordatorio</button>'
    +'</div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cancelar</button></div>');
}
function agBorrarSoloGasto(id,which){
  var m=getM(),k=which==='q1'?'q1_gastos':'q2_gastos';
  var g=(m[k]||[]).find(function(x){return x.id===id;});
  if(g&&g.agendaId){
    var it=agendaArr(m).find(function(x){return x.id===g.agendaId;});
    if(it) it.gastoId=null;
  }
  m[k]=m[k].filter(function(x){return x.id!==id;});
  save();closeModal();render();toast('Gasto eliminado');
}
function agBorrarGastoYRecordatorio(id,which){
  var m=getM(),k=which==='q1'?'q1_gastos':'q2_gastos';
  var g=(m[k]||[]).find(function(x){return x.id===id;});
  if(g&&g.agendaId) m.agenda=agendaArr(m).filter(function(x){return x.id!==g.agendaId;});
  m[k]=m[k].filter(function(x){return x.id!==id;});
  save();closeModal();render();toast('Gasto y recordatorio eliminados');
}

// ── Enlace desde el lado del gasto (llamado desde gasto-pickers.js) ─────────────
function agSincronizarDesdeGasto(g,m,pagado){
  var it=agendaArr(m).find(function(x){return x.id===g.agendaId;});
  if(!it) return;
  if(pagado && it.repetir && it.repetir!=='nunca'){
    agGenerarSiguienteRecurrente(it);
  }
}
function agSincronizarMontoDesdeGasto(g,m){
  var it=agendaArr(m).find(function(x){return x.id===g.agendaId;});
  if(it) it.monto=Math.abs(g.presupuesto||0);
}
// Un pago recurrente NO crea doce gastos de golpe (§6): al pagar el periodo actual, se genera
// solo el siguiente — y solo si su mes ya existe (si no, el recordatorio queda pendiente de
// que ese mes se cree; no se fuerza su creación desde acá).
function agGenerarSiguienteRecurrente(it){
  var d=new Date(it.fecha+'T12:00:00');
  if(it.repetir==='mensual') d.setMonth(d.getMonth()+1);
  else if(it.repetir==='quincenal') d.setDate(d.getDate()+15);
  else return;
  var nuevaFecha=d.toISOString().slice(0,10);
  var mesDestino=agBuscarMesPorFecha(nuevaFecha);
  if(!mesDestino) return;
  var yaExiste=agendaArr(mesDestino).some(function(x){return x.concepto===it.concepto&&x.fecha===nuevaFecha;});
  if(yaExiste) return;
  var which=agQuincenaDeFecha(nuevaFecha);
  var nuevo={id:uid(),tipo:'pago',concepto:it.concepto,fecha:nuevaFecha,monto:it.monto,repetir:it.repetir,tildado:false,gastoId:null,which:which,formaPago:it.formaPago};
  if(it.gastoId){
    // Sin chequear (estado null), no "sin pagar" — igual que cualquier gasto recién creado
    // (ver agGuardarNuevo): "sin pagar" es para uno aplazado a otra quincena, no para uno nuevo.
    var gastoNuevo={id:uid(),nombre:it.concepto,presupuesto:Math.abs(it.monto||0),metodo:it.formaPago||'',estado:null,pagado_flag:false,sinpagar:false,agendaId:nuevo.id};
    var lista=which==='q1'?(mesDestino.q1_gastos=mesDestino.q1_gastos||[]):(mesDestino.q2_gastos=mesDestino.q2_gastos||[]);
    lista.push(gastoNuevo);
    nuevo.gastoId=gastoNuevo.id;
  }
  agendaArr(mesDestino).push(nuevo);
}

// ── Formulario de creación ───────────────────────────────────────────────────
function agAbrirNuevo(){
  agFormTipo='tarea';
  agFormRegistrarGasto=true;
  agFormRepetirActual='nunca';
  agFormGastoExistenteId=null;
  agFormQuincenaManual=null;
  openModal(agFormHtml());
  setTimeout(function(){
    var el=document.getElementById('ag-concepto');
    if(el) el.focus();
  },50);
}
function agMetodoOptsHtml(){
  return (catMetodos||[]).map(function(x){return '<option>'+esc(x.nombre)+'</option>';}).join('');
}
// Fecha con la que arranca el formulario de "Nuevo en la agenda": si el mes seleccionado en
// Agenda (curM) es el mes real de hoy, usa la fecha real de hoy — si no (el usuario cambió de
// mes con el selector de arriba), usa el día 1 de ESE mes. Antes siempre usaba la fecha real de
// hoy sin importar qué mes estuviera viendo, así que crear un pago mientras se veía un mes
// distinto al actual quedaba con una fecha de otro mes por accidente, y "Asociar a un gasto ya
// creado" terminaba buscando en la quincena de ese día real (mes equivocado en la práctica).
function agFechaPorDefecto(){
  var real=new Date();
  var realIso=real.toISOString().slice(0,10);
  var m=getM();
  if(!m) return realIso;
  var mi=MESES.indexOf(m.nombre);
  var esMesReal=(m.año===real.getFullYear() && mi===real.getMonth());
  if(esMesReal) return realIso;
  return new Date(m.año,mi,1).toISOString().slice(0,10);
}
// A qué mes (objeto db) pertenece el formulario según la fecha tecleada — NO necesariamente el
// mes seleccionado en Agenda (curM/getM()). Si el usuario cambia la fecha a otro mes (ej. está
// viendo septiembre pero registra un pago de octubre), todo el formulario debe operar sobre
// octubre: buscar "gastos ya creados" ahí, y si no lo hace también el recordatorio termina
// guardado en un mes y su gasto asociado en otro, lo cual rompe la sincronización entre ambos
// (agSincronizarDesdeGasto busca el recordatorio dentro del MISMO mes que el gasto). Si ese mes
// todavía no existe en la app, se recurre al mes seleccionado como mejor opción disponible.
function agMesDeFecha(fecha){
  return agBuscarMesPorFecha(fecha)||getM();
}
function agFormHtml(){
  var esPago=agFormTipo==='pago';
  var hoy=agFechaPorDefecto();

  var tipoSelector='<div style="display:flex;background:'+AG.bg4+';border-radius:11px;padding:3px">'
    +'<button type="button" onclick="agCambiarTipo(\'tarea\')" style="flex:1;padding:9px 0;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:'+(esPago?'700':'800')+';background:'+(esPago?'transparent':AG.accBg2)+';color:'+(esPago?AG.txt5:AG.cian2)+'">Tarea</button>'
    +'<button type="button" onclick="agCambiarTipo(\'pago\')" style="flex:1;padding:9px 0;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:'+(esPago?'800':'700')+';background:'+(esPago?AG.accBg2:'transparent')+';color:'+(esPago?AG.cian2:AG.txt5)+'">Pago</button>'
    +'</div>';

  var conceptoHtml='<div><label style="display:block;font-size:11px;font-weight:700;color:'+AG.txt5+';letter-spacing:.04em;margin-bottom:5px">CONCEPTO</label>'
    +'<input id="ag-concepto" type="text" placeholder="'+(esPago?'¿Qué pago quieres recordar?':'¿Qué tienes que hacer?')+'" style="width:100%;padding:12px 13px;background:'+AG.bg4+';border:1.5px solid '+AG.cian+';border-radius:12px;font-size:15px;font-weight:700;color:'+AG.txt1+'"></div>';

  var camposHtml='<div class="ig-field-row">'
    +'<div><label style="display:block;font-size:11px;font-weight:700;color:'+AG.txt5+';margin-bottom:5px">FECHA</label>'
    +'<input id="ag-fecha" type="date" value="'+hoy+'" onchange="agActualizarBloqueGasto()" style="width:100%;padding:11px 12px;background:'+AG.bg4+';border:1px solid '+AG.bd1+';border-radius:11px;font-size:15px;font-weight:700;color:'+AG.txt3+'"></div>'
    +'<div><label style="display:block;font-size:11px;font-weight:700;color:'+AG.txt5+';margin-bottom:5px">HORA</label>'
    +'<input id="ag-hora" type="time" style="width:100%;padding:11px 12px;background:'+AG.bg4+';border:1px solid '+AG.bd1+';border-radius:11px;font-size:15px;font-weight:700;color:'+AG.txt3+'"></div>'
    +'</div>'
    +(esPago?('<div><label style="display:block;font-size:11px;font-weight:700;color:'+AG.txt5+';margin-bottom:5px">MONTO</label>'
      +'<input id="ag-monto" type="text" inputmode="numeric" placeholder="opcional" oninput="maskMoneyInput(this);agActualizarBloqueGasto()" style="width:100%;padding:11px 12px;background:'+AG.bg4+';border:1px solid '+AG.bd1+';border-radius:11px;font-size:15px;font-weight:800;color:'+AG.txt1+';font-variant-numeric:tabular-nums"></div>'):'');

  var repetirOpts=[{k:'nunca',l:'Nunca'},{k:'mensual',l:'Mensual'},{k:'quincenal',l:'Quincenal'}];
  var repetirHtml='<div><label style="display:block;font-size:11px;font-weight:700;color:'+AG.txt5+';margin-bottom:5px">REPETIR</label>'
    +'<div style="display:flex;background:'+AG.bg4+';border-radius:10px;padding:3px;gap:2px">'
    +repetirOpts.map(function(o){
      var isA=agFormRepetirActual===o.k;
      return '<button type="button" id="ag-rep-'+o.k+'" onclick="agSetRepetir(\''+o.k+'\')" style="flex:1;padding:7px 0;border-radius:7px;border:none;cursor:pointer;font-size:11.5px;font-weight:'+(isA?'800':'600')+';background:'+(isA?AG.accBg2:'transparent')+';color:'+(isA?AG.cian2:AG.txt5)+'">'+o.l+'</button>';
    }).join('')
    +'</div></div>';

  var switchHtml=esPago?agBloqueRegistrarGastoHtml():'';
  var botonTxt=esPago?(agFormRegistrarGasto?'Crear recordatorio y gasto':'Crear recordatorio'):'Crear tarea';

  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 18px 16px;border-bottom:1px solid '+AG.bd3+'">'
    +'<button onclick="closeModal()" style="background:none;border:none;color:'+AG.txt5+';font-size:13px;font-weight:700;cursor:pointer">Cancelar</button>'
    +'<span style="font-size:14px;font-weight:800;color:'+AG.txt2+'">Nuevo en la agenda</span>'
    +'<span style="width:56px"></span>'
    +'</div>'
    +'<div style="padding:16px 18px 18px;display:flex;flex-direction:column;gap:14px">'
    +tipoSelector+conceptoHtml+camposHtml+repetirHtml+switchHtml
    +'<button onclick="agGuardarNuevo()" style="padding:15px 0;border-radius:14px;background:'+AG.cian+';color:#052B33;border:none;font-size:15.5px;font-weight:800;cursor:pointer">'+botonTxt+'</button>'
    +'</div>';
}
// El bloque "Registrarlo también como gasto" se reconstruye SOLO a sí mismo (ver
// agActualizarBloqueGasto) en vez de todo el formulario — así escribir el monto no le quita el
// foco/cursor al input, el mismo bug que ya se corrigió para el formulario de gastos.
// Gastos de una quincena que todavía no están enlazados a ningún recordatorio — candidatos
// para "Asociar a un gasto ya creado" en vez de crear uno nuevo. Incluye los que viven dentro
// de un grupo (ej. "Odontología" bajo un grupo "Salud"): antes se excluían con !g.parentId, así
// que cualquier gasto agrupado (algo muy común) nunca aparecía en este picker, aunque siguiera
// siendo un gasto real y pagable igual que uno suelto — solo se excluye el grupo en sí mismo
// (esGrupo, que no es un gasto pagable) y el que ya tenga su propio recordatorio.
function agGastosDisponiblesParaAsociar(m,which){
  var lista=which==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
  return (lista||[]).filter(function(g){ return !g.esGrupo && !g.agendaId; });
}
function agBloqueRegistrarGastoHtml(){
  // El monto ya NO es requisito para encender "Registrarlo también como gasto" ni para asociar
  // uno ya creado (ese hereda su propio valor) — solo se exige, al guardar, cuando se va a crear
  // un gasto NUEVO (ver agGuardarNuevo).
  var on=agFormRegistrarGasto;
  var fechaActual=document.getElementById('ag-fecha')?document.getElementById('ag-fecha').value:new Date().toISOString().slice(0,10);
  // El mes de trabajo lo decide la FECHA tecleada, no el mes que está seleccionado en Agenda
  // (curM/getM()) — si difieren (ej. registrando en septiembre un pago de octubre), todo el
  // bloque debe operar sobre el mes real de esa fecha, o "asociar a un gasto ya creado" busca en
  // el mes equivocado (ver agMesDeFecha).
  var m=agMesDeFecha(fechaActual);
  var wh=agQuincenaResuelta(fechaActual);
  var gastoExistente=agFormGastoExistenteId?agBuscarGasto(m,agFormGastoExistenteId,wh):null;
  if(agFormGastoExistenteId&&!gastoExistente) agFormGastoExistenteId=null; // cambió de quincena o ya no existe

  // La quincena la sugiere la fecha, pero es editable: un gasto del 24 sigue siendo de la Q1
  // si esa Q2 todavía no se ha pagado, por ejemplo.
  var quincenaHtml='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
    +'<span style="font-size:12.5px;font-weight:600;color:'+AG.txt4+'">Quincena</span>'
    +'<div style="display:flex;background:'+AG.bg4+';border-radius:9px;padding:3px;gap:2px">'
    +'<button type="button" onclick="agSetQuincenaManual(\'q1\')" style="padding:5px 12px;border:none;border-radius:6px;cursor:pointer;font-size:11.5px;font-weight:'+(wh==='q1'?'800':'600')+';background:'+(wh==='q1'?AG.accBg2:'transparent')+';color:'+(wh==='q1'?AG.cian2:AG.txt5)+'">Q1</button>'
    +'<button type="button" onclick="agSetQuincenaManual(\'q2\')" style="padding:5px 12px;border:none;border-radius:6px;cursor:pointer;font-size:11.5px;font-weight:'+(wh==='q2'?'800':'600')+';background:'+(wh==='q2'?AG.accBg2:'transparent')+';color:'+(wh==='q2'?AG.cian2:AG.txt5)+'">Q2</button>'
    +'</div></div>';

  var consecuenciaHtml=gastoExistente
    ?('Se enlaza con <b style="color:'+AG.txt2+'">'+esc(nombreGasto(gastoExistente))+'</b>, sin tocar su estado actual')
    :('Queda en <b style="color:'+AG.cian+'">'+wh.toUpperCase()+'</b>, sin chequear (como cualquier gasto nuevo)');

  var asociarHtml='';
  if(on){
    asociarHtml=gastoExistente
      ?('<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid '+AG.bd4+';padding-top:12px">'
        +'<span style="font-size:12.5px;font-weight:600;color:'+AG.txt4+'">Gasto asociado</span>'
        +'<button type="button" onclick="agQuitarGastoExistente()" style="background:none;border:none;color:'+AG.rojo+';font-size:12px;font-weight:700;cursor:pointer">Quitar</button>'
        +'</div>')
      :('<div style="border-top:1px solid '+AG.bd4+';padding-top:12px">'
        +'<button type="button" onclick="agAbrirPickerGastoExistente()" style="background:none;border:none;color:'+AG.cian2+';font-size:12.5px;font-weight:700;cursor:pointer;padding:0;text-align:left">Asociar a un gasto ya creado, en vez de uno nuevo</button>'
        +'</div>');
  }

  var formaPagoHtml=(on&&!gastoExistente)?('<div style="border-top:1px solid '+AG.bd4+';padding-top:12px;display:flex;align-items:center;justify-content:space-between;gap:10px">'
      +'<span style="font-size:12.5px;font-weight:600;color:'+AG.txt4+'">Forma de pago</span>'
      +'<select id="ag-formapago" style="background:none;border:none;color:'+AG.txt2+';font-size:13px;font-weight:700;text-align:right;outline:none">'+agMetodoOptsHtml()+'</select>'
      +'</div>'):'';

  return '<div id="ag-bloque-gasto" style="padding:14px;background:'+AG.bg3+';border:1px solid '+AG.accBg3+';border-radius:14px;display:flex;flex-direction:column;gap:12px">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'
    +'<div style="min-width:0">'
    +'<div style="font-size:13.5px;font-weight:800;color:'+AG.txt2+'">Registrarlo también como gasto</div>'
    +'<div style="font-size:11.5px;color:'+AG.txt5+';margin-top:2px">'+consecuenciaHtml+'</div>'
    +'</div>'
    +'<button type="button" onclick="agToggleSwitchGasto()" id="ag-switch" style="width:44px;height:26px;border-radius:13px;padding:3px;border:none;cursor:pointer;flex-shrink:0;background:'+(on?AG.cian:AG.bd3)+'">'
    +'<span style="display:block;width:20px;height:20px;border-radius:50%;background:'+(on?'#052B33':AG.txt5)+';transform:translateX('+(on?'18px':'0')+');transition:transform .15s ease"></span>'
    +'</button>'
    +'</div>'
    +'<div style="border-top:1px solid '+AG.bd4+';padding-top:12px">'+quincenaHtml+'</div>'
    +formaPagoHtml
    +asociarHtml
    +'</div>';
}
function agActualizarBloqueGasto(){
  var wrap=document.getElementById('ag-bloque-gasto');
  if(!wrap) return; // tipo Tarea: el bloque ni existe
  wrap.outerHTML=agBloqueRegistrarGastoHtml();
}
function agToggleSwitchGasto(){
  agFormRegistrarGasto=!agFormRegistrarGasto;
  agActualizarBloqueGasto();
}
function agQuitarGastoExistente(){
  agFormGastoExistenteId=null;
  agActualizarBloqueGasto();
}
// Guarda lo tecleado antes de salir al picker de pantalla completa, para poder reconstruir el
// formulario tal cual estaba al volver (con "Cancelar" o al elegir un gasto).
function agCapturarSnapshot(){
  return {
    concepto: document.getElementById('ag-concepto')?document.getElementById('ag-concepto').value:'',
    fecha: document.getElementById('ag-fecha')?document.getElementById('ag-fecha').value:new Date().toISOString().slice(0,10),
    hora: document.getElementById('ag-hora')?document.getElementById('ag-hora').value:'',
    monto: document.getElementById('ag-monto')?document.getElementById('ag-monto').value:''
  };
}
function agRestaurarSnapshot(){
  openModal(agFormHtml());
  var snap=agFormSnapshot;
  agFormSnapshot=null;
  if(!snap) return;
  var cEl=document.getElementById('ag-concepto'); if(cEl) cEl.value=snap.concepto||'';
  var fEl=document.getElementById('ag-fecha'); if(fEl) fEl.value=snap.fecha||fEl.value;
  var hEl=document.getElementById('ag-hora'); if(hEl) hEl.value=snap.hora||'';
  var mEl=document.getElementById('ag-monto'); if(mEl) mEl.value=snap.monto||'';
  agSetRepetir(agFormRepetirActual);
}
function agAbrirPickerGastoExistente(){
  var fecha=document.getElementById('ag-fecha').value||new Date().toISOString().slice(0,10);
  var m=agMesDeFecha(fecha);
  var which=agQuincenaResuelta(fecha);
  var gastos=agGastosDisponiblesParaAsociar(m,which);
  if(!gastos.length){ showAlert('No hay gastos de '+which.toUpperCase()+' sin asociar todavía.'); return; }
  agFormSnapshot=agCapturarSnapshot();
  var listaCompleta=which==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
  var itemsHtml=gastos.map(function(g){
    // Si vive dentro de un grupo (ej. "Odontología" bajo "Salud"), se aclara de cuál — sin esto
    // un gasto agrupado se veía igual que uno suelto y no quedaba claro dónde encontrarlo luego.
    var grupoPadre=g.parentId?listaCompleta.find(function(x){return x.id===g.parentId;}):null;
    var subTxt=grupoPadre?('<div style="font-size:11px;color:var(--mut);margin-top:1px">en '+esc(nombreGasto(grupoPadre))+'</div>'):'';
    return '<div onclick="agElegirGastoExistente(\''+g.id+'\')" style="padding:13px 4px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid var(--brd);cursor:pointer">'
      +'<span><span style="font-size:14px;font-weight:600;color:var(--txt);display:block">'+esc(nombreGasto(g))+'</span>'+subTxt+'</span>'
      +'<span style="font-size:13px;color:var(--mut);flex-shrink:0">'+cop(g.presupuesto)+'</span>'
      +'</div>';
  }).join('');
  openModal('<div class="mtitle">Asociar a un gasto</div>'
    +'<p style="font-size:12px;color:var(--mut);margin-bottom:12px">Gastos de '+which.toUpperCase()+' sin recordatorio todavía</p>'
    +'<div style="max-height:340px;overflow-y:auto;margin-bottom:14px">'+itemsHtml+'</div>'
    +'<button class="bcnl" style="width:100%" onclick="agRestaurarSnapshot()">Cancelar</button>');
}
function agElegirGastoExistente(gastoId){
  agFormGastoExistenteId=gastoId;
  // Al asociar un gasto ya creado, el recordatorio hereda su nombre y su valor — es el gasto
  // quien manda ahora, así que no tiene sentido dejar lo que el usuario haya tecleado antes.
  var fecha=(agFormSnapshot&&agFormSnapshot.fecha)||new Date().toISOString().slice(0,10);
  var m=agMesDeFecha(fecha);
  var which=agQuincenaResuelta(fecha);
  var gasto=agBuscarGasto(m,gastoId,which);
  if(gasto&&agFormSnapshot){
    agFormSnapshot.concepto=nombreGasto(gasto);
    agFormSnapshot.monto=gasto.presupuesto?moneyInputFmt(gasto.presupuesto):'';
  }
  agRestaurarSnapshot();
}
function agSetRepetir(k){
  agFormRepetirActual=k;
  ['nunca','mensual','quincenal'].forEach(function(kk){
    var btn=document.getElementById('ag-rep-'+kk);
    if(!btn) return;
    var active=kk===k;
    btn.style.background=active?AG.accBg2:'transparent';
    btn.style.color=active?AG.cian2:AG.txt5;
    btn.style.fontWeight=active?'800':'600';
  });
}
// Cambiar Tarea/Pago sí reconstruye el formulario entero (aparece/desaparece el campo Monto y
// el bloque de gasto) — se preservan concepto y fecha ya escritos para no perder lo tecleado.
function agCambiarTipo(tipo){
  var concepto=document.getElementById('ag-concepto')?document.getElementById('ag-concepto').value:'';
  var fecha=document.getElementById('ag-fecha')?document.getElementById('ag-fecha').value:new Date().toISOString().slice(0,10);
  var hora=document.getElementById('ag-hora')?document.getElementById('ag-hora').value:'';
  agFormTipo=tipo;
  agFormGastoExistenteId=null;
  openModal(agFormHtml());
  var cEl=document.getElementById('ag-concepto'); if(cEl) cEl.value=concepto;
  var fEl=document.getElementById('ag-fecha'); if(fEl) fEl.value=fecha;
  var hEl=document.getElementById('ag-hora'); if(hEl) hEl.value=hora;
  agSetRepetir(agFormRepetirActual);
  setTimeout(function(){ if(cEl) cEl.focus(); },50);
}

function agGuardarNuevo(){
  var concepto=(document.getElementById('ag-concepto').value||'').trim();
  if(!concepto){ showAlert('Escribe qué quieres agendar'); return; }
  var fecha=document.getElementById('ag-fecha').value||new Date().toISOString().slice(0,10);
  var hora=(document.getElementById('ag-hora')?document.getElementById('ag-hora').value:'')||null;
  // El mes de destino lo decide la fecha tecleada, no el mes seleccionado en Agenda (ver
  // agMesDeFecha) — si el usuario está viendo septiembre pero la fecha cae en octubre, el
  // recordatorio (y su gasto, si aplica) deben quedar en octubre para que ambos sigan viviendo
  // en el MISMO mes (agSincronizarDesdeGasto busca el recordatorio ahí). Después de guardar, la
  // vista salta a ese mes para que el recordatorio recién creado no "desaparezca" de pantalla.
  var m=agMesDeFecha(fecha);
  var mKey=Object.keys(db).find(function(k){return db[k]===m;});

  if(agFormTipo==='tarea'){
    var tarea={id:uid(),tipo:'tarea',concepto:concepto,fecha:fecha,hora:hora,monto:null,repetir:'nunca',tildado:false,gastoId:null,which:agQuincenaDeFecha(fecha),formaPago:null};
    agendaArr(m).push(tarea);
    save();
    if(mKey!=null) curM=parseInt(mKey,10);
    closeModal();render();toast('Tarea agregada ✓');
    return;
  }

  var monto=moneyVal('ag-monto')||0;
  var registrarGasto=agFormRegistrarGasto;
  var which=agQuincenaResuelta(fecha);
  var gastoAsociadoPreCheck=agFormGastoExistenteId?agBuscarGasto(m,agFormGastoExistenteId,which):null;
  // El monto solo es obligatorio para crear un gasto NUEVO — uno ya asociado hereda su propio valor.
  if(registrarGasto&&!gastoAsociadoPreCheck&&monto<=0){ showAlert('Ingresa el valor del gasto'); return; }
  var item={id:uid(),tipo:'pago',concepto:concepto,fecha:fecha,hora:hora,monto:monto>0?monto:(gastoAsociadoPreCheck?gastoAsociadoPreCheck.presupuesto:null),repetir:agFormRepetirActual,tildado:false,gastoId:null,which:which,formaPago:null};
  var gastoCreado=null, gastoAsociado=null;

  if(registrarGasto){
    if(agFormGastoExistenteId) gastoAsociado=gastoAsociadoPreCheck;
    if(gastoAsociado){
      // Se enlaza a un gasto YA CREADO, sin tocar su estado/monto actual — es él quien manda
      // de ahí en adelante (ver agSincronizarMontoDesdeGasto: solo sincroniza mientras "sin
      // pagar", y este gasto puede llevar cualquier estado ya).
      gastoAsociado.agendaId=item.id;
      item.gastoId=gastoAsociado.id;
      item.formaPago=gastoAsociado.metodo||null;
    } else {
      var formaPago=document.getElementById('ag-formapago')?document.getElementById('ag-formapago').value:((catMetodos[0]||{}).nombre||'');
      // Sin chequear (estado null), no "sin pagar": ese estado es para un gasto YA EXISTENTE
      // que se aplaza a otra quincena, no para uno recién creado — nace igual que cualquier
      // gasto nuevo (círculo vacío, sin revisar todavía).
      gastoCreado={id:uid(),nombre:concepto,presupuesto:monto,metodo:formaPago,estado:null,pagado_flag:false,sinpagar:false,agendaId:item.id};
      var lista=which==='q1'?(m.q1_gastos=m.q1_gastos||[]):(m.q2_gastos=m.q2_gastos||[]);
      lista.push(gastoCreado);
      item.gastoId=gastoCreado.id;
      item.formaPago=formaPago;
    }
  }
  agendaArr(m).push(item);
  save();
  if(mKey!=null) curM=parseInt(mKey,10);
  agFormGastoExistenteId=null;
  agFormQuincenaManual=null;
  agMostrarConfirmacion(item,gastoCreado||gastoAsociado,!!gastoAsociado);
}

function agMostrarConfirmacion(item,gasto,esExistente){
  var d=new Date(item.fecha+'T12:00:00');
  var checkHtml='<div style="width:46px;height:46px;border-radius:23px;background:'+AG.accBg2+';border:1.5px solid '+AG.cian+';display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:'+AG.cian2+'">'+icon('check',22)+'</div>';
  var tarjetaRecordatorio='<div style="flex:1;padding:12px;background:'+AG.bg5+';border:1px solid '+AG.bd1+';border-radius:12px;min-width:0">'
    +'<div style="font-size:9px;font-weight:800;color:'+AG.txt5+';text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Recordatorio</div>'
    +'<div style="font-size:13px;font-weight:700;color:'+AG.txt2+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(item.concepto)+'</div>'
    +'<div style="font-size:11px;color:'+AG.txt5+';margin-top:2px">'+d.getDate()+' · '+(item.which?item.which.toUpperCase():'')+'</div>'
    +'</div>';
  var tarjetaGasto=gasto?('<div style="flex:1;padding:12px;background:'+AG.bg5+';border:1px solid '+AG.bd1+';border-radius:12px;min-width:0">'
    +'<div style="font-size:9px;font-weight:800;color:'+AG.txt5+';text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Gasto'+(esExistente?' (ya existía)':'')+'</div>'
    +'<div style="font-size:13px;font-weight:700;color:'+AG.txt2+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(gasto.metodo||'')+'</div>'
    +(esExistente?''
      :'<div style="display:inline-block;margin-top:4px;font-size:9px;font-weight:800;letter-spacing:.05em;padding:2px 6px;border-radius:5px;background:'+AG.bd3+';color:'+AG.txt5+'">SIN CHEQUEAR</div>')
    +'</div>'):'';
  var notaCierre='Cuando tildes el recordatorio el '+d.getDate()+', el gasto pasa a pagado solo. No tienes que volver aquí.';
  openModal('<div style="padding:24px 20px;text-align:center">'
    +checkHtml
    +'<div style="font-size:17px;font-weight:800;color:'+AG.txt2+';margin-bottom:4px">Listo</div>'
    +(gasto?('<div style="font-size:12.5px;color:'+AG.txt5+';margin-bottom:18px">'+(esExistente?'El recordatorio quedó enlazado con el gasto':'Se crearon dos cosas enlazadas entre sí')+'</div>'
      +'<div style="font-size:10px;font-weight:800;color:'+AG.txt5+';letter-spacing:.05em;margin-bottom:6px">ENLAZADO CON</div>'
      +'<div style="display:flex;gap:8px;text-align:left;margin-bottom:14px">'+tarjetaRecordatorio+tarjetaGasto+'</div>'
      +'<p style="font-size:11.5px;color:'+AG.txt5+';line-height:1.5;margin-bottom:18px">'+notaCierre+'</p>')
      :'<div style="font-size:12.5px;color:'+AG.txt5+';margin-bottom:18px">Recordatorio creado</div>')
    +'<button class="bpri" style="width:100%" onclick="closeModal();render()">Listo</button>'
    +'</div>');
}
