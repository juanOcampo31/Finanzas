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


function openOverflowMenu(){
  const icCloud='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>';
  const icTrash='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
  const icList='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
  const icLock='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  const icCal='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const icInfo='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  openModal('<div class="mtitle">Más opciones</div>'
    +'<div style="display:flex;flex-direction:column">'
    +'<div onclick="closeModal();openInfoGeneral()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer;color:var(--acc)">'
    +icInfo+'<span style="font-size:14px;color:var(--txt)">Información general</span></div>'
    +'<div onclick="closeModal();openMonthPicker()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer;color:var(--acc)">'
    +icCal+'<span style="font-size:14px;color:var(--txt)">Histórico de meses</span></div>'
    +'<div onclick="closeModal();openCatalogosMenu()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer;color:var(--acc)">'
    +icList+'<span style="font-size:14px;color:var(--txt)">Catálogos</span></div>'
    +'<div onclick="closeModal();openBackupMenu()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer;color:var(--acc)">'
    +icCloud+'<span style="font-size:14px;color:var(--txt)">Respaldar información</span></div>'
    +'<div onclick="closeModal();openSecurityMenu()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;border-bottom:1px solid var(--brd);cursor:pointer;color:var(--acc)">'
    +icLock+'<span style="font-size:14px;color:var(--txt)">Seguridad</span></div>'
    +'<div onclick="closeModal();openDeleteMonth()" style="display:flex;align-items:center;gap:14px;padding:14px 4px;cursor:pointer;color:var(--red)">'
    +icTrash+'<span style="font-size:14px;color:var(--red)">Eliminar mes</span></div>'
    +'</div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
}

function openInfoGeneral(){
  // Recolectar el básico de cada mes del año actual (Enero a Diciembre)
  const año=getM().año;
  const mesesDelAño={};
  const bonosDelAño={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año){
      var idx=MESES.indexOf(mes.nombre);
      if(idx>=0){
        mesesDelAño[idx]=mes.nomina?mes.nomina.basico_total||0:0;
        bonosDelAño[idx]=mes.nomina?mes.nomina.bonos_total||0:0;
      }
    }
  });

  // Para meses sin crear, sugerir el básico del último mes existente anterior
  var basicoConSugerido={};
  var bonoConSugerido={};
  var ultimoBasico=null;
  var ultimoBono=null;
  var esSugerido={};
  for(var i=0;i<=11;i++){
    if(mesesDelAño[i]!==undefined){
      basicoConSugerido[i]=mesesDelAño[i];
      bonoConSugerido[i]=bonosDelAño[i]||0;
      ultimoBasico=mesesDelAño[i];
      ultimoBono=bonosDelAño[i]||0;
      esSugerido[i]=false;
    } else if(ultimoBasico!==null){
      basicoConSugerido[i]=ultimoBasico;
      bonoConSugerido[i]=ultimoBono;
      esSugerido[i]=true;
    } else {
      basicoConSugerido[i]=0;
      bonoConSugerido[i]=0;
      esSugerido[i]=true;
    }
  }

  // Construir tabla de los 12 meses: Mes | Básico | Prom. Mensual (aporte a prima)
  var tableRows=MESES.map(function(nombre,i){
    var basico=basicoConSugerido[i];
    var bono=bonoConSugerido[i];
    var sugerido=esSugerido[i];
    var aportePrima=(basico*30)/360;
    // % de cambio del básico respecto al mes anterior
    var cambioBasicoHtml='';
    var subioB=null;
    if(i>0 && !sugerido && !esSugerido[i-1]){
      var basicoAnterior=basicoConSugerido[i-1];
      if(basicoAnterior>0 && basico!==basicoAnterior){
        var pctB=((basico-basicoAnterior)/basicoAnterior)*100;
        subioB=pctB>0;
        cambioBasicoHtml='<span style="font-size:10px;font-weight:700;color:var(--'+(subioB?'grn':'red')+');margin-left:6px;display:inline-flex;align-items:center;gap:2px;vertical-align:middle">'
          +icon(subioB?'arrowUp':'arrowDown',10)+Math.abs(pctB).toFixed(1)+'%</span>';
      }
    }
    var calIconColor=sugerido?'var(--mut)':(subioB===true?'var(--grn)':subioB===false?'var(--red)':'var(--acc)');
    // % de cambio del bono respecto al mes anterior
    var cambioBonoHtml='';
    if(i>0 && !sugerido && !esSugerido[i-1]){
      var bonoAnterior=bonoConSugerido[i-1];
      if(bonoAnterior>0 && bono!==bonoAnterior){
        var pctBo=((bono-bonoAnterior)/bonoAnterior)*100;
        var subioBo=pctBo>0;
        cambioBonoHtml='<span style="font-size:10px;font-weight:700;color:var(--'+(subioBo?'grn':'red')+');margin-left:6px;display:inline-flex;align-items:center;gap:2px;vertical-align:middle">'
          +icon(subioBo?'arrowUp':'arrowDown',10)+Math.abs(pctBo).toFixed(1)+'%</span>';
      }
    }
    return '<tr style="border-bottom:1px solid var(--brd)">'
      +'<td style="padding:7px 10px;font-size:12px;color:var(--txt)"><span style="display:inline-flex;align-items:center;gap:7px;vertical-align:middle">'
      +'<span style="color:'+calIconColor+';display:inline-flex">'+icon('cal',13)+'</span>'
      +nombre+(sugerido?'<span style="font-size:9px;color:var(--amb);margin-left:2px">(sug.)</span>':'')+'</span></td>'
      +'<td style="padding:7px 10px;font-size:12px;text-align:right;color:'+(sugerido?'var(--mut)':'var(--txt)')+'">'+cop(basico)+cambioBasicoHtml+'</td>'
      +'<td style="padding:7px 10px;font-size:12px;text-align:right;color:var(--acc);font-weight:600">'+cop(aportePrima)+'</td>'
      +'<td style="padding:7px 10px;font-size:12px;text-align:right;color:'+(sugerido?'var(--mut)':'var(--pur)')+'">'+cop(bono)+cambioBonoHtml+'</td>'
      +'</tr>';
  }).join('');
  var tableHtml='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">'
    +'<thead><tr style="border-bottom:1px solid var(--brd2)">'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:left;text-transform:uppercase;letter-spacing:.04em">Mes</th>'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:right;text-transform:uppercase;letter-spacing:.04em">Básico</th>'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:right;text-transform:uppercase;letter-spacing:.04em">Prom. Mensual</th>'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:right;text-transform:uppercase;letter-spacing:.04em">Bonos</th>'
    +'</tr></thead><tbody>'+tableRows+'</tbody></table></div>';

  // Prima primer semestre: (Enero*30/360) + (Febrero*30/360) + ... + (Junio*30/360)
  var primaS1=0, s1TieneSugeridos=false;
  for(var i=0;i<=5;i++){
    primaS1 += (basicoConSugerido[i]*30)/360;
    if(esSugerido[i]) s1TieneSugeridos=true;
  }
  // Prima segundo semestre: (Julio*30/360) + ... + (Diciembre*30/360)
  var primaS2=0, s2TieneSugeridos=false;
  for(var i=6;i<=11;i++){
    primaS2 += (basicoConSugerido[i]*30)/360;
    if(esSugerido[i]) s2TieneSugeridos=true;
  }
  primaS1=Math.round(primaS1);
  primaS2=Math.round(primaS2);

  // Cesantías: suma de los 12 promedios mensuales (básico*30/360) de todo el año
  var sumaCesantias=0, añoTieneSugeridos=false;
  for(var i=0;i<=11;i++){
    sumaCesantias += (basicoConSugerido[i]*30)/360;
    if(esSugerido[i]) añoTieneSugeridos=true;
  }
  var cesantias=Math.round(sumaCesantias);
  var interesesCesantias=Math.round(cesantias*0.12);
  var avisoAño=añoTieneSugeridos?'<div style="font-size:11px;color:var(--amb);margin-top:2px;display:flex;align-items:center;gap:5px">'+icon('alertTriangle',12)+'Incluye meses sugeridos (sin crear aún)</div>':'';

  function resumenCard(fxId,iconName,iconColor,iconBg,label,valor){
    return '<button onclick="toggleFormula(\''+fxId+'\')" style="background:var(--surf2);border:none;border-radius:var(--r2);padding:12px;text-align:left;cursor:pointer;min-width:0">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
      +'<div style="width:24px;height:24px;border-radius:7px;background:'+iconBg+';color:'+iconColor+';display:flex;align-items:center;justify-content:center;flex-shrink:0">'+icon(iconName,13)+'</div>'
      +'<span style="font-size:9px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+label+'</span>'
      +'</div>'
      +'<div style="font-size:16px;font-weight:800;color:var(--txt)">'+cop(valor)+'</div>'
      +'</button>';
  }
  var resumenPills='<div class="card" style="margin-bottom:10px">'
    +'<div class="chead"><div style="display:flex;align-items:center;gap:8px">'
    +'<div style="width:26px;height:26px;border-radius:8px;background:var(--acc-d);color:var(--acc);display:flex;align-items:center;justify-content:center">'+icon('barChart',14)+'</div>'
    +'<span class="ctitle">Resumen anual</span></div></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px">'
    +resumenCard('fx-primaj','dollar','var(--acc)','var(--acc-d)','Prima Junio',primaS1)
    +resumenCard('fx-primad','dollar','var(--pur)','var(--pur-d)','Prima Diciembre',primaS2)
    +resumenCard('fx-cesantias','calculator','var(--grn)','var(--grn-d)','Cesantías',cesantias)
    +resumenCard('fx-intereses','percent','var(--amb)','var(--amb-d)','Int. cesantías',interesesCesantias)
    +'</div>'
    +'<div id="fx-primaj" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Enero a Junio: Σ (básico × 30 ÷ 360)'+(s1TieneSugeridos?' · incluye meses sugeridos':'')+'</div>'
    +'<div id="fx-primad" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Julio a Diciembre: Σ (básico × 30 ÷ 360)'+(s2TieneSugeridos?' · incluye meses sugeridos':'')+'</div>'
    +'<div id="fx-cesantias" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Enero a Diciembre: Σ (básico × 30 ÷ 360)'+(añoTieneSugeridos?' · incluye meses sugeridos':'')+'</div>'
    +'<div id="fx-intereses" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Cesantías × 0.12 = '+cop(cesantias)+' × 0.12</div>'
    +'</div>';

  openModal('<div class="mtitle">Información general '+año+'</div>'
    +'<p style="font-size:12px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Básico mensual de cada mes del año y cálculo de prima de servicios (básico ÷ 30, sumado por semestre). Los meses sin crear toman el básico del último mes existente como sugerencia.</p>'
    +'<div class="card" style="margin-bottom:10px">'
    +'<div class="chead"><div style="display:flex;align-items:center;gap:8px">'
    +'<div style="width:26px;height:26px;border-radius:8px;background:var(--acc-d);color:var(--acc);display:flex;align-items:center;justify-content:center">'+icon('cal',14)+'</div>'
    +'<span class="ctitle">Básico por mes</span></div></div>'
    +tableHtml
    +'</div>'
    +resumenPills
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
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

function openMonthPicker(){
  const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  const monthList=keys.map(function(k){
    const mes=db[k];
    const isCur=k===curM;
    const r=calcPctPagadoMes(mes);
    const total=r.total, pagado=r.pagado, pct=r.pct;
    const ringColor=pct>=75?'var(--grn)':pct>=25?'var(--amb)':'var(--red)';
    const estadoTxt=isCur?'Actual':(pct>=75?'Completado':pct>=25?'En progreso':'Pendiente');
    const estadoColor=isCur?'var(--acc)':(pct>=75?'var(--grn)':pct>=25?'var(--amb)':'var(--red)');
    // Detalle de qué falta: solo tiene sentido mostrarlo si el % no es 100 — evita que el
    // usuario tenga que abrir la consola del navegador para saber qué gasto sigue arrastrando
    // el total hacia abajo.
    const tieneFaltantes=r.pendientes.length>0;
    const detalleHtml=tieneFaltantes?('<div id="mp-detalle-'+k+'" style="display:none;margin:0 0 8px;padding:8px 10px;background:var(--surf2);border-radius:var(--r2)">'
      +r.pendientes.map(function(p){
        return '<div onclick="event.stopPropagation();irAPendienteHistorico('+k+',\''+p.id+'\',\''+p.which.toLowerCase()+'\')" style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:5px 4px;cursor:pointer;border-radius:6px">'
          +'<span style="color:var(--acc);display:flex;align-items:center;gap:3px">'+esc(p.which)+' · '+esc(p.nombre||'(sin nombre)')+icon('chevronRight',11)+'</span><span style="color:var(--txt)">'+cop(p.presupuesto)+'</span></div>';
      }).join('')
      +'</div>'):'';
    return '<div style="border-bottom:1px solid var(--brd);padding:11px 0">'
      +'<div onclick="goToMonth('+k+')" style="display:flex;align-items:center;gap:10px;cursor:pointer">'
      +'<div style="width:30px;height:30px;border-radius:8px;background:'+(isCur?'var(--acc-d)':'var(--surf2)')+';color:'+(isCur?'var(--acc)':'var(--mut)')+';display:flex;align-items:center;justify-content:center;flex-shrink:0">'+icon('cal',15)+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:13px;font-weight:'+(isCur?'700':'500')+';color:'+(isCur?'var(--acc)':'var(--txt)')+'">'+mes.nombre+' '+mes.año+'</div>'
      +(tieneFaltantes?'<div onclick="event.stopPropagation();toggleMesDetalle('+k+')" style="font-size:10px;color:var(--acc);cursor:pointer;margin-top:2px">Ver qué falta ('+r.pendientes.length+') ▾</div>':'')
      +'</div>'
      +'<div style="position:relative;width:40px;height:40px;flex-shrink:0">'
      +'<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient('+ringColor+' '+(pct*3.6)+'deg,var(--brd) 0deg)"></div>'
      +'<div style="position:absolute;inset:4px;border-radius:50%;background:var(--surf);display:flex;align-items:center;justify-content:center">'
      +'<span style="font-size:10px;font-weight:800;color:var(--txt)">'+pct+'%</span>'
      +'</div></div>'
      +'<div style="text-align:right;flex-shrink:0;min-width:0">'
      +'<div style="font-size:11px;font-weight:700;color:'+estadoColor+'">'+estadoTxt+'</div>'
      +'<div style="font-size:10px;color:var(--mut);white-space:nowrap">'+cop(pagado)+' / '+cop(total)+'</div>'
      +'</div>'
      +'</div>'
      +detalleHtml
      +'</div>';
  }).join('');
  const legend='<div style="display:flex;justify-content:center;gap:14px;margin-top:14px;padding-top:10px;border-top:1px solid var(--brd)">'
    +'<span style="font-size:10px;color:var(--mut);display:flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:var(--red);display:inline-block"></span>0 - 25%</span>'
    +'<span style="font-size:10px;color:var(--mut);display:flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:var(--amb);display:inline-block"></span>25 - 75%</span>'
    +'<span style="font-size:10px;color:var(--mut);display:flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:var(--grn);display:inline-block"></span>75 - 100%</span>'
    +'</div>';
  openModal('<div class="mtitle">Seleccionar mes</div>'+monthList+legend);
}
function toggleMesDetalle(k){
  const el=document.getElementById('mp-detalle-'+k);
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

// Desde "Ver qué falta" en Histórico de meses: salta directo al mes/quincena del gasto
// pendiente y abre su editor, en vez de dejar que el usuario lo busque a mano en la lista.
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

function openDeleteMonth(){
  const keys=Object.keys(db).map(Number);
  const m=getM();
  // Can't delete if only one month left
  if(keys.length<=1){
    openModal('<div class="mtitle">No se puede eliminar</div>'
      +'<p style="font-size:13px;color:var(--mut);margin-bottom:16px">Debe quedar al menos un mes en la app.</p>'
      +'<div class="macts"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
    return;
  }
  // Build list of all months
  const monthList=keys.sort(function(a,b){return a-b;}).map(function(k){
    const mes=db[k];
    const gastos=(mes.q1_gastos||[]).length+(mes.q2_gastos||[]).length;
    const tc=Object.values(mes.tarjetas||{}).reduce(function(a,t){return a+(t.movimientos||[]).length;},0);
    const isCur=k===curM;
    return '<div onclick="confirmDeleteMonth('+k+')" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--brd);cursor:pointer'+(isCur?';background:var(--acc-d);margin:0 -18px;padding:10px 18px':'')+';">'
      +'<div>'
      +'<div style="font-size:13px;font-weight:600;color:var(--txt)">'+mes.nombre+' '+mes.año+(isCur?' <span style="font-size:10px;color:var(--acc)">actual</span>':'')+'</div>'
      +'<div style="font-size:11px;color:var(--mut);margin-top:1px">'+gastos+' gastos · '+tc+' mov. tarjeta</div>'
      +'</div>'
      +'<span style="color:var(--red);padding-left:12px;display:flex;align-items:center">'+icon('trash',16)+'</span>'
      +'</div>';
  }).join('');
  openModal('<div class="mtitle">Eliminar mes</div>'
    +'<p style="font-size:12px;color:var(--mut);margin-bottom:12px">Selecciona el mes que deseas eliminar. Esta acción no se puede deshacer.</p>'
    +monthList);
}

function confirmDeleteMonth(key){
  const mes=db[key];
  openModal('<div class="mtitle">¿Eliminar '+mes.nombre+'?</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Se eliminarán todos los datos de <b style="color:var(--txt)">'+mes.nombre+' '+mes.año+'</b> incluyendo gastos, tarjeta y nómina. Esta acción <b style="color:var(--red)">no se puede deshacer</b>.</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openDeleteMonth()">Cancelar</button>'
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
  const sig=MESES[MESES.indexOf(lm.nombre)+1]||('Mes '+(last+2));
  openModal('<div class="mtitle">Nuevo mes</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Se creará <b style="color:var(--txt)">'+sig+' '+lm.año+'</b> copiando la estructura de <b style="color:var(--txt)">'+lm.nombre+'</b>. Los gastos quedan pendientes y la tarjeta empieza vacía.</p>'
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

