/* ════════════════════════
   FLOWTRACK — games.js
   ════════════════════════ */

/* ─── MEMORY ─── */
let mCards=[],mSel=[],mMoves=0,mBest=null;
function initMemory(){
  mCards=[...GAME_EMOJIS,...GAME_EMOJIS].map((e,i)=>({id:i,e,f:false,m:false}));
  for(let i=mCards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[mCards[i],mCards[j]]=[mCards[j],mCards[i]];}
  mSel=[];mMoves=0;renderMemory();
}
function flipCard(i){
  if(mSel.length===2||mCards[i].f||mCards[i].m)return;
  mCards[i].f=true;mSel.push(i);renderMemory();
  if(mSel.length===2){
    mMoves++;
    const[a,b]=mSel;
    if(mCards[a].e===mCards[b].e){mCards[a].m=mCards[b].m=true;mSel=[];if(mCards.every(c=>c.m)){if(!mBest||mMoves<mBest)mBest=mMoves;}renderMemory();}
    else setTimeout(()=>{mCards[a].f=mCards[b].f=false;mSel=[];renderMemory();},650);
  }
}
function renderMemory(){
  const won=mCards.length>0&&mCards.every(c=>c.m);
  document.getElementById('gameArena').innerHTML=`
    <div class="g-head">🃏 MEMORY MATCH</div>
    <div class="g-meta">
      <span>Moves: <b style="color:#FDE68A">${mMoves}</b></span>
      ${mBest?`<span>Best: <b style="color:#34D399">${mBest}</b></span>`:'<span></span>'}
      <button onclick="initMemory()" style="background:var(--bg3);border:1px solid var(--line2);color:var(--txt2);border-radius:6px;padding:4px 12px;cursor:pointer;font-family:var(--fm);font-size:10px">RESET</button>
    </div>
    ${won?`<div style="text-align:center;padding:10px;background:#34D39918;border:1px solid #34D39940;border-radius:8px;margin-bottom:12px;color:#34D399;font-weight:700;font-size:15px">🏆 DONE IN ${mMoves} MOVES!</div>`:''}
    <div class="mem-grid">${mCards.map((c,i)=>`<div class="mem-card ${c.m?'matched':c.f?'flipped':''}" onclick="flipCard(${i})">${c.f||c.m?c.e:'?'}</div>`).join('')}</div>`;
}

/* ─── REACTION ─── */
let rState='idle',rMs=null,rBest=null,rScores=[],rStart=0,rTimer=null;
function renderReaction(){
  const cols={idle:'#A78BFA',waiting:'#FDE68A',ready:'#34D399',result:'#34D399'};
  const icons={idle:'⚡',waiting:'🟡',ready:'🟢',result:'⚡'};
  const labels={idle:'CLICK TO START',waiting:'WAIT FOR IT...',ready:'CLICK NOW!!!',result:rMs?`${rMs}ms — Click to retry`:''};
  const hint=rMs?(rMs<200?'🔥 INSANE':rMs<300?'💪 GREAT':rMs<400?'👍 GOOD':'😅 KEEP TRAINING'):'';
  const c=cols[rState];
  document.getElementById('gameArena').innerHTML=`
    <div class="g-head">⚡ REACTION TIME</div>
    <div class="g-meta">
      <span>Best: <b style="color:#34D399">${rBest?rBest+'ms':'—'}</b></span>
      <span>Avg: <b style="color:#FDE68A">${rScores.length?Math.round(rScores.reduce((a,b)=>a+b)/rScores.length)+'ms':'—'}</b></span>
    </div>
    <div class="react-box" onclick="handleReact()" style="background:${c}12;border-color:${c}40">
      <div style="font-size:40px">${icons[rState]}</div>
      <div style="color:${c};font-weight:700;font-size:14px;letter-spacing:.1em">${labels[rState]}</div>
      ${hint?`<div style="font-size:12px;color:var(--txt3)">${hint}</div>`:''}
    </div>
    ${rScores.length>1?`<div class="react-bars">${rScores.map(s=>{const max=Math.max(...rScores);return`<div class="react-bar" style="height:${Math.round((s/max)*100)}%;background:#A78BFA50"><span>${s}</span></div>`;}).join('')}</div>`:''}`;
}
function handleReact(){
  if(rState==='idle'){rState='waiting';renderReaction();rTimer=setTimeout(()=>{rState='ready';rStart=Date.now();renderReaction();},1500+Math.random()*3000);}
  else if(rState==='waiting'){clearTimeout(rTimer);rState='idle';rMs=null;renderReaction();setTimeout(()=>{const t=document.querySelector('.react-box div:nth-child(2)');if(t)t.textContent='Too early! 😅';},10);}
  else if(rState==='ready'){rMs=Date.now()-rStart;rScores=[...rScores.slice(-4),rMs];if(!rBest||rMs<rBest)rBest=rMs;rState='result';renderReaction();}
  else if(rState==='result'){rState='idle';rMs=null;renderReaction();}
}

/* ─── MATH ─── */
let mathQ=null,mathScore=0,mathStreak=0,mathTimer=15,mathIntvl=null;
function genMath(){
  const ops=['+','-','×','÷'],op=ops[Math.floor(Math.random()*3)];
  let a,b,ans;
  if(op==='÷'){b=Math.floor(Math.random()*9)+1;a=b*(Math.floor(Math.random()*9)+1);ans=a/b;}
  else if(op==='×'){a=Math.floor(Math.random()*12)+1;b=Math.floor(Math.random()*12)+1;ans=a*b;}
  else if(op==='+'){a=Math.floor(Math.random()*99)+1;b=Math.floor(Math.random()*99)+1;ans=a+b;}
  else{a=Math.floor(Math.random()*99)+20;b=Math.floor(Math.random()*a)+1;ans=a-b;}
  const opts=[ans,ans+Math.floor(Math.random()*10)+1,ans-Math.floor(Math.random()*10)-1,ans+Math.floor(Math.random()*20)+5].sort(()=>Math.random()-.5);
  return{a,b,op,ans,opts};
}
function startMathTimer(){
  clearInterval(mathIntvl);mathTimer=15;
  mathIntvl=setInterval(()=>{
    mathTimer--;
    const f=document.getElementById('mTimerFill'),l=document.getElementById('mTimerLbl');
    if(f){f.style.width=`${(mathTimer/15)*100}%`;f.style.background=mathTimer>7?'#34D399':mathTimer>4?'#FDE68A':'#F87171';}
    if(l)l.textContent=mathTimer+'s';
    if(mathTimer<=0){mathStreak=0;nextMath();}
  },1000);
}
function nextMath(){mathQ=genMath();renderMath();}
function answerMath(val){
  clearInterval(mathIntvl);
  const q=document.getElementById('mathQBox');
  if(val===mathQ.ans){mathScore+=10+(mathStreak*2);mathStreak++;if(q)q.classList.add('correct');}
  else{mathStreak=0;if(q)q.classList.add('wrong');}
  setTimeout(()=>nextMath(),500);
}
function renderMath(){
  if(!mathQ)mathQ=genMath();
  document.getElementById('gameArena').innerHTML=`
    <div class="g-head">🔢 MENTAL MATH</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:14px;font-size:13px">
      <span style="color:#FDE68A">Score: <b>${mathScore}</b></span>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:90px;height:5px;background:var(--line);border-radius:3px">
          <div id="mTimerFill" style="height:100%;width:100%;background:#34D399;border-radius:3px;transition:width 1s linear"></div>
        </div>
        <span style="color:var(--txt3);font-size:10px;font-family:var(--fm)" id="mTimerLbl">15s</span>
      </div>
      <span style="color:#34D399">🔥 ${mathStreak}</span>
    </div>
    <div class="math-q" id="mathQBox">${mathQ.a} ${mathQ.op} ${mathQ.b} = ?</div>
    <div class="math-opts">${mathQ.opts.map(o=>`<button class="math-opt" onclick="answerMath(${o})">${o}</button>`).join('')}</div>`;
  startMathTimer();
}

/* ─── SCRAMBLE ─── */
let sCur=null,sScore=0;
function pickWord(){const w=GYM_WORDS[Math.floor(Math.random()*GYM_WORDS.length)];return{...w,sc:[...w.w].sort(()=>Math.random()-.5).join('')};}
function renderScramble(fb=null){
  if(!sCur)sCur=pickWord();
  document.getElementById('gameArena').innerHTML=`
    <div class="g-head">🔤 WORD SCRAMBLE — GYM EDITION</div>
    <div class="g-meta"><span>Score: <b style="color:#FDE68A">${sScore}</b></span><button onclick="sCur=pickWord();renderScramble()" style="background:var(--bg3);border:1px solid var(--line2);color:var(--txt2);border-radius:6px;padding:4px 12px;cursor:pointer;font-family:var(--fm);font-size:10px">SKIP</button></div>
    <div style="text-align:center;font-size:12px;color:var(--txt3);margin-bottom:8px">Hint: ${sCur.h}</div>
    <div class="scram-tiles">${[...sCur.sc].map(l=>`<div class="tile">${l}</div>`).join('')}</div>
    <div class="scram-row">
      <input type="text" id="sInp" class="scram-in ${fb||''}" placeholder="Type the word..."
        style="text-transform:uppercase" onkeydown="if(event.key==='Enter')checkScram()" autofocus/>
      <button class="scram-btn" onclick="checkScram()">CHECK</button>
    </div>`;
  const inp=document.getElementById('sInp');
  if(inp&&fb!=='correct')inp.focus();
}
function checkScram(){
  const inp=document.getElementById('sInp');if(!inp)return;
  if(inp.value.toUpperCase()===sCur.w){sScore+=10;renderScramble('correct');setTimeout(()=>{sCur=pickWord();renderScramble();},600);}
  else{renderScramble('wrong');setTimeout(()=>renderScramble(),400);}
}

/* ─── Game Tabs ─── */
const GAMES=[{id:'memory',icon:'🃏',label:'Memory'},{id:'reaction',icon:'⚡',label:'Reaction'},{id:'math',icon:'🔢',label:'Math'},{id:'scramble',icon:'🔤',label:'Scramble'}];
function renderGameTabs(){
  document.getElementById('gameTabs').innerHTML=GAMES.map(g=>
    `<button class="gtab ${state.currentGame===g.id?'active':''}" onclick="switchGame('${g.id}')">${g.icon} ${g.label}</button>`
  ).join('');
}
function switchGame(id){
  state.currentGame=id;clearInterval(mathIntvl);
  renderGameTabs();
  if(id==='memory')initMemory();
  else if(id==='reaction'){rState='idle';rMs=null;renderReaction();}
  else if(id==='math'){mathScore=0;mathStreak=0;mathQ=genMath();renderMath();}
  else if(id==='scramble'){sCur=pickWord();sScore=0;renderScramble();}
}
