// ── CRUD Deducciones ──────────────────────────────────────────────────────────

// Selector opcional "crédito por deducción de nómina" (ej. libranzas tipo "PrestaFE"): al
// elegir un crédito, sugiere (sin bloquear) el valor de su próxima cuota pendiente.
function dedCreditoFieldHtml(selectedId){
  const ids=Object.keys(creditos);
  if(!ids.length) return '';
  const opts='<option value="">— Ninguno —</option>'+ids.map(function(cid){
    var cr=creditos[cid];
    return '<option value="'+cid+'"'+(selectedId===cid?' selected':'')+'>'+esc(cr.nombre)+'</option>';
  }).join('');
  return '<div class="field"><label>¿Es cuota de un crédito por nómina? (opcional)</label>'
    +'<select id="d-credito" onchange="sugerirValorDedCredito()">'+opts+'</select></div>';
}
function sugerirValorDedCredito(){
  const sel=document.getElementById('d-credito');
  if(!sel||!sel.value) return;
  const cr=creditos[sel.value]; if(!cr) return;
  const amort=calcAmortizacion(cr);
  const pagos=cr.pagos||[];
  var idx=amort.rows.findIndex(function(r,i){return !pagos[i];});
  if(idx===-1) idx=amort.rows.length-1;
  const row=amort.rows[idx];
  const vEl=document.getElementById('d-v');
  if(vEl) setMoneyValue(vEl,row.valorCuota);
  const nEl=document.getElementById('d-n');
  if(nEl && !nEl.value.trim()) nEl.value=cr.nombre;
}
// Encuentra la cuota libre más próxima de un crédito para vincularla a una deducción de
// nómina, sin chocar con OTRA deducción del mismo mes ya vinculada al mismo crédito (caso de
// un crédito quincenal con una deducción en Q1 y otra en Q2, cada una en su propia cuota).
function siguienteCuotaLibreCredito(creditoId, nom, which, excludeIdx){
  const cr=creditos[creditoId]; if(!cr) return null;
  const amort=calcAmortizacion(cr);
  const pagos=cr.pagos||[];
  // Antes solo revisaba otras deducciones del mismo mes; ahora usa el mismo criterio que
  // sugerirCuotaCredito (gastos normales) para que un gasto manual y una deducción de nómina
  // nunca terminen apuntando a la misma cuota.
  const excluir={mes:String(curM), key:(which==='q1'?'ded_q1':'ded_q2'), idx:excludeIdx};
  const usadas=cuotasOcupadasCredito(creditoId, excluir);
  for(var k=0;k<amort.rows.length;k++){
    var numero=amort.rows[k].numero;
    if(!pagos[k] && !usadas[numero]) return numero;
  }
  return amort.rows.length?amort.rows[amort.rows.length-1].numero:null;
}
function editDed(e,lbl,i){
  e.stopPropagation();
  const n=getNom(getM()),deds=lbl.includes('Q1')?n.ded_q1:n.ded_q2,d=deds[i];
  if(d.esIngresos){ toast('Los ingresos se editan desde la pestaña Ingresos'); return; }
  _dedTipo=d.tipo||'resta';
  const isSuma=d.tipo==='suma';
  const rCls=!isSuma?' sc':'', sCls=isSuma?' sa':'';
  openModal('<div class="mtitle">Editar deducción</div>'
    +'<div class="field"><label>Nombre</label><input id="d-n" value="'+esc(d.nombre)+'"></div>'
    +'<div class="trow2">'
    +'<button class="topt'+rCls+'" id="d-resta" onclick="setDedTipo(\'resta\')">'+btnIcon('minus',13)+'Resta</button>'
    +'<button class="topt'+sCls+'" id="d-suma" onclick="setDedTipo(\'suma\')">'+btnIcon('plus',13)+'Suma</button>'
    +'</div>'
    +'<div class="field"><label>Porcentaje (ej: 0.04 = 4%)</label><input id="d-p" type="number" step="0.001" value="'+(d.porcentaje||'')+'"></div>'
    +'<div class="field"><label>Valor fijo</label><input id="d-v" type="text" inputmode="numeric" value="'+moneyInputFmt(d.valor_fijo)+'" oninput="maskMoneyInput(this)"></div>'
    +dedCreditoFieldHtml(d.creditoId||null)
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveDed(\''+lbl+'\','+i+')">Guardar</button></div>'
    +'<button class="bdel" onclick="delDed(\''+lbl+'\','+i+')">Eliminar deducción</button>');
}
function addDed(lbl){
  _dedTipo='resta';
  openModal('<div class="mtitle">Nueva deducción / ingreso</div>'
    +'<div class="field"><label>Nombre</label><input id="d-n" placeholder="Prima, Salud, Bono..."></div>'
    +'<div class="trow2">'
    +'<button class="topt sc" id="d-resta" onclick="setDedTipo(\'resta\')">'+btnIcon('minus',13)+'Resta</button>'
    +'<button class="topt" id="d-suma" onclick="setDedTipo(\'suma\')">'+btnIcon('plus',13)+'Suma</button>'
    +'</div>'
    +'<div class="field"><label>Porcentaje (ej: 0.04 = 4%)</label><input id="d-p" type="number" step="0.001"></div>'
    +'<div class="field"><label>Valor fijo</label><input id="d-v" type="text" inputmode="numeric" oninput="maskMoneyInput(this)"></div>'
    +dedCreditoFieldHtml(null)
    +'<div class="macts"><button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveDed(\''+lbl+'\',-1)">Agregar</button></div>');
}
let _dedTipo = 'resta';
function setDedTipo(t) {
  _dedTipo = t;
  const r=document.getElementById('d-resta'), s=document.getElementById('d-suma');
  if(r) r.className = 'topt' + (t==='resta'?' sc':'');
  if(s) s.className = 'topt' + (t==='suma'?' sa':'');
}
function saveDed(lbl,i){
  const n=getNom(getM()),deds=lbl.includes('Q1')?n.ded_q1:n.ded_q2;
  const nombre=document.getElementById('d-n').value.trim();
  const pct=parseFloat(document.getElementById('d-p').value)||null;
  const vf=moneyVal('d-v')||null;
  if(!nombre){showAlert('Escribe un nombre');return;}
  const entry={nombre,porcentaje:pct,valor_fijo:vf,tipo:_dedTipo};
  const credSel=document.getElementById('d-credito');
  const creditoId=credSel&&credSel.value?credSel.value:null;
  // Si esta deducción ya estaba vinculada a un crédito y se cambió o se quitó ese vínculo,
  // hay que revertir la cuota que había quedado marcada como pagada — si no, el crédito
  // queda con una cuota "pagada" fantasma que ya no corresponde a ninguna deducción real.
  const anterior=(i!==-1)?deds[i]:null;
  if(anterior&&anterior.creditoId&&anterior.numCuota&&(anterior.creditoId!==creditoId)){
    const crAnt=creditos[anterior.creditoId];
    if(crAnt&&crAnt.pagos){
      crAnt.pagos[anterior.numCuota-1]=false;
      if(crAnt.pagoDetalle){ delete crAnt.pagoDetalle[anterior.numCuota-1]; invalidarAmortCache(anterior.creditoId); }
    }
  }
  if(creditoId){
    entry.creditoId=creditoId;
    entry.numCuota=siguienteCuotaLibreCredito(creditoId, n, lbl.includes('Q1')?'q1':'q2', i);
    // Es una deducción de nómina: se paga sola cada periodo, no requiere confirmación manual
    // como un gasto — así que la cuota que le corresponde se marca pagada de una vez.
    if(entry.numCuota){
      const cr=creditos[creditoId];
      if(cr){
        if(!cr.pagos) cr.pagos=[];
        cr.pagos[entry.numCuota-1]=true;
        if(!cr.pagoDetalle) cr.pagoDetalle={};
        const amort=calcAmortizacion(cr);
        const row=amort.rows.find(function(r){return r.numero===entry.numCuota;});
        cr.pagoDetalle[entry.numCuota-1]={montoPagado:row?row.valorCuota:0};
      }
    }
  }
  if(i===-1)deds.push(entry);
  else deds[i]=entry;
  save();closeModal();render();toast('Guardado');
}
function delDed(lbl,i){
  showConfirm('¿Eliminar esta deducción?',function(){
    const n=getNom(getM()),deds=lbl.includes('Q1')?n.ded_q1:n.ded_q2;
    const d=deds[i];
    // Igual que al cambiar el vínculo en saveDed: si la deducción tenía un crédito asociado,
    // se revierte la cuota que había quedado marcada como pagada.
    if(d&&d.creditoId&&d.numCuota){
      const cr=creditos[d.creditoId];
      if(cr&&cr.pagos){
        cr.pagos[d.numCuota-1]=false;
        if(cr.pagoDetalle){ delete cr.pagoDetalle[d.numCuota-1]; invalidarAmortCache(d.creditoId); }
      }
    }
    deds.splice(i,1);save();closeModal();render();toast('Eliminada');
  });
}

// ── Nuevo mes ─────────────────────────────────────────────────────────────────
