/* ══════════════════════════════
   FLOWTRACK — notifications.js
   ══════════════════════════════ */

let notifTimers = [];
let notifScheduled = new Set();

function requestNotifPermission() {
  if (!('Notification' in window)) {
    alert('Your browser does not support notifications.');
    return;
  }
  Notification.requestPermission().then(perm => {
    updateNotifPermStatus();
    if (perm === 'granted') {
      addInAppNotif('🔔 Notifications enabled!', 'You will now receive task reminders.');
      scheduleAllNotifs();
    }
  });
}

function updateNotifPermStatus() {
  const el = document.getElementById('notifPermStatus');
  if (!el) return;
  if (!('Notification' in window)) {
    el.innerHTML = '❌ Not supported in this browser';
    el.style.color = '#F87171';
  } else if (Notification.permission === 'granted') {
    el.innerHTML = '✅ Notifications are <b style="color:#34D399">enabled</b>';
  } else if (Notification.permission === 'denied') {
    el.innerHTML = '❌ Notifications are <b style="color:#F87171">blocked</b> — please enable in browser settings';
  } else {
    el.innerHTML = '⚠️ Permission not yet granted — click below to enable';
    el.style.color = '#FDE68A';
  }
}

function sendTestNotif() {
  if (Notification.permission !== 'granted') {
    requestNotifPermission(); return;
  }
  const n = new Notification('🔔 FlowTrack PRO', {
    body: "You're all set! Task reminders will appear here.",
    icon: 'https://cdn-icons-png.flaticon.com/512/1087/1087840.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/1087/1087840.png',
  });
  addInAppNotif('🔔 Test notification sent!', 'Notifications are working perfectly.');
  setTimeout(() => n.close(), 4000);
}

/* Schedule notifications for all tasks with notif:true */
function scheduleAllNotifs() {
  // Clear old timers
  notifTimers.forEach(t => clearTimeout(t));
  notifTimers = [];
  notifScheduled = new Set();

  const mins = state.notifMinutesBefore || 10;
  const now = new Date();

  state.tasks.forEach(task => {
    if (!task.notif || task.done) return;
    const taskDate = task.date || TODAY;
    const [h, m] = task.time.split(':').map(Number);
    const taskDT = new Date(`${taskDate}T${task.time}:00`);
    const notifDT = new Date(taskDT.getTime() - mins * 60 * 1000);
    const msUntil = notifDT - now;

    if (msUntil > 0 && !notifScheduled.has(task.id)) {
      notifScheduled.add(task.id);
      const t = setTimeout(() => {
        fireTaskNotif(task);
        notifScheduled.delete(task.id);
      }, msUntil);
      notifTimers.push(t);
    }
  });
}

function fireTaskNotif(task) {
  const space = SPACES[task.space] || {};
  const title = `${space.emoji || '🔔'} Time to: ${task.name}`;
  const body  = `Starting in ${state.notifMinutesBefore} mins at ${task.time} · ${space.label || task.space} space`;

  // In-app notification always
  addInAppNotif(title, body, task.space);

  // OS notification if permitted
  if (Notification.permission === 'granted') {
    const n = new Notification(`FlowTrack PRO — ${title}`, {
      body,
      icon: 'https://cdn-icons-png.flaticon.com/512/1087/1087840.png',
      tag: 'ft_task_' + task.id,
      requireInteraction: true,
    });
    n.onclick = () => {
      window.focus();
      switchTab(task.space, document.querySelector(`[data-tab="${task.space}"]`));
      n.close();
    };
    setTimeout(() => n.close(), 10000);
  }
}

/* In-app notification store */
function addInAppNotif(title, body, space) {
  const n = { id: nextId(), title, body, space, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), read: false };
  state.notifications.unshift(n);
  if (state.notifications.length > 30) state.notifications = state.notifications.slice(0, 30);
  updateNotifBadge();
  renderNotifList();
  showInAppToast(title, body, space);
  saveState();
}

function updateNotifBadge() {
  const unread = state.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  if (unread > 0) { badge.classList.remove('hidden'); badge.textContent = unread > 9 ? '9+' : unread; }
  else badge.classList.add('hidden');
}

function renderNotifList() {
  const el = document.getElementById('notifList');
  if (!el) return;
  if (state.notifications.length === 0) {
    el.innerHTML = '<div class="notif-empty">No notifications yet 🔕</div>'; return;
  }
  el.innerHTML = state.notifications.slice(0, 20).map(n => {
    const sp = SPACES[n.space] || {};
    const col = sp.color || '#6EE7F7';
    return `<div class="notif-item" style="border-left:3px solid ${col}">
      <div class="ni-title">${n.title}</div>
      <div>${n.body}</div>
      <div class="ni-time">${n.time}</div>
    </div>`;
  }).join('');
}

function clearNotifs() {
  state.notifications = [];
  updateNotifBadge();
  renderNotifList();
  saveState();
}

function toggleNotifPanel() {
  const p = document.getElementById('notifPanel');
  // Mark all read
  state.notifications.forEach(n => n.read = true);
  updateNotifBadge();
  p.classList.toggle('hidden');
  renderNotifList();
}

/* In-app toast popup */
function showInAppToast(title, body, space) {
  const sp = SPACES[space] || {};
  const col = sp.color || '#6EE7F7';
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:80px;right:16px;z-index:9999;
    background:#0E0E1A;border:1px solid ${col}50;border-left:3px solid ${col};
    border-radius:12px;padding:12px 16px;max-width:300px;
    box-shadow:0 8px 32px #00000080;
    animation:toastIn .3s ease forwards;
    font-family:'Inter',sans-serif;font-size:12px;
  `;
  toast.innerHTML = `
    <div style="font-weight:600;margin-bottom:3px;color:#E8E8F0">${title}</div>
    <div style="color:#8888A8;line-height:1.4">${body}</div>
  `;
  const style = document.createElement('style');
  style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    const s2 = document.createElement('style');
    s2.textContent = '@keyframes toastOut{from{opacity:1}to{opacity:0;transform:translateY(5px)}}';
    document.head.appendChild(s2);
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* Notification settings modal */
function openNotifSettings() {
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('notifSettingsModal').classList.remove('hidden');
  updateNotifPermStatus();
}
function closeNotifSettings() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('notifSettingsModal').classList.add('hidden');
  // Save timing preference
  const sel = document.querySelector('input[name="ntime"]:checked');
  if (sel) { state.notifMinutesBefore = parseInt(sel.value); saveState(); scheduleAllNotifs(); }
}
