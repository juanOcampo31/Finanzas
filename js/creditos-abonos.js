// ── CRÉDITOS: abonos a capital ───────────────────────────────────────────────
// Fase 2 de la migración a una arquitectura más modular: feature autocontenida separada de
// creditos-ui.js — registrar/eliminar un abono a capital (adelantar plata, no una cuota
// normal). Depende de calcAmortizacion/calcEstadoCredito (creditos-calculo.js).
//
// Abono adicional a capital, independiente de pagar una cuota puntual: reduce el saldo y por
// lo tanto el número de cuotas restantes (la cuota fija no cambia), ver calcAmortizacionSinCache.
function openAbonoModal(id){
  const cr=creditos[id]; if(!cr) return;
  if(cr.planImportado && cr.planImportado.length){
    showAlert('Los créditos con plan de pagos importado no admiten abonos a capital.');
    return;
  }
  const estado=calcEstadoCredito(cr);
  if(estado.proximaIdx===-1){ showAlert('Este crédito ya está pagado.'); return; }
  openModal('<div class="mtitle">Abonar a capital</div>'
    +'<p style="font-size:13px;color:var(--mut);margin-bottom:10px">Saldo actual: <b>'+cop(estado.saldoActual)+'</b>. El abono reduce el número de cuotas restantes; el valor de la cuota fija no cambia.</p>'
    +'<div class="field"><label>Monto del abono</label>'
    +'<input id="ab-val" type="text" inputmode="numeric" placeholder="Ej: 500.000" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Fecha del abono</label>'
    +'<input id="ab-fecha" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCreditoDetalle(\''+id+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="confirmarAbono(\''+id+'\')">Confirmar abono</button>'
    +'</div>');
}
function confirmarAbono(id){
  const cr=creditos[id]; if(!cr) return;
  const monto=moneyVal('ab-val');
  const fecha=document.getElementById('ab-fecha').value||new Date().toISOString().slice(0,10);
  if(!monto||monto<=0){ showAlert('El monto del abono debe ser mayor a 0'); return; }
  const estado=calcEstadoCredito(cr);
  if(monto>estado.saldoActual){
    showAlert('El abono ('+cop(monto)+') no puede ser mayor al saldo actual del crédito ('+cop(estado.saldoActual)+').');
    return;
  }
  if(!cr.abonos) cr.abonos=[];
  const idxAplicacion=estado.proximaIdx-1; // última cuota ya pagada (-1 si ninguna)
  const abono={id:uid(), idx:idxAplicacion, fecha:fecha, monto:monto};
  try{
    cr.abonos.push(abono);
    invalidarAmortCache(id);
    save();render();openCreditoDetalle(id);
    toast('Abono de '+cop(monto)+' registrado. El plazo del crédito se redujo.');
  }catch(err){
    cr.abonos=cr.abonos.filter(function(ab){return ab.id!==abono.id;});
    invalidarAmortCache(id);
    console.error('Error registrando abono:',err);
    showAlert('No se pudo registrar el abono. Intenta de nuevo.');
  }
}

// abId identifica un abono manual puntual (cr.abonos) a eliminar; abId===null identifica el
// excedente de esa cuota (Caso 1, no vive en cr.abonos sino en cr.pagoDetalle). Cuando una
// cuota tiene varios componentes, esto permite indicar exactamente cuál se quiere devolver.
function confirmarEliminarComponenteAbono(id,idx,abId){
  showConfirm('Se eliminará este abono a capital. El plazo del crédito puede volver a alargarse. ¿Continuar?',function(){
    eliminarComponenteAbono(id,idx,abId);
  });
}
function eliminarComponenteAbono(id,idx,abId){
  const cr=creditos[id]; if(!cr) return;
  if(abId){
    if(cr.abonos) cr.abonos=cr.abonos.filter(function(ab){return ab.id!==abId;});
  } else if(idx>=0 && cr.pagos && cr.pagos[idx] && cr.pagoDetalle && cr.pagoDetalle[idx] && cr.pagoDetalle[idx].montoPagado!=null){
    // Era el excedente de esta cuota: resetea el monto pagado al valor teórico de la cuota fija.
    const amortAntes=calcAmortizacion(cr);
    var teorico=amortAntes.valorCuota;
    if(cr.pagoDetalle[idx].montoPagado-teorico>1){
      cr.pagoDetalle[idx]={montoPagado:teorico};
    }
  }
  invalidarAmortCache(id);
  save();render();openCreditoDetalle(id);
  toast('Abono eliminado');
}

