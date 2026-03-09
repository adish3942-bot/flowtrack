/* ════════════════════════════
   FLOWTRACK — physique.js
   ════════════════════════════ */

let pendingImg = null;

function togglePhysiqueForm() {
  const f=document.getElementById('physForm');
  f.classList.toggle('hidden');
  document.getElementById('pDate').value = TODAY;
  pendingImg=null;
  document.getElementById('pPreview').classList.add('hidden');
}

function previewPhoto(e) {
  const file=e.target.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=ev=>{
    pendingImg=ev.target.result;
    const p=document.getElementById('pPreview');
    p.src=pendingImg; p.classList.remove('hidden');
  };
  r.readAsDataURL(file);
}

function savePhoto() {
  const label=document.getElementById('pLabel').value.trim();
  if(!label){alert('Please enter a label!');return;}
  const cols=['#F43F5E','#FB923C','#FDE68A','#34D399','#6EE7F7','#A78BFA'];
  state.photos.push({
    id:nextId(), label,
    date:document.getElementById('pDate').value,
    weight:parseFloat(document.getElementById('pWeight').value)||0,
    note:document.getElementById('pNote').value.trim(),
    color:cols[state.photos.length%cols.length],
    img:pendingImg,
  });
  ['pLabel','pWeight','pNote'].forEach(id=>document.getElementById(id).value='');
  pendingImg=null;
  togglePhysiqueForm();
  renderPhysique();
  saveState();
}

function renderPhysique() {
  renderWeightChart();
  const grid=document.getElementById('photoGrid');
  const cards=state.photos.map((p,i)=>{
    const badge=i===state.photos.length-1?'LATEST':i===0?'START':`WK ${i+1}`;
    return `<div class="photo-card" style="border-color:${p.color}30">
      <div class="pc-img" style="background:linear-gradient(135deg,${p.color}15,${p.color}05)">
        ${p.img?`<img class="pc-actual" src="${p.img}"/>`:''}
        <span class="pc-ph">💪</span>
        <span class="pc-badge" style="color:${p.color};background:${p.color}18;border-color:${p.color}35">${badge}</span>
        ${p.weight?`<span class="pc-wt" style="color:${p.color}">${p.weight}kg</span>`:''}
      </div>
      <div class="pc-info">
        <div class="pc-title" style="color:${p.color}">${p.label}</div>
        <div class="pc-date">${new Date(p.date+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
        ${p.note?`<div class="pc-note">${p.note}</div>`:''}
      </div>
    </div>`;
  }).join('');
  grid.innerHTML = cards + `<div class="photo-add" onclick="togglePhysiqueForm()">
    <span style="font-size:32px;opacity:.3">📸</span>
    <span style="font-size:11px;color:var(--txt3);letter-spacing:.1em">ADD PROGRESS</span>
  </div>`;
}

function renderWeightChart() {
  const chart=document.getElementById('wChart');
  const withW=state.photos.filter(p=>p.weight>0);
  if(withW.length<2){chart.classList.add('hidden');return;}
  chart.classList.remove('hidden');
  const vals=withW.map(p=>p.weight);
  const mn=Math.min(...vals),mx=Math.max(...vals);
  const bars=withW.map(p=>{
    const h=vals.length>1?((p.weight-mn)/(mx-mn||1))*60+16:40;
    return `<div class="wb-col">
      <div class="wb-val" style="color:${p.color}">${p.weight}kg</div>
      <div class="wb-fill" style="height:${h}px;background:${p.color}30;border:1px solid ${p.color}50"></div>
      <div class="wb-lbl">${p.label.split('—')[0].trim()}</div>
    </div>`;
  }).join('');
  const first=withW[0],last=withW[withW.length-1];
  const diff=(first.weight-last.weight).toFixed(1);
  chart.innerHTML=`<div class="col-lbl" style="margin-bottom:10px">WEIGHT TREND</div>
    <div class="w-bars">${bars}</div>
    <div class="w-summary">
      <span>Start: <b style="color:#F43F5E">${first.weight}kg</b></span>
      <span>Now: <b style="color:#34D399">${last.weight}kg</b></span>
      <span>Change: <b style="color:#FDE68A">${diff}kg ${diff>0?'lost':'gained'}</b></span>
    </div>`;
}
