// ── CRÉDITOS: congelar cuota ─────────────────────────────────────────────────
// Fase 2 de la migración a una arquitectura más modular: feature autocontenida separada de
// creditos-ui.js — mueve la fecha de una cuota (y las siguientes) N periodos hacia adelante sin
// agregar cuotas nuevas. Depende de calcAmortizacion/generarFechasCredito (creditos-calculo.js).
//
// "Congelar" una cuota salta N periodos (meses si es mensual, quincenas si es quincenal) antes
// de esa cuota, sin agregar cuotas nuevas — esa y todas las siguientes se recorren esa misma
// cantidad (ver generarFechasCredito/extraPeriodosEnCuota). Siempre se aplica sobre la PRÓXIMA
// cuota sin pagar: no tendría sentido congelar una ya pagada, y congelar una futura sin haber
// resuelto antes las anteriores dejaría un hueco confuso en el calendario.
function openCongelarModal(id){
  const cr=creditos[id]; if(!cr) return;
  if(cr.planImportado && cr.planImportado.length){
    showAlert('Los créditos con plan de pagos importado (fechas exactas del banco) no admiten congelar cuotas.');
    return;
  }
  const estado=calcEstadoCredito(cr);
  if(estado.proximaIdx===-1){ showAlert('Este crédito ya está pagado.'); return; }
  const row=estado.amort.rows[estado.proximaIdx];
  const esMensual=(cr.frecuencia==='mensual');
  const unidadPlural=esMensual?'meses':'quincenas';
  const fechaActualFmt=new Date(row.fecha+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'});
  openModal('<div class="mtitle">Congelar cuota</div>'
    +'<p style="font-size:13px;color:var(--mut);margin-bottom:10px">La cuota '+row.numero+' cae en <b style="color:var(--txt)">'+fechaActualFmt+'</b>. Elige cuántos '+unidadPlural+' quieres saltarte — esa cuota y todas las siguientes se recorren esa misma cantidad, sin agregar cuotas nuevas al crédito.</p>'
    +'<div class="field"><label>'+(esMensual?'Meses':'Quincenas')+' a congelar</label>'
    +'<input id="cg-periodos" type="number" min="1" max="12" value="1" oninput="actualizarPreviewCongelar(\''+id+'\')"></div>'
    +'<p id="cg-preview" style="font-size:13px;color:var(--acc);font-weight:700;margin-bottom:4px"></p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="openCreditoDetalle(\''+id+'\')">Cancelar</button>'
    +'<button class="bpri" onclick="confirmarCongelarCuota(\''+id+'\')">Congelar</button>'
    +'</div>');
  actualizarPreviewCongelar(id);
}
function actualizarPreviewCongelar(id){
  const cr=creditos[id]; if(!cr) return;
  const estado=calcEstadoCredito(cr);
  const idx=estado.proximaIdx;
  const previewEl=document.getElementById('cg-preview');
  if(idx===-1||!previewEl) return;
  const periodos=parseInt(document.getElementById('cg-periodos').value,10)||0;
  if(periodos<=0){ previewEl.textContent=''; return; }
  const congelamientosPreview=(cr.congelamientos||[]).concat([{idx:idx,periodos:periodos}]);
  const fechasPreview=generarFechasCredito(cr.fechaInicio,cr.cuotas||1,cr.frecuencia||'quincenal',congelamientosPreview);
  const nuevaFechaFmt=new Date(fechasPreview[idx]+'T12:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'});
  previewEl.textContent='Nueva fecha de la cuota '+estado.amort.rows[idx].numero+': '+nuevaFechaFmt;
}
// Congelar/descongelar mueve las FECHAS de las cuotas siguientes (ver generarFechasCredito), pero
// los gastos que esas cuotas ya tuvieran creados en meses que YA EXISTEN en la app (generados por
// generarGastosCredito al crear esos meses) se quedan apuntando a su mes/quincena vieja si nadie
// los reubica. Esto se llama justo después de cr.congelamientos cambia: para cada cuota SIN pagar
// reubica su gasto al mes/quincena que le corresponde ahora (moviéndolo si el mes ya existe,
// creándolo si el mes existe pero esa cuota aún no tenía gasto ahí, o simplemente quitándolo de
// donde estaba si el mes destino todavía no existe — generarGastosCredito lo crea solo cuando ese
// mes se cree). Las cuotas ya pagadas nunca se tocan: su gasto es un registro histórico.
function resincronizarGastosCredito(crId){
  var cr=creditos[crId]; if(!cr) return;
  var amort=calcAmortizacion(cr);
  var pagos=cr.pagos||[];

  var existentes={}; // numCuota -> {mesKey, which:'q1'|'q2', gasto}
  Object.keys(db).forEach(function(k){
    var mes=db[k];
    ['q1','q2'].forEach(function(w){
      (mes[w+'_gastos']||[]).forEach(function(g){
        if(g.creditoId===crId && g.numCuota && !g.pagado_flag){
          existentes[g.numCuota]={mesKey:k,which:w,gasto:g};
        }
      });
    });
  });

  amort.rows.forEach(function(row,idx){
    if(pagos[idx]) return;
    var bucket=calcQuincenaCuota(new Date(row.fecha+'T12:00:00'));
    var mesDestinoNombre=MESES[bucket.mes];
    var keyDestino=Object.keys(db).find(function(k){return db[k].año===bucket.año && db[k].nombre===mesDestinoNombre;});
    var actual=existentes[row.numero];

    if(!actual){
      if(keyDestino){
        var listaNueva=db[keyDestino][bucket.which+'_gastos']=db[keyDestino][bucket.which+'_gastos']||[];
        listaNueva.push({
          id:uid(), nombre:prefijoCredito(cr)+cr.nombre, presupuesto:row.valorCuota, metodo:'Nequi',
          pagado_real:null, estado:null, pagado_flag:false, sinpagar:false, parentId:null, esGrupo:false,
          cuotas_total:cr.cuotas, cuota_actual:row.numero, creditoId:crId, numCuota:row.numero,
          fecha_pago:null, comprobante:null
        });
      }
      return;
    }
    if(actual.mesKey===keyDestino && actual.which===bucket.which) return;

    var mesActual=db[actual.mesKey];
    mesActual[actual.which+'_gastos']=(mesActual[actual.which+'_gastos']||[]).filter(function(g){return g.id!==actual.gasto.id;});
    if(keyDestino){
      var listaDestino=db[keyDestino][bucket.which+'_gastos']=db[keyDestino][bucket.which+'_gastos']||[];
      listaDestino.push(actual.gasto);
    }
  });
}
function confirmarCongelarCuota(id){
  const cr=creditos[id]; if(!cr) return;
  const estado=calcEstadoCredito(cr);
  const idx=estado.proximaIdx;
  if(idx===-1){ closeModal(); return; }
  const periodos=parseInt(document.getElementById('cg-periodos').value,10)||0;
  if(periodos<=0){ showAlert('Ingresa al menos 1.'); return; }
  if(!cr.congelamientos) cr.congelamientos=[];
  cr.congelamientos.push({id:uid(), idx:idx, periodos:periodos});
  invalidarAmortCache(id);
  resincronizarGastosCredito(id);
  const unidad=(cr.frecuencia==='mensual')?(periodos===1?'mes':'meses'):(periodos===1?'quincena':'quincenas');
  save();render();openCreditoDetalle(id);
  toast('Cuota '+(idx+1)+' congelada '+periodos+' '+unidad+' — el resto del calendario se recorrió igual.');
}
function confirmarQuitarCongelamiento(id,congId){
  showConfirm('Se quitará el congelamiento y esa cuota (y las siguientes) volverán a su fecha original. ¿Continuar?',function(){
    quitarCongelamiento(id,congId);
  });
}
function quitarCongelamiento(id,congId){
  const cr=creditos[id]; if(!cr) return;
  if(cr.congelamientos) cr.congelamientos=cr.congelamientos.filter(function(c){return c.id!==congId;});
  invalidarAmortCache(id);
  resincronizarGastosCredito(id);
  save();render();openCreditoDetalle(id);
  toast('Congelamiento eliminado');
}

// abId identifica un abono manual puntual (cr.abonos) a eliminar; abId===null identifica el
// excedente de esa cuota (Caso 1, no vive en cr.abonos sino en cr.pagoDetalle). Cuando una
// cuota tiene varios componentes, esto permite indicar exactamente cuál se quiere devolver.
