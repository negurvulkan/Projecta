const editor = document.getElementById('editor');
const toolbar = document.getElementById('toolbar');
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
let currentTool = null;
let layoutData = [];
let selectedEl = null;
let selectionGroup = null;

function setTool(tool){
    currentTool = tool;
}

toolbar.addEventListener('click', e => {
    if(e.target.dataset.tool){
        setTool(e.target.dataset.tool);
        addElement(currentTool);
    }
});

function addElement(type){
    let el;
    const id = Date.now();
    switch(type){
        case 'line':
            el = document.createElementNS('http://www.w3.org/2000/svg','line');
            el.setAttribute('x1',10); el.setAttribute('y1',10);
            el.setAttribute('x2',100); el.setAttribute('y2',10);
            el.setAttribute('stroke','#000'); el.setAttribute('stroke-width',2);
            break;
        case 'arrow':
            el = document.createElementNS('http://www.w3.org/2000/svg','line');
            el.setAttribute('x1',10); el.setAttribute('y1',50);
            el.setAttribute('x2',100); el.setAttribute('y2',50);
            el.setAttribute('stroke','#000'); el.setAttribute('stroke-width',2);
            el.setAttribute('marker-end','url(#arrow)');
            ensureArrowMarker();
            break;
        case 'polygon':
            el = document.createElementNS('http://www.w3.org/2000/svg','polygon');
            el.setAttribute('points','10,90 60,140 10,140');
            el.setAttribute('fill','rgba(0,0,0,0.2)');
            el.setAttribute('stroke','#000');
            break;
        case 'text':
            const t = prompt('Text eingeben');
            if(!t) return;
            el = document.createElementNS('http://www.w3.org/2000/svg','text');
            el.textContent = t;
            el.setAttribute('x',10); el.setAttribute('y',180);
            el.setAttribute('fill','#000');
            break;
        case 'image':
            const url = prompt('Bild-URL');
            if(!url) return;
            el = document.createElementNS('http://www.w3.org/2000/svg','image');
            el.setAttributeNS('http://www.w3.org/1999/xlink','href',url);
            el.setAttribute('x',10); el.setAttribute('y',200);
            el.setAttribute('width',100); el.setAttribute('height',100);
            break;
        default:
            return;
    }
    el.dataset.id = id;
    el.dataset.type = type;
    editor.appendChild(el);
    makeDraggable(el);
    updateLayoutData();
}

function ensureArrowMarker(){
    let defs = editor.querySelector('defs');
    if(!defs){
        defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
        editor.appendChild(defs);
    }
    if(!editor.querySelector('#arrow')){
        const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
        marker.id='arrow'; marker.setAttribute('markerWidth',10); marker.setAttribute('markerHeight',10);
        marker.setAttribute('refX',10); marker.setAttribute('refY',5); marker.setAttribute('orient','auto-start-reverse');
        const path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d','M0,0 L10,5 L0,10 z');
        path.setAttribute('fill','#000');
        marker.appendChild(path);
        defs.appendChild(marker);
    }
}

function selectElement(el){
    selectedEl = el;
    if(selectionGroup) selectionGroup.remove();
    const bbox = el.getBBox();
    selectionGroup = document.createElementNS('http://www.w3.org/2000/svg','g');
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x',bbox.x); rect.setAttribute('y',bbox.y);
    rect.setAttribute('width',bbox.width); rect.setAttribute('height',bbox.height);
    rect.setAttribute('fill','none');
    rect.setAttribute('stroke','#00f');
    rect.setAttribute('stroke-dasharray','4');
    selectionGroup.appendChild(rect);
    const handles = [
        {name:'nw', x:bbox.x, y:bbox.y, cursor:'nwse-resize'},
        {name:'ne', x:bbox.x+bbox.width, y:bbox.y, cursor:'nesw-resize'},
        {name:'sw', x:bbox.x, y:bbox.y+bbox.height, cursor:'nesw-resize'},
        {name:'se', x:bbox.x+bbox.width, y:bbox.y+bbox.height, cursor:'nwse-resize'}
    ];
    handles.forEach(h=>{
        const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
        r.setAttribute('x',h.x-4); r.setAttribute('y',h.y-4);
        r.setAttribute('width',8); r.setAttribute('height',8);
        r.classList.add('resize-handle');
        r.dataset.handle = h.name;
        r.style.cursor = h.cursor;
        selectionGroup.appendChild(r);
    });
    const rot = document.createElementNS('http://www.w3.org/2000/svg','circle');
    rot.setAttribute('cx', bbox.x + bbox.width/2);
    rot.setAttribute('cy', bbox.y - 20);
    rot.setAttribute('r',6);
    rot.classList.add('rotate-handle');
    rot.style.cursor = 'grab';
    selectionGroup.appendChild(rot);
    editor.appendChild(selectionGroup);
    addHandleListeners();
}

function addHandleListeners(){
    if(!selectionGroup) return;
    selectionGroup.querySelectorAll('.resize-handle').forEach(h=>{
        h.addEventListener('pointerdown', startResize);
    });
    const rot = selectionGroup.querySelector('.rotate-handle');
    if(rot) rot.addEventListener('pointerdown', startRotate);
}

function updateSelectionBox(){
    if(!selectedEl || !selectionGroup) return;
    const bbox = selectedEl.getBBox();
    const rect = selectionGroup.querySelector('rect');
    rect.setAttribute('x',bbox.x); rect.setAttribute('y',bbox.y);
    rect.setAttribute('width',bbox.width); rect.setAttribute('height',bbox.height);
    const positions = {
        nw:[bbox.x,bbox.y],
        ne:[bbox.x+bbox.width,bbox.y],
        sw:[bbox.x,bbox.y+bbox.height],
        se:[bbox.x+bbox.width,bbox.y+bbox.height]
    };
    selectionGroup.querySelectorAll('.resize-handle').forEach(h=>{
        const p = positions[h.dataset.handle];
        h.setAttribute('x',p[0]-4);
        h.setAttribute('y',p[1]-4);
    });
    const rot = selectionGroup.querySelector('.rotate-handle');
    if(rot){
        rot.setAttribute('cx', bbox.x + bbox.width/2);
        rot.setAttribute('cy', bbox.y - 20);
    }
}

function applyTransform(el){
    const angle = parseFloat(el.dataset.rot || 0);
    const sx = parseFloat(el.dataset.sx || 1);
    const sy = parseFloat(el.dataset.sy || 1);
    const cx = parseFloat(el.dataset.cx || 0);
    const cy = parseFloat(el.dataset.cy || 0);
    el.setAttribute('transform', `translate(${cx} ${cy}) rotate(${angle}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`);
}

let resizeHandle = null;
let startX, startY, startBox, startSx, startSy;

function startResize(e){
    e.stopPropagation();
    resizeHandle = e.target.dataset.handle;
    startX = e.clientX; startY = e.clientY;
    startBox = selectedEl.getBBox();
    selectedEl.dataset.cx = startBox.x + startBox.width/2;
    selectedEl.dataset.cy = startBox.y + startBox.height/2;
    startSx = parseFloat(selectedEl.dataset.sx || 1);
    startSy = parseFloat(selectedEl.dataset.sy || 1);
    window.addEventListener('pointermove', resizeMove);
    window.addEventListener('pointerup', endResize);
}

function resizeMove(e){
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newW = startBox.width;
    let newH = startBox.height;
    if(resizeHandle.includes('e')) newW += dx;
    if(resizeHandle.includes('w')) newW -= dx;
    if(resizeHandle.includes('s')) newH += dy;
    if(resizeHandle.includes('n')) newH -= dy;
    const sx = Math.max(newW / startBox.width, 0.1) * startSx;
    const sy = Math.max(newH / startBox.height, 0.1) * startSy;
    selectedEl.dataset.sx = sx;
    selectedEl.dataset.sy = sy;
    applyTransform(selectedEl);
    updateSelectionBox();
    updateLayoutData();
}

function endResize(){
    window.removeEventListener('pointermove', resizeMove);
    window.removeEventListener('pointerup', endResize);
}

let startAngle, initAngle;

function startRotate(e){
    e.stopPropagation();
    const bbox = selectedEl.getBBox();
    selectedEl.dataset.cx = bbox.x + bbox.width/2;
    selectedEl.dataset.cy = bbox.y + bbox.height/2;
    startAngle = Math.atan2(e.clientY - selectedEl.dataset.cy, e.clientX - selectedEl.dataset.cx);
    initAngle = parseFloat(selectedEl.dataset.rot || 0);
    window.addEventListener('pointermove', rotateMove);
    window.addEventListener('pointerup', endRotate);
}

function rotateMove(e){
    const angle = Math.atan2(e.clientY - selectedEl.dataset.cy, e.clientX - selectedEl.dataset.cx);
    const deg = (angle - startAngle) * 180 / Math.PI + initAngle;
    selectedEl.dataset.rot = deg;
    applyTransform(selectedEl);
    updateSelectionBox();
    updateLayoutData();
}

function endRotate(){
    window.removeEventListener('pointermove', rotateMove);
    window.removeEventListener('pointerup', endRotate);
}

function deselect(){
    if(selectionGroup){
        selectionGroup.remove();
        selectionGroup = null;
    }
    selectedEl = null;
}

function makeDraggable(el){
    let startX, startY, origX, origY, origX2, origY2;

    el.addEventListener('pointerdown', e => {
        if(e.target.classList.contains('resize-handle') || e.target.classList.contains('rotate-handle')) return;

        selectElement(el);
        startX = e.clientX;
        startY = e.clientY;

        origX = parseFloat(el.getAttribute('x') || el.getAttribute('x1') || 0);
        origY = parseFloat(el.getAttribute('y') || el.getAttribute('y1') || 0);

        if(el.tagName === 'line'){
            origX2 = parseFloat(el.getAttribute('x2') || 0);
            origY2 = parseFloat(el.getAttribute('y2') || 0);
        }

        el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', e => {
        if(!el.hasPointerCapture(e.pointerId)) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        switch(el.tagName){
            case 'line':
                el.setAttribute('x1', origX + dx);
                el.setAttribute('y1', origY + dy);
                el.setAttribute('x2', origX2 + dx);
                el.setAttribute('y2', origY2 + dy);
                break;
            case 'text':
            case 'image':
            case 'polygon':
                el.setAttribute('x', origX + dx);
                el.setAttribute('y', origY + dy);
                break;
        }

        const bbox = el.getBBox();
        el.dataset.cx = bbox.x + bbox.width / 2;
        el.dataset.cy = bbox.y + bbox.height / 2;

        applyTransform(el);
        updateLayoutData();
        updateSelectionBox();
    });

    el.addEventListener('pointerup', e => {
        el.releasePointerCapture(e.pointerId);
    });
}

function updateLayoutData(){
    layoutData = Array.from(editor.children).filter(c=>c.tagName!=='defs').map(el=>{
        const obj = {id: el.dataset.id, type: el.dataset.type};
        switch(el.tagName){
            case 'line':
                obj.attrs = {
                    x1: el.getAttribute('x1'), y1: el.getAttribute('y1'),
                    x2: el.getAttribute('x2'), y2: el.getAttribute('y2'),
                    stroke: el.getAttribute('stroke'),
                    'stroke-width': el.getAttribute('stroke-width'),
                    marker: el.getAttribute('marker-end')
                };
                break;
            case 'polygon':
                obj.attrs = {points: el.getAttribute('points'), fill: el.getAttribute('fill'), stroke: el.getAttribute('stroke')};
                break;
            case 'text':
                obj.attrs = {x: el.getAttribute('x'), y: el.getAttribute('y'), fill: el.getAttribute('fill'), text: el.textContent};
                break;
            case 'image':
                obj.attrs = {x: el.getAttribute('x'), y: el.getAttribute('y'), width: el.getAttribute('width'), height: el.getAttribute('height'), href: el.getAttribute('href') || el.getAttributeNS('http://www.w3.org/1999/xlink','href')};
                break;
        }
        if(el.getAttribute('transform')){
            obj.attrs.transform = el.getAttribute('transform');
        }
        return obj;
    });
}

async function saveLayout(){
    const name = prompt('Layout Name?','layout');
    if(!name) return;
    const res = await fetch('../backend/api/save_layout.php', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name,data:layoutData})
    });
    const json = await res.json();
    alert('Gespeichert mit ID '+json.id);
}

async function loadLayout(){
    const res = await fetch('../backend/api/load_layout.php');
    const json = await res.json();
    renderLayout(json.data);
}

function renderLayout(data){
    editor.innerHTML='';
    data.forEach(obj=>{
        addElementFromData(obj);
    });
    updateLayoutData();
}

function addElementFromData(obj){
    let el;
    switch(obj.type){
        case 'line':
            el = document.createElementNS('http://www.w3.org/2000/svg','line');
            break;
        case 'polygon':
            el = document.createElementNS('http://www.w3.org/2000/svg','polygon');
            break;
        case 'text':
            el = document.createElementNS('http://www.w3.org/2000/svg','text');
            el.textContent = obj.attrs.text;
            break;
        case 'image':
            el = document.createElementNS('http://www.w3.org/2000/svg','image');
            el.setAttributeNS('http://www.w3.org/1999/xlink','href',obj.attrs.href);
            break;
        case 'arrow':
            ensureArrowMarker();
            el = document.createElementNS('http://www.w3.org/2000/svg','line');
            obj.attrs['marker-end']='url(#arrow)';
            break;
    }
    for(const k in obj.attrs){
        el.setAttribute(k,obj.attrs[k]);
    }
    if(obj.attrs && obj.attrs.transform){
        const r = obj.attrs.transform.match(/rotate\(([-0-9.]+)/);
        const s = obj.attrs.transform.match(/scale\(([-0-9.]+) ([-0-9.]+)\)/);
        if(r) el.dataset.rot = r[1];
        if(s){ el.dataset.sx = s[1]; el.dataset.sy = s[2]; }
    }
    el.dataset.id = obj.id;
    el.dataset.type = obj.type;
    editor.appendChild(el);
    makeDraggable(el);
}

async function resetLayout(){
    editor.innerHTML='';
    layoutData=[];
}

// buttons
saveBtn.addEventListener('click', saveLayout);
loadBtn.addEventListener('click', loadLayout);
resetBtn.addEventListener('click', resetLayout);
editor.addEventListener('pointerdown', e => {
    if(e.target === editor) deselect();
});
