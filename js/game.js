// Minimal Bop-a-Mole game logic (mobile-friendly)
const qs = s=>document.querySelector(s);
const qsa = s=>Array.from(document.querySelectorAll(s));

const screens = {
  splash: qs('#splash'),
  game: qs('#game'),
  score: qs('#score-screen')
};

const startBtn = qs('#start-bop');
const board = qs('#board');
const scoreEl = qs('#score');
const timeEl = qs('#time');
const finalScoreEl = qs('#final-score');
const bestScoreEl = qs('#best-score');
const newHighEl = qs('#new-high');
const playAgain = qs('#play-again');
const btnQuit = qs('#btn-quit');
const btnPause = qs('#btn-pause');

let score = 0;
let timeLeft = 30;
let spawnInterval = 800;
let moleTimeouts = [];
let gameTimer = null;
let spawnTimer = null;
let running = false;
let audioCtx = null;

const HS_KEY = 'zozzo.bop.highscore';

function ensureAudio(){
  if(audioCtx) return;
  try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ audioCtx = null; }
}

function playHitSound(){
  ensureAudio();
  if(!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(600, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.15);
}

function vibrateShort(){
  if(navigator.vibrate) navigator.vibrate(20);
}

function show(screen){
  Object.values(screens).forEach(s=>s.classList.remove('active'));
  screen.classList.add('active');
}

function loadHighScore(){
  try{ return Number(localStorage.getItem(HS_KEY) || 0); }catch(e){return 0}
}
function saveHighScore(v){
  try{ localStorage.setItem(HS_KEY, String(v)); }catch(e){}
}

function updateBestUI(){
  const best = loadHighScore();
  if(bestScoreEl) bestScoreEl.textContent = String(best);
}

function makeBoard(){
  // always render exactly 10 buttons; choose columns responsively
  const w = window.innerWidth;
  let cols = 4;
  if(w < 420) cols = 3;
  else if(w >= 900) cols = 5;
  const count = 10;
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${cols},1fr)`;
  for(let i=0;i<count;i++){
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.dataset.index = i;
    const mole = document.createElement('div');
    mole.className = 'mole';
    mole.setAttribute('role','button');
    mole.setAttribute('aria-pressed','false');
    hole.appendChild(mole);
    board.appendChild(hole);
  }
}

function randomInt(max){return Math.floor(Math.random()*max)}

function popMole(){
  // choose one of 10 buttons and a color to light
  const holes = qsa('.hole');
  if(holes.length===0) return;
  // pick 1-2 unique holes that are currently unlit (keep "few" lit)
  const available = holes.filter(h=>{
    const m = h.querySelector('.mole');
    return m && !m.classList.contains('up');
  });
  if(available.length===0) return;
  const maxCount = Math.min(2, available.length);
  const count = 1 + randomInt(maxCount); // 1..maxCount -> 1 or 2
  // shuffle available
  for(let i=available.length-1;i>0;i--){const j=randomInt(i+1);[available[i],available[j]]=[available[j],available[i]]}
  const selected = available.slice(0,count);
  // weighted color selection: purple rarer
  function pickColorWeighted(){
    const r = Math.random();
    if(r < 0.12) return 'purple';
    if(r < 0.56) return 'red';
    return 'yellow';
  }

  selected.forEach(hole => {
    const mole = hole.querySelector('.mole');
    if(!mole) return;
    mole.classList.remove('red','yellow','purple');
    const color = pickColorWeighted();
    mole.classList.add(color,'up');
    mole.setAttribute('data-color', color);
    mole.setAttribute('aria-pressed','false');
    highlightColorIndicator(color);
    const upFor = 600 + Math.random()*900;
    const to = setTimeout(()=>{
      mole.classList.remove('up','red','yellow','purple');
      mole.removeAttribute('data-color');
    }, upFor);
    moleTimeouts.push(to);
  });
}

function startSpawning(){
  spawnTimer = setInterval(popMole, spawnInterval);
}

function stopSpawning(){
  if(spawnTimer) clearInterval(spawnTimer);
  spawnTimer = null;
  moleTimeouts.forEach(t=>clearTimeout(t));
  moleTimeouts = [];
}

function startGame(){
  score = 0; timeLeft = 30; scoreEl.textContent = '0'; timeEl.textContent = String(timeLeft);
  makeBoard();
  running = true;
  updateBestUI();
  show(screens.game);
  startSpawning();
  gameTimer = setInterval(()=>{
    timeLeft -= 1;
    timeEl.textContent = String(timeLeft);
    if(timeLeft<=0){
      endGame();
    }
  },1000);
}

function pauseGame(){
  if(!running) return;
  if(btnPause.dataset.paused==='1'){
    // resume
    btnPause.textContent = 'Pause';
    btnPause.dataset.paused='0';
    startSpawning();
    gameTimer = setInterval(()=>{timeLeft-=1;timeEl.textContent=String(timeLeft);if(timeLeft<=0)endGame();},1000);
  } else {
    btnPause.textContent = 'Resume';
    btnPause.dataset.paused='1';
    clearInterval(gameTimer);
    stopSpawning();
  }
}

function endGame(){
  running = false;
  clearInterval(gameTimer);
  stopSpawning();
  finalScoreEl.textContent = String(score);
  // high score check
  const best = loadHighScore();
  if(score > best){
    saveHighScore(score);
    if(newHighEl){ newHighEl.classList.remove('sr-only'); }
  } else if(newHighEl){ newHighEl.classList.add('sr-only'); }
  updateBestUI();
  show(screens.score);
}

function handleHit(e){
  const t = e.target;
  if(!t.classList.contains('mole')) return;
  // if not lit/up, it's a white button — penalty
  if(!t.classList.contains('up')){
    score -= 1;
    scoreEl.textContent = String(score);
    t.classList.add('miss');
    setTimeout(()=>t.classList.remove('miss'),200);
    vibrateShort();
    return;
  }
  const color = t.getAttribute('data-color');
  if(color === 'purple'){
    score -= 5;
  } else if(color === 'red' || color === 'yellow'){
    score += 1;
  }
  // update UI
  scoreEl.textContent = String(score);
  t.classList.add('hit');
  t.classList.remove('up');
  t.classList.remove('red','yellow','purple');
  t.removeAttribute('data-color');
  setTimeout(()=>t.classList.remove('hit'),120);
  playHitSound();
  vibrateShort();
}

function highlightColorIndicator(color){
  const items = document.querySelectorAll('.lights .light');
  items.forEach(it=>it.classList.remove('active'));
  const el = document.querySelector(`.lights .light.${color}`);
  if(el) el.classList.add('active');
  // clear after short time
  setTimeout(()=>{ if(el) el.classList.remove('active'); }, 600);
}

// event wiring
startBtn.addEventListener('click', ()=>{
  ensureAudio();
  startGame();
});
playAgain.addEventListener('click', ()=>startGame());
btnQuit.addEventListener('click', ()=>{ stopSpawning(); clearInterval(gameTimer); show(screens.splash); });
btnPause.addEventListener('click', pauseGame);
board.addEventListener('click', handleHit);
// also support touch
board.addEventListener('touchstart', (e)=>{ const touch = e.changedTouches[0]; const el = document.elementFromPoint(touch.clientX,touch.clientY); if(el) handleHit({target:el,preventDefault:()=>{}}); }, {passive:true});

// create initial board
makeBoard();

// adapt board on resize/orientation
window.addEventListener('resize', ()=>makeBoard());
window.addEventListener('orientationchange', ()=>makeBoard());

// set best score on load
updateBestUI();

