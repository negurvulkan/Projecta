const calibBtn = document.getElementById('calibBtn');
if(calibBtn){
    calibBtn.addEventListener('click', startCalibration);
}

function startCalibration(){
    const container = document.getElementById('editor-container') || document.getElementById('projector-container');
    const overlay = document.createElement('div');
    overlay.id='calib-overlay';
    overlay.style.position='absolute';
    overlay.style.left=0; overlay.style.top=0; overlay.style.right=0; overlay.style.bottom=0;
    overlay.style.background='rgba(0,0,0,0.3)';
    overlay.style.zIndex=1000;
    overlay.style.cursor='crosshair';
    container.style.position='relative';
    container.appendChild(overlay);

    const points=[];
    overlay.addEventListener('click', e=>{
        const rect = overlay.getBoundingClientRect();
        points.push({x:e.clientX-rect.left,y:e.clientY-rect.top});
        if(points.length===4){
            container.removeChild(overlay);
            saveCalibration(points);
            applyCalibration(container.querySelector('svg'));
        }
    },{once:false});
}

function saveCalibration(points){
    const xs = points.map(p=>p.x);
    const ys = points.map(p=>p.y);
    const calib = {minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys)};
    localStorage.setItem('calibration', JSON.stringify(calib));
}

function applyCalibration(svg){
    const calib = JSON.parse(localStorage.getItem('calibration')||'null');
    if(!calib || !svg) return;
    const w = svg.viewBox.baseVal.width || svg.clientWidth;
    const h = svg.viewBox.baseVal.height || svg.clientHeight;
    const scaleX = (calib.maxX - calib.minX)/w;
    const scaleY = (calib.maxY - calib.minY)/h;
    svg.style.transform = `translate(${calib.minX}px, ${calib.minY}px) scale(${scaleX}, ${scaleY})`;
    svg.style.transformOrigin = 'top left';
}

// apply on load
window.addEventListener('load', ()=>{
    const svg = document.querySelector('#editor, #projector');
    if(svg) applyCalibration(svg);
});
