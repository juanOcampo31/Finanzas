// ── Escaneo de factura por QR ────────────────────────────────────────────────────────────────
// Lee el código QR de una factura con la cámara (jsQR, cargado vía CDN solo para esto — ver
// index.html) y de ahí intenta sacar el valor y, si se puede, el nombre del comercio, para
// precargarlos en el formulario de gasto que esté abierto. NO guarda la foto en ningún momento
// (ni el frame de video ni una captura) — solo el texto plano que traía el QR (facturaQR), como
// referencia de que ese gasto viene de una factura escaneada.
//
// El contenido real de un QR de factura varía mucho según el proveedor de facturación
// electrónica (cada software de la DIAN arma su propia URL/formato) — así que esto NUNCA asume
// un formato único: intenta reconocer patrones comunes (parámetros de URL tipo valor/total/monto,
// o un monto suelto en el texto plano) y siempre deja el texto crudo a la vista para que el
// usuario confirme o corrija antes de usarlo. Es una ayuda para no tener que escribir el valor a
// mano, no una lectura garantizada.
let qrStream=null;
let qrScanning=false;
let qrAnimFrame=null;

function abrirEscanearFactura(eid,wh,pid){
  iniciarPickerPending(eid,wh,pid); // mismo estado pendiente que usan los demás pickers del formulario de gasto
  if(typeof jsQR==='undefined'){
    showAlert('No se pudo cargar el lector de QR (revisa tu conexión a internet e intenta de nuevo).');
    return;
  }
  qrRenderCamara();
  document.getElementById('qrbg').classList.add('open');
  qrIniciarCamara();
}

function qrRenderCamara(){
  document.getElementById('qrc').innerHTML=
    '<div class="qr-video-wrap">'
    +'<video id="qr-video" autoplay playsinline muted></video>'
    +'<canvas id="qr-canvas" style="display:none"></canvas>'
    +'<div class="qr-frame"><div class="qr-frame-box"></div></div>'
    +'<div class="qr-top"><button class="qr-top-btn" onclick="qrCancelar()">'+icon('x',18)+'</button>'
    +'<span style="color:#fff;font-size:13px;font-weight:700">Escanear factura</span>'
    +'<span style="width:36px"></span></div>'
    +'<div class="qr-status" id="qr-status">Apunta la cámara al código QR de la factura</div>'
    +'</div>';
}

async function qrIniciarCamara(){
  try{
    qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
  }catch(err){
    qrCerrarOverlay();
    showAlert('No se pudo acceder a la cámara. Revisa los permisos del navegador para este sitio.');
    return;
  }
  const video=document.getElementById('qr-video');
  if(!video){ qrDetenerCamara(); return; } // el usuario cerró el overlay mientras se pedía permiso
  video.srcObject=qrStream;
  await video.play().catch(function(){});
  qrScanning=true;
  qrLoopEscaneo();
}

function qrLoopEscaneo(){
  if(!qrScanning) return;
  const video=document.getElementById('qr-video');
  const canvas=document.getElementById('qr-canvas');
  if(!video||!canvas||video.readyState!==video.HAVE_ENOUGH_DATA){
    qrAnimFrame=requestAnimationFrame(qrLoopEscaneo);
    return;
  }
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  const imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
  const code=jsQR(imgData.data,imgData.width,imgData.height,{inversionAttempts:'dontInvert'});
  if(code&&code.data){
    qrOnDetectado(code.data);
    return;
  }
  qrAnimFrame=requestAnimationFrame(qrLoopEscaneo);
}

function qrDetenerCamara(){
  qrScanning=false;
  if(qrAnimFrame) cancelAnimationFrame(qrAnimFrame);
  qrAnimFrame=null;
  if(qrStream){
    qrStream.getTracks().forEach(function(t){ t.stop(); });
    qrStream=null;
  }
}
function qrCerrarOverlay(){
  qrDetenerCamara();
  document.getElementById('qrbg').classList.remove('open');
  document.getElementById('qrc').innerHTML='';
}
function qrCancelar(){
  qrCerrarOverlay();
  reabrirGastoDesdePending();
}

// Intenta reconocer el valor (y, si se puede, el nombre del comercio) dentro del texto del QR.
// Soporta dos formas comunes: 1) una URL con parámetros de consulta (ej. ?valor=120000&nit=...),
// buscando por nombre de parámetro; 2) texto plano con un monto reconocible (ej. "VALOR: 120.000"
// o un "$120.000" suelto). Si no encuentra nada, deja ambos campos vacíos — nunca inventa un dato.
function parsearFacturaQR(texto){
  var valor=null, nombre=null;
  var nombresValor=['valor','total','monto','amount','valfac','totalfactura','importe','vlrtotal','vlr_total'];
  var nombresNombre=['nombre','razonsocial','emisor','proveedor','vendor','name','nomemisor'];
  try{
    var url=new URL(texto);
    url.searchParams.forEach(function(v,k){
      var kl=k.toLowerCase();
      if(valor===null&&nombresValor.indexOf(kl)>=0){
        var n=parseFloat(v.replace(/[^\d.,]/g,'').replace(/\./g,'').replace(',','.'));
        if(!isNaN(n)&&n>0) valor=Math.round(n);
      }
      if(nombre===null&&nombresNombre.indexOf(kl)>=0&&v.trim()) nombre=v.trim();
    });
  }catch(e){
    // No es una URL — texto plano. Busca "etiqueta: monto" o un "$monto" suelto.
    var mEtiqueta=texto.match(/(valor|total|monto)\s*[:=]\s*\$?\s*([\d.,]+)/i);
    var mPeso=texto.match(/\$\s*([\d.,]{4,})/);
    var crudo=mEtiqueta?mEtiqueta[2]:(mPeso?mPeso[1]:null);
    if(crudo){
      var limpio=crudo.replace(/\./g,'').replace(',','.');
      var n2=parseFloat(limpio);
      if(!isNaN(n2)&&n2>0) valor=Math.round(n2);
    }
  }
  return {valor:valor,nombre:nombre,raw:texto};
}

function qrOnDetectado(texto){
  qrDetenerCamara();
  const datos=parsearFacturaQR(texto);
  document.getElementById('qrc').innerHTML=
    '<div class="qr-confirm">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    +'<button type="button" onclick="qrCancelar()" style="width:34px;height:34px;border-radius:10px;background:none;border:none;color:var(--mut);display:flex;align-items:center;justify-content:center;cursor:pointer">'+icon('x',18)+'</button>'
    +'<span style="font-size:15px;font-weight:800;color:var(--txt)">Factura escaneada</span>'
    +'<span style="width:34px"></span>'
    +'</div>'
    +(datos.valor||datos.nombre?'':'<p style="font-size:12px;color:var(--amb);background:var(--amb-d);border-radius:var(--r2);padding:8px 10px;margin-bottom:12px;line-height:1.5">No se pudo reconocer el valor automáticamente en este QR. Revisa el texto detectado abajo y escribe el valor a mano.</p>')
    +'<div class="field"><label>Valor detectado</label><input id="qr-valor" type="text" inputmode="numeric" value="'+(datos.valor?moneyInputFmt(datos.valor):'')+'" placeholder="Ej: 120.000" oninput="maskMoneyInput(this)"></div>'
    +'<div class="field"><label>Nombre (opcional)</label><input id="qr-nombre" value="'+esc(datos.nombre||'')+'" placeholder="Ej: Éxito, Claro..."></div>'
    +'<div class="field"><label>Texto detectado en el QR</label><div class="qr-confirm-raw">'+esc(datos.raw)+'</div></div>'
    +'<div style="margin-top:auto;display:flex;flex-direction:column;gap:10px;padding-top:14px">'
    +'<button class="bpri" style="width:100%;padding:13px 0;border-radius:14px" onclick="qrConfirmarUso(\''+escJS(datos.raw)+'\')">Usar estos datos</button>'
    +'<button type="button" onclick="qrReintentar()" style="width:100%;text-align:center;background:none;border:none;color:var(--mut);font-size:13px;font-weight:700;cursor:pointer;padding:2px">Escanear de nuevo</button>'
    +'</div>'
    +'</div>';
}
function qrReintentar(){
  qrRenderCamara();
  qrIniciarCamara();
}
function qrConfirmarUso(raw){
  if(!_gastoFormPending){ qrCerrarOverlay(); return; }
  const valor=moneyVal('qr-valor');
  const nombre=(document.getElementById('qr-nombre').value||'').trim();
  if(valor>0) _gastoFormPending.data.presupuesto=valor;
  if(nombre) _gastoFormPending.data.nombre=nombre;
  _gastoFormPending.data.facturaQR=raw;
  qrCerrarOverlay();
  reabrirGastoDesdePending();
  toast(valor>0?'Datos de la factura aplicados al gasto':'Factura asociada al gasto');
}
