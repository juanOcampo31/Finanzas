// ── CRÉDITOS: refinanciación ─────────────────────────────────────────────────
// Toma el saldo pendiente de un crédito activo y crea uno nuevo con otro plazo/cuota/tasa,
// cerrando el original marcado como "refinanciado" (ver docs/superpowers/specs/
// 2026-10-20-refinanciacion-creditos-design.md). Este archivo mezcla, a propósito, la lógica
// "pura" (ejecutarRefinanciacion, que solo toca creditos/db, igual que sincronizarCreditoDesdeGasto
// en gasto-pago.js) con la UI del modal — es una sola feature autocontenida, no tan grande como
// para justificar el split calculo/ui que sí tiene el resto de créditos.

// Refinancia el crédito `idOriginal`: crea un crédito nuevo con el saldo pendiente actual y los
// datos de `params` ({nombre, cuotas, tasa, fechaInicio, frecuencia, tcVinculada, esMensualidad,
// valorCuotaManual}), marca el original como refinanciado, y desvincula (sin borrar) cualquier
// gasto o deducción de nómina de una cuota del original que todavía no esté pagada (cr.pagos[idx]
// falso) — esa deuda ya quedó incluida en el saldo del crédito nuevo. Devuelve el id del crédito
// nuevo. `valorCuotaManual`, si se da, se respeta tal cual (no se recalcula): si es mayor a la
// cuota sugerida, el crédito se liquida antes de `cuotas` — mismo mecanismo de cierre anticipado
// de calcAmortizacionSinCache que ya usa cualquier crédito real con cuota manual.
function ejecutarRefinanciacion(idOriginal, params){
  var crOriginal=creditos[idOriginal];
  if(!crOriginal) throw new Error('Crédito original no encontrado');
  var saldoActual=calcEstadoCredito(crOriginal).saldoActual;
  if(!(saldoActual>0)) throw new Error('Este crédito no tiene saldo pendiente para refinanciar');

  var nuevoId='cr_'+Date.now();
  var nuevoCredito={
    id:nuevoId, nombre:params.nombre, valorPrestamo:saldoActual, pctAval:0,
    cuotas:params.cuotas, tasa:params.tasa, fechaInicio:params.fechaInicio,
    frecuencia:params.frecuencia, valorCuotaManual:params.valorCuotaManual||null,
    esMensualidad:!!params.esMensualidad, tcVinculada:params.tcVinculada||null,
    pagos:[], refinanciaDeId:idOriginal
  };
  creditos[nuevoId]=nuevoCredito;

  // La primera cuota del crédito nuevo se agrega ya como gasto, en el mismo mes/quincena que
  // le correspondería por calendario hoy (igual bucket que usa el draft mensual en
  // catalogos.js) — si por algún motivo ese mes no es el que está abierto en la app ahora mismo,
  // cae en Q1 del mes actual como alternativa razonable, en vez de quedar sin ningún gasto hasta
  // el próximo mes nuevo.
  var bucket=calcQuincenaCuota(new Date());
  var mActual=getM();
  var which=(bucket.año===mActual.año && MESES.indexOf(mActual.nombre)===bucket.mes)?bucket.which:'q1';
  crearGastoDesdeCredito(nuevoId,{which:which,metodo:null,parentId:null});

  crOriginal.refinanciado=true;
  crOriginal.refinanciadoEn=new Date().toISOString().slice(0,10);
  crOriginal.refinanciadoPorId=nuevoId;

  Object.keys(db).forEach(function(k){
    var mes=db[k];
    [mes.q1_gastos||[], mes.q2_gastos||[]].forEach(function(list){
      list.forEach(function(g){
        if(g.creditoId===idOriginal && g.numCuota && !crOriginal.pagos[g.numCuota-1]){
          g.creditoId=null; g.numCuota=null;
        }
      });
    });
    var nom=mes.nomina;
    if(nom){
      ['ded_q1','ded_q2'].forEach(function(key){
        (nom[key]||[]).forEach(function(d){
          if(d.creditoId===idOriginal && d.numCuota && !crOriginal.pagos[d.numCuota-1]){
            d.creditoId=null; d.numCuota=null;
          }
        });
      });
    }
  });

  invalidarAmortCache(idOriginal);
  return nuevoId;
}

// ── UI: modal "Refinanciar crédito" ──────────────────────────────────────────
// Número de cuotas y valor de cuota se editan los DOS a la vez (no son modos excluyentes): el
// número de cuotas es el plazo pactado, y el valor de cuota es opcional — si se deja vacío se
// sugiere automáticamente (igual que en "Nuevo crédito", ver updateCuotaSugerida), pero si se
// escribe uno se respeta tal cual, sin recalcularlo. Si esa cuota es mayor a la sugerida, el
// crédito se liquida ANTES del número de cuotas pactado (mismo mecanismo de cierre anticipado que
// ya usa calcAmortizacionSinCache para cualquier crédito real con cuotas pagadas de más) — así se
// puede explorar "si pago más cada vez, ¿en cuánto tiempo termino?" directamente en la proyección.
let _rfCreditoId=null;
let _rfPendiente=null; // params ya validados, esperando la confirmación (ver confirmarRefinanciarCredito)

function abrirRefinanciarCredito(id){
  const cr=creditos[id]; if(!cr) return;
  _rfCreditoId=id;
  const saldoActual=calcEstadoCredito(cr).saldoActual;
  const hoy=new Date().toISOString().slice(0,10);
  const tasaVal=(cr.tasa!=null)?cr.tasa:'';
  openModal('<div class="mtitle">Refinanciar '+esc(cr.nombre)+'</div>'
    +'<div style="font-size:13px;color:var(--mut);margin-bottom:10px">Saldo a refinanciar: <b style="color:var(--txt)">'+cop(saldoActual)+'</b></div>'
    +'<div class="field"><label>Nombre</label><input id="rf-nombre" value="'+esc(cr.nombre+' (refinanciado)')+'"></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">'
    +'<div class="field" style="margin:0"><label>Número de cuotas</label><input id="rf-cuotas" type="number" placeholder="Ej: 24" oninput="rfRecalcular()"></div>'
    +'<div class="field" style="margin:0"><label>Tasa de interés %</label><input id="rf-tasa" type="number" step="0.01" value="'+tasaVal+'" oninput="rfRecalcular()"></div>'
    +'</div>'
    +'<div class="field" style="margin-top:8px"><label>Valor de cuota manual (opcional)</label>'
    +'<input id="rf-cuota-manual" type="text" inputmode="numeric" placeholder="Se sugiere automáticamente" oninput="maskMoneyInput(this);rfRecalcular()">'
    +'<div id="rf-cuota-sugerida-txt" style="font-size:11px;color:var(--acc);margin-top:4px"></div>'
    +'</div>'
    +'<div style="margin-top:8px">'+stdFormDateFieldHtml('rf-fecha','Fecha inicio',hoy,'rfRecalcular()')+'</div>'
    +frecuenciaFieldHtml('rf-frec',cr.frecuencia||'quincenal')
    +tarjetaVinculadaFieldHtml(cr.tcVinculada||null)
    +'<div id="rf-proyeccion" style="margin-top:10px"></div>'
    +'<div class="macts" style="margin-top:14px"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="confirmarRefinanciarCredito(\''+id+'\')">Refinanciar</button></div>');
  rfRecalcular();
}

// Recalcula, a partir de lo que haya en el formulario en este instante, la proyección completa
// (resumen + tabla de plan de pagos) — reutiliza renderProyeccionCredito (js/creditos-ui.js),
// la misma que usa "Nuevo crédito", pasándole el saldo pendiente como "valor del préstamo".
function rfRecalcular(){
  const cr=creditos[_rfCreditoId]; if(!cr) return;
  const sugEl=document.getElementById('rf-cuota-sugerida-txt');
  const manualEl=document.getElementById('rf-cuota-manual');
  const saldoActual=calcEstadoCredito(cr).saldoActual;
  const tasaPct=parseFloat(document.getElementById('rf-tasa').value)||0;
  const cuotas=parseInt(document.getElementById('rf-cuotas').value)||0;
  if(cuotas<=0){ if(sugEl) sugEl.textContent=''; renderProyeccionCredito('rf-proyeccion',0,0,0,0,'','',null); return; }

  const cuotaSugerida=calcCuotaPMT(saldoActual,tasaPct/100,cuotas);
  if(sugEl) sugEl.textContent='Cuota sugerida: '+cop(Math.round(cuotaSugerida));
  if(manualEl) manualEl.placeholder=cop(Math.round(cuotaSugerida))+' (sugerida)';
  const cuotaManual=moneyVal('rf-cuota-manual')||null;

  const fechaInicio=document.getElementById('rf-fecha').value||new Date().toISOString().slice(0,10);
  const frecuencia=(document.getElementById('rf-frec')||{}).value||cr.frecuencia||'quincenal';
  renderProyeccionCredito('rf-proyeccion',saldoActual,0,cuotas,tasaPct,fechaInicio,frecuencia,cuotaManual);
}

function confirmarRefinanciarCredito(id){
  const cr=creditos[id]; if(!cr) return;
  const nombre=(document.getElementById('rf-nombre').value||'').trim();
  const fechaInicio=document.getElementById('rf-fecha').value;
  const frecuencia=(document.getElementById('rf-frec')||{}).value||cr.frecuencia;
  const tasaPct=parseFloat(document.getElementById('rf-tasa').value)||0;
  const tasa=tasaPct/100;
  const cuotas=parseInt(document.getElementById('rf-cuotas').value)||0;
  const cuotaManual=moneyVal('rf-cuota-manual')||null;
  const saldoActual=calcEstadoCredito(cr).saldoActual;
  const tcVincEl=document.getElementById('cr-tc-vinc');
  const tcVinculada=tcVincEl&&tcVincEl.value?tcVincEl.value:null;

  if(!nombre){ showAlert('Escribe un nombre'); return; }
  if(!fechaInicio){ showAlert('Elige una fecha de inicio'); return; }
  if(tasaPct<0){ showAlert('La tasa de interés no puede ser negativa'); return; }
  if(!Number.isInteger(cuotas)||cuotas<=0){ showAlert('El número de cuotas debe ser un entero mayor a 0'); return; }
  if(cuotaManual){
    const interesPrimera=Math.round(saldoActual*tasa*100)/100;
    if(cuotaManual<=interesPrimera){
      showAlert('La cuota manual ('+cop(cuotaManual)+') no alcanza a cubrir el interés de la primera cuota ('+cop(interesPrimera)+'). El saldo aumentaría en vez de disminuir. Aumenta la cuota o reduce la tasa.');
      return;
    }
  }

  _rfPendiente={nombre:nombre,cuotas:cuotas,tasa:tasaPct,fechaInicio:fechaInicio,frecuencia:frecuencia,tcVinculada:tcVinculada,esMensualidad:!!cr.esMensualidad,valorCuotaManual:cuotaManual};

  var amortFinal;
  try{ amortFinal=calcAmortizacionSinCache({valorPrestamo:saldoActual,pctAval:0,cuotas:cuotas,tasa:tasaPct,fechaInicio:fechaInicio,frecuencia:frecuencia,valorCuotaManual:cuotaManual}); }catch(e){ amortFinal={rows:[]}; }
  const cuotasReales=amortFinal.rows.length||cuotas;

  openModal('<div class="mtitle">¿Refinanciar '+esc(cr.nombre)+'?</div>'
    +'<p style="font-size:13px;color:var(--mut);margin-bottom:16px">Se creará un crédito nuevo por '+cop(saldoActual)+' a '+cuotasReales+' cuotas. El crédito actual quedará cerrado y marcado como refinanciado — no te pedirá más cuotas, pero sigue visible en tu histórico.</p>'
    +'<div class="macts"><button class="bcnl" onclick="abrirRefinanciarCredito(\''+id+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="ejecutarYGuardarRefinanciacion(\''+id+'\')">Confirmar</button></div>');
}

function ejecutarYGuardarRefinanciacion(id){
  try{
    const nuevoId=ejecutarRefinanciacion(id,_rfPendiente);
    _rfPendiente=null;
    save();closeModal();openCreditoDetalle(nuevoId);toast('Crédito refinanciado ✓');
  }catch(err){
    console.error('Error refinanciando crédito:',err);
    showAlert('No se pudo refinanciar: '+err.message);
  }
}
