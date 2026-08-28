// ── Exportar CSV ──────────────────────────────────────────────────────────────
function openBackupMenu(){
  openModal('<div class="mtitle">Respaldo de datos</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
    +'Exporta tus datos para guardarlos en Drive, WhatsApp o email.<br>'
    +'Importa un backup para restaurar tus datos.</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +'<button class="bpri" onclick="exportJSON()" style="display:flex;align-items:center;justify-content:center;gap:8px">'
    +icon('upload',16)+' Exportar / compartir backup</button>'
    +'<button class="bcnl" onclick="document.getElementById(\'imp-file\').click();closeModal()" style="display:flex;align-items:center;justify-content:center;gap:8px">'
    +icon('download',16)+' Importar backup JSON</button>'
    +'</div>');
}

async function exportJSON(){
  const hoy=new Date().toISOString().slice(0,10);
  const payload=JSON.stringify({version:2,fecha:hoy,data:db,creditos:creditos,catMetodos:catMetodos,catTipos:catTipos,telefono:perfilTelefono});
  let pin=sessionPIN;
  if(!pin){
    pin=await promptPINModal('Confirma tu PIN para cifrar el backup');
    if(pin===null) return;
    if(!(await pinVerify(pin))){ showAlert('PIN incorrecto'); return; }
    sessionPIN=pin;
  }
  const envelope=await encryptString(payload,pin);
  const fileObj=Object.assign({encrypted:true, app:'FinanzasPersonales', version:2, fecha:hoy}, envelope);
  const fileName='finanzas_backup_'+hoy+'.json';
  const contenido=JSON.stringify(fileObj,null,2);
  const blob=new Blob([contenido],{type:'application/json'});
  // Para COMPARTIR (WhatsApp/Gmail/Mensajes) se usa .txt + text/plain en vez de .json +
  // application/json: muchas apps (sobre todo WhatsApp) filtran por tipo de archivo en su
  // "intent" de compartir y no reconocen application/json como adjunto válido, así que ni
  // siquiera aparecen en el panel — text/plain sí lo reconoce prácticamente cualquier app.
  // El contenido es exactamente el mismo backup cifrado, solo cambia la extensión/tipo.
  const shareFileName='finanzas_backup_'+hoy+'.txt';
  const shareBlob=new Blob([contenido],{type:'text/plain'});
  const shareFile=new File([shareBlob], shareFileName, {type:'text/plain'});
  if(!window.isSecureContext){
    // Web Share API exige HTTPS (o localhost); en http:// simple ni siquiera existe.
    toast('Necesitas abrir la app por HTTPS para poder compartir. Se descargará el archivo.');
  } else if(!navigator.share){
    toast('Este navegador no soporta compartir archivos. Se descargará el archivo.');
  } else if(navigator.canShare && !navigator.canShare({files:[shareFile]})){
    toast('Este navegador no permite compartir este tipo de archivo. Se descargará el archivo.');
  } else {
    try{
      await navigator.share({files:[shareFile], title:'Backup Finanzas Personales', text:'Backup cifrado de Finanzas Personales ('+hoy+')'});
      toast('Backup cifrado compartido ✓');
      return;
    }catch(e){
      if(e.name==='AbortError') return; // el usuario cerró el share sheet sin elegir nada
      console.error('Error al compartir el backup', e);
      toast('No se pudo abrir compartir ('+e.name+'). Se descargará el archivo.');
    }
  }
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=fileName;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Backup cifrado exportado ✓');
}

function importJSON(input){
  const file=input.files[0];
  if(!file){return;}
  const reader=new FileReader();
  reader.onload=async function(e){
    try{
      const parsed=JSON.parse(e.target.result);
      let importedPayload;
      if(parsed.encrypted){
        let pin=sessionPIN;
        if(!pin){
          pin=await promptPINModal('Ingresa tu PIN para restaurar el backup');
          if(pin===null){ input.value=''; return; }
        }
        let plain;
        try{
          plain=await decryptString(parsed,pin);
        }catch(err){
          showAlert('PIN incorrecto o archivo dañado. No se pudo descifrar el backup.');
          input.value=''; return;
        }
        sessionPIN=pin;
        importedPayload=JSON.parse(plain);
      } else {
        importedPayload=parsed; // compatibilidad con backups antiguos sin cifrar
      }
      const importedDb=importedPayload.data||importedPayload;
      if(typeof importedDb!=='object'||Array.isArray(importedDb)){
        showAlert('Archivo no válido. Debe ser un backup exportado desde esta app.');
        input.value=''; return;
      }
      const errorEsquema=validarEsquemaDb(importedDb);
      if(errorEsquema){
        showAlert('El backup no tiene un formato válido: '+errorEsquema);
        input.value=''; return;
      }
      window._importedDb=importedDb;
      window._importedExtra={
        creditos: importedPayload.creditos||null,
        catMetodos: importedPayload.catMetodos||null,
        catTipos: importedPayload.catTipos||null,
        telefono: importedPayload.telefono||null
      };
      openModal('<div class="mtitle">Importar backup</div>'
        +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:16px">'
        +'Archivo: <b style="color:var(--txt)">'+file.name+'</b><br>'
        +'Meses encontrados: <b style="color:var(--txt)">'+Object.keys(importedDb).length+'</b><br><br>'
        +'<b style="color:var(--red)">¿Reemplazar todos los datos actuales?</b> Esta acción no se puede deshacer.</p>'
        +'<div class="macts">'
        +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
        +'<button class="bpri" style="background:var(--red);color:#fff" onclick="confirmImport()">Reemplazar todo</button>'
        +'</div>');
    } catch(err){
      showAlert('Error al leer el archivo: '+err.message);
    }
    input.value='';
  };
  reader.readAsText(file);
}

function confirmImport(){
  if(!window._importedDb){closeModal();return;}
  db=window._importedDb;
  // Migrate all months
  Object.keys(db).forEach(function(k){ db[k]=migrateMonth(db[k]); });
  if(window._importedExtra){
    if(window._importedExtra.creditos) creditos=window._importedExtra.creditos;
    if(window._importedExtra.catMetodos) catMetodos=window._importedExtra.catMetodos;
    if(window._importedExtra.catTipos) catTipos=window._importedExtra.catTipos;
    if(window._importedExtra.telefono) perfilTelefono=window._importedExtra.telefono;
  }
  // Reset navigation
  const keys=Object.keys(db).map(Number).sort(function(a,b){return a-b;});
  curM=keys[keys.length-1]; // go to last month
  curTab=0;homeQ=homeQParaMes(db[curM]);
  gFiltro={q1:'todos',q2:'todos'};
  gSort={q1:'orden',q2:'orden'};
  gFilterOpen={q1:false,q2:false};
  save();closeModal();render();
  toast('Datos importados correctamente ✓');
  window._importedDb=null;
  window._importedExtra=null;
}

function exportCSV(){
  const m=getM(),nom=getNom(m);
  const rows=[['Sección','Nombre','Presupuesto','Método','Pagado Real','Estado','Fecha']];
  for(const g of(m.q1_gastos||[]))rows.push(['Q1',nombreGasto(g),g.presupuesto,g.metodo,g.pagado_real||'',g.pagado_flag?'Pagado':'Pendiente','']);
  for(const g of(m.q2_gastos||[]))rows.push(['Q2',nombreGasto(g),g.presupuesto,g.metodo,g.pagado_real||'',g.pagado_flag?'Pagado':'Pendiente','']);
  Object.values(m.tarjetas||{}).forEach(function(tc){(tc.movimientos||[]).forEach(function(t){rows.push([tc.nombre,t.descripcion,Math.abs(t.valor||0),t.tipo,'','',t.fecha]);});});
  rows.push(['Nomina','Basico Total',nom.basico_total,'','','',''],['Nomina','Bonos Total (informativo)',nom.bonos_total,'','','','']);
  for(const d of(nom.ded_q1||[]))rows.push(['NominaQ1',d.nombre,d.valor_fijo||'',d.porcentaje?(d.porcentaje*100).toFixed(0)+'%':'','','','']);
  for(const d of(nom.ded_q2||[]))rows.push(['NominaQ2',d.nombre,d.valor_fijo||'',d.porcentaje?(d.porcentaje*100).toFixed(0)+'%':'','','','']);
  const csv=rows.map(r=>r.map(c=>'"'+String(c||'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})),download:'Finanzas_'+m.nombre+'_2026.csv'});
  a.click();toast('Exportado · Ábrelo en Excel');
}

// Arranque automático — se salta por completo cuando window.__SKIP_AUTOSTART__ está en true,
// puesto ANTES de cargar este script. Existe para poder cargar el app.js REAL (no una copia
// pegada aparte, que se desactualiza) desde tests.html y desde el runner de Node
// (test/run-tests.mjs) sin que intente desbloquear con PIN, tocar localStorage de verdad o
// registrar un service worker — ninguno de los dos entornos es la app corriendo de verdad.
if(!(typeof window!=='undefined' && window.__SKIP_AUTOSTART__)){

initApp();

if('serviceWorker' in navigator){
  // En PWA instalada (standalone) el navegador no siempre revisa si hay un sw.js
  // nuevo por su cuenta, y aunque lo detecte, la pestaña ya abierta no se refresca
  // sola — por eso forzamos reg.update() al abrir/enfocar la app y recargamos una
  // sola vez cuando el nuevo service worker toma control.
  var swRefrescando=false;
  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if(swRefrescando) return;
    // Antes esto recargaba de inmediato apenas el SW nuevo tomaba control — si el usuario
    // tenía un modal abierto (editando un gasto, escribiendo un valor) perdía ese texto sin
    // ningún aviso. Ahora, mientras haya un modal abierto, solo se avisa y se reintenta cada
    // pocos segundos en vez de forzar la recarga.
    (function intentarRecargar(){
      var modalAbierto=document.getElementById('mbg')&&document.getElementById('mbg').classList.contains('open');
      if(modalAbierto){
        toast('Hay una nueva versión disponible — se recargará al cerrar esta ventana.',4000);
        setTimeout(intentarRecargar,3000);
        return;
      }
      swRefrescando=true;
      window.location.reload();
    })();
  });

  navigator.serviceWorker.register('sw.js', {updateViaCache:'none'}).then(function(reg){
    reg.update();
    document.addEventListener('visibilitychange', function(){
      if(document.visibilityState==='visible') reg.update();
    });
    window.addEventListener('pageshow', function(){ reg.update(); });
  }).catch(()=>{});

  navigator.serviceWorker.addEventListener('message', function(e){
    if(e.data && e.data.type==='VERSION'){
      var el=document.getElementById('lockVersion');
      if(el) el.textContent='V '+e.data.version+' • Powered by Felipe Ocampo';
    }
  });
  navigator.serviceWorker.ready.then(function(reg){
    if(reg.active) reg.active.postMessage({type:'GET_VERSION'});
  }).catch(function(){});
}

} // fin del guard __SKIP_AUTOSTART__
