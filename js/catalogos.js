// ── CATÁLOGOS: Tipos de gasto y Formas de pago ────────────────────────────────
function openCatalogosMenu(){
  openModal('<div class="mtitle">Catálogos</div>'
    +'<div style="display:flex;flex-direction:column">'
    +'<div onclick="openGastoTemplates()" style="display:flex;align-items:center;justify-content:space-between;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer">'
    +'<span style="font-size:14px;color:var(--txt)">Gastos</span>'
    +'<span style="font-size:11px;color:var(--mut);display:inline-flex;align-items:center;gap:4px">'+catTipos.length+' ítem(s)'+icon('chevronRight',12)+'</span></div>'
    +'<div onclick="openCatList(\'metodos\')" style="display:flex;align-items:center;justify-content:space-between;padding:14px 4px;cursor:pointer">'
    +'<span style="font-size:14px;color:var(--txt)">Formas de pago</span>'
    +'<span style="font-size:11px;color:var(--mut);display:inline-flex;align-items:center;gap:4px">'+catMetodos.length+' ítem(s)'+icon('chevronRight',12)+'</span></div>'
    +'</div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
}

function getCat(tipo){ return tipo==='tipos'?catTipos:catMetodos; }
function setCat(tipo,arr){ if(tipo==='tipos') catTipos=arr; else catMetodos=arr; }
function catLabel(tipo){ return tipo==='tipos'?'Gasto':'Forma de pago'; }

// ── Catálogo de Formas de pago (simple: solo nombre) ──────────────────────────
function openCatList(tipo){
  const arr=getCat(tipo);
  const rowsHtml=arr.length?arr.map(function(item){
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 4px;border-bottom:1px solid var(--brd)">'
      +'<span style="font-size:13px;color:var(--txt)">'+esc(item.nombre)+'</span>'
      +'<div style="display:flex;gap:8px">'
      +'<button onclick="editCatItem(\''+tipo+'\',\''+item.id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;display:flex;align-items:center">'+icon('edit',13)+'</button>'
      +'<button onclick="deleteCatItem(\''+tipo+'\',\''+item.id+'\')" style="background:none;border:none;color:var(--red);cursor:pointer;display:flex;align-items:center">'+icon('trash',13)+'</button>'
      +'</div></div>';
  }).join(''):'<div style="padding:20px;text-align:center;color:var(--mut);font-size:12px">Sin elementos. Agrega el primero.</div>';

  openModal('<div class="mtitle">'+catLabel(tipo)+'s</div>'
    +'<div style="max-height:320px;overflow-y:auto;border:1px solid var(--brd);border-radius:var(--r2);margin-bottom:14px">'+rowsHtml+'</div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCatalogosMenu()">Volver</button>'
    +'<button class="bpri" onclick="openNewCatItem(\''+tipo+'\')">＋ Agregar</button>'
    +'</div>');
}

function openNewCatItem(tipo){
  openModal('<div class="mtitle">Nueva: '+catLabel(tipo)+'</div>'
    +'<div class="field"><label>Nombre</label><input id="cat-nombre" placeholder="Ej: Daviplata, Efectivo..."></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCatList(\''+tipo+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="saveNewCatItem(\''+tipo+'\')">Guardar</button>'
    +'</div>');
}

function saveNewCatItem(tipo){
  const nombre=document.getElementById('cat-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  const arr=getCat(tipo);
  if(arr.some(function(i){return i.nombre.toLowerCase()===nombre.toLowerCase();})){
    showAlert('Ya existe ese ítem');return;
  }
  arr.push({id:uid(),nombre:nombre});
  setCat(tipo,arr);
  save();openCatList(tipo);toast('Agregado');
}

function editCatItem(tipo,id){
  const arr=getCat(tipo);
  const item=arr.find(function(i){return i.id===id;});
  if(!item) return;
  openModal('<div class="mtitle">Editar: '+catLabel(tipo)+'</div>'
    +'<div class="field"><label>Nombre</label><input id="cat-edit-nombre" value="'+esc(item.nombre)+'"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCatList(\''+tipo+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="saveEditCatItem(\''+tipo+'\',\''+id+'\')">Guardar</button>'
    +'</div>');
}

function saveEditCatItem(tipo,id){
  const nuevoNombre=document.getElementById('cat-edit-nombre').value.trim();
  if(!nuevoNombre){showAlert('Escribe un nombre');return;}
  const arr=getCat(tipo);
  const item=arr.find(function(i){return i.id===id;});
  if(!item) return;
  const nombreViejo=item.nombre;
  item.nombre=nuevoNombre;
  setCat(tipo,arr);
  if(tipo==='metodos'){
    // La forma de pago se guarda como texto en cada gasto (no por id), así que
    // al renombrarla hay que propagar el cambio a los gastos existentes.
    Object.keys(db).forEach(function(k){
      var mes=db[k];
      [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
        list.forEach(function(g){ if(g.metodo===nombreViejo) g.metodo=nuevoNombre; });
      });
    });
  }
  // 'tipos' se referencia por id (catTipoId), así que renombrar el catálogo no requiere
  // tocar los gastos existentes.
  save();render();openCatList(tipo);toast('Actualizado');
}

function deleteCatItem(tipo,id){
  showConfirm('¿Eliminar este ítem del catálogo? Los gastos ya creados quedan desvinculados, conservando su último nombre.',function(){
    const arr=getCat(tipo).filter(function(i){return i.id!==id;});
    setCat(tipo,arr);
    if(tipo==='tipos'){
      // Los gastos que estaban vinculados a esta plantilla se desvinculan (ya no hay
      // nada con qué sincronizarlos); conservan el último nombre que tenían.
      Object.keys(db).forEach(function(k){
        var mes=db[k];
        [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
          list.forEach(function(g){ if(g.catTipoId===id){ g.catTipoId=null; } });
        });
      });
      save();render();openGastoTemplates();toast('Eliminado');
    } else {
      save();openCatList(tipo);toast('Eliminado');
    }
  });
}

// ── Catálogo de Gastos (plantillas completas: presupuesto, método, cuotas, mensualidad) ──
function seedGastosDesdeUltimoMes(){
  const keys=Object.keys(db).map(Number);
  if(!keys.length){ toast('No hay meses creados aún'); return; }
  const lastKey=Math.max(...keys);
  const lm=db[lastKey];
  const todos=[...(lm.q1_gastos||[]),...(lm.q2_gastos||[])].filter(function(g){
    return !g.parentId && !g.esGrupo && !g.creditoId; // excluir subgastos, grupos y cuotas de crédito
  });

  var agregados=0, omitidos=0, metodosNuevos=0;
  todos.forEach(function(g){
    // Asegurar que la forma de pago usada exista en su catálogo
    if(g.metodo){
      var metodoExiste=catMetodos.some(function(m){return m.nombre.toLowerCase()===g.metodo.toLowerCase();});
      if(!metodoExiste){
        catMetodos.push({id:uid(),nombre:g.metodo});
        metodosNuevos++;
      }
    }
    var yaExiste=catTipos.some(function(t){return t.nombre.toLowerCase()===g.nombre.toLowerCase();});
    if(yaExiste){ omitidos++; return; }
    catTipos.push({
      id:uid(),
      nombre:g.nombre,
      presupuesto:g.presupuesto||null,
      metodo:g.metodo||null,
      cuotas_total:0, // no copiamos cuotas: cada plantilla es genérica, no atada a un avance específico
      esMensualidad:!!g.mensualidad
    });
    agregados++;
  });

  save();
  openGastoTemplates();
  var msg=agregados+' gasto(s) agregado(s)';
  if(omitidos) msg+=' · '+omitidos+' ya existían';
  if(metodosNuevos) msg+=' · '+metodosNuevos+' forma(s) de pago nuevas';
  toast(msg);
}

function openGastoTemplates(){
  const rowsHtml=catTipos.length?catTipos.map(function(item){
    var detalle=[];
    if(item.presupuesto) detalle.push(cop(item.presupuesto));
    if(item.metodo) detalle.push(esc(item.metodo));
    if(item.cuotas_total>0) detalle.push(item.cuotas_total+' cuotas');
    if(item.esMensualidad) detalle.push('mensualidad');
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 4px;border-bottom:1px solid var(--brd)">'
      +'<div style="min-width:0">'
      +'<div style="font-size:13px;color:var(--txt)">'+esc(item.nombre)+'</div>'
      +(detalle.length?'<div style="font-size:10px;color:var(--mut);margin-top:1px">'+detalle.join(' · ')+'</div>':'')
      +'</div>'
      +'<div style="display:flex;gap:8px;flex-shrink:0">'
      +'<button onclick="editGastoTemplate(\''+item.id+'\')" style="background:none;border:none;color:var(--mut);cursor:pointer;display:flex;align-items:center">'+icon('edit',13)+'</button>'
      +'<button onclick="deleteCatItem(\'tipos\',\''+item.id+'\')" style="background:none;border:none;color:var(--red);cursor:pointer;display:flex;align-items:center">'+icon('trash',13)+'</button>'
      +'</div></div>';
  }).join(''):'<div style="padding:20px;text-align:center;color:var(--mut);font-size:12px">Sin gastos guardados. Crea plantillas para reutilizar al registrar gastos.</div>';

  openModal('<div class="mtitle">Gastos (plantillas)</div>'
    +'<p style="font-size:12px;color:var(--mut);line-height:1.5;margin-bottom:12px">Guarda gastos frecuentes con su valor, forma de pago y cuotas para no escribirlos cada vez. Son opcionales: en el formulario siempre puedes escribir un nombre libre.</p>'
    +'<div style="display:flex;justify-content:flex-end;margin-bottom:8px">'
    +'<button onclick="seedGastosDesdeUltimoMes()" style="background:var(--surf2);border:1px solid var(--brd2);border-radius:20px;padding:5px 12px;font-size:11px;color:var(--acc);cursor:pointer">'+btnIcon('refresh',12)+'Crear desde el último mes</button>'
    +'</div>'
    +'<div style="max-height:320px;overflow-y:auto;border:1px solid var(--brd);border-radius:var(--r2);margin-bottom:14px">'+rowsHtml+'</div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCatalogosMenu()">Volver</button>'
    +'<button class="bpri" onclick="openNewGastoTemplate()">＋ Agregar</button>'
    +'</div>');
}

function gastoTemplateForm(item){
  item = item || {nombre:'',presupuesto:'',metodo:'',cuotas_total:'',esMensualidad:false};
  const metodoOpts='<option value="">— Ninguna —</option>'+catMetodos.map(function(m){
    return '<option'+(item.metodo===m.nombre?' selected':'')+'>'+esc(m.nombre)+'</option>';
  }).join('');
  return '<div class="field"><label>Nombre</label><input id="gt-nombre" value="'+esc(item.nombre)+'" placeholder="Ej: Arriendo, Mercado..."></div>'
    +'<div class="field"><label>Presupuesto (opcional)</label><input id="gt-presupuesto" type="text" inputmode="numeric" value="'+moneyInputFmt(item.presupuesto)+'" placeholder="Ej: 950.000" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Forma de pago asociada (opcional)</label><select id="gt-metodo">'+metodoOpts+'</select></div>'
    +'<div class="field"><label>Cuotas (opcional)</label><input id="gt-cuotas" type="number" min="0" value="'+(item.cuotas_total||'')+'" placeholder="Ej: 10"></div>'
    +'<div class="cbx-row"><input type="checkbox" id="gt-mens"'+(item.esMensualidad?' checked':'')+'>'
    +'<label for="gt-mens" style="font-size:13px;color:var(--txt)">Es una mensualidad (pago adelantado al mes siguiente)</label></div>';
}

function openNewGastoTemplate(){
  openModal('<div class="mtitle">Nuevo gasto</div>'
    +gastoTemplateForm()
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openGastoTemplates()">Cancelar</button>'
    +'<button class="bpri" onclick="saveNewGastoTemplate()">Guardar</button>'
    +'</div>');
}

function saveNewGastoTemplate(){
  const nombre=document.getElementById('gt-nombre').value.trim();
  if(!nombre){showAlert('Escribe un nombre');return;}
  if(catTipos.some(function(i){return i.nombre.toLowerCase()===nombre.toLowerCase();})){
    showAlert('Ya existe un gasto con ese nombre');return;
  }
  catTipos.push({
    id:uid(),
    nombre:nombre,
    presupuesto:moneyVal('gt-presupuesto')||null,
    metodo:document.getElementById('gt-metodo').value||null,
    cuotas_total:parseInt(document.getElementById('gt-cuotas').value)||0,
    esMensualidad:document.getElementById('gt-mens').checked
  });
  save();openGastoTemplates();toast('Gasto agregado');
}

function editGastoTemplate(id){
  const item=catTipos.find(function(i){return i.id===id;});
  if(!item) return;
  openModal('<div class="mtitle">Editar gasto</div>'
    +gastoTemplateForm(item)
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openGastoTemplates()">Cancelar</button>'
    +'<button class="bpri" onclick="saveEditGastoTemplate(\''+id+'\')">Guardar</button>'
    +'</div>');
}

function saveEditGastoTemplate(id){
  const item=catTipos.find(function(i){return i.id===id;});
  if(!item) return;
  const nuevoNombre=document.getElementById('gt-nombre').value.trim();
  if(!nuevoNombre){showAlert('Escribe un nombre');return;}
  item.nombre=nuevoNombre;
  item.presupuesto=moneyVal('gt-presupuesto')||null;
  item.metodo=document.getElementById('gt-metodo').value||null;
  item.cuotas_total=parseInt(document.getElementById('gt-cuotas').value)||0;
  item.esMensualidad=document.getElementById('gt-mens').checked;
  // Integridad estricta: solo se actualizan los gastos VINCULADOS a esta plantilla
  // (catTipoId === id). Los gastos de libre ingreso, aunque tengan un nombre parecido,
  // nunca se tocan porque no comparten ese vínculo.
  var actualizados=0;
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
      list.forEach(function(g){
        if(g.catTipoId===id){ g.nombre=nuevoNombre; actualizados++; }
      });
    });
  });
  save();render();openGastoTemplates();
  toast(actualizados>0?('Actualizado · '+actualizados+' gasto(s) vinculado(s) sincronizado(s)'):'Actualizado');
}


// añoSel: año a mostrar (opcional). Sin argumento, o si ya no existe entre los años con meses
// creados, cae al año del mes activo — mismo comportamiento de siempre. Se pasa explícito al
// reabrir este modal desde el propio selector de año o desde setQ2DiasFijos, para no perder de
// vista el año que se estaba revisando.
// ── Información general — paleta propia de este panel (más compacta y oscura que el resto de
// la app), usada solo dentro de openInfoGeneral/sus helpers. No toca las variables CSS globales
// (--surf, --acc, etc.) para no afectar ningún otro modal.
var IG={
  bg1:'#0F1A2E',bg2:'#0D1729',bg3:'#0B1526',bg4:'#101A2E',bg5:'#111C2E',bg6:'#131E33',bg7:'#132038',
  accBg:'#0E2233',accBg2:'#0E3742',accBg3:'#164E63',
  bd1:'#22304F',bd2:'#26344F',bd3:'#1E2B45',bd4:'#2E3E5C',
  cian:'#22D3EE',cian2:'#67E8F9',amber:'#F59E0B',red:'#F87171',green:'#34D399',
  txt1:'#F8FAFC',txt2:'#F1F5F9',txt3:'#E2E8F0',txt4:'#CBD5E1',txt5:'#94A3B8',txt6:'#64748B',txt7:'#475569'
};
function igCapFirst(s){return s.charAt(0).toUpperCase()+s.slice(1);}
// Cierra cualquier editor de mes abierto en Información general (uno solo a la vez) y le quita
// el resaltado a su fila. Se usa al abrir otro editor, al Cancelar y tras Guardar.
function cerrarIgEditores(){
  document.querySelectorAll('[id^="ig-editor-"]').forEach(function(el){ el.style.display='none'; });
  document.querySelectorAll('[id^="ig-row-"]').forEach(function(el){ el.style.background='transparent'; });
  document.querySelectorAll('[id^="ig-name-"]').forEach(function(el){ el.style.fontWeight='600'; el.style.color=IG.txt3; });
}
// Tocar una fila de mes abre su editor inline (básico/bonos/quincena 2) justo debajo, con el
// básico enfocado y seleccionado. Tocar la fila ya abierta la cierra. Reemplaza a la antigua
// sección aparte "Editar salario y bonos" (con su propio desplegable de mes).
function toggleIgEditor(i){
  var ed=document.getElementById('ig-editor-'+i);
  if(!ed) return;
  var wasOpen=ed.style.display==='block';
  cerrarIgEditores();
  if(wasOpen) return;
  ed.style.display='block';
  var row=document.getElementById('ig-row-'+i);
  if(row) row.style.background=IG.bg7;
  var nameEl=document.getElementById('ig-name-'+i);
  if(nameEl){ nameEl.style.fontWeight='800'; nameEl.style.color=IG.txt1; }
  setTimeout(function(){
    var bt=document.getElementById('ig-bt-'+i);
    if(bt){ bt.focus(); bt.select(); }
  },50);
}
// Expande/colapsa el detalle de una racha de meses consecutivos sin registrar (ver openInfoGeneral).
function toggleIgGrupo(start){
  var body=document.getElementById('ig-grupo-body-'+start);
  if(!body) return;
  var open=body.style.display==='block';
  body.style.display=open?'none':'block';
  var chev=document.getElementById('ig-grupo-chev-'+start);
  if(chev) chev.innerHTML=icon(open?'chevronDown':'chevronUp',12);
}
// Panel de ayuda ("?" junto al título): el párrafo explicativo que antes vivía siempre visible
// arriba de la tabla, ahora bajo demanda para no ocupar alto por defecto.
function toggleIgHelp(){
  igHelpOpen=!igHelpOpen;
  var el=document.getElementById('ig-help-panel');
  if(el) el.style.display=igHelpOpen?'block':'none';
}
function openInfoGeneral(añoSel,mesAbrirIdx){
  const añosDisponibles=Array.from(new Set(Object.keys(db).map(function(k){return db[k].año;}))).sort(function(a,b){return a-b;});
  const año=(añoSel!=null && añosDisponibles.indexOf(añoSel)>=0)?añoSel:getM().año;
  // Recolectar el básico de cada mes del año seleccionado (Enero a Diciembre)
  const mesesDelAño={};
  const bonosDelAño={};
  const auxDelAño={};
  const keyPorIndice={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año){
      var idx=MESES.indexOf(mes.nombre);
      if(idx>=0){
        mesesDelAño[idx]=mes.nomina?mes.nomina.basico_total||0:0;
        bonosDelAño[idx]=mes.nomina?mes.nomina.bonos_total||0:0;
        auxDelAño[idx]=mes.nomina?mes.nomina.aux_transporte_total||0:0;
        keyPorIndice[idx]=Number(k);
      }
    }
  });

  // Para meses sin crear, sugerir el básico (y auxilio) del último mes existente anterior
  var basicoConSugerido={};
  var bonoConSugerido={};
  var auxConSugerido={};
  var ultimoBasico=null;
  var ultimoBono=null;
  var ultimoAux=null;
  var esSugerido={};
  for(var i=0;i<=11;i++){
    if(mesesDelAño[i]!==undefined){
      basicoConSugerido[i]=mesesDelAño[i];
      bonoConSugerido[i]=bonosDelAño[i]||0;
      auxConSugerido[i]=auxDelAño[i]||0;
      ultimoBasico=mesesDelAño[i];
      ultimoBono=bonosDelAño[i]||0;
      ultimoAux=auxDelAño[i]||0;
      esSugerido[i]=false;
    } else if(ultimoBasico!==null){
      basicoConSugerido[i]=ultimoBasico;
      bonoConSugerido[i]=ultimoBono;
      auxConSugerido[i]=ultimoAux;
      esSugerido[i]=true;
    } else {
      basicoConSugerido[i]=0;
      bonoConSugerido[i]=0;
      auxConSugerido[i]=0;
      esSugerido[i]=true;
    }
  }

  // Básico/bono de Diciembre del año ANTERIOR, para poder comparar Enero (i=0) contra él.
  var basicoDicAnterior=null, bonoDicAnterior=null;
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año-1 && mes.nombre==='Diciembre'){
      basicoDicAnterior=mes.nomina?mes.nomina.basico_total||0:0;
      bonoDicAnterior=mes.nomina?mes.nomina.bonos_total||0:0;
    }
  });

  // Prima/cesantías ESTIMADO (relleno con básico sugerido en meses sin crear). El auxilio de
  // transporte SÍ hace base de prima/cesantías (a diferencia de los bonos, solo informativos):
  // ver auxTransporteQ1/Q2 en nomina-calc.js y el mismo criterio en calcPrimaMes (creditos.js).
  var primaS1=0, s1TieneSugeridos=false;
  for(var i=0;i<=5;i++){ primaS1+=((basicoConSugerido[i]+auxConSugerido[i])*30)/360; if(esSugerido[i]) s1TieneSugeridos=true; }
  var primaS2=0, s2TieneSugeridos=false;
  for(var i=6;i<=11;i++){ primaS2+=((basicoConSugerido[i]+auxConSugerido[i])*30)/360; if(esSugerido[i]) s2TieneSugeridos=true; }
  primaS1=Math.round(primaS1); primaS2=Math.round(primaS2);
  var sumaCesantias=0, añoTieneSugeridos=false;
  for(var i=0;i<=11;i++){ sumaCesantias+=((basicoConSugerido[i]+auxConSugerido[i])*30)/360; if(esSugerido[i]) añoTieneSugeridos=true; }
  var cesantias=Math.round(sumaCesantias);
  var interesesCesantias=Math.round(cesantias*0.12);

  // Prima/cesantías ACTUAL: solo meses ya creados, con lo realmente recibido por quincena (ver
  // q1NoTrackeada en confirmarPrimeraConfiguracion, auth.js).
  var basicoActualPorMes={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año){
      var idx=MESES.indexOf(mes.nombre);
      if(idx>=0) basicoActualPorMes[idx]=(basicoQ1(mes)||0)+(basicoQ2(mes)||0)+(auxTransporteQ1(mes)||0)+(auxTransporteQ2(mes)||0);
    }
  });
  function sumaActual(inicio,fin){
    var s=0;
    for(var i=inicio;i<=fin;i++){ if(basicoActualPorMes[i]!==undefined) s+=(basicoActualPorMes[i]*30)/360; }
    return Math.round(s);
  }
  var primaS1Actual=sumaActual(0,5);
  var primaS2Actual=sumaActual(6,11);
  var cesantiasActual=sumaActual(0,11);
  var interesesCesantiasActual=Math.round(cesantiasActual*0.12);

  // ── Tira de resumen anual: sube al principio (es el resultado de todo lo demás) y se
  // conserva el tap-para-ver-fórmula (toggleFormula) que ya existía en las tarjetas grandes.
  // Las 4 tarjetas SIEMPRE en una sola fila, en el mismo orden/posición — en vez de envolver
  // (3+1) en pantallas angostas, se van achicando juntas (flex:1 1 0, min-width:0) y el valor
  // puede partirse en dos líneas si no cabe, en vez de saltar de fila o truncarse.
  function stripCard(fxId,bg,bd,label,valorActual,valorEstimado){
    return '<div onclick="toggleFormula(\''+fxId+'\')" style="flex:1 1 0;min-width:0;padding:8px 7px;border-radius:11px;display:flex;flex-direction:column;gap:2px;cursor:pointer;background:'+bg+';border:1px solid '+bd+'">'
      +'<span style="font-size:8.5px;font-weight:700;color:'+IG.txt6+';letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+label+'</span>'
      +'<span style="font-size:13px;font-weight:800;color:'+IG.txt1+';font-variant-numeric:tabular-nums;line-height:1.2;word-break:break-word">'+cop(valorActual)+'</span>'
      +'<span style="font-size:9px;color:'+IG.txt6+';line-height:1.2;word-break:break-word">est. '+cop(valorEstimado)+'</span>'
      +'</div>';
  }
  var resumenStripHtml='<div style="padding:12px 14px 10px;display:flex;gap:6px">'
    +stripCard('fx-primaj',IG.accBg,IG.accBg3,'PRIMA JUN',primaS1Actual,primaS1)
    +stripCard('fx-primad',IG.accBg,IG.accBg3,'PRIMA DIC',primaS2Actual,primaS2)
    +stripCard('fx-cesantias',IG.bg5,IG.bd1,'CESANTÍAS',cesantiasActual,cesantias)
    +stripCard('fx-intereses',IG.bg5,IG.bd1,'INT. CES.',interesesCesantiasActual,interesesCesantias)
    +'</div>'
    +'<div id="fx-primaj" style="display:none;padding:0 14px 10px;font-size:11px;color:'+IG.cian+'">Actual: solo meses ya creados, con lo realmente recibido por quincena.<br>Estimado: Enero a Junio, Σ (básico × 30 ÷ 360)'+(s1TieneSugeridos?', incluye meses sugeridos':'')+'.</div>'
    +'<div id="fx-primad" style="display:none;padding:0 14px 10px;font-size:11px;color:'+IG.cian+'">Actual: solo meses ya creados, con lo realmente recibido por quincena.<br>Estimado: Julio a Diciembre, Σ (básico × 30 ÷ 360)'+(s2TieneSugeridos?', incluye meses sugeridos':'')+'.</div>'
    +'<div id="fx-cesantias" style="display:none;padding:0 14px 10px;font-size:11px;color:'+IG.cian+'">Actual: solo meses ya creados, con lo realmente recibido por quincena.<br>Estimado: Enero a Diciembre, Σ (básico × 30 ÷ 360)'+(añoTieneSugeridos?', incluye meses sugeridos':'')+'.</div>'
    +'<div id="fx-intereses" style="display:none;padding:0 14px 10px;font-size:11px;color:'+IG.cian+'">Cesantías × 0.12 — Actual: '+cop(cesantiasActual)+' × 0.12. Estimado: '+cop(cesantias)+' × 0.12.</div>';

  // ── Filas "Básico por mes": rachas consecutivas de meses sin registrar se agrupan en una sola
  // fila plegable (por rachas reales, no "los primeros N" — un hueco en medio corta la racha).
  var segmentos=[];
  var rachaInicio=null;
  for(var i=0;i<=12;i++){
    var esVacio=i<12 && esSugerido[i];
    if(esVacio){
      if(rachaInicio===null) rachaInicio=i;
    } else {
      if(rachaInicio!==null){
        var fin=i-1;
        if(fin-rachaInicio+1>=2) segmentos.push({tipo:'grupo',start:rachaInicio,end:fin});
        else segmentos.push({tipo:'vacio',idx:rachaInicio});
        rachaInicio=null;
      }
      if(i<12) segmentos.push({tipo:'real',idx:i});
    }
  }

  // Fila de un mes YA CREADO: compacta (punto+nombre a la izquierda, básico+bonos con su
  // % de cambio a la derecha), tocarla abre su editor inline justo debajo (toggleIgEditor).
  // "Ver qué falta" se conserva igual que antes (mismo toggleMesDetalle/irAPendienteHistorico).
  function filaReal(i){
    var kMes=keyPorIndice[i];
    var basico=basicoConSugerido[i], bono=bonoConSugerido[i];
    var basicoAnterior=null, bonoAnterior=null, hayAnterior=false;
    if(i>0){ if(!esSugerido[i-1]){ basicoAnterior=basicoConSugerido[i-1]; bonoAnterior=bonoConSugerido[i-1]; hayAnterior=true; } }
    else if(basicoDicAnterior!==null){ basicoAnterior=basicoDicAnterior; bonoAnterior=bonoDicAnterior; hayAnterior=true; }
    // El % de cambio se pega al valor que realmente cambió (básico o bonos), no al nombre del
    // mes — así de un vistazo se ve CUÁL de los dos subió/bajó, en vez de un delta genérico.
    function deltaDe(actual,anterior){
      if(!hayAnterior || !(anterior>0) || actual===anterior) return '';
      var pct=((actual-anterior)/anterior)*100, subio=pct>0;
      return '<span style="font-size:11px;font-weight:700;color:'+(subio?IG.green:IG.red)+';display:inline-flex;align-items:center;gap:2px">'
        +icon(subio?'arrowUp':'arrowDown',10)+Math.abs(pct).toFixed(1)+'%</span>';
    }
    var deltaBasicoHtml=deltaDe(basico,basicoAnterior);
    var deltaBonoHtml=deltaDe(bono,bonoAnterior);
    var r=calcPctPagadoMes(db[kMes]);
    var estadoColor=r.total===0?IG.txt7:r.pct>=75?IG.green:r.pct>=25?IG.amber:IG.red;
    var dotHtml='<span title="'+r.pct+'% pagado" style="width:8px;height:8px;border-radius:50%;background:'+estadoColor+';display:inline-block;flex-shrink:0"></span>';
    var verFaltaHtml='', detalleHtml='';
    if(r.pendientes.length>0){
      verFaltaHtml='<div onclick="event.stopPropagation();toggleMesDetalle('+kMes+')" style="font-size:10.5px;color:'+IG.cian+';cursor:pointer;margin-top:2px">Ver qué falta ('+r.pendientes.length+')</div>';
      detalleHtml='<div id="ig-detalle-'+kMes+'" style="display:none;padding:2px 4px 8px 26px">'
        +r.pendientes.map(function(p){
          return '<div onclick="event.stopPropagation();irAPendienteHistorico('+kMes+',\''+p.id+'\',\''+p.which.toLowerCase()+'\')" style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:5px 4px;cursor:pointer;border-radius:6px">'
            +'<span style="color:'+IG.cian+';display:flex;align-items:center;gap:3px">'+esc(p.which)+' · '+esc(p.nombre||'(sin nombre)')+icon('chevronRight',11)+'</span><span style="color:'+IG.txt3+'">'+cop(p.presupuesto)+'</span></div>';
        }).join('')
        +'</div>';
    }
    var nom=getNom(db[kMes]);
    var diasQ2Mes=diasQ2(año,i);
    var abierto=mesAbrirIdx===i;
    return '<div id="ig-row-'+i+'" onclick="toggleIgEditor('+i+')" style="padding:7px 12px;border-radius:11px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;transition:background 130ms ease;background:'+(abierto?IG.bg7:'transparent')+'">'
        +'<div style="display:flex;flex-direction:column;gap:2px;min-width:0">'
          +'<div style="display:flex;align-items:center;gap:8px">'+dotHtml+'<span id="ig-name-'+i+'" style="font-size:14.5px;font-weight:'+(abierto?'800':'600')+';color:'+(abierto?IG.txt1:IG.txt3)+'">'+MESES[i]+'</span></div>'
          +verFaltaHtml
        +'</div>'
        +'<div style="display:grid;grid-template-columns:84px 84px;gap:10px;flex-shrink:0">'
          +'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px">'
            +'<span style="font-size:14.5px;font-weight:700;color:'+IG.txt2+';font-variant-numeric:tabular-nums">'+cop(basico)+'</span>'
            +deltaBasicoHtml
          +'</div>'
          +'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px">'
            +'<span style="font-size:13px;font-weight:600;color:'+IG.cian+';font-variant-numeric:tabular-nums">'+cop(bono)+'</span>'
            +deltaBonoHtml
          +'</div>'
        +'</div>'
      +'</div>'
      +detalleHtml
      +'<div id="ig-editor-'+i+'" style="display:'+(abierto?'block':'none')+'">'
        +'<div style="margin:2px 0 8px;padding:14px;background:'+IG.bg3+';border:1px solid '+IG.accBg3+';border-radius:13px;display:flex;flex-direction:column;gap:12px">'
          +'<div class="ig-field-row">'
            +'<div><label style="display:block;font-size:11px;font-weight:700;color:'+IG.txt6+';margin-bottom:5px">BÁSICO TOTAL MES</label>'
            +'<input id="ig-bt-'+i+'" type="text" inputmode="numeric" value="'+moneyInputFmt(nom.basico_total)+'" oninput="maskMoneyInput(this)" style="width:100%;padding:11px 12px;background:'+IG.bg4+';border:1.5px solid '+IG.cian+';border-radius:11px;font-size:16px;font-weight:800;color:'+IG.txt1+';font-variant-numeric:tabular-nums;outline:none"></div>'
            +'<div><label style="display:block;font-size:11px;font-weight:700;color:'+IG.txt6+';margin-bottom:5px">BONOS · INFORMATIVO</label>'
            +'<input id="ig-bon-'+i+'" type="text" inputmode="numeric" placeholder="0" value="'+moneyInputFmt(nom.bonos_total)+'" oninput="maskMoneyInput(this)" style="width:100%;padding:11px 12px;background:'+IG.bg4+';border:1px solid '+IG.bd1+';border-radius:11px;font-size:16px;font-weight:700;color:'+IG.txt3+';outline:none"></div>'
          +'</div>'
          +'<div><label style="display:block;font-size:11px;font-weight:700;color:'+IG.txt6+';margin-bottom:5px">AUXILIO DE TRANSPORTE</label>'
          +'<input id="ig-aux-'+i+'" type="text" inputmode="numeric" placeholder="0" value="'+moneyInputFmt(nom.aux_transporte_total)+'" oninput="maskMoneyInput(this)" style="width:100%;padding:11px 12px;background:'+IG.bg4+';border:1px solid '+IG.bd1+';border-radius:11px;font-size:16px;font-weight:700;color:'+IG.txt3+';outline:none">'
          +'<p style="font-size:10.5px;color:'+IG.txt6+';margin-top:5px;line-height:1.4">Cuenta para el neto y para la base de prima/cesantías, pero NO para las deducciones de salud/pensión.</p></div>'
          +'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">'
            +'<span style="font-size:11.5px;color:'+IG.txt6+'">Quincena 2</span>'
            +'<div style="display:flex;background:'+IG.bg4+';border-radius:10px;padding:3px;gap:2px">'
              +'<button onclick="setQ2DiasFijos(false,'+año+','+i+')" style="padding:7px 12px;border:none;border-radius:8px;font-size:12px;cursor:pointer;min-height:38px;'+(!perfilQ2DiasFijos?('background:'+IG.accBg2+';color:'+IG.cian2+';font-weight:800'):('background:transparent;color:'+IG.txt5+';font-weight:600'))+'">Automático</button>'
              +'<button onclick="setQ2DiasFijos(true,'+año+','+i+')" style="padding:7px 12px;border:none;border-radius:8px;font-size:12px;cursor:pointer;min-height:38px;'+(perfilQ2DiasFijos?('background:'+IG.accBg2+';color:'+IG.cian2+';font-weight:800'):('background:transparent;color:'+IG.txt5+';font-weight:600'))+'">15 días fijos</button>'
            +'</div>'
          +'</div>'
          +'<div style="font-size:11.5px;color:'+IG.txt6+'">'+(perfilQ2DiasFijos?'Q1 = básico ÷ 2 · Q2 = 15 días fijos, sin importar el mes.':'Q1 = básico ÷ 2 · Q2 = básico ÷ 30 × días reales del mes ('+diasQ2Mes+' en '+MESES[i]+').')+'</div>'
          +'<div style="display:flex;align-items:center;gap:14px">'
            +'<button onclick="cerrarIgEditores()" style="background:none;border:none;color:'+IG.txt5+';font-size:13.5px;font-weight:700;cursor:pointer;padding:10px 4px;min-height:44px">Cancelar</button>'
            +'<button onclick="guardarBasicoBonoDesdeInfoGeneral('+kMes+','+año+','+i+')" style="flex:1;padding:12px;background:'+IG.cian+';color:#052B33;border:none;border-radius:11px;font-size:14.5px;font-weight:800;cursor:pointer;min-height:44px">Guardar '+MESES[i]+'</button>'
          +'</div>'
        +'</div>'
      +'</div>';
  }
  // Mes sin registrar QUE NO forma parte de una racha agrupable (racha de un solo mes): se
  // muestra como fila normal en el valor sugerido, sin ser tocable (no existe como mes real,
  // así que no hay nada que editar todavía — para eso está "+ Nuevo mes").
  function filaVacia(i){
    return '<div style="padding:7px 12px;border-radius:11px;display:flex;align-items:center;justify-content:space-between;gap:12px">'
      +'<div style="display:flex;align-items:center;gap:8px">'
        +'<span style="width:8px;height:8px;border-radius:50%;background:'+IG.txt7+';display:inline-block;flex-shrink:0"></span>'
        +'<span style="font-size:14.5px;font-weight:600;color:'+IG.txt6+'">'+MESES[i]+' <span style="font-size:9px;color:'+IG.amber+'">(sug.)</span></span>'
      +'</div>'
      +'<span style="font-size:14.5px;font-weight:700;color:'+IG.txt6+';font-variant-numeric:tabular-nums">'+cop(basicoConSugerido[i])+'</span>'
    +'</div>';
  }
  // Racha de 2+ meses consecutivos sin registrar: chip plegable con el rango, el conteo y la
  // sugerencia vigente; al desplegar muestra cada mes individual (mismos, tampoco tocables).
  function filaGrupo(start,end){
    var count=end-start+1;
    var rango=igCapFirst(MESES_ABBR_MIN[start])+' – '+igCapFirst(MESES_ABBR_MIN[end]);
    var sub=[];
    for(var j=start;j<=end;j++){
      sub.push('<div style="border-left:2px solid '+IG.bd3+';margin-left:10px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between">'
        +'<span style="font-size:13.5px;font-weight:600;color:'+IG.txt5+'">'+MESES[j]+'</span>'
        +'<span style="font-size:12.5px;color:'+IG.txt7+'">$0</span></div>');
    }
    return '<div id="ig-grupo-'+start+'" onclick="toggleIgGrupo('+start+')" style="padding:11px 12px;background:'+IG.bg2+';border:1px dashed '+IG.bd2+';border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px">'
      +'<div style="display:flex;flex-direction:column;gap:2px;min-width:0">'
        +'<span style="font-size:13.5px;font-weight:700;color:'+IG.txt5+'">'+rango+'</span>'
        +'<span style="font-size:11.5px;color:'+IG.txt6+'">'+count+' meses sin registrar</span>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'
        +'<span style="font-size:11px;font-weight:700;color:'+IG.amber+'">sug. '+cop(basicoConSugerido[start])+'</span>'
        +'<span id="ig-grupo-chev-'+start+'" style="display:flex;color:'+IG.txt6+'">'+icon('chevronDown',12)+'</span>'
      +'</div>'
    +'</div>'
    +'<div id="ig-grupo-body-'+start+'" style="display:none">'+sub.join('')+'</div>';
  }
  var filasHtml=segmentos.map(function(seg){
    if(seg.tipo==='real') return filaReal(seg.idx);
    if(seg.tipo==='vacio') return filaVacia(seg.idx);
    return filaGrupo(seg.start,seg.end);
  }).join('');

  // ── Cabecera (título+ayuda a la izquierda, año+cerrar a la derecha) ──
  var añoOpts=añosDisponibles.map(function(a){return '<option value="'+a+'"'+(a===año?' selected':'')+'>'+a+'</option>';}).join('');
  var añoHtml=añosDisponibles.length>1
    ?'<div style="position:relative;display:flex;align-items:center">'
      +'<select id="ig-anio" onchange="openInfoGeneral(parseInt(this.value))" style="appearance:none;-webkit-appearance:none;padding:6px 24px 6px 10px;background:'+IG.bg6+';border:1px solid '+IG.bd2+';border-radius:10px;font-size:13px;font-weight:800;color:'+IG.txt2+';outline:none">'+añoOpts+'</select>'
      +'<span style="position:absolute;right:8px;pointer-events:none;color:'+IG.txt6+';display:flex">'+icon('chevronDown',10)+'</span>'
    +'</div>'
    :'<span style="padding:6px 10px;background:'+IG.bg6+';border:1px solid '+IG.bd2+';border-radius:10px;font-size:13px;font-weight:800;color:'+IG.txt2+'">'+año+'</span>';
  var headerHtml='<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px 14px;border-bottom:1px solid '+IG.bd3+'">'
    +'<div style="display:flex;align-items:center;gap:8px;min-width:0">'
      +'<span style="font-size:17px;font-weight:800;color:'+IG.txt2+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Información general</span>'
      +'<button onclick="toggleIgHelp()" style="width:20px;height:20px;border-radius:50%;border:1px solid '+IG.bd4+';background:transparent;color:'+IG.txt6+';font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;padding:0">?</button>'
    +'</div>'
    +'<div style="display:flex;align-items:center;gap:10px;flex-shrink:0">'
      +añoHtml
      +'<button onclick="closeModal()" style="width:28px;height:28px;border-radius:50%;border:none;background:transparent;color:'+IG.txt6+';font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">✕</button>'
    +'</div>'
  +'</div>';
  // Párrafo explicativo: ya no ocupa espacio por defecto, solo al tocar el "?" (toggleIgHelp).
  var helpHtml='<div id="ig-help-panel" style="display:'+(igHelpOpen?'block':'none')+';padding:12px 18px;background:'+IG.accBg+';border-bottom:1px solid '+IG.bd3+';font-size:12.5px;color:#A5F3FC;line-height:1.55">'
    +'Básico mensual de cada mes del año y cálculo de prima de servicios (básico ÷ 30, sumado por semestre). Los meses sin crear toman el básico del último mes existente como sugerencia. Toca un mes ya creado (el punto de color indica qué tanto está pagado) para editar su básico y bonos.'
  +'</div>';
  var mesesHeadHtml='<div style="padding:8px 18px 6px;display:flex;justify-content:space-between;align-items:center">'
    +'<span style="font-size:10px;font-weight:700;color:'+IG.txt6+';letter-spacing:.1em;text-transform:uppercase">Mes</span>'
    +'<div style="display:grid;grid-template-columns:84px 84px;gap:10px;text-align:right">'
      +'<span style="font-size:10px;font-weight:700;color:'+IG.txt6+';letter-spacing:.1em;text-transform:uppercase">Básico</span>'
      +'<span style="font-size:10px;font-weight:700;color:'+IG.txt6+';letter-spacing:.1em;text-transform:uppercase">Bonos</span>'
    +'</div>'
  +'</div>';
  function legendItem(color,texto){
    return '<span style="display:flex;align-items:center;gap:5px;font-size:10.5px;color:'+IG.txt6+'"><span style="width:7px;height:7px;border-radius:50%;background:'+color+';display:inline-block"></span>'+texto+'</span>';
  }
  var footerHtml='<div style="padding:9px 18px 14px;border-top:1px solid '+IG.bd3+';display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">'
    +'<div style="display:flex;align-items:center;gap:13px;flex-wrap:wrap">'
      +legendItem(IG.red,'0–25%')+legendItem(IG.amber,'25–75%')+legendItem(IG.green,'75–100% pagado')
    +'</div>'
    +'<button onclick="closeModal()" style="background:none;border:none;color:'+IG.txt5+';font-size:12.5px;font-weight:700;cursor:pointer;padding:8px 4px">Cerrar</button>'
  +'</div>';

  // El wrapper con margin negativo cancela el padding:18px de .modal (compartido por TODOS los
  // modales de la app) solo para esta ventana, así el header/tira/filas/pie quedan a ras del
  // borde como pide el diseño, sin tocar la clase .modal global (evitaría romper el resto).
  openModal('<div style="margin:-18px -18px 0;background:'+IG.bg1+';border-radius:20px 20px 0 0;overflow:hidden">'
    +headerHtml
    +helpHtml
    +resumenStripHtml
    +mesesHeadHtml
    +'<div style="padding:0 12px 4px;display:flex;flex-direction:column;gap:1px">'+filasHtml+'</div>'
    +footerHtml
  +'</div>');

  if(mesAbrirIdx!=null){
    setTimeout(function(){
      var bt=document.getElementById('ig-bt-'+mesAbrirIdx);
      if(bt){ bt.focus(); bt.select(); }
    },50);
  }
}
// Mismo cálculo que saveBasico() (tarjeta.js, editor de básico/bonos de la pestaña Nómina) pero
// aplicado a un mes cualquiera del año que se está viendo en Información general, no solo al mes
// abierto actualmente. Al guardar el editor se cierra y el resumen anual de arriba queda
// recalculado, ambos en el mismo re-render del modal (sin recargar la ventana).
function guardarBasicoBonoDesdeInfoGeneral(k,año,mesIdx){
  const m=db[k], n=getNom(m);
  const bt=moneyVal('ig-bt-'+mesIdx);
  const bon=moneyVal('ig-bon-'+mesIdx);
  const aux=moneyVal('ig-aux-'+mesIdx);
  n.basico_total=bt; n.bonos_total=bon; n.aux_transporte_total=aux;
  n.basico_q1=basicoQ1({nombre:m.nombre,año:m.año,nomina:{basico_total:bt}});
  n.basico_q2=basicoQ2({nombre:m.nombre,año:m.año,nomina:{basico_total:bt}});
  n.bonos_q1=Math.round(bon/2); n.bonos_q2=Math.round(bon/2);
  n.aux_transporte_q1=Math.round(aux/2); n.aux_transporte_q2=Math.round(aux/2);
  save();
  render();
  openInfoGeneral(año);
  toast('Básico y bonos actualizados ✓');
}
// Se guarda de inmediato (no hay botón "Guardar" para esto) — afecta basicoQ2()/netoQ2() de
// TODOS los meses de una vez (ver diasQ2 en nomina-calc.js). Reabre Información general dejando
// abierto el editor del mes que se estaba viendo (mesIdx), para no perder el foco a mitad de la
// edición solo por cambiar el modo de cálculo de la quincena 2.
function setQ2DiasFijos(val,año,mesIdx){
  perfilQ2DiasFijos=!!val;
  save();
  render();
  openInfoGeneral(año,mesIdx);
}
function toggleFormula(id){
  const el=document.getElementById(id);
  if(!el) return;
  const willOpen=el.style.display==='none';
  document.querySelectorAll('[id^="fx-"]').forEach(function(other){
    if(other!==el) other.style.display='none';
  });
  el.style.display=willOpen?'block':'none';
}

// La antigua pantalla aparte "Histórico de meses" (openMonthPicker) se integró dentro de
// Información general: la tabla "Básico por mes" de ahí ya trae el punto de estado y la
// navegación (goToMonth) para cada mes real, y "Ver qué falta" reutiliza este mismo toggle.
function toggleMesDetalle(k){
  const el=document.getElementById('ig-detalle-'+k);
  if(!el) return;
  el.style.display=el.style.display==='none'?'block':'none';
}


function goToMonth(k){
  curM=k;
  homeQ=homeQParaMes(db[k]);
  gFiltro={q1:'todos',q2:'todos'};
  gSort={q1:'orden',q2:'orden'};
  gFilterOpen={q1:false,q2:false};
  curTC=null;
  closeModal();render();
}

// Desde "Ver qué falta" en la tabla "Básico por mes" de Información general: salta directo al
// mes/quincena del gasto pendiente y abre su editor, en vez de dejar que el usuario lo busque a
// mano en la lista.
function irAPendienteHistorico(k,gastoId,which){
  goToMonth(k);
  curTab=0; // Inicio: ahí viven las listas de gastos Q1/Q2
  const m=getM();
  const list=which==='q1'?(m.q1_gastos||[]):(m.q2_gastos||[]);
  const g=list.find(function(x){return x.id===gastoId;});
  if(g&&g.parentId) gGroupOpen[g.parentId]=true; // si es hijo de un grupo colapsado, despliégalo
  render();
  if(g) openGasto(g,which);
  else toast('No se encontró ese gasto (¿se eliminó?)');
}

// Confirmación de borrado de un mes puntual — se llega acá desde la papelera de cada fila en
// el selector de mes del header (ver renderHeaderMonthPanel en render.js), que ya oculta esa
// papelera cuando solo queda un mes (siempre debe quedar al menos uno en la app).
function confirmDeleteMonth(key){
  const mes=db[key];
  openModal('<div class="mtitle">¿Eliminar '+mes.nombre+'?</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Se eliminarán todos los datos de <b style="color:var(--txt)">'+mes.nombre+' '+mes.año+'</b> incluyendo gastos, tarjeta y nómina. Esta acción <b style="color:var(--red)">no se puede deshacer</b>.</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" style="background:var(--red);color:#fff" onclick="deleteMonth('+key+')">Eliminar</button>'
    +'</div>');
}

function deleteMonth(key){
  const keys=Object.keys(db).map(Number);
  if(keys.length<=1){closeModal();return;}
  delete db[key];
  // Reindex to keep keys sequential
  const sorted=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  const newDb={};
  sorted.forEach(function(k,i){ newDb[i]=db[k]; });
  db=newDb;
  // Adjust curM
  const newKeys=Object.keys(db).map(Number);
  curM=Math.min(curM,Math.max(...newKeys));
  gFiltro={q1:'todos',q2:'todos'};
  gSort={q1:'orden',q2:'orden'};
  gFilterOpen={q1:false,q2:false};
  save();closeModal();render();toast('Mes eliminado');
}

function openNewMonth(){
  const keys=Object.keys(db).map(Number),last=Math.max(...keys),lm=db[last];
  // Mismo caso especial que buildDraftMonth() (gasto-estado.js): Diciembre → Enero del año
  // siguiente. Antes de este fix, esta vista previa (y el título del botón) mostraban el mismo
  // "Mes N" del año viejo que terminó creando buildDraftMonth, por la misma causa: sin este caso
  // especial, MESES.indexOf('Diciembre')+1 (=12) no existe en el arreglo.
  const idxMesAnterior=MESES.indexOf(lm.nombre);
  var sig, sigAño;
  if(idxMesAnterior===11){ sig=MESES[0]; sigAño=(lm.año||new Date().getFullYear())+1; }
  else if(idxMesAnterior>=0){ sig=MESES[idxMesAnterior+1]; sigAño=lm.año; }
  else { sig='Mes '+(last+2); sigAño=lm.año; }
  openModal('<div class="mtitle">Nuevo mes</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Se creará <b style="color:var(--txt)">'+sig+' '+sigAño+'</b> copiando la estructura de <b style="color:var(--txt)">'+lm.nombre+'</b>. Los gastos quedan pendientes y la tarjeta empieza vacía.</p>'
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="createMonth()">Crear '+sig+'</button></div>');
}
// A qué (año, mes, quincena) pertenece una cuota según su fecha real de vencimiento — no es
// simplemente "día≤15 → Q1 del mismo mes": los primeros 10 días del mes se consideran parte
// del Q2 del mes ANTERIOR (para que la cuota se vea con tiempo de pagarla antes de que venza,
// en vez de aparecer recién el mismo día 1). Si sigue sin pagar cuando el mes siguiente ya
// existe, moverCuotasVencidasAlMesSiguiente() la reubica en Q1 de ese mes como vencida.
function calcQuincenaCuota(fechaDate){
  var dia=fechaDate.getDate(), y=fechaDate.getFullYear(), m=fechaDate.getMonth();
  if(dia<=10){
    m=m-1;
    if(m<0){ m=11; y=y-1; }
    return {año:y,mes:m,which:'q2'};
  }
  if(dia<=15) return {año:y,mes:m,which:'q1'};
  return {año:y,mes:m,which:'q2'};
}

// Al crear un mes nuevo (nm), revisa la Q2 del mes anterior (lm) por cuotas de crédito que se
// hayan generado ahí por la regla de gracia de los primeros 10 días (ver calcQuincenaCuota) y
// que sigan sin pagar: si el mes al que en verdad pertenecen esa cuota (por calendario) es nm,
// ya no tiene sentido dejarla esperando en el mes anterior — se traslada (no se duplica) a
// Q1 de nm, donde calcQuincenaCuota la ubicaría con la regla simple (día≤15 → Q1).
function moverCuotasVencidasAlMesSiguiente(lm,nm){
  if(!lm||!nm) return;
  const miNm=MESES.indexOf(nm.nombre);
  const q2=lm.q2_gastos||[];
  const aMover=q2.filter(function(g){
    if(!g.creditoId||g.pagado_flag||g.sinpagar) return false;
    var cr=creditos[g.creditoId]; if(!cr) return false;
    var row=calcAmortizacion(cr).rows[g.numCuota-1]; if(!row) return false;
    var bucket=calcQuincenaCuota(new Date(row.fecha+'T12:00:00'));
    return bucket.año===nm.año&&bucket.mes===miNm&&bucket.which==='q2';
  });
  if(!aMover.length) return;
  var aMoverIds=new Set(aMover.map(function(g){return g.id;}));
  lm.q2_gastos=q2.filter(function(g){return !aMoverIds.has(g.id);});
  if(!Array.isArray(nm.q1_gastos)) nm.q1_gastos=[];
  aMover.forEach(function(g){ nm.q1_gastos.push(g); });
}

// Un crédito que YA tiene alguna cuota vinculada a una deducción de nómina (ej. libranzas tipo
// "fondo de empleados") se asume manejado por nómina de ahí en adelante — sus cuotas
// FUTURAS tampoco deben sugerirse como gasto, aunque esa cuota puntual todavía no tenga
// deducción creada (el usuario la crea manualmente en Nómina cada periodo). Sin esto, cada mes
// nuevo seguía sugiriendo un gasto para la próxima cuota de un crédito que en realidad se paga
// solo, descontado de la nómina.
function creditoManejadoPorNomina(crId){
  return Object.values(db).some(function(mes){
    var nom=mes.nomina; if(!nom) return false;
    return ['ded_q1','ded_q2'].some(function(key){
      return (nom[key]||[]).some(function(d){return d.creditoId===crId;});
    });
  });
}

function generarGastosCredito(nm){
  // Para cada crédito activo, revisar si alguna cuota cae en el mes nm (según su bucket
  // año/mes/quincena real, no el mes calendario crudo de la fecha — ver calcQuincenaCuota).
  const mi=MESES.indexOf(nm.nombre);
  const año=nm.año;
  if(!Array.isArray(nm.q1_gastos)) nm.q1_gastos=[];
  if(!Array.isArray(nm.q2_gastos)) nm.q2_gastos=[];
  Object.keys(creditos).forEach(function(crId){
    // Aislado por crédito: si uno tiene datos corruptos (ej. de un import roto o una edición
    // manual de localStorage) y calcAmortizacion() lanza, antes eso rompía la generación de
    // TODO el mes nuevo (incluidos los créditos sanos) — ahora ese crédito simplemente no
    // genera su gasto este mes, y el resto sigue igual. Queda en consola para investigarlo.
    try{
      if(creditoManejadoPorNomina(crId)) return;
      var cr=creditos[crId];
      var amort=calcAmortizacion(cr);
      // Cuotas ya cubiertas por un gasto O por una deducción de nómina — si no se revisa también
      // la nómina, un crédito así termina con un gasto duplicado además de su deducción real.
      var usadas=cuotasOcupadasCredito(crId);
      amort.rows.forEach(function(row,idx){
        var fecha=new Date(row.fecha+'T12:00:00');
        var bucket=calcQuincenaCuota(fecha);
        if(bucket.año===año && bucket.mes===mi){
          var which=bucket.which;
          var list=which==='q1'?nm.q1_gastos:nm.q2_gastos;
          if(!usadas[row.numero]){
            list.push({
              id:uid(),
              nombre:prefijoCredito(cr)+cr.nombre,
              presupuesto:row.valorCuota,
              metodo:'Nequi',
              pagado_real:null,
              estado:(cr.pagos&&cr.pagos[idx])?'pagado':null,
              pagado_flag:!!(cr.pagos&&cr.pagos[idx]),
              sinpagar:false,
              parentId:null,
              esGrupo:false,
              cuotas_total:cr.cuotas,
              cuota_actual:row.numero,
              creditoId:crId,
              numCuota:row.numero,
              fecha_pago:null,
              comprobante:null
            });
          }
        }
      });
    }catch(err){
      console.error('No se pudo generar el gasto del crédito "'+(creditos[crId]&&creditos[crId].nombre)+'" para '+nm.nombre+' '+nm.año+':',err);
    }
  });
}

