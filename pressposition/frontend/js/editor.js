const editor = document.getElementById('editor');
const toolbar = document.getElementById('toolbar');
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
let currentTool = null;
let layoutData = [];

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

function makeDraggable(el){
    let startX, startY, origX, origY;
    el.addEventListener('pointerdown', e => {
        startX = e.clientX; startY = e.clientY;
        origX = parseFloat(el.getAttribute('x') || el.getAttribute('x1') || 0);
        origY = parseFloat(el.getAttribute('y') || el.getAttribute('y1') || 0);
        el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
        if(!el.hasPointerCapture(e.pointerId)) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        switch(el.tagName){
            case 'line':
                el.setAttribute('x1',origX + dx);
                el.setAttribute('y1',origY + dy);
                el.setAttribute('x2',parseFloat(el.getAttribute('x2')) + dx);
                el.setAttribute('y2',parseFloat(el.getAttribute('y2')) + dy);
                break;
            case 'text':
            case 'image':
            case 'polygon':
                el.setAttribute('x',origX + dx);
                el.setAttribute('y',origY + dy);
                break;
        }
        updateLayoutData();
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
