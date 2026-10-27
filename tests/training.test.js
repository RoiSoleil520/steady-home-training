import assert from 'node:assert/strict';
import { exercises, getSetPlan, countCompletedStrength, isExerciseComplete, formatSeconds, localDateKey, sanitizeStoredState } from '../training.js';

const sitstand = exercises.find(exercise => exercise.id === 'sitstand');
const press = exercises.find(exercise => exercise.id === 'press');
const balance = exercises.find(exercise => exercise.id === 'stagger');

assert.equal(getSetPlan(sitstand, 1).total, 1, '第1周的力量训练应限制为1组');
assert.equal(getSetPlan(balance, 1).total, 2, '第1周不应减少平衡练习次数');
assert.equal(isExerciseComplete(sitstand, 1, [0]), true, '第1周1组即可完成');
assert.equal(isExerciseComplete(sitstand, 2, [0]), false, '第2周两组动作只做1组不能计为完成');
assert.equal(isExerciseComplete(sitstand, 2, [1]), false, '只有第2组打卡时不能满足必需组数');
assert.equal(isExerciseComplete(press, 2, [0]), true, '可选的第2组不应阻止动作完成');
assert.equal(isExerciseComplete(press, 2, [1]), false, '可选组不能替代第1组');
assert.equal(countCompletedStrength(1, { together: [0, 1], stagger: [0, 1] }), 0, '平衡练习不应增加力量动作进度');
assert.equal(countCompletedStrength(1, Object.fromEntries(exercises.map(exercise => [exercise.id, [0]]))), 7);
assert.equal(countCompletedStrength(2, Object.fromEntries(exercises.map(exercise => [exercise.id, [0, 1]]))), 7);
assert.equal(formatSeconds(90), '01:30');
assert.equal(formatSeconds(-1), '00:00');
assert.equal(formatSeconds(59.1), '01:00');
assert.equal(localDateKey(new Date(2026, 9, 27, 0, 1)), '2026-10-27', '记录应使用用户本地日期');
assert.deepEqual(sanitizeStoredState(null), { phase: 1, records: {} });
assert.deepEqual(sanitizeStoredState({ phase: 8, records: [] }), { phase: 1, records: {} });
const sanitized = sanitizeStoredState({ phase: 2, records: { bad: {}, '2026-10-27': { sets: { sitstand: [0, 0, 1, 2, '0'], unknown: [0] }, warmup: true, walk: 'true' } } });
assert.deepEqual(sanitized.records['2026-10-27'], { sets: { sitstand: [0, 1] }, warmup: true, walk: false });
assert.equal(Object.keys(sanitized.records).length, 1);
console.log('18项断言通过：训练阶段、必需/可选组、力量进度、计时格式、本地日期和记录恢复。');
