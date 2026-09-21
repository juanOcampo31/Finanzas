// ── Ingresos adicionales ─────────────────────────────────────────────────────
// Fase 2 de la migración a una arquitectura más modular: separado de render.js — la pestaña
// Ingresos (freelance, ventas, arriendo...) vive acá.
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
// Mismo estándar visual que "Editar/Nuevo gasto" (ver openGasto en js/gasto-pickers.js):
// encabezado con cerrar (X) + título centrado + eliminar (ícono), tarjeta "hero" con
// nombre+valor destacados, y "Fecha" como fila de detalle con ícono — footer Guardar/Cancelar.
function openIngresoModal(g,which){
  const isE=!!g;
  const eid=isE?g.id:'';
  const wh=which||curIngQ;
  const hoy=new Date().toISOString().slice(0,10);
  const fechaValue=isE?(g.fecha||hoy):hoy;

  const headerHtml=stdFormHeaderHtml(isE?'Editar ingreso':'Nuevo ingreso',null,isE?("delIngreso('"+eid+"','"+wh+"')"):null);

  const heroHtml=stdFormHeroCardHtml(
    stdFormNombreValorHtml('ing-n',isE?g.nombre:'','Freelance, Venta, Arriendo...','ing-v',isE?g.valor:0,'COP · valor del ingreso','var(--grn)')
  );

  const fechaHtml='<div style="margin:0 0 12px">'+stdFormDateFieldHtml('ing-f','Fecha',fechaValue)+'</div>';

  const footerHtml=stdFormFooterHtml("saveIngreso('"+eid+"','"+wh+"')",'Guardar');

  openModal(headerHtml+heroHtml+fechaHtml+footerHtml);
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

