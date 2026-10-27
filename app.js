import { exercises, localDateKey, getSetPlan, isExerciseComplete, countCompletedStrength, formatSeconds, sanitizeStoredState } from './training.js';
import { renderDiagram } from './diagrams.js';

const STORAGE_KEY = 'steady-home-training-v1';
const grid = document.querySelector('#exercise-grid');
const phaseSelect = document.querySelector('#phase-select');
const warmupCheck = document.querySelector('#warmup-check');
const walkCheck = document.querySelector('#walk-check');
let storageAvailable = true;
let state = readState();
let currentDate = localDateKey();
let currentFilter = 'strength';
let toastTimeout;

function readState() {
  try {
    return sanitizeStoredState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    storageAvailable = false;
    return sanitizeStoredState(null);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  document.querySelector('#storage-note').hidden = storageAvailable;
}

function todayRecord() {
  state.records[currentDate] ??= { sets: {}, warmup: false, walk: false };
  return state.records[currentDate];
}

function showToast(message, offerRest = false) {
  const toast = document.querySelector('#toast');
  clearTimeout(toastTimeout);
  toast.textContent = message;
  if (offerRest) {
    const restButton = document.createElement('button');
    restButton.type = 'button';
    restButton.textContent = '开始休息';
    restButton.addEventListener('click', () => {
      resetTimer();
      timerToggle.click();
      toast.hidden = true;
    });
    toast.append(restButton);
  }
  toast.hidden = false;
  toastTimeout = setTimeout(() => { toast.hidden = true; }, offerRest ? 7000 : 3500);
}

function renderSchedule() {
  const days = [
    ['周一', '力量训练', '约30～40分钟', 'strength-day', '↟'],
    ['周二', '步行＋平衡', '按体力安排', '', '⌁'],
    ['周三', '轻松活动', '给身体一点恢复', '', '☀'],
    ['周四', '力量训练', '约30～40分钟', 'strength-day', '↟'],
    ['周五', '步行＋平衡', '按体力安排', '', '⌁'],
    ['周六', '步行＋平衡', '按体力安排', '', '⌁'],
    ['周日', '休息／散步', '享受自己的节奏', '', '☀'],
  ];
  const todayIndex = (new Date().getDay() + 6) % 7;
  document.querySelector('#week-schedule').innerHTML = days.map(([day, title, subtitle, className, icon], index) => `
    <div class="day ${className} ${index === todayIndex ? 'today' : ''}" ${index === todayIndex ? 'aria-current="date"' : ''}>
      <span class="day-name">${day}</span><span class="day-icon" aria-hidden="true">${icon}</span>
      <span class="day-title">${title}</span><span class="day-subtitle">${subtitle}</span>
    </div>`).join('');
}

function setButtonMarkup(exercise, index) {
  const checked = todayRecord().sets[exercise.id]?.includes(index) ?? false;
  const optional = exercise.category === 'strength' && state.phase !== 1 && index >= exercise.requiredSets;
  const unit = exercise.category === 'balance' ? '轮' : '组';
  const label = `第${index + 1}${unit}${optional ? '（可选）' : exercise.bilateral ? '（双侧）' : ''}`;
  return `<button type="button" class="set-button" data-exercise="${exercise.id}" data-set="${index}" aria-pressed="${checked}" aria-label="${exercise.name}，${label}"><span class="set-check" aria-hidden="true">${checked ? '✓' : ''}</span>${label}</button>`;
}

function renderExercises() {
  document.querySelector('#phase-note').textContent = state.phase === 1
    ? '第1周，每个力量动作只做1组。先把动作练稳，平衡练习保持原次数。'
    : '没有新增疼痛、肿胀或跛行，再增加组数；标注「可选」的第2组按体力决定。';
  grid.innerHTML = exercises.filter(exercise => currentFilter === 'all' || exercise.category === currentFilter).map(exercise => {
    const plan = getSetPlan(exercise, state.phase);
    const complete = isExerciseComplete(exercise, state.phase, todayRecord().sets[exercise.id]);
    const number = String(exercises.indexOf(exercise) + 1).padStart(2, '0');
    return `<article class="exercise-card ${complete ? 'completed' : ''}" data-card="${exercise.id}">
      <div class="exercise-card-top"><span class="exercise-number">${number}</span><div><h3>${exercise.name}</h3><p class="exercise-meta">${exercise.equipment}</p></div></div>
      <div class="exercise-diagram">${renderDiagram(exercise)}</div>
      <div class="dose-row"><span>${exercise.reps} × ${plan.label}</span><small>${exercise.category === 'strength' ? '缓慢控制' : '手可扶稳'}</small></div>
      <ul class="exercise-cues">${exercise.cues.map(cue => `<li>${cue}</li>`).join('')}</ul>
      <p class="exercise-note">${exercise.note}</p>
      <div class="set-buttons">${Array.from({ length: plan.total }, (_, index) => setButtonMarkup(exercise, index)).join('')}</div>
    </article>`;
  }).join('');
}

function renderProgress() {
  const record = todayRecord();
  const count = countCompletedStrength(state.phase, record.sets);
  document.querySelector('#progress-count').textContent = `${count} / 7`;
  document.querySelector('#progress-fill').style.width = `${count / 7 * 100}%`;
  document.querySelector('.progress-track').setAttribute('aria-valuenow', String(count));
  document.querySelector('#progress-message').textContent = count === 7
    ? '今天的力量练习完成了，好好休息。'
    : count > 0 ? '已经为自己迈出一步，按身体状态继续。' : '不着急，先从第一个动作开始。';
  warmupCheck.checked = record.warmup;
  walkCheck.checked = record.walk;
  document.querySelector('#today-date').textContent = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  document.querySelector('#storage-note').hidden = storageAvailable;
}

function syncDate() {
  const nextDate = localDateKey();
  if (nextDate === currentDate) return false;
  currentDate = nextDate;
  renderSchedule();
  renderExercises();
  renderProgress();
  return true;
}

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-exercise]');
  if (!button) return;
  const exercise = exercises.find(item => item.id === button.dataset.exercise);
  const setIndex = Number(button.dataset.set);
  syncDate();
  const record = todayRecord();
  const checked = record.sets[exercise.id] ?? [];
  const wasChecked = checked.includes(setIndex);
  const nextSets = wasChecked ? checked.filter(index => index !== setIndex) : [...checked, setIndex];
  record.sets[exercise.id] = nextSets;
  saveState();
  // Update in place so keyboard focus stays on the set button.
  const activeButton = grid.querySelector(`[data-exercise="${exercise.id}"][data-set="${setIndex}"]`);
  if (activeButton) {
    activeButton.setAttribute('aria-pressed', String(!wasChecked));
    activeButton.querySelector('.set-check').textContent = wasChecked ? '' : '✓';
    activeButton.closest('.exercise-card').classList.toggle('completed', isExerciseComplete(exercise, state.phase, nextSets));
  }
  renderProgress();
  if (!wasChecked) showToast(exercise.category === 'strength' ? '这一组完成了，歇一歇。' : '完成一轮，按自己的节奏继续。', exercise.category === 'strength');
});

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  syncDate();
  currentFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  renderExercises();
}));

phaseSelect.value = String(state.phase);
phaseSelect.addEventListener('change', () => {
  syncDate();
  state.phase = Number(phaseSelect.value);
  saveState();
  renderExercises();
  renderProgress();
});

for (const [checkbox, key] of [[warmupCheck, 'warmup'], [walkCheck, 'walk']]) {
  checkbox.addEventListener('change', () => {
    const checked = checkbox.checked;
    syncDate();
    todayRecord()[key] = checked;
    saveState();
    renderProgress();
  });
}

let timerDuration = 60;
let remainingSeconds = 60;
let timerDeadline = null;
let timerInterval = null;
const timerDisplay = document.querySelector('#timer-display');
const timerToggle = document.querySelector('#timer-toggle');
const mobileRest = document.querySelector('#mobile-rest');
const mobileRestToggle = document.querySelector('#mobile-rest-toggle');

function updateTimerDisplay() {
  timerDisplay.textContent = formatSeconds(remainingSeconds);
  document.querySelector('#mobile-rest-time').textContent = formatSeconds(remainingSeconds);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerDeadline = null;
}

function tickTimer() {
  if (timerDeadline === null) return;
  remainingSeconds = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
  updateTimerDisplay();
  if (remainingSeconds !== 0) return;
  stopTimer();
  timerToggle.textContent = '再休息一轮';
  mobileRestToggle.textContent = '再一轮';
  document.querySelector('#timer-status').textContent = '休息结束，按身体状态决定是否继续。';
  showToast('休息结束，按身体状态决定是否继续。');
}

timerToggle.addEventListener('click', () => {
  if (timerDeadline !== null) {
    tickTimer();
    stopTimer();
    timerToggle.textContent = remainingSeconds === 0 ? '再休息一轮' : '继续休息';
    mobileRestToggle.textContent = remainingSeconds === 0 ? '再一轮' : '继续';
    return;
  }
  if (remainingSeconds === 0) remainingSeconds = timerDuration;
  timerDeadline = Date.now() + remainingSeconds * 1000;
  timerToggle.textContent = '暂停计时';
  mobileRestToggle.textContent = '暂停';
  mobileRest.hidden = false;
  document.querySelector('#timer-status').textContent = '休息计时开始。';
  updateTimerDisplay();
  timerInterval = setInterval(tickTimer, 250);
});

function resetTimer() {
  stopTimer();
  remainingSeconds = timerDuration;
  timerToggle.textContent = '开始休息';
  mobileRest.hidden = true;
  document.querySelector('#timer-status').textContent = '计时已重置。';
  updateTimerDisplay();
}

document.querySelector('#timer-reset').addEventListener('click', resetTimer);
mobileRestToggle.addEventListener('click', () => timerToggle.click());
document.querySelector('#mobile-rest-close').addEventListener('click', resetTimer);
document.querySelectorAll('[data-seconds]').forEach(button => button.addEventListener('click', () => {
  timerDuration = Number(button.dataset.seconds);
  document.querySelectorAll('[data-seconds]').forEach(preset => {
    const active = preset === button;
    preset.classList.toggle('active', active);
    preset.setAttribute('aria-pressed', String(active));
  });
  resetTimer();
}));

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  syncDate();
  tickTimer();
});
window.addEventListener('focus', syncDate);
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) return;
  state = readState();
  phaseSelect.value = String(state.phase);
  syncDate();
  renderExercises();
  renderProgress();
});

renderSchedule();
renderExercises();
renderProgress();
