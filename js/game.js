// Minimal Bop-a-Mole game logic (mobile-friendly)
const qs = s=>document.querySelector(s);
const qsa = s=>Array.from(document.querySelectorAll(s));

const screens = {
  splash: qs('#splash'),
  game: qs('#game'),
  score: qs('#score-screen')
};

const startBtn = qs('#start-bop');
const gameCards = qsa('.game-card');
const board = qs('#board');
const scoreEl = qs('#score');
const timeEl = qs('#time');
const finalScoreEl = qs('#final-score');
const bestScoreEl = qs('#best-score');
const newHighEl = qs('#new-high');
const versionEl = qs('#app-version');
const statusEl = qs('#game-status');
const playAgain = qs('#play-again');
const scoreHome = qs('#score-home');
const btnQuit = qs('#btn-quit');
const btnPause = qs('#btn-pause');
const gameTitle = qs('#game-title');

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

function resetPauseState(){
  if(btnPause){
    btnPause.dataset.paused = '0';
    btnPause.textContent = 'Pause';
  }
}

function playHitSound(){
  ensureAudio();
  if(!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(720, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.12, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.18);
}

function playMissSound(){
  ensureAudio();
  if(!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(180, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.08, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.22);
}

function playPenaltySound(){
  ensureAudio();
  if(!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(280, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.1, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.20);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.20);
}

function announce(message){
  if(!statusEl) return;
  statusEl.textContent = message;
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

const GAMES = {
  bop: { label: 'Bop-a-Mole' }
};

function selectGame(gameId){
  const game = GAMES[gameId] || GAMES.bop;
  if(gameTitle) gameTitle.textContent = game.label;
  gameCards.forEach(card => {
    if(card.dataset.game === gameId){
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

function loadAppVersion(){
  if(!versionEl) return;
  fetch('version.json')
    .then(resp => resp.json())
    .then(data => {
      if(data && data.version){
        versionEl.textContent = data.version;
      }
    })
    .catch(()=>{});
}

function makeBoard(){
  // always render exactly 10 buttons; choose columns responsively
  const w = window.innerWidth;
  const h = window.innerHeight;
  const portrait = h > w;
  // portrait mobile should use a 2×5 grid; landscape uses 5×2
  let cols = portrait ? 2 : 5;
  if(w >= 900) cols = 5; // wide desktop
  const count = 10;
  const rows = Math.ceil(count / cols);
  board.innerHTML = '';

  // compute available container width/height
  const gap = 10; // matches CSS gap:10px
  const containerPadding = 48; // left+right padding allowance
  const maxBoardWidth = Math.min(window.innerWidth - 24, 760);
  // estimate header/footer heights to reserve vertical space
  const headerEl = screens.game ? screens.game.querySelector('.game-header') : null;
  const controlsEl = screens.game ? screens.game.querySelector('.controls') : null;
  const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
  const controlsH = controlsEl ? controlsEl.getBoundingClientRect().height : 64;
  const reservedV = headerH + controlsH + 120; // extra for margins/safe areas
  const availableW = Math.max(320, maxBoardWidth - containerPadding);
  const availableH = Math.max(240, window.innerHeight - reservedV);

  // compute ideal square cell size so grid fits in both dimensions
  const cellW = Math.floor((availableW - (cols - 1) * gap) / cols);
  const cellH = Math.floor((availableH - (rows - 1) * gap) / rows);
  const cell = Math.max(56, Math.min(cellW, cellH)); // clamp a sensible minimum

  // set explicit grid sizes so we can guarantee fit without scroll
  board.style.gridTemplateColumns = `repeat(${cols}, ${cell}px)`;
  board.style.gridTemplateRows = `repeat(${rows}, ${cell}px)`;
  board.style.justifyContent = 'center';
  board.style.alignContent = 'center';

  // set board width and center it to avoid horizontal overflow on iOS
  const boardWidth = (cell * cols) + (gap * (cols - 1));
  board.style.width = `${Math.min(boardWidth, availableW)}px`;
  board.style.maxWidth = '100%';
  board.style.marginLeft = 'auto';
  board.style.marginRight = 'auto';

  for(let i=0;i<count;i++){
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.dataset.index = i;
    // override padding trick with exact sizing so we fit all cells
    hole.style.width = `${cell}px`;
    hole.style.height = `${cell}px`;
    hole.style.paddingTop = '0';
    const mole = document.createElement('div');
    mole.className = 'mole';
    mole.setAttribute('role','button');
    mole.setAttribute('tabindex','0');
    mole.setAttribute('aria-pressed','false');
    hole.appendChild(mole);
    board.appendChild(hole);
  }

  // If portrait on a narrow device, suggest rotating for best play
  if(portrait && window.innerWidth <= 540){
    announce('For best play, rotate your device to landscape.');
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
    mole.setAttribute('aria-label', `${color} target, tap to hit`);
    highlightColorIndicator(color);
    const upFor = 650 + Math.random()*850;
    const to = setTimeout(()=>{
      // record when this mole went down and what color it was
      const holeEl = mole.parentElement;
      const ts = Date.now();
      if(holeEl){
        holeEl.dataset.lastDown = String(ts);
        holeEl.dataset.lastColor = color; // red|yellow|purple
        // clear lastColor after 2s
        setTimeout(()=>{ try{ delete holeEl.dataset.lastColor }catch(e){} }, 2000);
      }
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
  resetPauseState();
  announce('Game started. Tap glowing buttons to score.');
  show(screens.game);
  startSpawning();
  if(gameTimer) clearInterval(gameTimer);
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
    btnPause.textContent = 'Pause';
    btnPause.dataset.paused='0';
    startSpawning();
    announce('Game resumed.');
    gameTimer = setInterval(()=>{timeLeft-=1;timeEl.textContent=String(timeLeft);if(timeLeft<=0)endGame();},1000);
  } else {
    btnPause.textContent = 'Resume';
    btnPause.dataset.paused='1';
    clearInterval(gameTimer);
    stopSpawning();
    announce('Game paused.');
  }
}

function endGame(){
  running = false;
  clearInterval(gameTimer);
  stopSpawning();
  finalScoreEl.textContent = String(score);
  const best = loadHighScore();
  if(score > best){
    saveHighScore(score);
    if(newHighEl){ newHighEl.classList.remove('sr-only'); }
    announce('New high score! Great job.');
    playHitSound();
  } else {
    if(newHighEl){ newHighEl.classList.add('sr-only'); }
    announce(`Game over. Final score ${score}.`);
  }
  updateBestUI();
  show(screens.score);
}

function handleHit(e){
  const target = e.target;
  const hole = target.closest('.hole');
  if(!hole) return;
  const mole = hole.querySelector('.mole');
  if(!mole) return;
  // if not lit/up, it's a white button — penalty
  if(!mole.classList.contains('up')){
    let forgive = false;
    if(hole.dataset && hole.dataset.lastDown && hole.dataset.lastColor){
      const lastDown = Number(hole.dataset.lastDown || 0);
      const lastColor = hole.dataset.lastColor;
      const age = Date.now() - lastDown;
      if((lastColor === 'red' || lastColor === 'yellow') && age >=0 && age <= 500){
        forgive = true;
      }
    }
    if(forgive){
      mole.classList.add('hit');
      announce('Nice, forgiven accidental tap.');
      setTimeout(()=>mole.classList.remove('hit'),120);
      return;
    }
    score -= 2;
    scoreEl.textContent = String(score);
    announce('Missed. Minus two points.');
    mole.classList.add('miss');
    setTimeout(()=>mole.classList.remove('miss'),200);
    playMissSound();
    if(navigator.vibrate) navigator.vibrate([20,20,20]);
    return;
  }
  const color = mole.getAttribute('data-color');
  if(color === 'purple'){
    score -= 4;
    announce('Oops! Purple penalty. Minus four points.');
    playPenaltySound();
    if(navigator.vibrate) navigator.vibrate([30,40,30]);
  } else if(color === 'red' || color === 'yellow'){
    score += 1;
    announce('Hit! One point.');
    playHitSound();
    vibrateShort();
  }
  scoreEl.textContent = String(score);
  mole.classList.add('hit');
  mole.classList.remove('up','red','yellow','purple');
  mole.removeAttribute('data-color');
  setTimeout(()=>mole.classList.remove('hit'),120);
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
  selectGame('bop');
  startGame();
});
gameCards.forEach(card => {
  card.addEventListener('click', () => {
    const selected = card.dataset.game;
    if(selected === 'bop'){
      selectGame('bop');
      startGame();
    }
  });
});
playAgain.addEventListener('click', ()=>startGame());
btnQuit.addEventListener('click', ()=>{ resetPauseState(); stopSpawning(); clearInterval(gameTimer); announce('Returning to menu.'); show(screens.splash); });
if(scoreHome){ scoreHome.addEventListener('click', ()=>{ resetPauseState(); stopSpawning(); clearInterval(gameTimer); announce('Returning to menu.'); show(screens.splash); }); }
btnPause.addEventListener('click', pauseGame);
board.addEventListener('click', handleHit);
board.addEventListener('keydown', (e)=>{
  if((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('mole')){
    e.preventDefault();
    handleHit({target:e.target, preventDefault:()=>{}});
  }
});
// also support touch
board.addEventListener('touchstart', (e)=>{
  const touch = e.changedTouches[0];
  const el = document.elementFromPoint(touch.clientX,touch.clientY);
  if(el){
    e.preventDefault();
    handleHit({target:el, preventDefault:()=>{}});
  }
}, {passive:false});

// create initial board
makeBoard();
selectGame('bop');

// adapt board on resize/orientation
window.addEventListener('resize', ()=>makeBoard());
window.addEventListener('orientationchange', ()=>makeBoard());

// set best score on load
updateBestUI();
loadAppVersion();

