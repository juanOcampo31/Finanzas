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
function openInfoGeneral(añoSel,mesEditIdx){
  const añosDisponibles=Array.from(new Set(Object.keys(db).map(function(k){return db[k].año;}))).sort(function(a,b){return a-b;});
  const año=(añoSel!=null && añosDisponibles.indexOf(añoSel)>=0)?añoSel:getM().año;
  // Recolectar el básico de cada mes del año seleccionado (Enero a Diciembre)
  const mesesDelAño={};
  const bonosDelAño={};
  // Antes vivía en la pantalla aparte "Histórico de meses" (openMonthPicker, ya removida): qué
  // mes real corresponde a cada índice del año, para poder navegar (goToMonth) y calcular el
  // estado de pago (calcPctPagadoMes) de cada fila de la tabla de abajo.
  const keyPorIndice={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año){
      var idx=MESES.indexOf(mes.nombre);
      if(idx>=0){
        mesesDelAño[idx]=mes.nomina?mes.nomina.basico_total||0:0;
        bonosDelAño[idx]=mes.nomina?mes.nomina.bonos_total||0:0;
        keyPorIndice[idx]=Number(k);
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
    // Gráfico de estado + navegación: solo tiene sentido en meses REALES (un mes "sugerido"
    // todavía no existe, no hay a dónde navegar ni nada que calcular). Mismo criterio de color
    // que usaba "Histórico de meses" (rojo <25%, ámbar 25-75%, verde ≥75%).
    var estadoHtml='', verFaltaHtml='', detalleRowHtml='', trOpen;
    if(!sugerido){
      var kMes=keyPorIndice[i];
      var r=calcPctPagadoMes(db[kMes]);
      var estadoColor=r.total===0?'var(--brd2)':r.pct>=75?'var(--grn)':r.pct>=25?'var(--amb)':'var(--red)';
      estadoHtml='<span title="'+r.pct+'% pagado" style="width:8px;height:8px;border-radius:50%;background:'+estadoColor+';display:inline-block;flex-shrink:0"></span>';
      if(r.pendientes.length>0){
        verFaltaHtml='<div onclick="event.stopPropagation();toggleMesDetalle('+kMes+')" style="font-size:9px;color:var(--acc);cursor:pointer;margin-top:1px">Ver qué falta ('+r.pendientes.length+')</div>';
        detalleRowHtml='<tr id="ig-detalle-'+kMes+'" style="display:none;background:rgba(0,0,0,.12)"><td colspan="4" style="padding:2px 10px 8px 30px">'
          +r.pendientes.map(function(p){
            return '<div onclick="event.stopPropagation();irAPendienteHistorico('+kMes+',\''+p.id+'\',\''+p.which.toLowerCase()+'\')" style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:5px 4px;cursor:pointer;border-radius:6px">'
              +'<span style="color:var(--acc);display:flex;align-items:center;gap:3px">'+esc(p.which)+' · '+esc(p.nombre||'(sin nombre)')+icon('chevronRight',11)+'</span><span style="color:var(--txt)">'+cop(p.presupuesto)+'</span></div>';
          }).join('')
          +'</td></tr>';
      }
      trOpen='<tr onclick="goToMonth('+kMes+')" style="border-bottom:1px solid var(--brd);cursor:pointer">';
    } else {
      trOpen='<tr style="border-bottom:1px solid var(--brd)">';
    }
    return trOpen
      +'<td style="padding:7px 10px;font-size:12px;color:var(--txt)"><span style="display:inline-flex;align-items:center;gap:7px;vertical-align:middle">'
      +estadoHtml
      +'<span style="color:'+calIconColor+';display:inline-flex">'+icon('cal',13)+'</span>'
      +nombre+(sugerido?'<span style="font-size:9px;color:var(--amb);margin-left:2px">(sug.)</span>':'')+'</span>'
      +verFaltaHtml+'</td>'
      +'<td style="padding:7px 10px;font-size:12px;text-align:right;color:'+(sugerido?'var(--mut)':'var(--txt)')+'">'+cop(basico)+cambioBasicoHtml+'</td>'
      +'<td style="padding:7px 10px;font-size:12px;text-align:right;color:var(--acc);font-weight:600">'+cop(aportePrima)+'</td>'
      +'<td style="padding:7px 10px;font-size:12px;text-align:right;color:'+(sugerido?'var(--mut)':'var(--pur)')+'">'+cop(bono)+cambioBonoHtml+'</td>'
      +'</tr>'
      +detalleRowHtml;
  }).join('');
  var tableHtml='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">'
    +'<thead><tr style="border-bottom:1px solid var(--brd2)">'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:left;text-transform:uppercase;letter-spacing:.04em">Mes</th>'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:right;text-transform:uppercase;letter-spacing:.04em">Básico</th>'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:right;text-transform:uppercase;letter-spacing:.04em">Prom. Mensual</th>'
    +'<th style="padding:6px 10px;font-size:10px;color:var(--mut);text-align:right;text-transform:uppercase;letter-spacing:.04em">Bonos</th>'
    +'</tr></thead><tbody>'+tableRows+'</tbody></table></div>'
    +'<div style="display:flex;justify-content:center;gap:12px;padding:10px 0 2px;border-top:1px solid var(--brd)">'
    +'<span style="font-size:9px;color:var(--mut);display:flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:var(--red);display:inline-block"></span>0-25% pagado</span>'
    +'<span style="font-size:9px;color:var(--mut);display:flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:var(--amb);display:inline-block"></span>25-75%</span>'
    +'<span style="font-size:9px;color:var(--mut);display:flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:var(--grn);display:inline-block"></span>75-100%</span>'
    +'</div>';

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

  // "Actual" vs "Estimado": lo de arriba (basicoConSugerido) es el ESTIMADO de siempre — rellena
  // los meses que todavía no existen con el básico del último mes real, como si todo el año
  // hubiera cotizado normal desde que se empezó a usar la app. El ACTUAL, en cambio, solo suma
  // meses que YA existen como registro (sin rellenar huecos futuros) y usa lo REALMENTE
  // recibido por quincena (basicoQ1+basicoQ2) en vez del básico teórico del mes completo — así
  // el primer mes, si arrancó en la quincena 2 (q1NoTrackeada, ver confirmarPrimeraConfiguracion
  // en auth.js), no infla la prima/cesantías con una Q1 que nunca se registró.
  var basicoActualPorMes={};
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    if(mes.año===año){
      var idx=MESES.indexOf(mes.nombre);
      if(idx>=0) basicoActualPorMes[idx]=(basicoQ1(mes)||0)+(basicoQ2(mes)||0);
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

  function resumenCard(fxId,iconName,iconColor,iconBg,label,valorActual,valorEstimado){
    return '<button onclick="toggleFormula(\''+fxId+'\')" style="background:var(--surf2);border:none;border-radius:var(--r2);padding:12px;text-align:left;cursor:pointer;min-width:0">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
      +'<div style="width:24px;height:24px;border-radius:7px;background:'+iconBg+';color:'+iconColor+';display:flex;align-items:center;justify-content:center;flex-shrink:0">'+icon(iconName,13)+'</div>'
      +'<span style="font-size:9px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+label+'</span>'
      +'</div>'
      +'<div style="font-size:16px;font-weight:800;color:var(--txt)">'+cop(valorActual)+'</div>'
      +'<div style="font-size:10px;color:var(--mut);margin-top:2px">Estimado '+cop(valorEstimado)+'</div>'
      +'</button>';
  }
  // Cálculo de la quincena 2 (perfilQ2DiasFijos, ver diasQ2 en nomina-calc.js) — decide
  // basicoQ2() de cada mes, así que vive dentro del panel "Editar salario y bonos" (más abajo),
  // junto a lo demás que afecta el básico/bonos de un mes.
  var q2ToggleHtml='<div style="padding:2px 16px 14px">'
    +'<div style="font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Cálculo de la quincena 2</div>'
    +'<div class="trow2" style="margin-bottom:6px">'
    +'<button class="topt'+(!perfilQ2DiasFijos?' sa':'')+'" onclick="setQ2DiasFijos(false,'+año+')">Automático</button>'
    +'<button class="topt'+(perfilQ2DiasFijos?' sa':'')+'" onclick="setQ2DiasFijos(true,'+año+')">15 días fijos</button>'
    +'</div>'
    +'<div style="font-size:11px;color:var(--mut);line-height:1.5">'
    +(perfilQ2DiasFijos
      ?'La quincena 2 siempre se calcula como 15 días, sin importar el mes.'
      :'La quincena 2 se calcula con los días reales del mes (13 a 16, según el mes).')
    +'</div></div>';
  // Editar salario y bonos de cualquier mes ya creado del año, sin salir de Información general
  // (antes solo se podía desde editBasico() en la pestaña Nómina, y solo para el mes abierto en
  // ese momento). Reutiliza la misma fórmula de saveBasico() (tarjeta.js) para no duplicar la
  // lógica de Q1/Q2. Solo tiene sentido si hay al menos un mes real creado en el año.
  var mesesRealesIdx=Object.keys(keyPorIndice).map(function(x){return parseInt(x);}).sort(function(a,b){return a-b;});
  var editarSalarioHtml='';
  if(mesesRealesIdx.length){
    var mActualIdx=MESES.indexOf(getM().nombre);
    var mesEditActual=(mesEditIdx!=null && keyPorIndice[mesEditIdx]!==undefined)?mesEditIdx
      :(getM().año===año && keyPorIndice[mActualIdx]!==undefined)?mActualIdx
      :mesesRealesIdx[mesesRealesIdx.length-1];
    var kEdit=keyPorIndice[mesEditActual];
    var mEdit=db[kEdit], nEdit=getNom(mEdit);
    var diasEdit=diasQ2(mEdit.año,mesEditActual);
    var mesEditOpts=mesesRealesIdx.map(function(idx){return '<option value="'+idx+'"'+(idx===mesEditActual?' selected':'')+'>'+MESES[idx]+'</option>';}).join('');
    editarSalarioHtml='<div class="card" style="margin-bottom:10px">'
      +'<div class="chead"><div style="display:flex;align-items:center;gap:8px">'
      +'<div style="width:26px;height:26px;border-radius:8px;background:var(--acc-d);color:var(--acc);display:flex;align-items:center;justify-content:center">'+icon('edit',14)+'</div>'
      +'<span class="ctitle">Editar salario y bonos</span></div></div>'
      +'<div style="padding:2px 16px 14px">'
      +'<div class="field" style="margin-bottom:10px"><label>Mes</label>'
      +'<select id="ig-edit-mes" onchange="openInfoGeneral('+año+',parseInt(this.value))">'+mesEditOpts+'</select></div>'
      +'<p style="font-size:11px;color:var(--mut);margin-bottom:10px">Q1 = básico ÷ 2 · Q2 = básico ÷ 30 × '+diasEdit+' días ('+MESES[mesEditActual]+')</p>'
      +'<div class="field"><label>Básico total mes</label>'
      +'<input id="ig-edit-bt" type="text" inputmode="numeric" value="'+moneyInputFmt(nEdit.basico_total)+'" oninput="maskMoneyInput(this)"></div>'
      +'<div class="field"><label>Bonos total mes (solo informativo)</label>'
      +'<input id="ig-edit-bon" type="text" inputmode="numeric" value="'+moneyInputFmt(nEdit.bonos_total)+'" oninput="maskMoneyInput(this)"></div>'
      +'<button class="bpri" style="width:100%;margin-top:4px" onclick="guardarBasicoBonoDesdeInfoGeneral('+kEdit+','+año+','+mesEditActual+')">Guardar</button>'
      +'</div>'
      +'<div style="border-top:1px solid var(--brd)">'+q2ToggleHtml+'</div>'
      +'</div>';
  }
  var resumenPills='<div class="card" style="margin-bottom:10px">'
    +'<div class="chead"><div style="display:flex;align-items:center;gap:8px">'
    +'<div style="width:26px;height:26px;border-radius:8px;background:var(--acc-d);color:var(--acc);display:flex;align-items:center;justify-content:center">'+icon('barChart',14)+'</div>'
    +'<span class="ctitle">Resumen anual</span></div></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px">'
    +resumenCard('fx-primaj','dollar','var(--acc)','var(--acc-d)','Prima Junio',primaS1Actual,primaS1)
    +resumenCard('fx-primad','dollar','var(--pur)','var(--pur-d)','Prima Diciembre',primaS2Actual,primaS2)
    +resumenCard('fx-cesantias','calculator','var(--grn)','var(--grn-d)','Cesantías',cesantiasActual,cesantias)
    +resumenCard('fx-intereses','percent','var(--amb)','var(--amb-d)','Int. cesantías',interesesCesantiasActual,interesesCesantias)
    +'</div>'
    +'<div id="fx-primaj" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Actual: solo meses ya creados, con lo realmente recibido por quincena.<br>Estimado: Enero a Junio, Σ (básico × 30 ÷ 360)'+(s1TieneSugeridos?', incluye meses sugeridos':'')+'.</div>'
    +'<div id="fx-primad" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Actual: solo meses ya creados, con lo realmente recibido por quincena.<br>Estimado: Julio a Diciembre, Σ (básico × 30 ÷ 360)'+(s2TieneSugeridos?', incluye meses sugeridos':'')+'.</div>'
    +'<div id="fx-cesantias" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Actual: solo meses ya creados, con lo realmente recibido por quincena.<br>Estimado: Enero a Diciembre, Σ (básico × 30 ÷ 360)'+(añoTieneSugeridos?', incluye meses sugeridos':'')+'.</div>'
    +'<div id="fx-intereses" style="display:none;padding:0 16px 10px;font-size:11px;color:var(--acc)">Cesantías × 0.12 — Actual: '+cop(cesantiasActual)+' × 0.12. Estimado: '+cop(cesantias)+' × 0.12.</div>'
    +'</div>';

  // Selector de año: solo tiene sentido mostrarlo si hay más de un año con meses creados —
  // con uno solo, un <select> de una sola opción no aporta nada.
  var añoOpts=añosDisponibles.map(function(a){return '<option value="'+a+'"'+(a===año?' selected':'')+'>'+a+'</option>';}).join('');
  var añoSelectorHtml=añosDisponibles.length>1
    ?'<div class="field" style="margin-bottom:14px"><label>Año</label><select id="ig-anio" onchange="openInfoGeneral(parseInt(this.value))">'+añoOpts+'</select></div>'
    :'';

  openModal('<div class="mtitle">Información general'+(añosDisponibles.length>1?'':(' '+año))+'</div>'
    +añoSelectorHtml
    +'<p style="font-size:12px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Básico mensual de cada mes del año y cálculo de prima de servicios (básico ÷ 30, sumado por semestre). Los meses sin crear toman el básico del último mes existente como sugerencia. Toca un mes ya creado (el punto de color indica qué tanto está pagado) para ir directo a él.</p>'
    +'<div class="card" style="margin-bottom:10px">'
    +'<div class="chead"><div style="display:flex;align-items:center;gap:8px">'
    +'<div style="width:26px;height:26px;border-radius:8px;background:var(--acc-d);color:var(--acc);display:flex;align-items:center;justify-content:center">'+icon('cal',14)+'</div>'
    +'<span class="ctitle">Básico por mes</span></div></div>'
    +tableHtml
    +'</div>'
    +resumenPills
    +editarSalarioHtml
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" style="grid-column:1/-1" onclick="closeModal()">Cerrar</button></div>');
}
// Mismo cálculo que saveBasico() (tarjeta.js, editor de básico/bonos de la pestaña Nómina) pero
// aplicado a un mes cualquiera del año que se está viendo en Información general, no solo al mes
// abierto actualmente — así se puede corregir el histórico sin tener que navegar mes por mes.
function guardarBasicoBonoDesdeInfoGeneral(k,año,mesIdx){
  const m=db[k], n=getNom(m);
  const bt=moneyVal('ig-edit-bt');
  const bon=moneyVal('ig-edit-bon');
  n.basico_total=bt; n.bonos_total=bon;
  n.basico_q1=basicoQ1({nombre:m.nombre,año:m.año,nomina:{basico_total:bt}});
  n.basico_q2=basicoQ2({nombre:m.nombre,año:m.año,nomina:{basico_total:bt}});
  n.bonos_q1=Math.round(bon/2); n.bonos_q2=Math.round(bon/2);
  save();
  render();
  openInfoGeneral(año,mesIdx);
  toast('Básico y bonos actualizados ✓');
}

// Se guarda de inmediato (no hay botón "Guardar" para esto) — afecta basicoQ2()/netoQ2() de
// TODOS los meses de una vez (ver diasQ2 en nomina-calc.js), así que conviene que el toque
// mismo ya se sienta aplicado: reabre Información general (mismo año que se estaba viendo) con
// el toggle y el Actual/Estimado ya recalculados, en vez de dejarlo pendiente de otra acción.
function setQ2DiasFijos(val,año){
  perfilQ2DiasFijos=!!val;
  save();
  render();
  openInfoGeneral(año);
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
  el.style.display=el.style.display==='none'?'table-row':'none';
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

