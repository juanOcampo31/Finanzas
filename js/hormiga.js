// ── Gastos hormiga ─────────────────────────────────────────────────────────────
// Compras pequeñas y sueltas (café, domicilio, snack, taxi...) que no son parte de la lista de
// gastos PLANEADOS de la quincena (q1_gastos/q2_gastos) pero que sí sacan plata: se registran
// aparte, en m.hormiga.q1 / m.hormiga.q2, con {id, monto, nota, catId, fecha}. catId apunta al
// catálogo catHormiga (Catálogos → Categorías hormiga); es opcional. La quincena es la
// que el usuario tenía abierta al agregar (la fecha es solo informativa, cualquier día del mes;
// una compra del 20 puede salir de la plata de la Q1). NO restan del disponible: solo se
// muestra cuánto se ha gastado (calcHormigaQuincena en nomina-calc.js). Viven dentro del mes, así que viajan solas en el respaldo y en la nube.

const HORMIGA_MAX_CHIPS=6;      // sugerencias de nota en el formulario
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
    const s=porClave[k]||(porClave[k]={nota:hormigaNotaMostrada(x.nota),veces:0,ultimoMonto:0,ultimaFecha:'',catId:''});
    s.veces++;
    if((x.fecha||'')>=s.ultimaFecha){ s.ultimaFecha=x.fecha||''; s.ultimoMonto=x.monto||0; s.nota=hormigaNotaMostrada(x.nota); s.catId=hormigaCat(x.catId)?x.catId:''; }
  });
  return Object.keys(porClave).map(function(k){return porClave[k];})
    .sort(function(a,b){return b.veces-a.veces || (a.ultimaFecha<b.ultimaFecha?1:-1);})
    .slice(0,HORMIGA_MAX_CHIPS);
}
// ── Categorías (catálogo catHormiga) ──────────────────────────────────────────
// Sin el campo en los datos (usuarios de antes, respaldos viejos) → categorías iniciales. Un
// arreglo vacío se respeta: el usuario borró todas a propósito.
function normalizarCatHormiga(arr){
  if(!Array.isArray(arr)) return CATS_HORMIGA_INICIALES.map(function(n){ return {id:uid(), nombre:n}; });
  return arr.filter(function(c){ return c && c.id && c.nombre; });
}
function hormigaCat(catId){
  return catId?(catHormiga||[]).find(function(c){ return c.id===catId; })||null:null;
}
function hormigaCatNombre(catId){ const c=hormigaCat(catId); return c?c.nombre:'Sin categoría'; }
// Categoría del registro más reciente que todavía exista en el catálogo (preselección del formulario).
function hormigaUltimaCat(){
  let ult=null;
  hormigaTodas().forEach(function(x){ if(hormigaCat(x.catId) && (!ult || (x.fecha||'')>=(ult.fecha||''))) ult=x; });
  return ult?ult.catId:'';
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
  // Por categoría (las borradas del catálogo caen en "Sin categoría").
  const porCat={};
  lista.forEach(function(x){
    const c=hormigaCat(x.catId), k=c?c.id:'_';
    const g=porCat[k]||(porCat[k]={catId:c?c.id:'',nombre:c?c.nombre:'Sin categoría',total:0,veces:0});
    g.total+=Math.abs(x.monto||0); g.veces++;
  });
  const categorias=Object.keys(porCat).map(function(k){return porCat[k];}).sort(function(a,b){return b.total-a.total;});
  return {total:total, cantidad:lista.length, promedio:lista.length?Math.round(total/lista.length):0, conceptos:conceptos, categorias:categorias};
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
  const catSel=isE?(hormigaCat(item.catId)?item.catId:''):hormigaUltimaCat();
  const delOnclick=isE?("delHormiga('"+item.id+"','"+wh+"')"):null;

  const header=stdFormHeaderHtml(isE?'Editar gasto hormiga':'Gasto hormiga',_hormigaVolverDetalle?("openHormigaDetalle('"+_hormigaVolverDetalle+"')"):null,delOnclick);
  const hero=stdFormHeroCardHtml(
    stdFormNombreValorHtml('hm-n',isE?item.nota:'','Café, domicilio, snack…','hm-v',isE?item.monto:0,'COP · compra pequeña','var(--amb)',null,'Nota')
  );
  const sugs=isE?[]:hormigaSugerencias();
  const chipsHtml=sugs.length
    ?('<div class="horm-chips">'+sugs.map(function(s){
        return '<button type="button" class="horm-chip" onclick="hormigaUsarSugerencia(this)" data-nota="'+esc(s.nota)+'" data-monto="'+(s.ultimoMonto||0)+'" data-cat="'+esc(s.catId||'')+'">'+esc(s.nota)+(s.ultimoMonto?' <span>'+cop(s.ultimoMonto)+'</span>':'')+'</button>';
      }).join('')+'</div>')
    :'';
  const cats=catHormiga||[];
  const catsHtml='<div style="margin:0 0 12px"><label class="horm-lbl">Categoría</label>'
    +(cats.length
      ?('<div class="horm-chips" id="hm-cats" style="margin:0">'
        +cats.map(function(c){
          return '<button type="button" class="horm-chip'+(c.id===catSel?' sel':'')+'" data-cat="'+esc(c.id)+'" onclick="hormigaElegirCat(this)">'+esc(c.nombre)+'</button>';
        }).join('')+'</div>')
      :'<div style="font-size:12px;color:var(--mut)">No tienes categorías. Agrégalas en Menú → Catálogos → Categorías hormiga.</div>')
    +'</div>';
  const fechaHtml='<div style="margin:0 0 12px">'+stdFormDateFieldHtml('hm-f','Fecha',fecha)+'</div>';
  const footer=stdFormFooterHtml("saveHormiga('"+(isE?item.id:'')+"','"+wh+"')",'Guardar',_hormigaVolverDetalle?("openHormigaDetalle('"+_hormigaVolverDetalle+"')"):null);
  openModal(header+hero+chipsHtml+catsHtml+fechaHtml+footer);
  const f=document.getElementById('hm-f');
  if(f){ f.min=hormigaFechaStr(info,1); f.max=hormigaFechaStr(info,info.ultimo); }
  if(!isE){ const v=document.getElementById('hm-v'); if(v && v.focus) setTimeout(function(){ try{ v.focus(); }catch(e){} },60); }
}
function hormigaUsarSugerencia(btn){
  const n=document.getElementById('hm-n'), v=document.getElementById('hm-v');
  if(n) n.value=btn.dataset.nota||'';
  const monto=parseInt(btn.dataset.monto,10)||0;
  if(v && monto) v.value=moneyInputFmt(monto);
  const cat=btn.dataset.cat||'';
  if(cat) document.querySelectorAll('#hm-cats .horm-chip').forEach(function(b){ b.classList.toggle('sel', b.dataset.cat===cat); });
}
function hormigaElegirCat(btn){
  const yaSel=btn.classList.contains('sel');
  document.querySelectorAll('#hm-cats .horm-chip').forEach(function(b){ b.classList.remove('sel'); });
  if(!yaSel) btn.classList.add('sel'); // tocar la elegida la desmarca (categoría opcional)
}
function saveHormiga(id,which){
  const m=getM();
  const info=hormigaMesInfo(m);
  const monto=moneyVal('hm-v');
  const nota=(document.getElementById('hm-n').value||'').trim();
  const fecha=document.getElementById('hm-f').value||hormigaFechaPorDefecto(m,which);
  const selEl=document.querySelector('#hm-cats .horm-chip.sel');
  const catId=selEl?(selEl.dataset.cat||''):'';
  if(!monto){ showAlert('Escribe el valor de la compra'); return; }
  if(fecha.slice(0,7)!==hormigaFechaStr(info,1).slice(0,7)){
    showAlert('La fecha debe ser de '+m.nombre+' '+info.año+'. Para otro mes, cámbiate a ese mes primero.');
    return;
  }
  const destino=which; // queda en la quincena donde se abrió el formulario, sin importar la fecha
  if(id){
    const origen=hormigaLista(m,which);
    const idx=origen.findIndex(function(x){return x.id===id;});
    if(idx<0){ closeModal(); return; }
    const it=origen[idx];
    it.monto=monto; it.nota=nota; it.catId=catId; it.fecha=fecha;
    delete it.metodo; // campo de la versión anterior (forma de pago), ya no se usa
  } else {
    hormigaLista(m,destino).push({id:uid(), monto:monto, nota:nota, catId:catId, fecha:fecha});
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
// Encabezado con el total, una fila compacta de comparaciones y las compras agrupadas por
// categoría en grupos desplegables (mismo patrón que los grupos de la lista de Gastos): cerrados
// muestran nombre, cantidad, total, % y barra; al tocarlos se ven sus compras.
const HORMIGA_COLORES=['#A493D6','#6E9BEA','#5DBB8A','#C9A25E','#E07B7B','#7FA8D9','#D48BB0','#D99A6C'];
let _hormigaGruposAbiertos={}; // clave de categoría ('_' = sin categoría) → abierto; se conserva al volver de editar

function hormigaColorCat(catId){
  const i=(catHormiga||[]).findIndex(function(c){ return c.id===catId; });
  return i<0?'#64748B':HORMIGA_COLORES[i%HORMIGA_COLORES.length];
}
function hormigaInicial(nombre){
  const t=(nombre||'').trim();
  return t?t.charAt(0).toUpperCase():'?';
}
// Variación contra otro total: {txt, color} o null si no hay con qué comparar.
function hormigaVariacion(actual,anterior){
  if(!anterior) return null;
  const pct=Math.round((actual-anterior)/anterior*100);
  if(pct===0) return {txt:'Igual', color:'var(--mut)'};
  return {txt:(pct>0?'▲ ':'▼ ')+Math.abs(pct)+'%', color:pct>0?'var(--red)':'var(--grn)'};
}
// Ícono en cuadro a la izquierda (alto de las 3 líneas, como en los grupos de categoría) y al
// frente título / valor / detalle. El cuadro toma el color del valor (rojo sube, verde baja...).
const HORMIGA_FONDO_COLOR={'var(--red)':'var(--red-d)','var(--grn)':'var(--grn-d)','var(--amb)':'var(--amb-d)'};
function hormigaStatHtml(ico,lbl,valor,sub,color){
  const c=color||'var(--txt)';
  return '<div class="horm-stat">'
    +'<div class="horm-stat-ico" style="background:'+(HORMIGA_FONDO_COLOR[c]||'var(--surf2)')+';color:'+c+'">'+icon(ico,17)+'</div>'
    +'<div class="horm-stat-txt"><div class="horm-stat-lbl">'+esc(lbl)+'</div>'
    +'<div class="horm-stat-val" style="color:'+c+'">'+esc(valor)+'</div>'
    +(sub?'<div class="horm-stat-sub">'+esc(sub)+'</div>':'')
    +'</div></div>';
}
function hormigaToggleGrupo(el,clave){
  const g=el.closest?el.closest('.horm-grp'):el.parentNode;
  if(!g) return;
  const abierto=!g.classList.contains('open');
  g.classList.toggle('open',abierto);
  _hormigaGruposAbiertos[clave]=abierto;
}
function openHormigaDetalle(which){
  if(_hormigaVolverDetalle!==which) _hormigaGruposAbiertos={}; // otra quincena: arranca todo cerrado
  _hormigaVolverDetalle=which;
  const m=getM();
  const ql=which==='q1'?'Q1':'Q2';
  const otra=which==='q1'?'q2':'q1';
  const lista=hormigaLista(m,which).slice().sort(function(a,b){return (a.fecha||'')<(b.fecha||'')?1:-1;});
  const r=hormigaResumen(lista);

  const header=stdFormHeaderHtml('Hormiga · '+ql+' '+m.nombre,"_hormigaVolverDetalle=null;closeModal()");
  const hero='<div class="horm-hero">'
    +'<div class="horm-hero-lbl">Total de la quincena</div>'
    +'<div class="horm-hero-val">'+cop(r.total)+'</div>'
    +'<div class="horm-hero-sub">'+(r.cantidad?(r.cantidad+(r.cantidad===1?' compra':' compras')+' · prom. '+cop(r.promedio)):'Todavía no hay compras')+'</div>'
    +'</div>';

  // Fila compacta: vs. la otra quincena, vs. la misma quincena del mes anterior, proyección.
  let statsHtml='';
  if(r.total){
    const totalOtra=calcHormigaQuincena(m,otra);
    const mesAnt=hormigaMesAnterior();
    const totalAnt=mesAnt?calcHormigaQuincena(mesAnt,which):0;
    const vOtra=hormigaVariacion(r.total,totalOtra);
    const vAnt=hormigaVariacion(r.total,totalAnt);
    const proy=hormigaProyeccion();
    const stats=[];
    if(vOtra) stats.push(hormigaStatHtml('swap','vs. '+(otra==='q1'?'Q1':'Q2'),vOtra.txt,cop(totalOtra),vOtra.color));
    if(vAnt) stats.push(hormigaStatHtml('cal','vs. '+mesAnt.nombre.slice(0,3)+'.',vAnt.txt,cop(totalAnt),vAnt.color));
    if(proy) stats.push(hormigaStatHtml('trendUp','Al mes','~'+cop(proy.mensual),'~'+cop(proy.anual)+'/año','var(--amb)'));
    if(stats.length) statsHtml='<div class="horm-stats">'+stats.join('')+'</div>';
  }

  // Grupos por categoría.
  const gruposHtml=r.categorias.map(function(c){
    const clave=c.catId||'_';
    const color=hormigaColorCat(c.catId);
    const pct=r.total?Math.round(c.total/r.total*100):0;
    const items=lista.filter(function(x){ return (hormigaCat(x.catId)?x.catId:'')===c.catId; });
    const itemsHtml=items.map(function(x){
      // Una sola línea: nota, fecha corta y valor.
      return '<div class="horm-item" onclick="editHormiga(\''+x.id+'\',\''+which+'\')">'
        +'<span class="horm-item-nota">'+esc(hormigaNotaMostrada(x.nota))+'</span>'
        +'<span class="horm-item-sub">'+esc(fmtD(x.fecha))+'</span>'
        +'<span class="horm-item-val">'+cop(x.monto)+'</span>'
        +'</div>';
    }).join('');
    return '<div class="horm-grp'+(_hormigaGruposAbiertos[clave]?' open':'')+'">'
      +'<div class="horm-grp-head" onclick="hormigaToggleGrupo(this,\''+esc(clave)+'\')">'
      +'<div class="horm-grp-ico" style="background:'+color+'26;color:'+color+'">'+esc(hormigaInicial(c.nombre))+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div class="horm-grp-row"><span class="horm-grp-nom">'+esc(c.nombre)+'</span><span class="horm-grp-val">'+cop(c.total)+'</span></div>'
      +'<div class="horm-grp-row"><span class="horm-grp-sub">'+c.veces+(c.veces===1?' compra':' compras')+'</span><span class="horm-grp-pct" style="color:'+color+'">'+pct+'%</span></div>'
      +'<div class="horm-bar"><div style="width:'+Math.max(3,pct)+'%;background:'+color+'"></div></div>'
      +'</div>'
      +'<span class="horm-grp-chev">'+icon('chevronDown',16)+'</span>'
      +'</div>'
      +'<div class="horm-grp-body">'+itemsHtml+'</div>'
      +'</div>';
  }).join('');
  const catsHtml=r.cantidad
    ?('<div class="horm-sec">Por categoría</div><div class="horm-grps">'+gruposHtml+'</div>')
    :'<div class="horm-vacio">Toca <b>Agregar</b> para registrar tu primera compra de esta quincena.</div>';

  const footer='<button class="bpri" style="width:100%;padding:13px 0;border-radius:14px;font-size:15px;margin-top:4px" onclick="openHormiga(null,\''+which+'\')">+ Agregar gasto hormiga</button>';

  openModal(header+hero+statsHtml+catsHtml+footer);
}
