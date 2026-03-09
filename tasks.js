/* ════════════════════════
   FLOWTRACK — tasks.js
   ════════════════════════ */

let timerInterval = null;

/* ── Timer ── */
function startTimer(taskId) {
  if (state.activeTimer !== null && state.activeTimer !== taskId) stopTimer();
  state.activeTimer = taskId;
  state.timerSec = 0;
  timerInterval = setInterval(() => {
    state.timerSec++;
    const v = fmtTime(state.timerSec);
    const el1 = document.getElementById('sbTimerVal');
    if (el1) el1.textContent = v;
  }, 1000);
  const sb = document.getElementById('sbTimer');
  if (sb) sb.classList.remove('hidden');
  reRenderCurrentTab();
}

function stopTimer() {
  if (state.activeTimer === null) return;
  clearInterval(timerInterval);
  const task = state.tasks.find(t => t.id === state.activeTimer);
  if (task && state.timerSec > 0) {
    state.logs.push({ taskId:task.id, name:task.name, space:task.space, elapsed:state.timerSec, time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) });
  }
  state.activeTimer = null; state.timerSec = 0;
  const sb = document.getElementById('sbTimer');
  if (sb) sb.classList.add('hidden');
  reRenderCurrentTab();
  renderDashLog();
  saveState();
}

/* ── Modal ── */
function openModal(space) {
  state.modalSpace = space;
  const sp = SPACES[space];
  document.getElementById('modalTitle').textContent = `New ${sp.label} Task`;
  document.getElementById('mDate').value = TODAY;
  document.getElementById('mName').value = '';
  document.getElementById('mDesc').value = '';
  document.getElementById('mTime').value = '09:00';
  document.getElementById('mDur').value  = '30';
  document.getElementById('mPrio').value = 'normal';
  document.getElementById('mNotif').checked = true;
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('taskModal').classList.remove('hidden');
  document.getElementById('modalSaveBtn').style.background = `linear-gradient(135deg, ${sp.color}, ${sp.color}AA)`;
  setTimeout(() => document.getElementById('mName').focus(), 100);
}

function closeModal() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('taskModal').classList.add('hidden');
  document.getElementById('notifSettingsModal').classList.add('hidden');
}

function saveTask() {
  const name = document.getElementById('mName').value.trim();
  if (!name) { document.getElementById('mName').style.borderColor='#F87171'; return; }
  const task = {
    id: nextId(),
    space: state.modalSpace,
    name,
    desc:  document.getElementById('mDesc').value.trim(),
    time:  document.getElementById('mTime').value,
    date:  document.getElementById('mDate').value || TODAY,
    dur:   parseInt(document.getElementById('mDur').value) || 30,
    prio:  document.getElementById('mPrio').value,
    notif: document.getElementById('mNotif').checked,
    done:  false,
  };
  state.tasks.push(task);
  closeModal();
  scheduleAllNotifs();
  reRenderCurrentTab();
  renderDashboard();
  saveState();
  // Toast confirmation
  const sp = SPACES[task.space];
  showInAppToast(`✅ Task added to ${sp.label}`, `${task.name} at ${task.time}`, task.space);
}

function toggleDone(id) {
  const t = state.tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  reRenderCurrentTab();
  renderDashboard();
  saveState();
}

function deleteTask(id) {
  if (state.activeTimer === id) stopTimer();
  state.tasks = state.tasks.filter(t => t.id !== id);
  reRenderCurrentTab();
  renderDashboard();
  saveState();
}

/* ── Render Space Body ── */
function renderSpaceBody(space) {
  const el = document.getElementById(`body-${space}`);
  if (!el) return;
  const sp = SPACES[space];
  const tasks = state.tasks.filter(t => t.space === space);
  const sorted = [...tasks].sort((a,b) => a.time.localeCompare(b.time));
  const done = tasks.filter(t=>t.done).length;
  const totalMins = tasks.reduce((a,t)=>a+t.dur,0);

  // Stats bar
  const statsHTML = `
    <div class="space-stats-bar">
      <div class="ss-stat"><div class="ss-val" style="color:${sp.color}">${done}/${tasks.length}</div><div class="ss-lbl">DONE</div></div>
      <div class="ss-stat"><div class="ss-val" style="color:${sp.color}">${tasks.filter(t=>t.prio==='high').length}</div><div class="ss-lbl">HIGH PRIO</div></div>
      <div class="ss-stat"><div class="ss-val" style="color:${sp.color}">${totalMins}m</div><div class="ss-lbl">PLANNED</div></div>
      <div class="ss-stat"><div class="ss-val" style="color:${sp.color}">${Math.round(done/Math.max(tasks.length,1)*100)}%</div><div class="ss-lbl">COMPLETE</div></div>
    </div>`;

  // Split pending / done
  const pending = sorted.filter(t=>!t.done);
  const completed = sorted.filter(t=>t.done);

  const renderTaskBlock = (tasks, label, accent) => {
    if (tasks.length === 0) return '';
    return `
      <div class="space-section">
        <div class="space-section-title" style="color:${accent}">${label} <span style="color:var(--txt3)">${tasks.length}</span></div>
        <div class="space-task-list">
          ${tasks.map(t => renderSpaceTask(t, sp)).join('')}
        </div>
      </div>`;
  };

  const emptyHTML = tasks.length === 0 ? `
    <div class="space-section" style="grid-column:1/-1">
      <div class="empty-state">
        <div class="empty-icon">${sp.emoji}</div>
        <div>No ${sp.label} tasks yet</div>
        <div style="margin-top:6px;font-size:11px;color:var(--txt3)">Click "+ New Task" to add your first one</div>
      </div>
    </div>` : '';

  el.innerHTML = statsHTML + `<div class="space-body">
    ${emptyHTML}
    ${renderTaskBlock(pending, 'PENDING', sp.color)}
    ${renderTaskBlock(completed, 'COMPLETED', '#44445A')}
  </div>`;
}

function renderSpaceTask(t, sp) {
  const isActive = state.activeTimer === t.id;
  const timerCol = isActive ? '#FF6B6B' : sp.color;
  const timerBg  = isActive ? '#FF6B6B18' : `${sp.color}18`;
  const timerBdr = isActive ? '#FF6B6B40' : `${sp.color}40`;
  const timerTxt = isActive ? '■ STOP' : '▶';
  const prioClass = t.prio === 'high' ? 'prio-high' : t.prio === 'low' ? 'prio-low' : '';
  return `
    <div class="space-task" style="${isActive ? `border-color:${sp.color}40;background:${sp.color}06` : ''}">
      <div class="st-check" onclick="toggleDone(${t.id})"
        style="border-color:${t.done ? sp.color : ''};background:${t.done ? sp.color+'22' : ''}">
        ${t.done ? `<span style="color:${sp.color}">✓</span>` : ''}
      </div>
      <div class="st-name ${t.done ? 'done' : ''} ${prioClass}">${t.name}</div>
      <div class="st-time">${t.time}</div>
      <div class="st-dur">${t.dur}m</div>
      ${t.notif ? `<span class="st-notif">🔔</span>` : ''}
      <button class="st-timer" onclick="${isActive ? 'stopTimer()' : `startTimer(${t.id})`}"
        style="color:${timerCol};background:${timerBg};border:1px solid ${timerBdr}">${timerTxt}</button>
      <button class="st-del" onclick="deleteTask(${t.id})">✕</button>
    </div>`;
}

/* ── Dashboard Task Feed ── */
function renderDashFeed() {
  const el = document.getElementById('dashFeed');
  if (!el) return;
  const sorted = [...state.tasks]
    .filter(t => !t.date || t.date === TODAY)
    .sort((a,b) => a.time.localeCompare(b.time));

  if (sorted.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><div>No tasks today</div></div>'; return;
  }
  el.innerHTML = sorted.map(t => {
    const sp = SPACES[t.space] || {};
    const isActive = state.activeTimer === t.id;
    const prioClass = t.prio === 'high' ? 'prio-high' : t.prio === 'low' ? 'prio-low' : '';
    return `
      <div class="task-feed-item">
        <div class="tfi-check" onclick="toggleDone(${t.id})"
          style="border-color:${t.done ? sp.color : ''};background:${t.done ? sp.color+'22' : ''}">
          ${t.done ? `<span style="color:${sp.color}">✓</span>` : ''}
        </div>
        <div class="tfi-dot" style="background:${sp.color}"></div>
        <div class="tfi-name ${t.done ? 'done' : ''} ${prioClass}">${t.name}</div>
        <div class="tfi-badge" style="color:${sp.color};background:${sp.color}15">${sp.emoji} ${sp.label}</div>
        <div class="tfi-time">${t.time}</div>
        <button class="tfi-timer" onclick="${isActive ? 'stopTimer()' : `startTimer(${t.id})`}"
          style="color:${isActive ? '#FF6B6B' : sp.color};background:${isActive ? '#FF6B6B18' : sp.color+'18'};border:1px solid ${isActive ? '#FF6B6B40' : sp.color+'40'}">
          ${isActive ? '■' : '▶'}
        </button>
        <button class="tfi-del" onclick="deleteTask(${t.id})">✕</button>
      </div>`;
  }).join('');
}

function renderDashLog() {
  const el = document.getElementById('dashLog');
  if (!el) return;
  if (state.logs.length === 0) {
    el.innerHTML = '<div style="font-size:12px;color:var(--txt3);padding:10px 0">No sessions yet — start a timer!</div>'; return;
  }
  el.innerHTML = [...state.logs].reverse().slice(0,5).map(l => {
    const sp = SPACES[l.space] || {};
    return `<div class="log-item">
      <span>${sp.emoji||'⚡'}</span>
      <span style="flex:1;font-size:11px">${l.name}</span>
      <span class="li-elapsed">${fmtTime(l.elapsed)}</span>
      <span style="font-family:var(--fm);font-size:9px;color:var(--txt3)">${l.time}</span>
    </div>`;
  }).join('');
}
