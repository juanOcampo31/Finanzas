// ── Reordenar manualmente arrastrando (mantener presionado) ─────────────────────────────
// Fase 2 de la migración a una arquitectura más modular: separado de gasto-pickers.js — feature
// autocontenida y chica, sin relación con los pickers ni con el formulario de gasto.
// Sin botón ni ícono aparte: mantener presionado sobre el propio gasto/grupo (fuera del
// checkbox/botones, que deben seguir funcionando con un toque normal) durante ~300ms sin
// moverse lo arma para arrastrar; a partir de ahí sigue el dedo/mouse y lo suelta en la
// posición exacta. Usa Pointer Events (mouse y touch por igual). Solo aplica a gastos de nivel
// superior dentro del mismo contenedor (#glist-rows-q1/q2); los subgastos de un grupo no se
// reordenan así (se ubican por parentId, no por posición en el arreglo). Solo tiene sentido —
// y solo se activa— con el criterio "Orden" y sin filtro de método: con otro criterio el orden
// visible ya no es el del arreglo, y con un filtro activo la lista visible no tiene todos los
// gastos (soltar perdería la posición de lo que quedó oculto).
function startDragGasto(e,id,which){
  if((gSort[which]||'orden')!=='orden' || (gFiltro[which]||'todos')!=='todos') return;
  // No armar el arrastre si el toque empezó sobre un control que ya tiene su propio
  // comportamiento de toque (checkbox de pagado, botón editar, flecha de expandir el grupo) —
  // deben seguir respondiendo a un toque normal sin que este listener se los coma.
  if(e.target.closest('.gchk,button,.g-chevron,.g-sub-row,.g-sub-add')) return;
  const row=e.currentTarget;
  const container=document.getElementById('glist-rows-'+which);
  if(!row||!container) return;
  const startX=e.clientX, startY=e.clientY;
  var armed=false;
  // Espera a que el toque se sostenga quieto un momento antes de armar el arrastre — así un
  // toque corto (o el inicio de un scroll) no dispara el reordenamiento por accidente.
  const holdTimer=setTimeout(function(){
    armed=true;
    row.classList.add('g-dragging');
    if(navigator.vibrate) navigator.vibrate(12);
  },300);
  function onMove(ev){
    if(!armed){
      if(Math.abs(ev.clientY-startY)>10||Math.abs(ev.clientX-startX)>10) clearTimeout(holdTimer);
      return;
    }
    ev.preventDefault();
    const target=document.elementFromPoint(ev.clientX,ev.clientY);
    const overRow=target&&target.closest?target.closest('.g-drag-item'):null;
    if(!overRow||overRow===row||overRow.parentElement!==container) return;
    const rect=overRow.getBoundingClientRect();
    const after=ev.clientY>rect.top+rect.height/2;
    container.insertBefore(row, after?overRow.nextSibling:overRow);
  }
  function onUp(){
    clearTimeout(holdTimer);
    document.removeEventListener('pointermove',onMove);
    document.removeEventListener('pointerup',onUp);
    document.removeEventListener('pointercancel',onUp);
    if(armed){
      row.classList.remove('g-dragging');
      // El arrastre terminó en un click sintético sobre esta misma fila (editGasto/toggleGG) —
      // se descarta una sola vez para que soltar no abra el gasto que se acaba de reordenar.
      row.addEventListener('click',function blockClick(ev){
        ev.stopPropagation();
        ev.preventDefault();
        row.removeEventListener('click',blockClick,true);
      },{capture:true,once:true});
      const newOrderIds=Array.prototype.slice.call(container.children).map(function(el){return el.dataset.gid;}).filter(Boolean);
      applyGastoOrder(newOrderIds,which);
    }
  }
  document.addEventListener('pointermove',onMove,{passive:false});
  document.addEventListener('pointerup',onUp);
  document.addEventListener('pointercancel',onUp);
}
// Aplica el orden final (leído del DOM tras soltar) al arreglo guardado: los gastos de nivel
// superior quedan en ese orden; los subgastos (parentId) se dejan tal cual estaban al final —
// su posición no afecta nada, se ubican por parentId, no por índice.
function applyGastoOrder(orderedIds,which){
  const m=getM(),list=which==='q1'?m.q1_gastos:m.q2_gastos;
  const byId={};
  list.forEach(function(g){ byId[g.id]=g; });
  const tops=orderedIds.map(function(id){ return byId[id]; }).filter(Boolean);
  const totalTops=list.filter(function(g){ return !g.parentId; }).length;
  if(tops.length!==orderedIds.length||tops.length!==totalTops) return; // no cuadra, no arriesgar a perder gastos
  const subs=list.filter(function(g){ return g.parentId; });
  const newList=tops.concat(subs);
  if(which==='q1') m.q1_gastos=newList; else m.q2_gastos=newList;
  save();render();
}
