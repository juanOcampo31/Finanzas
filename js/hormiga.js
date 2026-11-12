// ── Gastos hormiga ─────────────────────────────────────────────────────────────
// Compras pequeñas y sueltas (café, domicilio, snack, taxi...) que no son parte de la lista de
// gastos PLANEADOS de la quincena (q1_gastos/q2_gastos) pero que sí sacan plata: se registran
// aparte, en m.hormiga.q1 / m.hormiga.q2, con {id, monto, nota, metodo, fecha}. La quincena
// sale de la fecha (1–15 → Q1, 16–fin de mes → Q2, mismo rango que muestran las tarjetas de
// Inicio). Restan del disponible (ver calcHormigaQuincena/calcDisponibleQuincena en
// nomina-calc.js). Viven dentro del mes, así que viajan solas en el respaldo y en la nube.

const HORMIGA_MAX_CHIPS=6;      // sugerencias de nota en el formulario
const HORMIGA_MAX_TOP=5;        // conceptos en "En qué se va"
const HORMIGA_QUINCENAS_PROM=6; // quincenas (con registros) usadas para la proyección

// Si el formulario se abrió desde el detalle, al guardar/cancelar/eliminar se vuelve al
// detalle (la app tiene un solo modal a la vez, ver openModal).
let _hormigaVolverDetalle=null; // 'q1' | 'q2' | null

function hormigaLista(m,which){
  if(!m.hormiga) m.hormiga={q1:[],q2:[]};
  if(!Array.isArray(m.hormiga[which])) m.hormiga[which]=[];
  return m.hormiga[which];
}
function hormigaPad(n){ return (n<10?'0':'')+n; }
// Año/mes (0-11) del mes m, y su último día.
function hormigaMesInfo(m){
  const mi=MESES.indexOf(m.nombre);
  const mes=mi>=0?mi:0;
  const año=m.año||new Date().getFullYear();
  return {año:año, mes:mes, ultimo:new Date(año,mes+1,0).getDate()};
}
function hormigaFechaStr(info,dia){ return info.año+'-'+hormigaPad(info.mes+1)+'-'+hormigaPad(dia); }
function hormigaQuincenaDeFecha(fecha){ return parseInt(fecha.slice(8,10),10)<=15?'q1':'q2'; }
// Fecha por defecto de un registro nuevo: hoy si cae en esa quincena de ese mes; si no, el
// primer día de la quincena (para registrar algo atrasado sin tener que cambiar el mes).
function hormigaFechaPorDefecto(m,which){
  const info=hormigaMesInfo(m), hoy=new Date();
  if(hoy.getFullYear()===info.año && hoy.getMonth()===info.mes){
    const d=hoy.getDate();
    if((which==='q1')===(d<=15)) return hormigaFechaStr(info,d);
  }
  return hormigaFechaStr(info,which==='q1'?1:16);
}
// Clave para agrupar notas: sin mayúsculas, tildes ni espacios de más ("Café " = "cafe").
function hormigaClaveNota(nota){
  return (nota||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ');
}
function hormigaNotaMostrada(nota){
  const t=(nota||'').trim();
  return t?t.charAt(0).toUpperCase()+t.slice(1):'Sin nota';
}
function hormigaTodas(){
  const out=[];
  Object.keys(db).forEach(function(k){
    const h=db[k]&&db[k].hormiga;
    if(!h) return;
    (h.q1||[]).concat(h.q2||[]).forEach(function(x){ out.push(x); });
  });
  return out;
}
// Notas más usadas en TODOS los meses, con el último monto registrado para cada una (así un
// toque en la sugerencia llena nota y valor).
function hormigaSugerencias(){
  const porClave={};
  hormigaTodas().forEach(function(x){
    const k=hormigaClaveNota(x.nota);
    if(!k) return;
    const s=porClave[k]||(porClave[k]={nota:hormigaNotaMostrada(x.nota),veces:0,ultimoMonto:0,ultimaFecha:''});
    s.veces++;
    if((x.fecha||'')>=s.ultimaFecha){ s.ultimaFecha=x.fecha||''; s.ultimoMonto=x.monto||0; s.nota=hormigaNotaMostrada(x.nota); }
  });
  return Object.keys(porClave).map(function(k){return porClave[k];})
    .sort(function(a,b){return b.veces-a.veces || (a.ultimaFecha<b.ultimaFecha?1:-1);})
    .slice(0,HORMIGA_MAX_CHIPS);
}
function hormigaUltimoMetodo(){
  let ult=null;
  hormigaTodas().forEach(function(x){ if(x.metodo && (!ult || (x.fecha||'')>=(ult.fecha||''))) ult=x; });
  return ult?ult.metodo:'';
}
// Resumen de una lista de registros: total, cantidad, promedio y conceptos ordenados por total.
function hormigaResumen(lista){
  const total=lista.reduce(function(a,x){return a+Math.abs(x.monto||0);},0);
  const grupos={};
  lista.forEach(function(x){
    const k=hormigaClaveNota(x.nota)||'_';
    const g=grupos[k]||(grupos[k]={nota:hormigaNotaMostrada(x.nota),total:0,veces:0});
    g.total+=Math.abs(x.monto||0); g.veces++;
  });
  const conceptos=Object.keys(grupos).map(function(k){return grupos[k];}).sort(function(a,b){return b.total-a.total;});
  return {total:total, cantidad:lista.length, promedio:lista.length?Math.round(total/lista.length):0, conceptos:conceptos};
}
// Mes anterior a curM que exista en db (o null).
function hormigaMesAnterior(){
  const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  const i=keys.indexOf(curM);
  return i>0?db[keys[i-1]]:null;
}
// Proyección: promedio de las últimas quincenas CON registros (hasta HORMIGA_QUINCENAS_PROM,
// sin contar quincenas futuras) → mensual (×2) y anual (×24). Null si no hay datos.
function hormigaProyeccion(){
  const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;}).filter(function(k){return k<=curM;});
  const totales=[];
  for(let i=keys.length-1;i>=0 && totales.length<HORMIGA_QUINCENAS_PROM;i--){
    const mes=db[keys[i]];
    ['q2','q1'].forEach(function(q){
      if(totales.length>=HORMIGA_QUINCENAS_PROM) return;
      const t=calcHormigaQuincena(mes,q);
      if(t>0) totales.push(t);
    });
  }
  if(!totales.length) return null;
  const prom=totales.reduce(function(a,x){return a+x;},0)/totales.length;
  return {quincenal:Math.round(prom), mensual:Math.round(prom*2), anual:Math.round(prom*24), base:totales.length};
}

// ── Tarjeta en Inicio ─────────────────────────────────────────────────────────
function hormigaTarjetaInicioHtml(m,which){
  const r=hormigaResumen(hormigaLista(m,which));
  const ql=which==='q1'?'Q1':'Q2';
  const sub=r.cantidad
    ?(r.cantidad+(r.cantidad===1?' compra':' compras')+' · prom. '+cop(r.promedio))
    :'Café, domicilios, antojos… anótalos aquí';
  return '<div class="horm-card" onclick="openHormigaDetalle(\''+which+'\')">'
    +'<div class="horm-ico">'+icon('coffee',17)+'</div>'
    +'<div class="horm-mid">'
    +'<div class="horm-tit">Gastos hormiga · '+ql+'</div>'
    +'<div class="horm-sub">'+esc(sub)+'</div>'
    +'</div>'
    +(r.cantidad?'<div class="horm-val">'+cop(r.total)+'</div>':'')
    +'<button class="horm-add" onclick="event.stopPropagation();openHormigaNuevo(\''+which+'\')" aria-label="Agregar gasto hormiga">'+icon('plus',16)+'</button>'
    +'</div>';
}

// ── Formulario (nuevo / editar) ───────────────────────────────────────────────
// Entrada "suelta" (el + de la tarjeta de Inicio): al guardar se cierra, no vuelve al detalle.
function openHormigaNuevo(which){
  _hormigaVolverDetalle=null;
  openHormiga(null,which);
}
function openHormiga(item,which){
  const m=getM();
  const isE=!!item;
  const wh=which||homeQ;
  const info=hormigaMesInfo(m);
  const fecha=isE?(item.fecha||hormigaFechaPorDefecto(m,wh)):hormigaFechaPorDefecto(m,wh);
  const metodoSel=isE?(item.metodo||''):hormigaUltimoMetodo();
  const delOnclick=isE?("delHormiga('"+item.id+"','"+wh+"')"):null;

  const header=stdFormHeaderHtml(isE?'Editar gasto hormiga':'Gasto hormiga',_hormigaVolverDetalle?("openHormigaDetalle('"+_hormigaVolverDetalle+"')"):null,delOnclick);
  const hero=stdFormHeroCardHtml(
    stdFormNombreValorHtml('hm-n',isE?item.nota:'','Café, domicilio, snack…','hm-v',isE?item.monto:0,'COP · compra pequeña','var(--amb)',null,'Nota')
  );
  const sugs=isE?[]:hormigaSugerencias();
  const chipsHtml=sugs.length
    ?('<div class="horm-chips">'+sugs.map(function(s){
        return '<button type="button" class="horm-chip" onclick="hormigaUsarSugerencia(this)" data-nota="'+esc(s.nota)+'" data-monto="'+(s.ultimoMonto||0)+'">'+esc(s.nota)+(s.ultimoMonto?' <span>'+cop(s.ultimoMonto)+'</span>':'')+'</button>';
      }).join('')+'</div>')
    :'';
  const metodos=(catMetodos||[]).map(function(x){return x.nombre;});
  if(metodoSel && metodos.indexOf(metodoSel)<0) metodos.unshift(metodoSel);
  const metodosHtml=metodos.length
    ?('<div style="margin:0 0 12px"><label class="horm-lbl">Pagado con</label><div class="horm-chips" id="hm-metodos" style="margin:0">'
      +metodos.map(function(n){
        return '<button type="button" class="horm-chip'+(n===metodoSel?' sel':'')+'" data-metodo="'+esc(n)+'" onclick="hormigaElegirMetodo(this)">'+esc(n)+'</button>';
      }).join('')+'</div></div>')
    :'';
  const fechaHtml='<div style="margin:0 0 12px">'+stdFormDateFieldHtml('hm-f','Fecha',fecha)+'</div>';
  const footer=stdFormFooterHtml("saveHormiga('"+(isE?item.id:'')+"','"+wh+"')",'Guardar',_hormigaVolverDetalle?("openHormigaDetalle('"+_hormigaVolverDetalle+"')"):null);
  openModal(header+hero+chipsHtml+metodosHtml+fechaHtml+footer);
  const f=document.getElementById('hm-f');
  if(f){ f.min=hormigaFechaStr(info,1); f.max=hormigaFechaStr(info,info.ultimo); }
  if(!isE){ const v=document.getElementById('hm-v'); if(v && v.focus) setTimeout(function(){ try{ v.focus(); }catch(e){} },60); }
}
function hormigaUsarSugerencia(btn){
  const n=document.getElementById('hm-n'), v=document.getElementById('hm-v');
  if(n) n.value=btn.dataset.nota||'';
  const monto=parseInt(btn.dataset.monto,10)||0;
  if(v && monto) v.value=moneyInputFmt(monto);
}
function hormigaElegirMetodo(btn){
  const yaSel=btn.classList.contains('sel');
  document.querySelectorAll('#hm-metodos .horm-chip').forEach(function(b){ b.classList.remove('sel'); });
  if(!yaSel) btn.classList.add('sel'); // tocar el elegido lo desmarca (método opcional)
}
function saveHormiga(id,which){
  const m=getM();
  const info=hormigaMesInfo(m);
  const monto=moneyVal('hm-v');
  const nota=(document.getElementById('hm-n').value||'').trim();
  const fecha=document.getElementById('hm-f').value||hormigaFechaPorDefecto(m,which);
  const selEl=document.querySelector('#hm-metodos .horm-chip.sel');
  const metodo=selEl?(selEl.dataset.metodo||''):'';
  if(!monto){ showAlert('Escribe el valor de la compra'); return; }
  if(fecha.slice(0,7)!==hormigaFechaStr(info,1).slice(0,7)){
    showAlert('La fecha debe ser de '+m.nombre+' '+info.año+'. Para otro mes, cámbiate a ese mes primero.');
    return;
  }
  const destino=hormigaQuincenaDeFecha(fecha);
  if(id){
    // Si cambió la fecha a la otra quincena, el registro se mueve de lista.
    const origen=hormigaLista(m,which);
    const idx=origen.findIndex(function(x){return x.id===id;});
    if(idx<0){ closeModal(); return; }
    const it=origen[idx];
    it.monto=monto; it.nota=nota; it.metodo=metodo; it.fecha=fecha;
    if(destino!==which){ origen.splice(idx,1); hormigaLista(m,destino).push(it); }
  } else {
    hormigaLista(m,destino).push({id:uid(), monto:monto, nota:nota, metodo:metodo, fecha:fecha});
  }
  save();
  const volver=_hormigaVolverDetalle;
  render();
  if(volver) openHormigaDetalle(destino); else closeModal();
  toast(id?'Gasto hormiga actualizado':'Gasto hormiga agregado ('+(destino==='q1'?'Q1':'Q2')+')');
}
function editHormiga(id,which){
  const it=hormigaLista(getM(),which).find(function(x){return x.id===id;});
  if(it){ _hormigaVolverDetalle=which; openHormiga(it,which); }
}
function delHormiga(id,which){
  const volver=_hormigaVolverDetalle;
  showConfirm('¿Eliminar este gasto hormiga?',function(){
    const m=getM();
    m.hormiga[which]=hormigaLista(m,which).filter(function(x){return x.id!==id;});
    save(); render();
    if(volver) openHormigaDetalle(which);
    toast('Gasto hormiga eliminado');
  });
}

// ── Detalle y análisis de la quincena ────────────────────────────────────────
function hormigaVariacionHtml(actual,anterior,etiqueta){
  if(!anterior) return '';
  const pct=Math.round((actual-anterior)/anterior*100);
  const sube=pct>0;
  const color=pct===0?'var(--mut)':(sube?'var(--red)':'var(--grn)');
  const txt=pct===0?'igual que':(Math.abs(pct)+'% '+(sube?'más que':'menos que'));
  return '<div class="horm-row"><span>'+esc(etiqueta)+' <b>'+cop(anterior)+'</b></span><span style="color:'+color+';font-weight:700">'+txt+'</span></div>';
}
function openHormigaDetalle(which){
  _hormigaVolverDetalle=which;
  const m=getM();
  const ql=which==='q1'?'Q1':'Q2';
  const otra=which==='q1'?'q2':'q1';
  const lista=hormigaLista(m,which).slice().sort(function(a,b){return (a.fecha||'')<(b.fecha||'')?1:-1;});
  const r=hormigaResumen(lista);

  const header=stdFormHeaderHtml('Hormiga · '+ql+' '+m.nombre,"_hormigaVolverDetalle=null;closeModal()");
  const hero='<div class="horm-hero">'
    +'<div class="horm-hero-lbl">TOTAL DE LA QUINCENA</div>'
    +'<div class="horm-hero-val">'+cop(r.total)+'</div>'
    +'<div class="horm-hero-sub">'+(r.cantidad?(r.cantidad+(r.cantidad===1?' compra':' compras')+' · promedio '+cop(r.promedio)):'Todavía no hay compras registradas')+'</div>'
    +'</div>';

  // Comparación: la otra quincena de este mes y la misma quincena del mes anterior.
  const totalOtra=calcHormigaQuincena(m,otra);
  const mesAnt=hormigaMesAnterior();
  const totalAnt=mesAnt?calcHormigaQuincena(mesAnt,which):0;
  let compHtml='';
  if(r.total){
    compHtml=hormigaVariacionHtml(r.total,totalOtra,(otra==='q1'?'Q1':'Q2')+' de este mes:')
      +hormigaVariacionHtml(r.total,totalAnt,mesAnt?(ql+' de '+mesAnt.nombre+':'):'');
  }
  const proy=hormigaProyeccion();
  const proyHtml=proy
    ?('<div class="horm-proy">'+icon('trendUp',15)+'<span>A este ritmo son <b>~'+cop(proy.mensual)+' al mes</b> y <b>~'+cop(proy.anual)+' al año</b>.'
      +'<br><small>Promedio de '+proy.base+(proy.base===1?' quincena':' quincenas')+' con registros.</small></span></div>')
    :'';
  const seccion=function(titulo,cuerpo){ return cuerpo?('<div class="horm-sec">'+titulo+'</div><div class="horm-box">'+cuerpo+'</div>'):''; };

  const top=r.conceptos.slice(0,HORMIGA_MAX_TOP);
  const maxTop=top.length?top[0].total:0;
  const topHtml=top.map(function(c){
    const w=maxTop?Math.max(4,Math.round(c.total/maxTop*100)):0;
    return '<div class="horm-top">'
      +'<div class="horm-row"><span>'+esc(c.nota)+' <small>· '+c.veces+(c.veces===1?' vez':' veces')+'</small></span><b>'+cop(c.total)+'</b></div>'
      +'<div class="horm-bar"><div style="width:'+w+'%"></div></div>'
      +'</div>';
  }).join('');

  const itemsHtml=lista.map(function(x){
    return '<div class="horm-item" onclick="editHormiga(\''+x.id+'\',\''+which+'\')">'
      +'<div style="flex:1;min-width:0"><div class="horm-item-nota">'+esc(hormigaNotaMostrada(x.nota))+'</div>'
      +'<div class="horm-item-sub">'+esc(fmtD(x.fecha))+(x.metodo?' · '+esc(x.metodo):'')+'</div></div>'
      +'<div class="horm-item-val">'+cop(x.monto)+'</div>'
      +'</div>';
  }).join('');

  const footer='<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">'
    +'<button class="bpri" style="width:100%;padding:13px 0;border-radius:14px;font-size:15px" onclick="openHormiga(null,\''+which+'\')">+ Agregar gasto hormiga</button>'
    +'</div>';

  openModal(header+hero
    +seccion('Comparación',compHtml)
    +proyHtml
    +seccion('En qué se va',topHtml)
    +seccion('Compras',itemsHtml)
    +footer);
}
