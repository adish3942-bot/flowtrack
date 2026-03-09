/* ══════════════════════
   FLOWTRACK — data.js
   ══════════════════════ */

const SPACES = {
  college: { label:'College', color:'#6EE7F7', emoji:'🎓', desc:'Assignments, exams & lectures' },
  school:  { label:'School',  color:'#FDE68A', emoji:'📚', desc:'Classes, homework & projects' },
  gym:     { label:'Gym',     color:'#FB923C', emoji:'💪', desc:'Workouts, sets & fitness goals' },
  routine: { label:'Routine', color:'#A78BFA', emoji:'⚡', desc:'Daily habits & personal tasks' },
};

const MACROS = {
  protein:{ color:'#FF6B6B', label:'Protein', unit:'g',    goal:180 },
  carbs:  { color:'#FFD93D', label:'Carbs',   unit:'g',    goal:250 },
  fat:    { color:'#60A5FA', label:'Fat',      unit:'g',    goal:70  },
  cal:    { color:'#34D399', label:'Calories', unit:'kcal', goal:2800 },
};

const FOOD_DB = [
  { name:'Chicken Breast (100g)',  protein:31,  carbs:0,   fat:3.6, cal:165 },
  { name:'Brown Rice (100g)',      protein:2.6, carbs:23,  fat:0.9, cal:112 },
  { name:'Eggs (1 whole)',         protein:6,   carbs:0.6, fat:5,   cal:68  },
  { name:'Oats (100g)',            protein:17,  carbs:66,  fat:7,   cal:389 },
  { name:'Banana (1 medium)',      protein:1.3, carbs:27,  fat:0.4, cal:105 },
  { name:'Whey Protein (1 scoop)', protein:25,  carbs:3,   fat:2,   cal:130 },
  { name:'Sweet Potato (100g)',    protein:1.6, carbs:20,  fat:0.1, cal:86  },
  { name:'Almonds (30g)',          protein:6,   carbs:6,   fat:14,  cal:173 },
  { name:'Greek Yogurt (150g)',    protein:15,  carbs:6,   fat:0.7, cal:90  },
  { name:'Salmon (100g)',          protein:25,  carbs:0,   fat:13,  cal:208 },
  { name:'Broccoli (100g)',        protein:2.8, carbs:7,   fat:0.4, cal:34  },
  { name:'Milk (200ml)',           protein:6.8, carbs:9.4, fat:7.2, cal:130 },
  { name:'Peanut Butter (2 tbsp)', protein:8,   carbs:6,   fat:16,  cal:190 },
  { name:'Tuna (100g)',            protein:30,  carbs:0,   fat:1,   cal:130 },
  { name:'Cottage Cheese (100g)',  protein:11,  carbs:3.4, fat:4.3, cal:98  },
];

const GYM_WORDS = [
  {w:'PROTEIN', h:'Muscle builder'},{w:'DEADLIFT',h:'King of lifts'},
  {w:'CARDIO',  h:'Heart training'},{w:'SQUAT',   h:'Leg day essential'},
  {w:'CREATINE',h:'Strength supplement'},{w:'MACROS',h:'Nutrition tracking'},
  {w:'GAINZ',   h:'Gym progress'},{w:'PULLUP',h:'Back builder'},
  {w:'BENCH',   h:'Chest day king'},{w:'PLANK',  h:'Core stability'},
];

const GAME_EMOJIS = ['🏋️','🥊','🔥','⚡','💪','🎯','🧠','🏆'];

/* ── App State ── */
const TODAY = new Date().toISOString().split('T')[0];

let state = {
  tasks: [
    {id:1,space:'college',name:'Math Assignment',  time:'09:00',date:TODAY,dur:90, done:false,prio:'high',  notif:true},
    {id:2,space:'college',name:'Physics Notes',    time:'11:00',date:TODAY,dur:60, done:false,prio:'normal',notif:true},
    {id:3,space:'college',name:'Project Research', time:'14:00',date:TODAY,dur:120,done:false,prio:'normal',notif:true},
    {id:4,space:'school', name:'History Reading',  time:'10:00',date:TODAY,dur:45, done:false,prio:'normal',notif:true},
    {id:5,space:'school', name:'English Essay',    time:'15:00',date:TODAY,dur:60, done:false,prio:'high',  notif:true},
    {id:6,space:'gym',    name:'Morning Workout',  time:'06:00',date:TODAY,dur:60, done:true, prio:'normal',notif:true},
    {id:7,space:'gym',    name:'Evening Cardio',   time:'18:00',date:TODAY,dur:30, done:false,prio:'normal',notif:true},
    {id:8,space:'gym',    name:'Protein Shake',    time:'07:00',date:TODAY,dur:5,  done:true, prio:'normal',notif:false},
    {id:9,space:'routine',name:'Morning Stretch',  time:'05:30',date:TODAY,dur:15, done:true, prio:'normal',notif:true},
    {id:10,space:'routine',name:'Read 30 Mins',    time:'21:00',date:TODAY,dur:30, done:false,prio:'normal',notif:true},
  ],
  meals: [
    {id:1,name:'Chicken Breast (100g)',time:'08:00',protein:31,carbs:0,fat:3.6,cal:165},
    {id:2,name:'Oats (100g)',          time:'08:00',protein:17,carbs:66,fat:7,  cal:389},
    {id:3,name:'Whey Protein (1 scoop)',time:'12:00',protein:25,carbs:3,fat:2,  cal:130},
  ],
  water: 4,
  photos: [
    {id:1,label:'Week 1 — Start',   date:'2026-01-01',weight:78,note:'Starting the journey 💪',color:'#F43F5E',img:null},
    {id:2,label:'Week 5 — Progress',date:'2026-02-01',weight:76,note:'Leaning out nicely!',    color:'#FB923C',img:null},
    {id:3,label:'Week 9 — Now',     date:'2026-03-01',weight:74,note:'Veins are showing 🔥',  color:'#34D399',img:null},
  ],
  notifications: [],
  activeTimer: null,
  timerSec: 0,
  logs: [],
  currentTab: 'dashboard',
  currentGame: 'memory',
  modalSpace: null,
  notifMinutesBefore: 10,
};

/* ── Helpers ── */
const pad = n => String(n).padStart(2,'0');
const fmtTime = s => {
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60;
  return h>0?`${pad(h)}:${pad(m)}:${pad(sc)}`:`${pad(m)}:${pad(sc)}`;
};
const getTotals = () => ({
  protein: state.meals.reduce((a,m)=>a+m.protein,0),
  carbs:   state.meals.reduce((a,m)=>a+m.carbs,0),
  fat:     state.meals.reduce((a,m)=>a+m.fat,0),
  cal:     state.meals.reduce((a,m)=>a+m.cal,0),
});
const nextId = () => Date.now() + Math.floor(Math.random()*1000);

/* ── Persist to localStorage per user ── */
function getStorageKey() {
  const sess = JSON.parse(localStorage.getItem('ft_session')||'{}');
  return 'ft_state_' + (sess.username || 'default');
}
function saveState() {
  try { localStorage.setItem(getStorageKey(), JSON.stringify(state)); } catch(e){}
}
function loadState() {
  try {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    }
  } catch(e){}
}
