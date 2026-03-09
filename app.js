/* ════════════════════════
   FLOWTRACK — app.js
   Main controller & init
   ════════════════════════ */

// Auth guard
const session = JSON.parse(localStorage.getItem('ft_session') || 'null');
if (!session) { window.location.href = 'index.html'; }

function logout() {
  localStorage.removeItem('ft_session');
  window.location.href = 'index.html';
}

/* ── Tab Switch ── */
function switchTab(id, btn) {
  state.currentTab = id;
  // Sidebar
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`[data-tab="${id}"]`).forEach(b => b.classList.add('active'));
  // Bottom nav
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.bn[data-tab="${id}"]`).forEach(b => b.classList.add('active'));
  // Sections
  document.querySelectorAll('.tab').forEach(s => s.classList.add('hidden'));
  const sec = document.getElementById('tab-' + id);
  if (sec) sec.classList.remove('hidden');
  // Page title for mobile topbar
  const titles = { dashboard:'Dashboard', college:'College', school:'School', gym:'Gym', routine:'Routine', diet:'Diet', physique:'Physique', games:'MindGames' };
  const tc = document.getElementById('topbarTitle');
  if (tc) tc.textContent = titles[id] || id;
  // Render
  initTabContent(id);
  // Close notif panel if open
  const np = document.getElementById('notifPanel');
  if (np && !np.classList.contains('hidden')) np.classList.add('hidden');
}

function initTabContent(id) {
  if (id === 'dashboard')  renderDashboard();
  if (id === 'college')    renderSpaceBody('college');
  if (id === 'school')     renderSpaceBody('school');
  if (id === 'gym')        renderSpaceBody('gym');
  if (id === 'routine')    renderSpaceBody('routine');
  if (id === 'diet')       { renderMacroRings(); renderWater(); renderMeals(); renderFoodDB(); }
  if (id === 'physique')   renderPhysique();
  if (id === 'games')      { renderGameTabs(); switchGame(state.currentGame); }
}

function reRenderCurrentTab() { initTabContent(state.currentTab); }

/* ── Dashboard ── */
function renderDashboard() {
  renderSpaceGrid();
  renderDashFeed();
  renderDashMacro();
  renderDashLog();
  updateHeadStats();
}

function renderSpaceGrid() {
  const el = document.getElementById('spaceGrid'); if (!el) return;
  el.innerHTML = Object.entries(SPACES).map(([key, sp]) => {
    const tasks = state.tasks.filter(t => t.space === key);
    const done  = tasks.filter(t => t.done).length;
    const pct   = tasks.length ? (done/tasks.length)*100 : 0;
    return `<div class="sc" style="--sc-col:${sp.color}" onclick="switchTab('${key}', document.querySelector('[data-tab=${key}]'))">
      <div class="sc-emoji">${sp.emoji}</div>
      <div class="sc-name">${sp.label}</div>
      <div class="sc-sub">${done}/${tasks.length} tasks · ${sp.desc}</div>
      <div class="sc-prog"><div class="sc-prog-fill" style="width:${pct}%;background:${sp.color}"></div></div>
    </div>`;
  }).join('');
}

/* ── Head Stats ── */
function updateHeadStats() {
  const el = document.getElementById('headStats'); if (!el) return;
  const done  = state.tasks.filter(t => t.done).length;
  const total = state.tasks.length;
  const cal   = Math.round(getTotals().cal);
  const tracked = state.logs.reduce((a,l) => a+l.elapsed, 0);
  el.innerHTML = [
    { val:`${done}/${total}`, lbl:'TASKS DONE' },
    { val:`${cal}`, lbl:'KCAL TODAY' },
    { val:fmtTime(tracked), lbl:'TRACKED' },
    { val:`${state.water}/8`, lbl:'WATER' },
  ].map(s => `<div class="hstat"><div class="hstat-val">${s.val}</div><div class="hstat-lbl">${s.lbl}</div></div>`).join('');
}

/* ── Init ── */
function init() {
  loadState();

  // Set user info
  if (session) {
    const nameEl = document.getElementById('sbName');
    if (nameEl) nameEl.textContent = session.name || session.username;
    const avEl = document.getElementById('sbAvatar');
    if (avEl) avEl.textContent = (session.name || session.username || '?')[0].toUpperCase();
  }

  // Set date
  const d = new Date();
  const dateStr = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }).toUpperCase();
  // Render initial tab
  renderDashboard();
  renderNotifList();
  updateNotifBadge();

  // Schedule notifications
  if (Notification.permission === 'granted') scheduleAllNotifs();

  // Re-schedule every minute
  setInterval(() => { scheduleAllNotifs(); }, 60000);
}

document.addEventListener('DOMContentLoaded', init);

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeNotifSettings(); }
});
