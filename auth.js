/* ══════════════════════
   FLOWTRACK — auth.js
   ══════════════════════ */

// Seed demo account
if (!localStorage.getItem('ft_users')) {
  localStorage.setItem('ft_users', JSON.stringify([
    { username: 'demo', password: 'demo123', name: 'Demo User' }
  ]));
}

// Redirect if already logged in
if (localStorage.getItem('ft_session')) {
  window.location.href = 'app.html';
}

function getUsers() {
  return JSON.parse(localStorage.getItem('ft_users') || '[]');
}

function showSignIn() {
  document.getElementById('signinForm').classList.remove('hidden');
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('signinTab').classList.add('active');
  document.getElementById('signupTab').classList.remove('active');
}

function showSignUp() {
  document.getElementById('signupForm').classList.remove('hidden');
  document.getElementById('signinForm').classList.add('hidden');
  document.getElementById('signupTab').classList.add('active');
  document.getElementById('signinTab').classList.remove('active');
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}

function signIn() {
  const u = document.getElementById('siUser').value.trim();
  const p = document.getElementById('siPass').value;
  const err = document.getElementById('siError');
  err.classList.add('hidden');

  if (!u || !p) { showError(err, 'Please fill in all fields.'); return; }

  const users = getUsers();
  const user = users.find(x => x.username === u && x.password === p);
  if (!user) { showError(err, 'Invalid username or password.'); return; }

  localStorage.setItem('ft_session', JSON.stringify({ username: user.username, name: user.name }));
  window.location.href = 'app.html';
}

function signUp() {
  const name = document.getElementById('suName').value.trim();
  const u    = document.getElementById('suUser').value.trim();
  const p    = document.getElementById('suPass').value;
  const err  = document.getElementById('suError');
  err.classList.add('hidden');

  if (!name || !u || !p) { showError(err, 'Please fill in all fields.'); return; }
  if (u.length < 3)      { showError(err, 'Username must be at least 3 characters.'); return; }
  if (p.length < 6)      { showError(err, 'Password must be at least 6 characters.'); return; }

  const users = getUsers();
  if (users.find(x => x.username === u)) { showError(err, 'Username already taken.'); return; }

  users.push({ username: u, password: p, name });
  localStorage.setItem('ft_users', JSON.stringify(users));
  localStorage.setItem('ft_session', JSON.stringify({ username: u, name }));
  window.location.href = 'app.html';
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
  el.style.animation = 'none';
  requestAnimationFrame(() => { el.style.animation = 'shake .3s ease'; });
}

// Password strength meter
document.addEventListener('DOMContentLoaded', () => {
  const pw = document.getElementById('suPass');
  if (pw) {
    pw.addEventListener('input', () => {
      const v = pw.value;
      const bar = document.querySelector('.strength-bar div');
      let str = 0;
      if (v.length >= 6) str++;
      if (v.length >= 10) str++;
      if (/[A-Z]/.test(v)) str++;
      if (/[0-9]/.test(v)) str++;
      if (/[^A-Za-z0-9]/.test(v)) str++;
      const pcts = ['0%','20%','40%','60%','80%','100%'];
      const cols = ['','#EF4444','#F97316','#EAB308','#22C55E','#00FFB2'];
      bar.style.width = pcts[str];
      bar.style.background = cols[str];
    });
  }
});

// Shake keyframe
const s = document.createElement('style');
s.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}';
document.head.appendChild(s);
