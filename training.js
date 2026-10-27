export const exercises = [
  { id: 'sitstand', name: '椅子坐站', category: 'strength', diagram: 'sitstand', equipment: '稳固椅子 · 徒手', reps: '6～10次', sets: 2, requiredSets: 2, cues: ['椅子靠墙，徒手慢起慢坐。', '脚跟不抬，不偏向健侧。'], note: '需要时扶稳固支撑。', description: '从椅子坐姿慢慢站起，再缓慢坐下，双脚平稳着地。' },
  { id: 'row', name: '坐姿弹力带划船', category: 'strength', diagram: 'row', equipment: '弹力带 · 肋木架', reps: '10～12次', sets: 2, requiredSets: 2, cues: ['带固定在下胸高度，肘向后拉。', '背自然直立，不含胸猛拽。'], note: '先检查肋木与弹力带固定点。', description: '坐稳背直，双手从身前拉向肋部，肘向身后移动。' },
  { id: 'wallpush', name: '墙壁俯卧撑', category: 'strength', diagram: 'wallpush', equipment: '墙壁 · 徒手', reps: '6～10次', sets: 2, requiredSets: 2, cues: ['身体整体靠近墙，再推回。', '先站近些，双脚保持稳定。'], note: '踝部出现牵拉痛时停做。', description: '双手撑墙，屈肘让身体靠近墙面，再伸肘推回。' },
  { id: 'sideleg', name: '扶肋木侧抬腿', category: 'strength', diagram: 'sideleg', equipment: '肋木架 · 徒手', reps: '每侧8～12次', sets: 2, requiredSets: 2, bilateral: true, cues: ['扶稳，小幅抬腿，脚尖朝前。', '身体不侧倒，先不加弹力带。'], note: '双侧做完算1组；支撑脚踝不适则停。', description: '扶稳肋木架，保持躯干直立，将一条腿向侧方小幅抬起。' },
  { id: 'press', name: '坐姿轻哑铃推举', category: 'strength', diagram: 'press', equipment: '轻哑铃 · 靠背椅', reps: '8～10次', sets: 2, requiredSets: 1, cues: ['坐稳，向上推至舒适高度。', '不耸肩、不挺腰、不憋气。'], note: '肩不适可改坐姿轻哑铃弯举。', description: '坐稳靠背椅，从肩旁缓慢向上推举轻哑铃，背部保持自然。' },
  { id: 'calf', name: '扶肋木双脚提踵', category: 'strength', diagram: 'calf', equipment: '肋木架 · 徒手', reps: '6～10次', sets: 2, requiredSets: 1, cues: ['扶稳，两脚同时慢踮起、放下。', '脚踝不向内外歪，不弹震。'], note: '不适可改坐姿、不负重提踵。', description: '手扶肋木，双脚脚跟一起缓慢抬起，再轻轻放回地面。' },
  { id: 'pallof', name: '坐姿抗旋转推手', category: 'strength', diagram: 'pallof', equipment: '弹力带 · 稳固椅子', reps: '每侧6～8次', sets: 2, requiredSets: 1, bilateral: true, cues: ['带从侧方胸高处拉来，轻阻力。', '双手向前推停2秒，躯干不转。'], note: '双侧做完算1组；图为斜侧面示意。', description: '弹力带固定在身体侧方，双手从胸前向前伸出，抵抗侧向拉力，躯干不旋转。' },
  { id: 'together', name: '扶肋木并脚站', category: 'balance', diagram: 'together', equipment: '肋木架 · 睁眼练习', reps: '20秒', sets: 2, requiredSets: 2, cues: ['双脚并拢，睁眼站稳。', '手始终可扶到肋木，不闭眼。'], note: '平衡练习每次总计约3～5分钟。', description: '双脚并拢，面向肋木站立，手保持可以扶住支撑物。' },
  { id: 'stagger', name: '扶肋木前后脚站', category: 'balance', diagram: 'stagger', equipment: '肋木架 · 睁眼练习', reps: '每脚位20秒', sets: 2, requiredSets: 2, bilateral: true, cues: ['一脚前移半步，左右留间距。', '睁眼扶稳，熟练后减少手扶。'], note: '每轮交换前后脚，各站20秒。', description: '一只脚在另一只脚前半步，两脚保留横向间距，扶稳后站立，再交换前后脚。' },
];

export function localDateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getSetPlan(exercise, phase) {
  if (exercise.category === 'balance') return { total: 2, required: 2, label: '2次' };
  if (phase === 1) return { total: 1, required: 1, label: '1组' };
  return { total: exercise.sets, required: exercise.requiredSets, label: exercise.requiredSets === 1 ? '1～2组' : '2组' };
}

export function isExerciseComplete(exercise, phase, checkedSets = []) {
  const { required } = getSetPlan(exercise, phase);
  return Array.from({ length: required }, (_, index) => index).every(index => checkedSets.includes(index));
}

export function countCompletedStrength(phase, completedSets) {
  return exercises.filter(exercise => exercise.category === 'strength'
    && isExerciseComplete(exercise, phase, completedSets[exercise.id])).length;
}

export function formatSeconds(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

export function sanitizeStoredState(raw) {
  const phase = [1, 2, 3, 4].includes(raw?.phase) ? raw.phase : 1;
  const records = {};
  if (!raw?.records || typeof raw.records !== 'object' || Array.isArray(raw.records)) return { phase, records };
  for (const [date, record] of Object.entries(raw.records)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !record || typeof record !== 'object') continue;
    const sets = {};
    for (const exercise of exercises) {
      const saved = record.sets?.[exercise.id];
      if (Array.isArray(saved)) sets[exercise.id] = [...new Set(saved.filter(index => index === 0 || index === 1))];
    }
    records[date] = { sets, warmup: record.warmup === true, walk: record.walk === true };
  }
  return { phase, records };
}
