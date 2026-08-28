// ── Estado del gasto: null | 'sinpagar' | 'pagado' ──────────────────────────────────────
// Único campo de verdad para "qué es" un gasto — reemplaza los dos checkboxes independientes
// pagado_flag/sinpagar (que permitían las 4 combinaciones de 2 booleanos para un dato de 3
// valores mutuamente excluyentes, incluida la imposible "pagado Y sin pagar"). pagado_flag y
// sinpagar se conservan escritos EN PARALELO (nunca se leen para decidir nada nuevo, solo se
// escriben) porque todavía hay muchos cálculos de totales/listas/orden/exportación que los
// leen directamente — cambiarlos todos a leer `estado` es más riesgo del que vale la pena
// mientras ambas representaciones se mantengan consistentes. gastoEstado() es la única fuente
// de lectura del estado; setGastoEstado() es la única forma de cambiarlo.
function gastoEstado(g){
  if(g.estado!==undefined) return g.estado;
  return g.pagado_flag?'pagado':(g.sinpagar?'sinpagar':null);
}
function setGastoEstado(g,estado){
  g.estado=estado;
  g.pagado_flag=(estado==='pagado');
  g.sinpagar=(estado==='sinpagar');
}
// Migración única e idempotente de pagado_flag/sinpagar → estado, para los gastos guardados
// antes de este cambio (nunca tuvieron el campo `estado`). Si ambos flags legacy estaban en
// true a la vez (el estado imposible que este cambio existe para evitar), gana 'pagado': el
// dinero ya salió, es el hecho más fuerte de los dos.
function migrarEstadoGastos(){
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
      list.forEach(function(g){
        if(g.estado!==undefined) return;
        g.estado=g.pagado_flag?'pagado':(g.sinpagar?'sinpagar':null);
      });
    });
  });
}

// Repara gastos con parentId "huérfano" (apunta a un id que no existe EN SU PROPIA QUINCENA)
// causado por el bug de idMap-por-quincena en buildDraftMonth() (ver comentario ahí). Un
// grupo (ej. "tarjeta") vive independiente en Q1 y en Q2 por diseño — cada quincena tiene su
// propia fila de grupo con sus propios abonos — así que un huérfano de Q1 SOLO puede
// reengancharse a un grupo que también viva en Q1 (nunca al de Q2, y viceversa). Si no hay
// ningún grupo candidato en esa misma quincena, se deja como gasto suelto (parentId=null) en
// vez de dejarlo invisible para siempre.
function repararGastosHuerfanosDeGrupo(){
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [{key:'q1_gastos'},{key:'q2_gastos'}].forEach(function(entry){
      var list=mes[entry.key]||[];
      var idsExistentes=new Set(list.map(function(g){return g.id;}));
      var gruposTarjeta=list.filter(function(g){return g.esGrupo&&g.tcCardId;});
      var tcCardIds=new Set(gruposTarjeta.map(function(g){return g.tcCardId;}));
      list.forEach(function(g){
        if(!g.parentId || idsExistentes.has(g.parentId)) return;
        if(gruposTarjeta.length && tcCardIds.size===1) g.parentId=gruposTarjeta[0].id;
        else g.parentId=null;
      });
    });
  });
}

function buildDraftMonth(){
  const keys=Object.keys(db).map(Number),last=Math.max(...keys),lm=db[last];
  const nk=last+1;
  const nm=migrateMonth(JSON.parse(JSON.stringify(lm)));
  nm.nombre=MESES[MESES.indexOf(lm.nombre)+1]||('Mes '+(nk+1));

  function advanceDate(dateStr){
    if(!dateStr) return null;
    const d = new Date(dateStr+'T12:00:00');
    d.setMonth(d.getMonth()+1);
    return d.toISOString().slice(0,10);
  }
  Object.keys(nm.tarjetas||{}).forEach(function(tid){
    var t=nm.tarjetas[tid];
    t.movimientos=[];
    t.info={
      fechaCorte: advanceDate(t.info?.fechaCorte),
      fechaPago:  advanceDate(t.info?.fechaPago),
      cupo:       t.info?.cupo||null
    };
  });

  // idMap se comparte entre Q1 y Q2 (antes cada quincena tenía el suyo propio): un gasto
  // vinculado por parentId a un grupo (ej. "tarjeta") que vive en la OTRA quincena necesita
  // encontrar el id nuevo de ESE grupo, así que el mapeo de ids viejo→nuevo debe construirse
  // con los grupos de ambas quincenas antes de reajustar ningún parentId. Si no, ese gasto
  // queda con un parentId que ya no existe en el mes nuevo — huérfano, invisible para
  // cualquier lógica de grupo (incluida la de "Histórico de meses"), y se sigue arrastrando
  // mes tras mes aunque se borre, porque el mes SIGUIENTE lo vuelve a copiar igual de roto.
  const idMap = {};
  function copyGastosIds(gastos) {
    return gastos
      .filter(function(g){
        if(g.creditoId) return false;
        if(g.cuotas_total>0&&g.cuota_actual>=g.cuotas_total&&g.pagado_flag) return false;
        return true;
      })
      .map(function(g){
        const newId = uid();
        if(g.esGrupo) idMap[g.id] = newId;
        var nxtCuota = g.cuotas_total>0&&g.pagado_flag&&g.cuota_actual ? g.cuota_actual+1 : g.cuota_actual||0;
        var nxtMens = null;
        if(g.mensualidad){
          if(g.pagado_flag){
            var mp=g.mensualidad.split('-');
            var mY=parseInt(mp[0]),mM=parseInt(mp[1]);
            mM++; if(mM>12){mM=1;mY++;}
            nxtMens=mY+'-'+(mM<10?'0':'')+mM;
          } else {
            nxtMens=g.mensualidad;
          }
        }
        return Object.assign({},g,{
          id: newId,
          // pagado_flag se resetea a false para el mes nuevo (sinpagar, si venía marcado, se
          // conserva tal cual estaba — mismo criterio de antes); estado debe quedar coherente
          // con esa combinación, no simplemente heredado de g.estado.
          estado: g.sinpagar?'sinpagar':null,
          pagado_flag: false,
          pagado_real: null,
          cuota_actual: nxtCuota,
          fecha_pago: null,
          comprobante: null,
          mensualidad: nxtMens
        });
      });
  }
  function remapParents(list){
    return list.map(function(g){
      if(g.parentId && idMap[g.parentId]){
        return Object.assign({},g,{parentId: idMap[g.parentId]});
      }
      return g;
    });
  }

  const q1Copiado = copyGastosIds(nm.q1_gastos);
  const q2Copiado = copyGastosIds(nm.q2_gastos);
  nm.q1_gastos = remapParents(q1Copiado);
  nm.q2_gastos = remapParents(q2Copiado);

  var prevLinkedGroups=(lm.q2_gastos||[]).filter(function(g){return g.esGrupo&&g.tcCardId;});
  prevLinkedGroups.forEach(function(prevG){
    var stillExists=nm.q2_gastos.some(function(g){return g.esGrupo&&g.tcCardId===prevG.tcCardId;});
    if(!stillExists){
      nm.q2_gastos.push({
        id:uid(),
        nombre:prevG.nombre,
        presupuesto:0,
        metodo:prevG.metodo||'BBVA',
        pagado_real:null,
        estado:null,
        pagado_flag:false,
        sinpagar:false,
        parentId:null,
        esGrupo:true,
        tcLinked:true,
        tcCardId:prevG.tcCardId,
        cuotas_total:0,
        cuota_actual:0
      });
    }
  });

  generarGastosCredito(nm);
  syncTCGrupo(nm);
  avanzarDeduccionesCredito(nm);

  return {nk:nk, nm:nm};
}

// Créditos por deducción de nómina (ej. libranzas tipo "PrestaFE"): una deducción con
// creditoId+numCuota representa la cuota de un crédito descontada directo de la nómina.
// Al crear el mes siguiente, la cuota del mes que se cierra se da por descontada (se marca
// pagada en el crédito) y la deducción avanza a la siguiente cuota automáticamente. Si el
// crédito ya se terminó de pagar, la deducción se retira sola (ya no aplica ese descuento).
function avanzarDeduccionesCredito(nm){
  const nom=nm.nomina; if(!nom) return;
  ['ded_q1','ded_q2'].forEach(function(key){
    const list=nom[key]||[];
    for(var idx=list.length-1; idx>=0; idx--){
      var d=list[idx];
      if(!d.creditoId || !d.numCuota) continue;
      var cr=creditos[d.creditoId];
      if(!cr) continue; // el crédito fue eliminado: se deja la deducción tal cual, sin poder avanzarla
      if(!cr.pagos) cr.pagos=[];
      if(!cr.pagoDetalle) cr.pagoDetalle={};
      var amortActual=calcAmortizacion(cr);
      var rowActual=amortActual.rows.find(function(r){return r.numero===d.numCuota;});
      cr.pagos[d.numCuota-1]=true;
      cr.pagoDetalle[d.numCuota-1]={montoPagado:rowActual?rowActual.valorCuota:(d.valor_fijo||0)};
      invalidarAmortCache(d.creditoId); // el monto real de esta cuota cambió, recalcular plazo/filas
      var siguiente=d.numCuota+1;
      var amort=calcAmortizacion(cr);
      if(siguiente>amort.rows.length){
        list.splice(idx,1);
        continue;
      }
      var row=amort.rows.find(function(r){return r.numero===siguiente;});
      d.numCuota=siguiente;
      if(row) d.valor_fijo=row.valorCuota;
      // La nueva cuota asignada también se da por pagada de una vez (deducción de nómina
      // automática), consistente con lo que ya hace saveDed() al crear el vínculo.
      cr.pagos[siguiente-1]=true;
      cr.pagoDetalle[siguiente-1]={montoPagado:row?row.valorCuota:0};
      invalidarAmortCache(d.creditoId);
    }
  });
}

function createMonth(){
  const draft=buildDraftMonth();
  window._draftMonth=draft.nm;
  window._draftKey=draft.nk;
  openMonthReview();
}

function openMonthReview(){
  const nm=window._draftMonth;
  if(!nm) return;

  function rowsForList(list,which){
    return list.filter(function(g){return !g.parentId;}).map(function(g,i){
      var otraQ=which==='q1'?'q2':'q1';
      var grupoTag=g.esGrupo?'<span style="font-size:9px;color:var(--acc);margin-left:4px">grupo</span>':'';
      var credTag=g.creditoId?'<span style="font-size:9px;color:var(--pur);margin-left:4px">crédito</span>':'';
      return '<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid var(--brd)">'
        +'<div style="flex:1;min-width:0">'
        +'<div style="font-size:12px;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(nombreGasto(g))+grupoTag+credTag+'</div>'
        +'<div style="font-size:10px;color:var(--mut)">'+cop(g.presupuesto)+'</div>'
        +'</div>'
        +'<button onclick="moveDraftGasto(\''+g.id+'\',\''+which+'\',\''+otraQ+'\')" title="Mover a '+otraQ.toUpperCase()+'" style="background:var(--surf2);border:1px solid var(--brd2);border-radius:50%;width:26px;height:26px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--acc);cursor:pointer;padding:0">'+icon('arrowRight',13)+'</button>'
        +'<button onclick="deleteDraftGasto(\''+g.id+'\',\''+which+'\')" title="Eliminar de esta carga" style="background:var(--red-d);border:1px solid rgba(248,113,113,.35);border-radius:50%;width:26px;height:26px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--red);cursor:pointer;padding:0">'+icon('trash',13)+'</button>'
        +'</div>';
    }).join('');
  }

  const q1Html=rowsForList(nm.q1_gastos||[],'q1');
  const q2Html=rowsForList(nm.q2_gastos||[],'q2');
  const totalQ1=(nm.q1_gastos||[]).filter(function(g){return !g.parentId;}).reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);
  const totalQ2=(nm.q2_gastos||[]).filter(function(g){return !g.parentId;}).reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);

  openModal('<div class="mtitle">Revisar '+nm.nombre+'</div>'
    +'<p style="font-size:11px;color:var(--mut);line-height:1.4;margin-bottom:10px">Mueve entre quincenas o elimina lo que no aplique antes de crear el mes.</p>'
    +'<div style="border:1px solid var(--brd);border-radius:var(--r2);margin-bottom:10px;overflow:hidden">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--surf2)">'
    +'<span style="font-size:11px;font-weight:700;color:var(--acc);text-transform:uppercase">Q1</span>'
    +'<span style="font-size:11px;font-weight:700;color:var(--txt)">'+cop(totalQ1)+'</span></div>'
    +'<div style="max-height:150px;overflow-y:auto">'
    +(q1Html||'<div style="padding:12px;text-align:center;color:var(--mut);font-size:11px">Sin gastos en Q1</div>')
    +'</div></div>'
    +'<div style="border:1px solid var(--brd);border-radius:var(--r2);margin-bottom:14px;overflow:hidden">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--surf2)">'
    +'<span style="font-size:11px;font-weight:700;color:var(--grn);text-transform:uppercase">Q2</span>'
    +'<span style="font-size:11px;font-weight:700;color:var(--txt)">'+cop(totalQ2)+'</span></div>'
    +'<div style="max-height:150px;overflow-y:auto">'
    +(q2Html||'<div style="padding:12px;text-align:center;color:var(--mut);font-size:11px">Sin gastos en Q2</div>')
    +'</div></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="cancelMonthReview()">Cancelar</button>'
    +'<button class="bpri" onclick="confirmCreateMonth()">Crear '+nm.nombre+'</button>'
    +'</div>');
}

function moveDraftGasto(id,fromQ,toQ){
  const nm=window._draftMonth; if(!nm) return;
  const fromList=fromQ==='q1'?nm.q1_gastos:nm.q2_gastos;
  const toList=toQ==='q1'?nm.q1_gastos:nm.q2_gastos;
  const idx=fromList.findIndex(function(g){return g.id===id;});
  if(idx===-1) return;
  const g=fromList[idx];
  if(g.esGrupo){
    const subs=fromList.filter(function(s){return s.parentId===g.id;});
    fromList.splice(idx,1);
    toList.push(g);
    subs.forEach(function(s){
      const sIdx=fromList.findIndex(function(x){return x.id===s.id;});
      if(sIdx!==-1){ fromList.splice(sIdx,1); toList.push(s); }
    });
  } else {
    fromList.splice(idx,1);
    toList.push(g);
  }
  openMonthReview();
}

function deleteDraftGasto(id,which){
  const nm=window._draftMonth; if(!nm) return;
  const list=which==='q1'?nm.q1_gastos:nm.q2_gastos;
  const idx=list.findIndex(function(g){return g.id===id;});
  if(idx===-1) return;
  const g=list[idx];
  if(g.esGrupo){
    showConfirm('¿Eliminar el grupo "'+nombreGasto(g)+'" y sus subgastos de esta carga? Esto no afecta meses anteriores.',function(){
      const filtered=list.filter(function(x){return x.id!==g.id && x.parentId!==g.id;});
      if(which==='q1') nm.q1_gastos=filtered; else nm.q2_gastos=filtered;
      openMonthReview();
    });
  } else {
    showConfirm('¿Eliminar "'+nombreGasto(g)+'" de esta carga? Esto no afecta meses anteriores.',function(){
      list.splice(idx,1);
      openMonthReview();
    });
  }
}

function cancelMonthReview(){
  window._draftMonth=null;
  window._draftKey=null;
  closeModal();
}

function confirmCreateMonth(){
  const nm=window._draftMonth, nk=window._draftKey;
  if(!nm||nk==null) return;
  moverCuotasVencidasAlMesSiguiente(db[nk-1],nm);
  db[nk]=nm;
  save();curM=nk;curTab=0;homeQ=homeQParaMes(nm);
  gFiltro={q1:'todos',q2:'todos'};
  gSort={q1:'orden',q2:'orden'};
  gFilterOpen={q1:false,q2:false};
  window._draftMonth=null;
  window._draftKey=null;
  closeModal();render();toast(nm.nombre+' creado');
}

