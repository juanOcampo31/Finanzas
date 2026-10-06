// ── Formulario Editar/Nuevo gasto ────────────────────────────────────────────
// Fase 2 de la migración a una arquitectura más modular: separado de gasto-pickers.js (que
// ahora solo tiene los pickers de pantalla completa que este formulario usa). Acá vive el
// formulario en sí (openGasto/saveG), convertir a grupo/eliminar y crear-gasto-desde-crédito.
function openGasto(g,which,parentId,skipFocus){
  const e=g||{nombre:'',presupuesto:0,metodo:'',pagado_real:null,estado:null,pagado_flag:false};
  // isE (¿existe ya el gasto?) se basa en si trae id, no solo en si "g" es un objeto — al
  // reabrir el formulario tras elegir algo en el picker de Forma de pago/Grupo (ver
  // reabrirGastoDesdePending) se pasa un objeto con los datos capturados EN CURSO, que para un
  // gasto todavía no guardado no trae id; si isE se basara en "!!g" quedaría mal marcado como
  // edición (nombre bloqueado, aparecería "Eliminar gasto", etc.) solo por reabrir el formulario.
  const isE=!!(g&&g.id);
  const pid=parentId||'';
  const eid=isE?e.id:'';
  const wh=which||'q1';

  // Si el gasto está ligado a un crédito, "Valor" arranca mostrando el valor de ESA cuota (el
  // valor no lo decide el usuario, lo decide la tabla de amortización). El campo se puede
  // seguir editando: si el usuario escribe un número mayor, mientras la ventana esté abierta se
  // respeta tal cual lo que escribió (no se le pisa el campo en vivo) — solo AL GUARDAR (ver
  // saveG) ese excedente se traslada a "valor real pagado" y el campo vuelve a fijarse en la
  // cuota. Un valor igual o menor no dispara nada especial.
  var creditoLigado=(e.creditoId&&creditos[e.creditoId])?creditos[e.creditoId]:null;
  var cuotaValorActual=null, cuotaNumActual=null, cuotaTotalActual=null;
  if(creditoLigado){
    var amortLigado=calcAmortizacion(creditoLigado);
    cuotaNumActual=e.numCuota||1;
    var rowLigado=amortLigado.rows[cuotaNumActual-1];
    // OJO: rowLigado.valorCuota NO sirve acá si esta cuota ya se pagó con un abono mayor —
    // calcAmortizacionSinCache reemplaza el valor de la fila por el monto REAL pagado
    // (pagoDetalle[k].montoPagado) una vez registrado, así que después de un abono mayor
    // rowLigado.valorCuota deja de ser "la cuota" y pasa a ser "lo que ya pagaste". El valor
    // fijo/teórico de la cuota es amort.valorCuota (constante para todo el plazo, salvo la
    // última cuota si cierra antes por abonos previos — caso borde que no cubre este cálculo).
    cuotaValorActual=amortLigado.valorCuota||(rowLigado?rowLigado.valorCuota:e.presupuesto);
    cuotaTotalActual=amortLigado.rows.length;
  }
  var valorMostrado=creditoLigado?cuotaValorActual:e.presupuesto;
  // Si ya se pagó esta cuota con un valor distinto al fijo (abono mayor), se muestra como dato
  // adicional debajo de "Valor" — que siempre sigue mostrando la cuota, no lo realmente pagado.
  var pagadoRealDistinto=creditoLigado&&e.pagado_real!=null&&e.pagado_real!==cuotaValorActual;

  var defaultMetodo=e.metodo||(catMetodos[0]?catMetodos[0].nombre:'');
  if(!e.id&&pid){
    var parentG=(getM()[wh==='q1'?'q1_gastos':'q2_gastos']||[]).find(function(x){return x.id===pid;});
    if(parentG&&parentG.metodo) defaultMetodo=parentG.metodo;
  }

  const opts=catMetodos.map(function(x){return '<option'+(defaultMetodo===x.nombre?' selected':'')+'>'+esc(x.nombre)+'</option>';}).join('');

  // Mover un gasto existente (independiente o de otro grupo) a un grupo desplegable ya
  // creado, sin tener que borrarlo y volver a crearlo como subgasto. No aplica al editar
  // el grupo mismo (no se puede anidar un grupo dentro de otro).
  // "Grupo" abre un picker de pantalla completa (abrirPickerGrupo) en vez de un <select> nativo,
  // igual que "Forma de pago" — más legible con listas largas y consistente con el mockup de
  // rediseño. El <select> real queda oculto solo para que saveG() lo siga leyendo tal cual.
  var moverGrupoField='';
  if(isE && !e.esGrupo){
    const listNow2=wh==='q1'?(getM().q1_gastos||[]):(getM().q2_gastos||[]);
    const gruposNow=listNow2.filter(function(x){return x.esGrupo&&x.id!==eid;});
    if(gruposNow.length>0||e.parentId){
      var grupoOpts='<option value="">— Sin agrupar —</option>'+gruposNow.map(function(gr){
        return '<option value="'+gr.id+'"'+(e.parentId===gr.id?' selected':'')+'>'+esc(nombreGasto(gr))+'</option>';
      }).join('');
      var grupoActual=e.parentId?(gruposNow.find(function(gr){return gr.id===e.parentId;})):null;
      var grupoLabel=grupoActual?nombreGasto(grupoActual):'Sin agrupar';
      moverGrupoField='<select id="g-grupo-destino" style="display:none">'+grupoOpts+'</select>'
        +stdFormRowHtml('folder','var(--amb-d)','var(--amb)','Asociar a grupo',grupoLabel,"abrirPickerGrupo('"+eid+"','"+wh+"','"+pid+"')");
    }
  }

  // "Pagos parciales" (abonos acumulables, mismo patrón que los abonos a capital de un
  // crédito): solo aplica a un gasto YA guardado y que no sea un grupo (el valor de un grupo es
  // derivado, no algo contra lo que abonar). Abrir esta fila lleva a abrirAbonosGasto
  // (gasto-pago.js), que lista lo abonado y permite agregar un pago nuevo; al completar el
  // 100% del valor, el gasto se marca "Pagado" solo (misma lógica que ya tenía un gasto
  // ligado a un crédito cuando se paga con un abono mayor al de la cuota).
  var abonosFieldHtml='';
  if(isE && !e.esGrupo){
    var abonosGasto=e.abonos||[];
    var sumAbonosGasto=abonosGasto.reduce(function(a,ab){return a+(ab.monto||0);},0);
    var abonosLabelActual=sumAbonosGasto>0?(cop(sumAbonosGasto)+' de '+cop(Math.abs(e.presupuesto||0))):'Sin pagos parciales';
    abonosFieldHtml=stdFormRowHtml('dollar','var(--grn-d)','var(--grn)','Pagos parciales',abonosLabelActual,"abrirAbonosGasto('"+eid+"','"+wh+"')");
  }

  // "Escanear factura" (ver js/factura-scan.js): lee el QR de una factura con la cámara y
  // precarga Valor/Nombre en este mismo formulario — no aplica a un grupo (no hay una sola
  // factura que represente a todos sus subgastos). El texto crudo del QR (facturaQR) viaja en
  // un input oculto, igual que pagado_real/comprobante, porque no es un campo visible como tal.
  var facturaFieldHtml='';
  if(!e.esGrupo){
    var facturaLabelActual=e.facturaQR?'Factura asociada ✓':'Ninguna';
    facturaFieldHtml=stdFormRowHtml('camera','var(--acc-d)','var(--acc)','Escanear QR',facturaLabelActual,"abrirEscanearFactura('"+eid+"','"+wh+"','"+pid+"')");
  }

  // "Asociar a crédito" abre un picker de pantalla completa (abrirPickerCredito), igual que
  // "Forma de pago" — con la lista de créditos y, dentro del mismo picker, "+ Crear crédito
  // nuevo (cuotas fijas)" (antes era un enlace aparte en Más opciones, solo visible cuando no
  // había ningún crédito asociado). El <select> real queda oculto solo para que saveG() lo siga
  // leyendo tal cual (incluido data-cuota, que usaba antes sugerirCuotaCredito()).
  var creditoField='';
  if(!isE){
    var creditoOpts='<option value="">— Ninguno —</option>'+Object.keys(creditos).map(function(cid){
      return '<option value="'+cid+'"'+(e.creditoId===cid?' selected':'')+'>'+esc(creditos[cid].nombre)+'</option>';
    }).join('');
    var creditoLabelActual=(e.creditoId&&creditos[e.creditoId])?creditos[e.creditoId].nombre:'Ninguno';
    creditoField='<select id="g-credito" style="display:none" data-cuota="'+(e.numCuota||'')+'">'+creditoOpts+'</select>'
      +stdFormRowHtml('bank','var(--pur-d)','var(--pur)','Asociar a crédito',creditoLabelActual,"abrirPickerCredito('"+wh+"','"+pid+"')");
  }

  // "Convertir en grupo desplegable" ya no vive como fila de la tarjeta de Detalles — ahora es
  // un switch (mismo objeto visual que "Registrarlo también como gasto" al crear un recordatorio
  // en Agenda/Quincena, ver agBloqueRegistrarGastoHtml en js/agenda.js: píldora de 44x26 con
  // círculo que se desliza) puesto justo al lado del nombre del gasto. Aplica tanto a un gasto
  // nuevo de nivel raíz (!isE&&!pid, dispara convertirEnGrupoDesdeCreacion — guarda primero y
  // luego abre la configuración del grupo) como a cualquier gasto ya existente que no sea
  // subgasto de otro grupo (isE&&!e.parentId, dispara convertirGrupo — sirve tanto para
  // convertirlo por primera vez como para reabrir la configuración si ya es grupo). Un subgasto
  // (parentId) nunca puede convertirse en grupo, así que ahí no aparece.
  var grupoSwitchOn=isE&&!!e.esGrupo;
  var grupoSwitchHtml='';
  if((!isE&&!pid)||(isE&&!e.parentId)){
    var grupoSwitchClick=isE?("convertirGrupo('"+eid+"','"+wh+"')"):("convertirEnGrupoDesdeCreacion('"+wh+"','"+pid+"')");
    grupoSwitchHtml='<button type="button" onclick="'+grupoSwitchClick+'" title="Grupo desplegable" style="width:40px;height:24px;border-radius:12px;padding:2px;border:none;cursor:pointer;flex-shrink:0;display:flex;background:'+(grupoSwitchOn?'var(--pur)':'#22304F')+'">'
      +'<span style="display:block;width:20px;height:20px;border-radius:50%;background:'+(grupoSwitchOn?'#fff':'var(--mut)')+';transform:translateX('+(grupoSwitchOn?'16px':'0')+');transition:transform .15s ease"></span>'
      +'</button>';
  }
  // "Eliminar grupo (y subgastos)" sigue como fila propia en Detalles (acción destructiva
  // aparte, no algo que el switch de arriba deba disparar sin querer).
  var grpBtn='';
  if(isE&&e.esGrupo){
    grpBtn=stdFormActionRowHtml('trash','var(--red-d)','var(--red)','Eliminar grupo (y subgastos)',"delGrupo('"+eid+"','"+wh+"')",'var(--red)');
  }

  // Campo Nombre: al EDITAR un gasto ya existente no se puede renombrar desde aquí (se
  // muestra como texto fijo, sin caja de input) — evita relacionar mal un gasto ya en curso
  // (p.ej. una cuota de crédito) con un nombre distinto al que tiene en el resto de la app.
  // Al CREAR uno nuevo sigue siendo editable como siempre.
  var nameFieldHtml;
  if(isE){
    // Un gasto ligado a un crédito sigue sin poder renombrarse aquí (su nombre lo fija el
    // crédito, ver prefijoCredito en elegirCredito/crearGastoDesdeCredito) — para cualquier
    // otro gasto ya guardado, el lápiz habilita el input (ver habilitarEdicionNombreGasto).
    var nombreEditBtn=creditoLigado?'':('<button type="button" onclick="habilitarEdicionNombreGasto()" style="background:none;border:none;color:var(--mut);cursor:pointer;display:flex;align-items:center;flex-shrink:0;padding:2px">'+icon('edit',14)+'</button>');
    nameFieldHtml='<div style="display:flex;flex-direction:column;gap:3px">'
      +'<div style="display:flex;align-items:center;justify-content:center;gap:10px">'
      +'<input id="g-n" value="'+esc(e.nombre)+'" readonly data-cat-tipo-id="'+(e.catTipoId||'')+'" style="font-family:inherit;background:transparent;border:none;outline:none;font-size:16px;font-weight:700;color:var(--txt);padding:0;cursor:default;text-align:center;max-width:100%">'
      +(creditoLigado?'':nombreEditBtn)
      +grupoSwitchHtml
      +'</div>'
      +(creditoLigado?('<div style="text-align:center"><span onclick="creditoDetalleDesdeModal=false;closeModal();openCreditoDetalle(\''+e.creditoId+'\')" style="font-size:11px;font-weight:600;color:var(--acc);cursor:pointer;text-decoration:underline;text-underline-offset:2px;white-space:nowrap">Ver detalle '+etiquetaCredito(creditoLigado)+' · '+esc(creditoLigado.nombre)+'</span></div>'):'')
      +'</div>';
  } else {
    nameFieldHtml = '<div class="field" style="margin:0"><label>Nombre</label>'
      +'<div style="display:flex;align-items:center;gap:10px">'
      +'<input id="g-n" value="'+esc(e.nombre)+'" data-cat-tipo-id="" placeholder="Arriendo, Mercado, Luz..." style="flex:1;min-width:0">'
      +grupoSwitchHtml
      +'</div></div>';
  }

  // "Crear crédito nuevo": un gasto a cuotas fijas se maneja como un crédito interno con tasa 0
  // (cuota fija, sin interés) — reutiliza todo el motor de amortización/generación mensual de
  // créditos en vez de un contador manual de cuotas. Es un enlace (no un check, porque no es un
  // estado del gasto sino una acción: navega directo a Créditos para crearlo ahí (con su plazo,
  // frecuencia y fecha reales) y, al guardar el crédito, este mismo gasto (en la Q en la que se
  // estaba creando) se agrega automáticamente ya vinculado — no hay que volver a este
  // formulario. El enlace "Ver detalle del crédito" para gastos YA vinculados vive junto al
  // nombre del crédito, debajo de "Valor" (ver valorBlockHtml) — no aquí en Más opciones, porque
  // es la info más relevante de ESE gasto puntual.
  // (El viejo editor manual "Maneja cuotas" — cuotas_total/cuota_actual sin creditoId — se quitó
  // del proceso: con créditos ya cubre ese caso de forma completa, sin duplicar lógica.)

  // Bloque "Valor": número grande centrado con línea de acento debajo, como el mockup de
  // rediseño (Editar Gasto.dc.html, tarjeta 2A). "Valor" siempre representa el valor de la
  // cuota vigente para este período (para un gasto ligado a un crédito, la cuota real de la
  // tabla de amortización; para cualquier otro, el presupuesto de ese gasto en esta quincena).
  // El enlace "Ver detalle del crédito" va junto al nombre del gasto (ver nameFieldHtml), no
  // acá — acá solo queda el subtítulo "Cuota N de M".
  const valorSubtitulo=creditoLigado
    ?('Cuota '+cuotaNumActual+' de '+cuotaTotalActual)
    :'COP · valor de la cuota';
  const valorBlockHtml='<div style="padding:0 4px 2px;display:flex;flex-direction:column;gap:4px;align-items:center;text-align:center">'
    +'<div style="display:flex;align-items:baseline;gap:6px;padding-bottom:6px;border-bottom:2px solid var(--acc)">'
    +'<span style="font-size:22px;font-weight:600;color:var(--mut)">$</span>'
    +'<input id="g-p" type="text" inputmode="numeric" value="'+moneyInputFmt(valorMostrado)+'" oninput="maskMoneyInput(this);'
    +(creditoLigado?('mostrarCuotaOriginalSiCambia(this,'+cuotaValorActual+',\''+wh+'\')'):'')
    +'"'
    +' style="font-family:inherit;width:180px;background:transparent;border:none;outline:none;font-size:38px;font-weight:800;color:var(--txt);letter-spacing:-.02em;font-variant-numeric:tabular-nums;text-align:center;padding:0">'
    +'</div>'
    +'<div style="font-size:11px;color:var(--mut)">'+valorSubtitulo
    +(creditoLigado?('<span id="g-cuota-original-line" style="display:none"> · Cuota original: '+cop(cuotaValorActual)+'</span>'):'')
    +(creditoLigado?'<span id="g-pago-extra-span" style="display:none;color:var(--acc);font-weight:600"></span>':'')
    +(pagadoRealDistinto?(' · <span id="g-pagado-real-line" style="color:var(--acc);font-weight:600">Pagaste '+cop(e.pagado_real)+'</span>'):'')
    +'</div>'
    +'</div>';

  // Forma de pago: fila que abre un picker de pantalla completa (abrirPickerFormaPago) con la
  // lista de formas de pago, en vez de un <select> nativo — más legible y es donde ahora vive
  // "+ Nueva forma de pago" (ya no ocupa espacio propio en el formulario de gasto). El <select>
  // real queda oculto solo para que saveG() lo siga leyendo tal cual.
  const formaPagoRowHtml='<select id="g-m" style="display:none">'+opts+'</select>'
    +stdFormRowHtml('card','var(--grn-d)','var(--grn)','Forma de pago',defaultMetodo,"abrirPickerFormaPago('"+eid+"','"+wh+"','"+pid+"')",false);

  // Sección "Estado": campo único de tres valores mutuamente excluyentes — null ("sin
  // definir", el estado por defecto de un gasto nuevo, todavía no revisado), 'sinpagar'
  // (decidí que está pendiente) o 'pagado' (el dinero ya salió). Se muestra como dos tarjetas
  // deseleccionables: tocar la inactiva la activa y apaga la otra; tocar la ACTIVA la
  // desmarca y vuelve a "sin definir". Reemplaza los dos checkboxes independientes de antes
  // (g-pd/g-sp), que permitían guardar el estado imposible "pagado y sin pagar a la vez".
  // El rótulo de la segunda tarjeta cambia según la quincena (labelSinPagar, más abajo): "Mover
  // a Q2" en Q1, "Sin pagar" en Q2. En Q1, seleccionar esa tarjeta guarda el formulario de una
  // vez (mismo saveG de siempre) y por lo tanto abre directo "¿Mover a Q2?" — no hace falta un
  // botón aparte para eso, ver seleccionarEstadoGasto().
  // Altura de las tarjetas igualada a la de los botones de la app (.bpri/.bcnl: padding
  // 11px) — por eso padding vertical chico + altura fija con contenido centrado, en vez del
  // padding amplio de antes (pensado para dos líneas de texto en ambas tarjetas).
  const CARD_ESTADO_BASE='flex:1;height:44px;padding:0 10px;border-radius:12px;background:#0B1526;border:1px solid #22304F;display:flex;flex-direction:row;justify-content:center;gap:6px;align-items:center;cursor:pointer;transition:all 140ms ease;box-sizing:border-box';
  const CARD_SINPAGAR_ON='flex:1;height:44px;padding:0 10px;border-radius:12px;background:#2A1D06;border:1px solid #F59E0B;display:flex;flex-direction:row;justify-content:center;gap:6px;align-items:center;cursor:pointer;transition:all 140ms ease;box-sizing:border-box';
  const CARD_PAGADO_ON='flex:1;height:44px;padding:0 10px;border-radius:12px;background:#062B33;border:1px solid #22D3EE;display:flex;flex-direction:row;justify-content:center;gap:6px;align-items:center;cursor:pointer;transition:all 140ms ease;box-sizing:border-box';
  const estadoInicial=gastoEstado(e);
  const tituloPagadoColor=estadoInicial==='pagado'?'#67E8F9':'#94A3B8';
  const tituloSinPagarColor=estadoInicial==='sinpagar'?'#FBBF24':'#94A3B8';
  // La tarjeta "Sin pagar" muestra un solo rótulo (sin subtítulo aparte): en Q1 dice "Mover a
  // Q2" (la acción que en verdad va a pasar), en Q2 dice "Sin pagar" (no hay adónde moverlo,
  // queda como recordatorio). La primera tarjeta dice "Pagar" cuando todavía no está marcada
  // (invita a la acción) y "Pagado" cuando ya lo está (describe el hecho) — mismo criterio en
  // vivo al seleccionarla/deseleccionarla, ver pintarEstadoGasto().
  const labelSinPagar=wh==='q1'?'Mover a Q2':'Sin pagar';
  const labelPagado=estadoInicial==='pagado'?'Pagado':'Pagar';
  const estadoSectionHtml='<div style="padding:4px 0 0">'
    +'<input type="hidden" id="g-estado" value="'+(estadoInicial||'')+'">'
    +'<div style="display:flex;gap:8px">'
    +'<div id="g-card-pagado" onclick="seleccionarEstadoGasto(\'pagado\',\''+wh+'\',\''+eid+'\',\''+pid+'\')" style="'+(estadoInicial==='pagado'?CARD_PAGADO_ON:CARD_ESTADO_BASE)+'">'
    +'<span id="g-card-pagado-icon" style="display:flex;color:'+tituloPagadoColor+'">'+icon('check',13)+'</span>'
    +'<div id="g-card-pagado-titulo" style="font-size:13.5px;font-weight:800;color:'+tituloPagadoColor+'">'+labelPagado+'</div>'
    +'</div>'
    +'<div id="g-card-sinpagar" onclick="seleccionarEstadoGasto(\'sinpagar\',\''+wh+'\',\''+eid+'\',\''+pid+'\')" style="'+(estadoInicial==='sinpagar'?CARD_SINPAGAR_ON:CARD_ESTADO_BASE)+'">'
    +'<span id="g-card-sinpagar-icon" style="display:flex;color:'+tituloSinPagarColor+'">'+icon('arrowRight',13)+'</span>'
    +'<div id="g-card-sinpagar-titulo" style="font-size:13.5px;font-weight:800;color:'+tituloSinPagarColor+'">'+labelSinPagar+'</div>'
    +'</div>'
    +'</div>'
    +'</div>';

  // "Más opciones" (Asociar a crédito, Convertir en grupo/Editar grupo/Eliminar grupo) ya no
  // vive plegada detrás de un toggle aparte — antes escondía datos que a veces YA existían (un
  // gasto ligado a un crédito, por ejemplo) detrás de un clic extra. Ahora son filas más de la
  // misma tarjeta de Detalles, siempre visibles: menos plegado, más compacto en conjunto (una
  // sola tarjeta con líneas finas en vez de dos tarjetas con su propio encabezado cada una).
  // "Valor real pagado" ya no es un campo visible del formulario, pero sigue existiendo como
  // dato del gasto (pagado_real) — lo siguen leyendo saveG() y sincronizarCreditoDesdeGasto().
  // Este input oculto solo sirve de valor por defecto al abrir el formulario (y para que los
  // pickers de Forma de pago/Grupo lo preserven vía capturarEstadoFormGasto); saveG() calcula
  // el valor real a guardar directamente a partir de lo escrito en "Valor", no de este campo.
  const realHiddenInput='<input type="hidden" id="g-r" value="'+moneyInputFmt(e.pagado_real)+'">'
    +'<input type="hidden" id="g-facturaqr" value="'+esc(e.facturaQR||'')+'">';

  // Encabezado: cerrar (X) a la izquierda, título centrado, eliminar (ícono) a la derecha — el
  // botón rojo grande de "Eliminar gasto" ya no ocupa espacio en el cuerpo del formulario.
  const headerHtml=stdFormHeaderHtml(isE?'Editar gasto':'Nuevo gasto',null,isE?("delG('"+eid+"','"+wh+"')"):null);

  // Nombre + Valor + Estado, agrupados en una sola tarjeta destacada (antes vivían sueltos: el
  // nombre iba abajo del todo, separado del monto al que pertenece).
  const heroHtml=stdFormHeroCardHtml(nameFieldHtml+valorBlockHtml+estadoSectionHtml);

  // Forma de pago / Asociar a grupo / Asociar a crédito / convertir-editar-eliminar grupo —
  // todo agrupado en una sola tarjeta con ícono por fila (antes "Más opciones" era una segunda
  // tarjeta plegada aparte, con su propio encabezado ocupando espacio extra).
  const detallesCardHtml=stdFormCardHtml(formaPagoRowHtml+abonosFieldHtml+facturaFieldHtml+moverGrupoField+creditoField+grpBtn);

  const footerHtml=stdFormFooterHtml("saveG('"+eid+"','"+wh+"','"+pid+"')",'Guardar');

  const html=headerHtml
    +realHiddenInput
    +heroHtml
    +detallesCardHtml
    +footerHtml;
  openModal(html);
  // Selección automática del valor de "Valor" SOLO al abrir el formulario de verdad (por
  // primera vez): con el valor ya seleccionado alcanza con escribir para reemplazarlo, sin
  // tocar el campo primero. El truco de marcarlo readOnly antes de enfocar/seleccionar es a
  // propósito: enfocar un input SIEMPRE dispara el teclado numérico en móvil aunque no se llame
  // pEl.focus() explícitamente (pEl.select() por sí solo ya enfoca el campo) — pero un input
  // readOnly puede recibir foco y mostrar su texto seleccionado SIN que el navegador abra el
  // teclado. En cuanto el usuario de verdad toca el campo (primer touchstart/mousedown) se
  // quita el readOnly, así ese mismo toque ya lo deja editable con el teclado normal. skipFocus
  // =true cuando en realidad esto es un RE-render tras volver de un picker interno (Forma de
  // pago/Grupo/Crédito/plantilla, ver reabrirGastoDesdePending) — antes se repetía esta
  // selección cada vez que se volvía de cualquiera de esos pickers, tirando al usuario de vuelta
  // a "Valor" justo cuando quería seguir editando otro campo distinto.
  if(!skipFocus){
    // El setTimeout es necesario porque openModal recién acaba de inyectar el HTML — sin él, el
    // input todavía no está listo para recibir la selección en algunos navegadores.
    setTimeout(function(){
      const pEl=document.getElementById('g-p');
      if(!pEl) return;
      pEl.readOnly=true;
      pEl.focus();
      pEl.select();
      function habilitarEdicion(){
        pEl.readOnly=false;
        pEl.removeEventListener('touchstart',habilitarEdicion);
        pEl.removeEventListener('mousedown',habilitarEdicion);
      }
      pEl.addEventListener('touchstart',habilitarEdicion,{once:true});
      pEl.addEventListener('mousedown',habilitarEdicion,{once:true});
    },50);
  }
}
// Lápiz junto a "Nombre" al editar un gasto ya guardado (ver nameFieldHtml en openGasto):
// el input nace readonly para no permitir renombrar sin querer un gasto que puede estar
// vinculado a un catálogo o a un grupo; tocar el lápiz lo habilita para ese guardado puntual.
function habilitarEdicionNombreGasto(){
  const nEl=document.getElementById('g-n');
  if(!nEl) return;
  nEl.readOnly=false;
  nEl.style.cursor='text';
  nEl.focus();
  nEl.select();
}
// Al marcar "Crear crédito nuevo" en un gasto nuevo, se abandona este formulario y se abre
// directamente "Nuevo crédito" (con nombre y cuota precargados si ya se habían escrito), para
// que el crédito se cree con sus datos reales (plazo, frecuencia, fecha) en vez de un mini-form
// aparte dentro del gasto. Se guarda en qué Q (y grupo, si aplica) se estaba creando el gasto
// para que, al guardar el crédito, saveNewCredito() cree ahí mismo el gasto ya vinculado —
// el usuario no tiene que volver a este formulario ni usar "Asociar a crédito" manualmente.
let creditoDesdeGastoCtx=null;
function irCrearCreditoDesdeGasto(which,parentId){
  const nombreVal=document.getElementById('g-n')?.value.trim()||'';
  const valorVal=moneyVal('g-p');
  const metodoVal=document.getElementById('g-m')?.value||'';
  creditoDesdeGastoCtx={which:which||'q1',parentId:parentId||null,metodo:metodoVal};
  openNewCredito('manual');
  const crNombre=document.getElementById('cr-nombre');
  if(crNombre&&nombreVal) crNombre.value=nombreVal;
  const crCuotaManual=document.getElementById('cr-cuota-manual');
  if(crCuotaManual&&valorVal>0) setMoneyValue(crCuotaManual,valorVal);
}

// Crea el gasto de la primera cuota de un crédito recién creado, ya vinculado (creditoId/
// numCuota), en la Q donde el usuario venía trabajando — mismo shape que genera
// generarGastosCredito() para los meses siguientes, así el badge "N/M · mes" es consistente.
function crearGastoDesdeCredito(creditoId,ctx){
  const cr=creditos[creditoId]; if(!cr) return;
  const amort=calcAmortizacion(cr);
  const row=amort.rows[0];
  const m=getM(),list=ctx.which==='q1'?m.q1_gastos:m.q2_gastos;
  const gasto={
    id:uid(),nombre:prefijoCredito(cr)+cr.nombre,presupuesto:row.valorCuota,
    metodo:ctx.metodo||(catMetodos[0]?catMetodos[0].nombre:''),
    pagado_real:null,estado:null,pagado_flag:false,sinpagar:false,parentId:ctx.parentId||null,
    cuotas_total:cr.cuotas,cuota_actual:1,creditoId:creditoId,numCuota:1,mensualidad:null
  };
  list.push(gasto);
  lastCreatedId=gasto.id;
}


function saveG(id,which,parentId){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  // Se consume (y limpia) el flag apenas entra la función, no al final: si algo más abajo
  // corta la ejecución con un "return" temprano (nombre vacío, orden de pago bloqueado), el
  // flag no debe quedar pegado en true esperando el próximo guardado que nada tenga que ver.
  const convertirTrasGuardar=_convertirGrupoTrasGuardar;
  _convertirGrupoTrasGuardar=false;
  const nEl=document.getElementById('g-n');
  const nombre=nEl.value.trim();
  const catTipoIdSel=nEl.dataset.catTipoId||null;
  const presup=moneyVal('g-p');
  let real=moneyVal('g-r')||null;
  const metodo=document.getElementById('g-m').value;
  // Estado: campo único ('pagado' | 'sinpagar' | null vía cadena vacía) que viene de las dos
  // tarjetas deseleccionables de Estado (ver openGasto) — reemplaza los checkboxes g-pd/g-sp
  // independientes, que permitían dejar guardado el estado imposible "pagado y sin pagar" a
  // la vez. paid/sinpagar se siguen derivando acá porque el resto de saveG (y sincronizarCreditoDesdeGasto)
  // todavía los usa como booleanos.
  const estadoSelEl=document.getElementById('g-estado');
  let paid=estadoSelEl?estadoSelEl.value==='pagado':false;
  let sinpagar=estadoSelEl?estadoSelEl.value==='sinpagar':false;
  const creditoSel=document.getElementById('g-credito');
  const creditoIdSel=creditoSel?creditoSel.value||null:null;
  if(!nombre){showAlert('Escribe un nombre');return;}
  let gasto;
  if(id){
    gasto=list.find(x=>x.id===id);
    if(gasto){
      const estadoAntes=gastoEstado(gasto);
      // "Valor" de un gasto ligado a un crédito no es libre: lo fija la cuota de la tabla de
      // amortización (ver comentario de creditoLigado en openGasto). Mientras el formulario
      // está abierto se respeta lo que el usuario escriba (no se le pisa el campo en vivo);
      // recién ACÁ, al guardar, si lo escrito supera la cuota se traslada a "valor real pagado"
      // y "Valor" queda fijado en la cuota — sin esto último, cualquier número que se hubiera
      // escrito de más quedaría guardado como presupuesto en vez de como pago real.
      let presupFinal=presup;
      if(gasto.creditoId && creditos[gasto.creditoId]){
        const amortG=calcAmortizacion(creditos[gasto.creditoId]);
        const rowG=amortG.rows[(gasto.numCuota||1)-1];
        // amortG.valorCuota (fijo/teórico) en vez de rowG.valorCuota: si esta cuota ya se pagó
        // con un abono mayor, rowG.valorCuota pasa a ser el monto REAL pagado (ver comentario
        // en openGasto), y pinear presupuesto a eso reintroduciría el mismo dato equivocado.
        const cuotaValorG=amortG.valorCuota||(rowG?rowG.valorCuota:presup);
        // Siempre (no solo si "real" venía vacío): si ya había un abono mayor registrado y el
        // usuario escribe un número distinto, ese nuevo número es el que debe quedar guardado.
        // Escribir un valor mayor a la cuota es, en sí, la señal de que esta cuota se pagó, así
        // que también marca "Pagado" (estado), sin obligar a tocar la tarjeta de Estado aparte.
        if(presup>cuotaValorG){ real=presup; paid=true; sinpagar=false; }
        presupFinal=cuotaValorG;
      }
      gasto.nombre=nombre;gasto.catTipoId=catTipoIdSel||null;gasto.presupuesto=presupFinal;gasto.pagado_real=real;gasto.metodo=metodo;
      setGastoEstado(gasto,paid?'pagado':(sinpagar?'sinpagar':null));
      gasto.fecha_pago=document.getElementById('g-fp')?.value||gasto.fecha_pago||null;
      gasto.comprobante=document.getElementById('g-cmp')?.value.trim()||gasto.comprobante||null;
      gasto.facturaQR=document.getElementById('g-facturaqr')?.value||gasto.facturaQR||null;
      const grupoDestinoEl=document.getElementById('g-grupo-destino');
      if(grupoDestinoEl) gasto.parentId=grupoDestinoEl.value||null;
      // Enlace con la Agenda (ver §6 del pedido / js/agenda.js): si cambia el monto acá y el
      // gasto sigue "sin pagar", el recordatorio se actualiza sin preguntar. Una vez pagado, el
      // gasto manda y el recordatorio deja de tocarse desde este lado.
      if(gasto.agendaId && gastoEstado(gasto)!=='pagado' && typeof agSincronizarMontoDesdeGasto==='function'){
        agSincronizarMontoDesdeGasto(gasto,m);
      }
      if(!sincronizarCreditoDesdeGasto(gasto,estadoAntes)) return;
    }
  } else {
    // If this is a subgasto, inherit parent group's metodo
    var finalMetodo=metodo;
    if(parentId){
      var parentG=list.find(function(x){return x.id===parentId;});
      if(parentG&&parentG.metodo) finalMetodo=parentG.metodo;
    }
    gasto={id:uid(),nombre,presupuesto:presup,metodo:finalMetodo,pagado_real:real,estado:paid?'pagado':(sinpagar?'sinpagar':null),pagado_flag:paid,sinpagar,parentId:parentId||null,cuotas_total:0,cuota_actual:0};
    var facturaQRNueva=document.getElementById('g-facturaqr')?.value||null;
    if(facturaQRNueva) gasto.facturaQR=facturaQRNueva;
    if(catTipoIdSel){ gasto.catTipoId=catTipoIdSel; }
    if(creditoIdSel){
      gasto.creditoId=creditoIdSel;
      // elegirCredito() (picker "Asociar a crédito") calcula la cuota sugerida y la deja en
      // data-cuota del <select> oculto al reabrir el formulario.
      const cuotaDesdeSel=parseInt(creditoSel?.dataset.cuota)||0;
      gasto.numCuota=cuotaDesdeSel||1;
      // cuotas_total/cuota_actual también se completan aquí (aunque el gasto no "maneje
      // cuotas" por sí mismo) para que la fila muestre el badge "N/M · mes" igual que los
      // gastos que genera generarGastosCredito() automáticamente los meses siguientes.
      var crAsoc=creditos[creditoIdSel];
      if(crAsoc){ gasto.cuotas_total=crAsoc.cuotas; gasto.cuota_actual=gasto.numCuota; }
      if(!sincronizarCreditoDesdeGasto(gasto,null)) return;
    }
    list.push(gasto);
    lastCreatedId=gasto.id;
  }
  save(); closeModal(); render();
  setTimeout(function(){ lastCreatedId=null; }, 400);
  // "Convertir en grupo desplegable" sobre un gasto recién creado (ver
  // convertirEnGrupoDesdeCreacion): ya quedó guardado como gasto normal arriba, ahora se abre
  // el mismo modal de convertir/configurar grupo que usa un gasto existente, en vez del toast
  // o la pregunta de mover a Q2.
  if(convertirTrasGuardar){
    convertirGrupo(gasto.id,which);
    return;
  }
  // Si es Q1 y se marcó "Sin pagar", ofrecer crear el gasto en Q2
  if(which==='q1' && sinpagar) {
    ofrecerCopiarQ2(gasto);
  } else {
    toast(id?'Gasto actualizado':(gasto.esGrupo?'Grupo creado ✓':'Gasto agregado'));
  }
}
// Permite marcar "Convertir en grupo desplegable" desde Más opciones al CREAR un gasto nuevo
// (antes solo existía para uno ya guardado): primero lo guarda con el saveG de siempre y luego
// abre convertirGrupo() sobre el que se acaba de crear, en vez de duplicar ese flujo.
let _convertirGrupoTrasGuardar=false;
function convertirEnGrupoDesdeCreacion(wh,pid){
  const nEl=document.getElementById('g-n');
  if(!nEl||!nEl.value.trim()){ showAlert('Escribe un nombre'); return; }
  _convertirGrupoTrasGuardar=true;
  saveG('',wh,pid);
}

function ofrecerCopiarQ2(g) {
  openModal('<div class="mtitle">¿Mover a Q2?</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.6;margin-bottom:16px">'
    +'El gasto <b style="color:var(--txt)">'+esc(nombreGasto(g))+'</b> se marcó como sin pagar.<br>'
    +'¿Deseas crearlo también en la quincena 2 para recordar que quedó pendiente?</p>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal();toast(\'Gasto guardado\')">No, solo Q1</button>'
    +'<button class="bpri" onclick="copiarGastoQ2(\''+g.id+'\')">Sí, agregar a Q2</button>'
    +'</div>');
}
function copiarGastoQ2(id) {
  const m=getM();
  const g=m.q1_gastos.find(x=>x.id===id);
  if(!g){closeModal();return;}
  const copia={id:uid(),nombre:g.nombre,catTipoId:g.catTipoId||null,presupuesto:g.presupuesto,metodo:g.metodo,pagado_real:null,estado:null,pagado_flag:false,sinpagar:false};
  // Si el gasto viene de un crédito, la copia en Q2 debe heredar el vínculo (creditoId/numCuota)
  // para que siga representando la misma cuota — de lo contrario el crédito queda con esa cuota
  // pendiente sin ningún gasto que permita marcarla como pagada, y la copia en Q2 pierde toda
  // relación con el crédito. Como la cuota debía pagarse en la quincena anterior (Q1) y no se
  // pagó, aparecerá como "Vencido" tanto en el crédito como en esta fila (ver diasHasta/badge).
  if(g.creditoId){
    copia.creditoId=g.creditoId;
    copia.numCuota=g.numCuota;
    copia.cuotas_total=g.cuotas_total;
    copia.cuota_actual=g.cuota_actual;
  }
  if(g.mensualidad) copia.mensualidad=g.mensualidad;
  m.q2_gastos.push(copia);
  save(); closeModal(); render(); toast('Copiado a Q2');
}
function delGrupo(id,which){
  showConfirm('¿Eliminar el grupo y todos sus subgastos?',function(){
    const m=getM(), k=which==='q1'?'q1_gastos':'q2_gastos';
    m[k]=m[k].filter(x=>x.id!==id&&x.parentId!==id);
    save();closeModal();render();toast('Grupo eliminado');
  });
}
function delG(id,which){
  const m=getM(),k=which==='q1'?'q1_gastos':'q2_gastos';
  const g=(m[k]||[]).find(function(x){return x.id===id;});
  // Si nació de un recordatorio de la Agenda, no se borra en silencio (§6 del pedido): se
  // pregunta también por el recordatorio en vez de dejarlo huérfano apuntando a un gasto que
  // ya no existe.
  if(g&&g.agendaId&&typeof agConfirmarBorrarGasto==='function'){
    agConfirmarBorrarGasto(g,which);
    return;
  }
  showConfirm('¿Eliminar este gasto?',function(){
    m[k]=m[k].filter(x=>x.id!==id);
    save();closeModal();render();toast('Gasto eliminado');
  });
}
