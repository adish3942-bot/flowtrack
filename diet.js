/* ══════════════════════
   FLOWTRACK — diet.js
   ══════════════════════ */

function renderMacroRings() {
  const totals = getTotals();
  document.getElementById('macroRings').innerHTML = Object.entries(MACROS).map(([k,m]) => {
    const pct = Math.min((totals[k]/m.goal)*100, 100);
    const r=28, circ=2*Math.PI*r, off=circ-(circ*pct/100);
    return `<div class="macro-card">
      <svg width="70" height="70">
        <circle cx="35" cy="35" r="${r}" fill="none" stroke="#1A1A2E" stroke-width="5"/>
        <circle cx="35" cy="35" r="${r}" fill="none" stroke="${m.color}" stroke-width="5"
          stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
          stroke-linecap="round" transform="rotate(-90 35 35)" style="transition:stroke-dashoffset .5s"/>
        <text x="35" y="39" text-anchor="middle" fill="${m.color}" font-size="11" font-family="JetBrains Mono,monospace">
          ${Math.round(pct)}%
        </text>
      </svg>
      <div class="macro-lbl" style="color:${m.color}">${m.label}</div>
      <div class="macro-sub">${Math.round(totals[k])}/${m.goal}${m.unit}</div>
    </div>`;
  }).join('');
}

function renderWater() {
  document.getElementById('waterGlasses').innerHTML = Array.from({length:8},(_,i) =>
    `<div class="wg ${i<state.water?'on':''}" onclick="setWater(${i+1})">${i<state.water?'💧':''}</div>`
  ).join('');
  document.getElementById('waterCount').textContent = `${state.water}/8`;
}
function setWater(n) { state.water=n; renderWater(); saveState(); updateHeadStats(); }

function renderMeals() {
  const t=getTotals();
  document.getElementById('mealStat').textContent = `${state.meals.length} items · ${Math.round(t.cal)} kcal`;
  document.getElementById('mealList').innerHTML = state.meals.map(m =>
    `<div class="meal-row">
      <span class="mr-time">${m.time}</span>
      <span class="mr-name">${m.name}</span>
      <span class="mr-p">${m.protein}g P</span>
      <span class="mr-c">${m.carbs}g C</span>
      <span class="mr-f">${m.fat}g F</span>
      <span class="mr-cal">${m.cal}kcal</span>
      <button class="mr-del" onclick="delMeal(${m.id})">✕</button>
    </div>`
  ).join('');
  renderMacroRings();
  updateHeadStats();
  renderDashMacro();
}
function addMeal(f) {
  state.meals.push({...f, id:nextId(), time:new Date().toTimeString().slice(0,5)});
  renderMeals(); saveState();
}
function delMeal(id) { state.meals=state.meals.filter(m=>m.id!==id); renderMeals(); saveState(); }
function renderFoodDB() {
  const q=(document.getElementById('foodSearch')||{}).value||'';
  document.getElementById('foodDB').innerHTML = FOOD_DB.filter(f=>f.name.toLowerCase().includes(q.toLowerCase()))
    .map(f => `<div class="food-row" onclick='addMeal(${JSON.stringify(f)})'>
      <span class="fr-name">${f.name}</span>
      <span style="color:#FF6B6B;font-size:10px;font-family:var(--fm)">${f.protein}g</span>
      <span style="color:#FFD93D;font-size:10px;font-family:var(--fm)">${f.carbs}g</span>
      <span style="color:#60A5FA;font-size:10px;font-family:var(--fm)">${f.fat}g</span>
      <span style="color:#34D399;font-size:10px;font-family:var(--fm);width:48px;text-align:right">${f.cal}kcal</span>
      <span class="fr-add">+</span>
    </div>`).join('');
}

function renderDashMacro() {
  const el=document.getElementById('dashMacro'); if(!el) return;
  const t=getTotals();
  el.innerHTML = Object.entries(MACROS).map(([k,m]) => {
    const pct=Math.min((t[k]/m.goal)*100,100);
    return `<div class="dash-macro-bar">
      <div class="dmb-head"><span>${m.label}</span><span style="color:${m.color};font-family:var(--fm);font-size:10px">${Math.round(t[k])}/${m.goal}${m.unit}</span></div>
      <div class="dmb-track"><div class="dmb-fill" style="width:${pct}%;background:${m.color}"></div></div>
    </div>`;
  }).join('');
}
