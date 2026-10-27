const colors = { active: '#286c58', start: '#94a18b', equipment: '#bac2ac', accent: '#bf8258' };

function segment(points, color, width = 3) {
  return `<polyline points="${points.map(point => point.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function head(x, y, color) {
  return `<circle cx="${x}" cy="${y}" r="6.5" fill="#f3f5ec" stroke="${color}" stroke-width="2.7"/>`;
}

function chair(x = 19, y = 61, width = 36) {
  return segment([[x - 3, y - 34], [x - 3, y], [x + width, y]], colors.equipment, 2)
    + segment([[x, y], [x - 2, 94]], colors.equipment, 2)
    + segment([[x + width - 3, y], [x + width, 94]], colors.equipment, 2);
}

function rail(x = 74) {
  let svg = segment([[x, 11], [x, 94]], colors.equipment, 2)
    + segment([[x + 15, 11], [x + 15, 94]], colors.equipment, 2);
  for (let y = 16; y < 94; y += 13) svg += segment([[x, y], [x + 15, y]], colors.equipment, 1.4);
  return svg;
}

function weight(x, y, color) {
  return segment([[x - 6, y], [x + 6, y]], color, 2)
    + segment([[x - 6, y - 3], [x - 6, y + 3]], color)
    + segment([[x + 6, y - 3], [x + 6, y + 3]], color);
}

function pose(type, end) {
  const color = end ? colors.active : colors.start;
  const limb = points => segment(points, color);
  switch (type) {
    case 'sitstand':
      return chair(15, 64, 35) + (end
        ? head(57, 10, color) + limb([[57, 18], [56, 51], [58, 72], [59, 92], [70, 92]]) + limb([[56, 28], [65, 43], [71, 50]])
        : head(43, 19, color) + limb([[41, 27], [31, 59], [57, 63], [60, 91], [71, 91]]) + limb([[40, 34], [51, 45], [61, 48]]));
    case 'row':
      return chair(6, 61, 32) + rail(79) + head(26, 17, color)
        + limb([[26, 25], [25, 57], [48, 61], [49, 91], [60, 91]])
        + (end
          ? limb([[26, 34], [13, 49], [39, 43]]) + segment([[39, 43], [81, 39]], colors.accent, 1.8)
          : limb([[26, 34], [44, 39], [64, 41]]) + segment([[64, 41], [81, 39]], colors.accent, 1.8));
    case 'wallpush':
      return segment([[83, 6], [83, 96]], colors.equipment)
        + (end
          ? head(67, 16, color) + limb([[64, 24], [42, 59], [22, 91], [34, 91]]) + limb([[60, 33], [68, 48], [81, 34]])
          : head(43, 14, color) + limb([[42, 22], [31, 58], [22, 91], [34, 91]]) + limb([[40, 32], [61, 34], [81, 34]]));
    case 'sideleg':
      return rail(75) + head(38, 12, color) + limb([[38, 20], [38, 55]])
        + limb([[31, 30], [27, 47], [22, 56]]) + limb([[44, 30], [61, 35], [76, 35]])
        + limb([[35, 55], [32, 91], [23, 91]])
        + limb(end ? [[41, 55], [64, 84], [73, 84]] : [[41, 55], [46, 91], [55, 91]]);
    case 'press':
      return chair(20, 65, 48) + head(44, 30, color) + limb([[44, 38], [44, 66]])
        + limb([[39, 66], [30, 78], [30, 94], [21, 94]]) + limb([[49, 66], [60, 78], [60, 94], [69, 94]])
        + (end
          ? limb([[37, 43], [29, 26], [28, 10]]) + limb([[51, 43], [60, 26], [61, 10]]) + weight(28, 7, color) + weight(61, 7, color)
          : limb([[37, 43], [25, 50], [25, 30]]) + limb([[51, 43], [64, 50], [64, 30]]) + weight(25, 27, color) + weight(64, 27, color));
    case 'calf': {
      const rise = end ? 5 : 0;
      return rail(77) + head(42, 13 - rise, color)
        + limb([[42, 21 - rise], [42, 55 - rise], [45, 75 - rise], [46, 91 - rise], [60, 91]])
        + limb([[42, 32 - rise], [58, 39], [77, 39]]);
    }
    case 'pallof': {
      const handX = end ? 86 : 55;
      const elbow = end ? [63, 40] : [43, 51];
      return chair(19, 64, 39) + head(41, 21, color) + limb([[41, 29], [40, 60]])
        + limb([[38, 60], [57, 65], [57, 92], [68, 92]])
        + segment([[42, 60], [63, 65], [64, 89], [75, 89]], color, 2)
        + segment([[5, 22], [5, 72]], colors.equipment, 2)
        + limb([[40, 36], elbow, [handX, 40]])
        + segment([[44, 36], [elbow[0] + 4, elbow[1] + 2], [handX, 40]], color, 1.8)
        + segment([[5, 30], [handX, 40]], colors.accent, 1.8)
        + (end ? '<text x="70" y="20" font-size="8" fill="#bf8258" text-anchor="middle">向前推手 →</text>' : '');
    }
    default:
      return '';
  }
}

function balanceDiagram(type) {
  const color = colors.active;
  const stagger = type === 'stagger';
  const rightX = stagger ? 173 : 167;
  const rightY = stagger ? 34 : 54;
  return `<g transform="translate(10 6)">${rail(72)}${head(38, 12, color)}
    ${segment([[38, 20], [38, 55]], color, 3)}
    ${segment([[32, 30], [23, 47], [19, 56]], color)}
    ${segment([[44, 30], [60, 36], [73, 36]], color)}
    ${segment([[35, 55], [34, 91], [27, 91]], color)}
    ${segment([[41, 55], [43, 91], [50, 91]], color)}</g>
    <text x="165" y="28" text-anchor="middle" font-size="9" fill="#8b987e">脚位俯视</text>
    <rect x="145" y="54" width="20" height="38" rx="8" fill="#e2ead9" stroke="${color}"/>
    <rect x="${rightX}" y="${rightY}" width="20" height="38" rx="8" fill="#e2ead9" stroke="${color}"/>
    <text x="155" y="79" text-anchor="middle" font-size="9" fill="${color}">左</text>
    <text x="${rightX + 10}" y="${rightY + 25}" text-anchor="middle" font-size="9" fill="${color}">右</text>
    <text x="165" y="109" text-anchor="middle" font-size="8" fill="#8b987e">图上方为脚尖方向</text>
    <text x="123" y="132" text-anchor="middle" font-size="10" fill="${color}">${stagger ? '前后半步，左右留一点间距' : '双脚并拢，睁眼扶稳'}</text>`;
}

export function renderDiagram(exercise) {
  const content = exercise.category === 'balance'
    ? balanceDiagram(exercise.diagram)
    : `<g transform="translate(10 8)">${pose(exercise.diagram, false)}</g>
       <path d="M113 55h19m-5-4 5 4-5 4" stroke="${colors.accent}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
       <g transform="translate(143 8)">${pose(exercise.diagram, true)}</g>
       <text x="56" y="130" text-anchor="middle" font-size="10" fill="${colors.start}">起始</text>
       <text x="190" y="130" text-anchor="middle" font-size="10" fill="${colors.active}">完成</text>`;
  return `<svg viewBox="0 0 246 145" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${exercise.name}动作示意：${exercise.description}"><g font-family="-apple-system, PingFang SC, Microsoft YaHei, sans-serif">${content}</g></svg>`;
}
