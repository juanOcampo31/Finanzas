// ── Gastos ───────────────────────────────────────────────────────────────────
// Fase 2 de la migración a una arquitectura más modular: separado de render.js (que ahora solo
// tiene la navegación de meses, el header y el render() principal) — todo lo relacionado con la
// lista de gastos de una quincena (filtros, orden, grupos) vive acá.
function toggleGFilter(which){
  gFilterOpen[which]=!gFilterOpen[which];
  render();
}

function setGSort(which,s){
  gSort[which]=s;
  render();
}

function sortGastos(gastos,which,subMap){
  var s=gSort[which]||'orden';
  var arr=gastos.slice(); // shallow copy to avoid mutating original

  // Orden secundario según selección del usuario
  if(s==='nombre')  arr.sort(function(a,b){return a.nombre.localeCompare(b.nombre,'es');});
  else if(s==='monto-asc')  arr.sort(function(a,b){return Math.abs(a.presupuesto||0)-Math.abs(b.presupuesto||0);});
  else if(s==='monto-desc') arr.sort(function(a,b){return Math.abs(b.presupuesto||0)-Math.abs(a.presupuesto||0);});
  else if(s==='metodo') arr.sort(function(a,b){return (a.metodo||'').localeCompare(b.metodo||'','es');});
  // 'orden' = mantiene el orden original como base

  // Marcar/desmarcar un gasto como pagado ya NO lo mueve de posición — antes este sort
  // primario forzaba también a los pagados al fondo (junto con los "sin pagar"), lo que hacía
  // que la fila saltara de lugar apenas se tocaba el check. Se conserva solo el hundimiento de
  // los "sin pagar" (mover a Q2/recordatorio): ese sí sigue siendo un cambio de estado real de
  // la quincena, no un simple check, y agruparlos al fondo evita que se mezclen con lo vigente.
  function esSinPagar(x){
    if(x.sinpagar) return 1;
    if(x.esGrupo){
      var subs=(subMap&&subMap[x.id])||[];
      return subs.length>0 && subs.every(function(sg){return sg.sinpagar;}) ? 1 : 0;
    }
    return 0;
  }
  arr.sort(function(a,b){
    return esSinPagar(a)-esSinPagar(b);
  });

  return arr;
}

function setGFiltro(which,f){
  gFiltro[which]=f;
  render();
}

// Monto total de un método de pago dentro de una quincena (o el total general si m==='todos')
// — usado tanto por la pastilla de filtro siempre visible como por el panel expandible. Incluye
// los subgastos de los grupos (antes solo sumaba gastos sueltos de nivel superior, así que el
// monto de la pastilla no reflejaba nada de lo que hubiera dentro de un grupo).
function montoMetodoFiltro(m,topGastosAll,total,subMap){
  if(m==='todos') return total;
  var directo=topGastosAll.filter(function(g){return !g.esGrupo&&g.metodo===m&&!g.sinpagar;}).reduce(function(a,g){return a+Math.abs(g.presupuesto||0);},0);
  var deSubgastos=topGastosAll.filter(function(g){return g.esGrupo;}).reduce(function(a,g){
    return a+(subMap&&subMap[g.id]?subMap[g.id]:[]).filter(function(s){return s.metodo===m&&!s.sinpagar;}).reduce(function(b,s){return b+Math.abs(s.presupuesto||0);},0);
  },0);
  return directo+deSubgastos;
}
function pillMetodoBtn(m,which,activeFiltro,mTotal,extraStyle){
  var active=m===activeFiltro;
  var label=m==='todos'?'Todos':esc(m);
  return '<button class="g-pill-'+which+'" data-f="'+esc(m)+'" onclick="setGFiltro(\''+which+'\',\''+escJS(m)+'\')" style="flex-shrink:0;padding:'+extraStyle+';border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap;background:'+(active?'var(--acc)':'var(--surf2)')+';color:'+(active?'#0F172A':'var(--mut)')+';">'+label+(mTotal>0?' <span style="opacity:.7">'+cop(mTotal)+'</span>':'')+'</button>';
}
function renderGastos(gastos,which) {
  if(!gastos.length) return '<div class="empty"><div class="eic" style="display:flex;justify-content:center;color:var(--mut)">'+icon('clipboard',36)+'</div><p>Sin gastos. Toca + para agregar.</p></div>';

  // Collect unique methods for filter pills
  var metodos=['todos'];
  gastos.forEach(function(g){
    if(g.metodo&&metodos.indexOf(g.metodo)<0) metodos.push(g.metodo);
    // Also from subgastos (they have parentId)
  });
  var activeFiltro=gFiltro[which]||'todos';

  const subMap={};
  const topGastosAll=[];
  for(const g of gastos){
    if(g.parentId){ if(!subMap[g.parentId]) subMap[g.parentId]=[]; subMap[g.parentId].push(g); }
    else topGastosAll.push(g);
  }

  // Apply method filter — groups shown only if metodo or any subgasto matches
  var topGastosFiltered=activeFiltro==='todos'?topGastosAll:topGastosAll.filter(function(g){
    if(!g.esGrupo) return g.metodo===activeFiltro;
    // For groups: show if group metodo matches OR any subgasto metodo matches
    if(g.metodo===activeFiltro) return true;
    return (subMap[g.id]||[]).some(function(s){return s.metodo===activeFiltro;});
  });
  const topGastos=sortGastos(topGastosFiltered,which,subMap);

  const activos=topGastosAll.filter(function(x){return !x.sinpagar;});
  const total=calcTotalGrupoAware(activos, subMap, which==='q1');
  const pagado=activos.reduce(function(a,x){
    if(x.esGrupo){
      // "pagado" de un grupo siempre se calcula sumando sus subgastos ya pagados (nunca la
      // base) — así que un grupo vinculado a tarjeta en Q1 ya solo suma lo que sí es un gasto
      // real ahí (ej. "Gasolina" pagada con la tarjeta), consistente con calcTotalGrupoAware.
      var paid=(subMap[x.id]||[]).filter(function(s){return !s.sinpagar&&s.pagado_flag;}).reduce(function(b,s){return b+Math.abs(s.presupuesto||0);},0);
      return a+paid;
    }
    return x.pagado_flag?a+Math.abs(x.presupuesto||0):a;
  },0);
  const sinPagarTotal=topGastosAll.filter(function(x){return x.sinpagar;}).reduce(function(a,x){return a+Math.abs(x.presupuesto||0);},0);
  const sinPagarCount=topGastosAll.filter(function(x){return x.sinpagar;}).length;
  // "N de M pagados" ya no vive acá — se movió a la tarjeta Q1/Q2 de Inicio, junto al rango de
  // fechas (ver calcPagadosIndividualGastos, compartida con esta misma cuenta para que ambos
  // lugares siempre coincidan). Solo queda el total de ítems para el encabezado de la lista.
  const totalIndividual=calcPagadosIndividualGastos(gastos).total;
  const pct=total>0?Math.round(pagado/total*100):0;
  const bc=pct<40?'pbok':pct<75?'pbw':'pbo';
  const netoQ=which==='q1'?netoQ1(getM()):netoQ2(getM());
  const disp=netoQ-total;

  // Badges de cuota/mensualidad/vencido/comprobante — compartidos entre la fila normal
  // (buildGastoRowHtml) y la fila de subgasto (buildSubRow): antes solo la fila normal los
  // calculaba, así que un gasto ligado a un crédito perdía el badge "N/M · mes" (y "Vencido")
  // en cuanto se movía a un grupo, porque los subgastos se pintan con buildSubRow.
  function buildGastoBadges(g){
    var cuotaBadge='',mensBadge='',vencidoBadge='',compBadge='',hoyFlag=false;
    if(g.mensualidad){
      var mp2=g.mensualidad.split('-');
      var mNames=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      var mLabel=mNames[parseInt(mp2[1])-1];
      mensBadge='<span style="font-size:10px;font-weight:600;background:var(--pur-d);color:var(--pur);padding:1px 6px;border-radius:10px;margin-left:4px;vertical-align:middle">'+mLabel+'</span>';
    }
    compBadge=g.comprobante&&g.pagado_flag?'<span style="font-size:10px;color:var(--mut);margin-left:4px;display:inline-flex;align-items:center;gap:3px;vertical-align:middle">'+icon('paperclip',11)+esc(g.comprobante)+'</span>':'';
    if(g.cuotas_total>0&&g.cuota_actual>0){
      var cuotaColor=g.pagado_flag?'var(--grn)':'var(--amb)';
      var cuotaLbl=g.cuota_actual+'/'+g.cuotas_total;
      if(g.creditoId && creditos[g.creditoId]){
        var crRef=creditos[g.creditoId];
        var rowRef=calcAmortizacion(crRef).rows[g.numCuota-1];
        if(rowRef){
          var mesesAbrev=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
          cuotaLbl+=' · '+mesesAbrev[new Date(rowRef.fecha+'T12:00:00').getMonth()];
          if(!g.pagado_flag && !g.sinpagar){
            var diasCuota=diasHasta(rowRef.fecha+'T12:00:00');
            if(diasCuota<0){
              vencidoBadge='<span style="font-size:9px;font-weight:700;background:var(--red-d);color:var(--red);padding:1px 6px;border-radius:10px;margin-left:4px;vertical-align:middle">Vencido</span>';
              hoyFlag=true;
            } else if(diasCuota===0){
              hoyFlag=true;
            }
          }
        }
      }
      cuotaBadge='<span style="font-size:10px;font-weight:600;background:var(--surf2);color:'+cuotaColor+';padding:1px 6px;border-radius:10px;margin-left:4px;vertical-align:middle">'+cuotaLbl+'</span>';
    }
    return {cuotaBadge:cuotaBadge,mensBadge:mensBadge,vencidoBadge:vencidoBadge,compBadge:compBadge,hoyFlag:hoyFlag};
  }

  function buildSubRow(s,wh){
    var sp=s.pagado_flag,st=s.sinpagar;
    var sd=(s.pagado_real!=null&&s.pagado_real!==s.presupuesto)?s.presupuesto-s.pagado_real:null;
    var sdh=sd!==null?' · <span style="color:var(--'+(sd>0?'grn':'red')+')\">'+(sd>0?'Sobró':'Faltó')+' '+cop(Math.abs(sd))+'</span>':'';
    var badges=buildGastoBadges(s);
    var chkCls=sp?'paid':st?'nopag':(badges.hoyFlag?'hoy':'');
    var nameCls=sp?'pd':st?'np':'';
    var amtCls=sp?'pa':'';
    var nopagBadge=st?'<span class="nopag-badge">Sin pagar</span>':'';
    var subMeta=sp?'pagado · '+esc(s.metodo||''):(esc(s.metodo||'')+(badges.hoyFlag?' · <span style="color:var(--red);font-weight:700">hoy</span>':''));
    var chkTxt=sp?icon('check',11):st?icon('arrowRight',11):'';
    // "Pag: $X" de pagos parciales (ver abrirAbonosGasto en gasto-pago.js), misma ubicación que
    // en la fila normal: segunda línea chica debajo del monto, no un badge junto al nombre.
    var subRealLine='';
    if(!sp&&s.abonos&&s.abonos.length){
      var sumAbonosSub=s.abonos.reduce(function(a,ab){return a+(ab.monto||0);},0);
      if(sumAbonosSub>0&&sumAbonosSub<Math.abs(s.presupuesto||0)){
        subRealLine='<div class="gmth" style="color:var(--grn)">Pag: '+cop(sumAbonosSub)+'</div>';
      }
    }
    return '<div class="g-sub-row'+(st?' row-aplazado':'')+'">'
      +'<div class="gchk '+chkCls+'" onclick="toggleP(event,\''+s.id+'\',\''+wh+'\')">'+chkTxt+'</div>'
      +'<div class="ginfo" onclick="editGasto(\''+s.id+'\',\''+wh+'\')" style="cursor:pointer">'
      +'<div class="gname '+nameCls+'">'+esc(nombreGasto(s))+badges.cuotaBadge+badges.vencidoBadge+badges.mensBadge+nopagBadge+'</div>'
      +'<div class="gmeta">'+subMeta+sdh+badges.compBadge+'</div></div>'
      +'<div style="text-align:right"><div class="gamt '+amtCls+'" onclick="editGasto(\''+s.id+'\',\''+wh+'\')" style="cursor:pointer'+(s.presupuesto<0?';color:var(--grn)':'')+'">'+(s.presupuesto<0?'+':'')+cop(s.presupuesto)+'</div>'+subRealLine+'</div>'
      +'</div>'
  }

  var gastoRowGiCounter=0; // índice único para ids de DOM (gg-/gc-)
  function buildGastoRowHtml(g){
    var gi=gastoRowGiCounter++;
    if(g.esGrupo){
      var subs=subMap[g.id]||[];
      // Si hay un filtro de método activo, el grupo puede haber quedado incluido en la lista
      // porque coincide el método DEL GRUPO o el de CUALQUIERA de sus subgastos (ver
      // topGastosFiltered) — pero antes seguía mostrando TODOS los subgastos sin importar el
      // filtro. Acá se acota a los que sí coinciden, para que el filtro también aplique adentro
      // del grupo (totales, badge de cantidad y la lista de subgastos que se ve al expandirlo).
      if(activeFiltro!=='todos') subs=subs.filter(function(s){return s.metodo===activeFiltro;});
      // Base del grupo: si tiene presupuesto propio (ej. saldo tarjeta), usarlo; si no, sumar subgastos
      var base=(g.presupuesto!==null&&g.presupuesto!==undefined&&g.tcLinked)?g.presupuesto:(g.presupuesto>0?g.presupuesto:0);
      var subsPagados=subs.filter(function(s){return s.pagado_flag&&!s.sinpagar;}).reduce(function(a,s){return a+Math.abs(s.presupuesto||0);},0);
      var subsPendientes=subs.filter(function(s){return !s.pagado_flag&&!s.sinpagar;}).reduce(function(a,s){return a+Math.abs(s.presupuesto||0);},0);
      // Si tiene base propia: pendiente = base - pagado; si no: pendiente = suma subgastos no pagados
      var totalGrupo=g.tcLinked?base:(base>0?base:subsPendientes+subsPagados);
      var pendiente=base>0?base-subsPagados:subsPendientes;
      var allPaid=subs.length>0&&subs.filter(function(s){return !s.sinpagar;}).every(function(s){return s.pagado_flag;});
      var countBadge=subs.length>0?'<span class="tc-count">'+subs.length+'</span>':'';
      // Igual que en sortGastos: marcar/desmarcar un subgasto como pagado ya no lo mueve de
      // posición dentro del grupo, solo "sin pagar" sigue hundiéndose al fondo.
      var subsOrdenados=subs.slice().sort(function(a,b){
        var va=a.sinpagar?1:0;
        var vb=b.sinpagar?1:0;
        return va-vb;
      });
      var subRowsHtml=subsOrdenados.map(function(s){return buildSubRow(s,which);}).join('');
      var addBtn='<div class="g-sub-add" onclick="openGasto(null,\''+which+'\',\''+g.id+'\')">＋ Agregar al grupo</div>';

      var deudaRow='';
      var grpChk=allPaid?'paid':'';
      var grpTxt=allPaid?icon('check',11):'';
      // Mostrar lo pagado si hay subgastos pagados
      var pendienteHtml=subsPagados>0
        ?'<div style="font-size:10px;color:var(--grn);margin-top:1px">Pag: '+cop(subsPagados)+'</div>'
        :'';
      return '<div class="g-group g-drag-item" data-gid="'+g.id+'" onpointerdown="startDragGasto(event,\''+g.id+'\',\''+which+'\')">'
        +'<div class="g-group-head" onclick="toggleGG(\''+g.id+'\',\'gg-'+gi+'\',\'gc-'+gi+'\')">'
        +'<div class="gchk '+grpChk+'" onclick="toggleGrupoPagado(event,\''+g.id+'\',\''+which+'\')">'+grpTxt+'</div>'
        +'<div class="ginfo"><div class="gname">'+esc(nombreGasto(g))+countBadge+(g.tcLinked?'<span style="display:inline-flex;vertical-align:middle;color:var(--acc);margin-left:5px">'+icon('refresh',11)+'</span>':'')+' </div><div class="gmeta">'+esc(g.metodo||'')+'</div></div>'
        +'<div style="text-align:right;display:flex;align-items:center;gap:6px">'
        +'<div><div class="gamt '+(g.tcLinked&&totalGrupo<0?'a':'')+'">'+(g.tcLinked&&totalGrupo<0?'-':'')+cop(Math.abs(totalGrupo))+'</div>'+pendienteHtml+'</div>'
        +'<button onclick="event.stopPropagation();editGasto(\''+g.id+'\',' +'\''+which+'\');" style="background:none;border:none;color:var(--mut);padding:4px 6px;cursor:pointer;flex-shrink:0;display:flex;align-items:center">'+icon('edit',15)+'</button>'
        +'<div class="g-chevron" id="gc-'+gi+'" style="display:flex">'+icon('chevronRight',16)+'</div></div>'
        +'</div>'
        +'<div id="gg-'+gi+'" style="display:'+(gGroupOpen[g.id]?'block':'none')+'"><div class="g-sub-wrap">'+subRowsHtml+deudaRow+addBtn+'</div></div>'
        +'</div>';
    }
    var p=g.pagado_flag,tras=g.sinpagar;
    var diff=(g.pagado_real!=null&&g.pagado_real!==g.presupuesto)?g.presupuesto-g.pagado_real:null;
    var dh=diff!==null?' · <span style="color:var(--'+(diff>0?'grn':'red')+')\">'+(diff>0?'Sobró':'Faltó')+' '+cop(Math.abs(diff))+'</span>':'';
    var gCls=(tras?'grow-nopag':'')+(g.id===lastCreatedId?' gnew':'');
    var badgesG=buildGastoBadges(g);
    var cuotaBadge=badgesG.cuotaBadge, mensBadge=badgesG.mensBadge, vencidoBadge=badgesG.vencidoBadge, compBadge=badgesG.compBadge, hoyFlag=badgesG.hoyFlag;
    var chkCls=p?'paid':tras?'nopag':(hoyFlag?'hoy':'');
    var namCls=p?'pd':tras?'np':'';
    var amtCls=p?'pa':'';
    var nopag=tras?'<span class="nopag-badge">Sin pagar</span>':'';
    var chkTxt=p?icon('check',11):tras?icon('arrowRight',11):'';
    var metaBase=p?'pagado · '+esc(g.metodo||''):(esc(g.metodo||'')+(hoyFlag?' · <span style="color:var(--red);font-weight:700">hoy</span>':''));
    // "Pag: $X" de pagos parciales (ver abrirAbonosGasto en gasto-pago.js) va en la misma
    // posición que "Pag: $X" en un grupo (segunda línea chica, debajo del monto, a la
    // derecha) — no como badge junto al nombre, para no competir con cuotaBadge/vencidoBadge ahí.
    var realLine;
    if(!p&&g.abonos&&g.abonos.length){
      var sumAbonosRow=g.abonos.reduce(function(a,ab){return a+(ab.monto||0);},0);
      if(sumAbonosRow>0&&sumAbonosRow<Math.abs(g.presupuesto||0)){
        realLine='<span style="color:var(--grn)">Pag: '+cop(sumAbonosRow)+'</span>';
      }
    }
    if(!realLine) realLine=g.pagado_real!=null&&g.pagado_real!==g.presupuesto?'Real: '+cop(g.pagado_real):esc(g.metodo||'');
    var rowCls='grow g-drag-item '+gCls+(hoyFlag&&!p&&!tras?' row-hoy':'');
    return '<div class="'+rowCls+'" data-gid="'+g.id+'" onclick="editGasto(\''+g.id+'\',\''+which+'\')" onpointerdown="startDragGasto(event,\''+g.id+'\',\''+which+'\')">'
      +'<div class="gchk '+chkCls+'" onclick="toggleP(event,\''+g.id+'\',\''+which+'\')">'+ chkTxt +'</div>'
      +'<div class="ginfo"><div class="gname '+namCls+'">'+esc(nombreGasto(g))+cuotaBadge+vencidoBadge+mensBadge+nopag+'</div><div class="gmeta">'+metaBase+dh+compBadge+'</div></div>'
      +'<div style="text-align:right"><div class="gamt '+amtCls+'"'+(g.presupuesto<0?' style="color:var(--grn)"':'')+'>'+(g.presupuesto<0?'+':'')+cop(g.presupuesto)+'</div><div class="gmth">'+realLine+'</div></div>'
      +'</div>';
  }

  var rows=topGastos.map(function(g){ return buildGastoRowHtml(g); }).join('');

  var pendienteQ=Math.max(total-pagado,0);
  var spNote=sinPagarTotal>0?'<span style="color:var(--amb);font-size:11px;font-weight:500;margin-left:6px">· '+cop(sinPagarTotal)+' sin pagar</span>':'';
  var dispColor=disp>=0?'grn':'red';
  var dispTxt=(disp<0?'-':'')+cop(disp);
  var qLabel=which==='q1'?'1':'2';

  // Filter pills by método — la pastilla siempre visible y la del panel expandido mostraban
  // exactamente el mismo cálculo de mTotal y casi el mismo botón, copiado dos veces (solo el
  // padding y el borde scroll-snap cambiaban); ahora ambas usan montoMetodoFiltro/pillMetodoBtn.
  var pillsHtml='<div style="position:relative"><div style="display:flex;gap:6px;overflow-x:auto;padding:8px 14px 6px 14px;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory">'
    +metodos.map(function(m){
      return pillMetodoBtn(m,which,activeFiltro,montoMetodoFiltro(m,topGastosAll,total,subMap),'4px 10px;scroll-snap-align:start');
    }).join('')+'</div></div>';

  // Collapsible filter + sort panel
  var isOpen=gFilterOpen[which]||false;
  var activeSort=gSort[which]||'orden';
  var hasBadge=(activeFiltro!=='todos'||activeSort!=='orden');

  var panelHtml='';
  if(isOpen){
    var sortOpts=[{k:'orden',lbl:'Orden'},{k:'nombre',lbl:'Nombre'},
      {k:'monto-desc',lbl:'Mayor $'},{k:'monto-asc',lbl:'Menor $'},{k:'metodo',lbl:'F. Pago'}];
    var filterPills=metodos.map(function(m){
      return pillMetodoBtn(m,which,activeFiltro,montoMetodoFiltro(m,topGastosAll,total,subMap),'3px 9px');
    }).join('');
    var sortPills=sortOpts.map(function(opt){
      var isA=opt.k===activeSort;
      return '<button onclick="setGSort(\''+which+'\',\''+opt.k+'\')" style="flex-shrink:0;padding:3px 9px;border-radius:20px;border:none;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap;background:'+(isA?'var(--acc)':'var(--surf2)')+';color:'+(isA?'#0F172A':'var(--mut)')+';">'+opt.lbl+'</button>';
    }).join('');
    // flex-wrap (no overflow-x con scroll oculto): así se ven TODAS las opciones de una vez,
    // sin depender de un gesto lateral que no era descubrible (no había ninguna pista visual
    // de que se podía deslizar, así que las opciones que no cabían quedaban invisibles).
    panelHtml='<div style="margin:0 14px 10px;padding:10px 12px;background:var(--bg-2);border:1px solid var(--brd2);border-radius:14px">'
      +'<div style="margin-bottom:8px"><div style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Filtrar</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:5px">'+filterPills+'</div></div>'
      +'<div><div style="font-size:10px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Ordenar</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:5px">'+sortPills+'</div></div>'
      +'</div>';
  }
  var sortPillsHtml=panelHtml;

  var filterBtnHtml='<button onclick="toggleGFilter(\''+which+'\')" style="background:none;border:1px solid var(--brd2);border-radius:20px;padding:2px 8px;font-size:10px;cursor:pointer;color:var(--mut);display:flex;align-items:center;gap:4px;flex-shrink:0">'
    +(hasBadge?'<span style="width:5px;height:5px;border-radius:50%;background:var(--acc);display:inline-block"></span>':'')
    +'Filtrar '+icon(isOpen?'chevronUp':'chevronDown',10)
    +'</button>';
  // Enlace directo al balance tipo "cuenta T" de esta quincena (ver js/reportes.js) — mismo
  // estilo de píldora que "Filtrar", para no competir visualmente con el encabezado.
  var balanceBtnHtml='<button onclick="openReportes(\''+which+'\')" style="background:none;border:1px solid var(--brd2);border-radius:20px;padding:2px 8px;font-size:10px;cursor:pointer;color:var(--mut);display:flex;align-items:center;gap:4px;flex-shrink:0">'
    +icon('barChart',10)+'Balance'
    +'</button>';
  var noteFilterRow=sinPagarCount>0
    ?'<div class="glist-note-row has-note"><span class="glist-note-txt">'+sinPagarCount+' sin pagar · '+cop(sinPagarTotal)+'</span></div>'
    :'';

  return '<div class="glist-card">'
    +'<div class="glist-head">'
    +'<span class="glist-title"><span style="color:var(--acc)">Gastos Q'+qLabel+'</span> · '+totalIndividual+'</span>'
    +'<span class="glist-sub" style="display:flex;align-items:center;gap:8px">'+balanceBtnHtml+filterBtnHtml+'</span>'
    +'</div>'
    +'<div class="glist-totals">'
    +'<div class="glist-tot"><div class="glist-tot-lbl">GASTOS Q'+qLabel+'</div><div class="glist-tot-val" style="color:var(--txt)">'+cop(total)+'</div></div>'
    +'<div class="glist-div"></div>'
    +'<div class="glist-tot"><div class="glist-tot-lbl">PAGADO</div><div class="glist-tot-val" style="color:var(--grn)">'+cop(pagado)+'</div></div>'
    +'<div class="glist-div"></div>'
    +'<div class="glist-tot"><div class="glist-tot-lbl">POR PAGAR</div><div class="glist-tot-val" style="color:var(--red)">'+cop(pendienteQ)+'</div></div>'
    +'</div>'
    +'<div class="pw"><div class="pb '+bc+'" style="width:'+pct+'%"></div></div>'
    +noteFilterRow
    +sortPillsHtml
    +'<div style="height:1px;background:var(--brd);margin:0 0 4px"></div>'
    +'<div id="glist-rows-'+which+'">'+rows+'</div>'
    +'</div>';
}
function toggleGG(groupId,wrapId,chevId){
  gGroupOpen[groupId]=!gGroupOpen[groupId];
  const w=document.getElementById(wrapId),ch=document.getElementById(chevId);
  if(!w||!ch) return;
  const open=gGroupOpen[groupId];
  w.style.display=open?'block':'none';
  ch.style.transform=open?'rotate(90deg)':'rotate(0)';
  ch.style.color=open?'var(--acc)':'var(--mut)';
}
function convertirGrupo(id,which){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id); if(!g)return;
  window._cvtId=id; window._cvtWhich=which;
  const isLinked=!!g.tcCardId;
  // "Monto base manual" solo se precarga al EDITAR un grupo que ya tenía uno — al convertir un
  // gasto normal en grupo por primera vez, su valor no debe quedar aquí (eso lo congelaría como
  // total fijo): se preserva como el primer subgasto del grupo, ver saveConvertir(). Si se
  // precargara igual, "Convertir" sin tocar nada dejaría el grupo en modo "monto fijo" y agregar
  // gastos después no movería el total mostrado.
  const baseVal=(!isLinked&&g.esGrupo&&g.presupuesto)?g.presupuesto:'';
  const fieldStyle=isLinked?'opacity:.4;pointer-events:none':'';
  const tcIds=listTCIds(m);
  const cardOptStyle=isLinked?'':'opacity:.4;pointer-events:none';
  const cardOpts=tcIds.map(function(tid){
    var card=m.tarjetas[tid];
    var saldo=calcTCSaldo(m,tid);
    var sel=(g.tcCardId===tid)?' selected':'';
    return '<option value="'+tid+'"'+sel+'>'+esc(card.nombre)+' ('+cop(saldo)+')</option>';
  }).join('');
  openModal('<div class="mtitle">'+(g.esGrupo?'Editar grupo':'Convertir en grupo')+'</div>'
    +'<p style="font-size:13px;color:var(--mut);line-height:1.5;margin-bottom:14px">'
    +'Los subgastos pagados se descuentan del total mostrando el saldo pendiente.</p>'
    +'<div class="cbx-row"><input type="checkbox" id="grp-linked"'+(isLinked?' checked':'')
    +' onchange="var f=document.getElementById(\'grp-base-field\');var c=document.getElementById(\'grp-card-field\');'
    +'f.style.opacity=this.checked?\'0.4\':\'1\';f.style.pointerEvents=this.checked?\'none\':\'auto\';'
    +'c.style.opacity=this.checked?\'1\':\'0.4\';c.style.pointerEvents=this.checked?\'auto\':\'none\';">'
    +'<label for="grp-linked" style="font-size:13px;color:var(--acc)">Vincular saldo de tarjeta</label></div>'
    +'<div class="field" id="grp-card-field" style="'+cardOptStyle+'">'
    +'<label>Tarjeta vinculada</label>'
    +'<select id="grp-card">'+cardOpts+'</select></div>'
    +'<div class="field" id="grp-base-field" style="'+fieldStyle+'">'
    +'<label>Monto base manual</label>'
    +'<input id="grp-base" type="text" inputmode="numeric" value="'+moneyInputFmt(baseVal)+'" placeholder="Ej: 1.209.417" oninput="maskMoneyInput(this)"></div>'
    +'<div class="macts">'
    +'<button class="bcnl" onclick="closeModal()">Cancelar</button>'
    +'<button class="bpri" onclick="saveConvertir()">'+(g.esGrupo?'Guardar':'Convertir')+'</button>'
    +'</div>');
}
function saveConvertir(){
  const id=window._cvtId, which=window._cvtWhich;
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const g=list.find(x=>x.id===id); if(!g)return;
  const linkedEl=document.getElementById('grp-linked');
  const linked=linkedEl?linkedEl.checked:false;
  const esConversionNueva=!g.esGrupo; // false si esto es "Editar grupo/base" sobre uno ya existente
  const valorOriginal=g.presupuesto;
  g.esGrupo=true;
  if(linked){
    const cardSel=document.getElementById('grp-card');
    const tcId=cardSel?cardSel.value:listTCIds(m)[0];
    g.tcCardId=tcId;
    g.tcLinked=true; // legacy compat flag
    g.presupuesto=calcTCSaldo(m,tcId);
    syncTCGrupo(m); // creates Abono TC automatically
  } else {
    g.tcCardId=null;
    g.tcLinked=false;
    g.presupuesto=moneyVal('grp-base');
    // Al convertir un gasto normal en grupo por primera vez, el valor que ya tenía no
    // desaparece: se preserva como su primer subgasto, para que el grupo pase a sumar sus
    // subgastos (modo normal) en vez de quedar "congelado" con ese valor como monto fijo. Si el
    // usuario además escribió un "monto base manual", ambos conviven (base fija + subgastos),
    // igual que ya funcionaba antes para un grupo existente con base propia.
    if(esConversionNueva && valorOriginal>0){
      list.push({id:uid(),nombre:g.nombre,presupuesto:valorOriginal,metodo:g.metodo,pagado_real:null,estado:null,pagado_flag:false,sinpagar:false,parentId:g.id});
    }
  }
  save();closeModal();render();toast(nombreGasto(g)+' convertido en grupo');
}
