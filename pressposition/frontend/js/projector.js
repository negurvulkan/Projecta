const projector = document.getElementById('projector');

async function fetchLayout(){
    const res = await fetch('../backend/api/load_layout.php');
    if(!res.ok) return;
    const json = await res.json();
    render(json.data);
}

function render(data){
    projector.innerHTML='';
    data.forEach(obj=>{
        let el;
        switch(obj.type){
            case 'line':
            case 'arrow':
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
        }
        for(const k in obj.attrs){
            el.setAttribute(k,obj.attrs[k]);
        }
        if(obj.type==='arrow'){
            ensureArrowMarker();
            el.setAttribute('marker-end','url(#arrow)');
        }
        projector.appendChild(el);
    });
}

function ensureArrowMarker(){
    let defs = projector.querySelector('defs');
    if(!defs){
        defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
        projector.appendChild(defs);
    }
    if(!projector.querySelector('#arrow')){
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

setInterval(fetchLayout, 2000);
fetchLayout();
