let currentLoveText = '';
const stroke = {
    'ㄱ': 2, 'ㄴ': 2, 'ㄷ': 3, 'ㄹ': 5, 'ㅁ': 4, 'ㅂ': 4, 'ㅅ': 2, 'ㅇ': 1, 'ㅈ': 3, 'ㅊ': 4, 'ㅋ': 3, 'ㅌ': 4, 'ㅍ': 4, 'ㅎ': 3,
    'ㅏ': 2, 'ㅐ': 3, 'ㅑ': 3, 'ㅒ': 4, 'ㅓ': 2, 'ㅔ': 3, 'ㅕ': 3, 'ㅖ': 4, 'ㅗ': 2, 'ㅛ': 3, 'ㅜ': 2, 'ㅠ': 3, 'ㅡ': 1, 'ㅣ': 1
};
const splitCon = {
    'ㄲ': ['ㄱ', 'ㄱ'], 'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'],
    'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'],
    'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'],
    'ㄸ': ['ㄷ', 'ㄷ'], 'ㅃ': ['ㅂ', 'ㅂ'], 'ㅆ': ['ㅅ', 'ㅅ'], 'ㅉ': ['ㅈ', 'ㅈ']
};
const splitVow = {
    'ㅘ': ['ㅗ', 'ㅏ'], 'ㅙ': ['ㅗ', 'ㅐ'], 'ㅚ': ['ㅗ', 'ㅣ'],
    'ㅝ': ['ㅜ', 'ㅓ'], 'ㅞ': ['ㅜ', 'ㅔ'], 'ㅟ': ['ㅜ', 'ㅣ'], 'ㅢ': ['ㅡ', 'ㅣ']
};
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// 한글 음절 분해
function decomposeHangul(str) {
    return Array.from(str).map(ch => {
        const code = ch.charCodeAt(0) - 0xAC00;
        if (code < 0 || code > 11171) return [ch];
        const jong = code % 28;
        const jung = Math.floor((code / 28) % 21);
        const cho = Math.floor(code / (28 * 21));
        const parts = [CHO[cho], JUNG[jung]];
        if (JONG[jong]) parts.push(JONG[jong]);
        return parts;
    });
}
document.getElementById('runBtn').addEventListener('click', () => {
    const A = document.getElementById('nameA').value.trim();
    const B = document.getElementById('nameB').value.trim();
    if (!A || !B) return;

    const { chars, steps } = calcSteps(A, B);
    vizChars = chars;
    vizSteps = steps;

    const last = steps[steps.length - 1];
    const percent = last.join('');
    currentLoveText = `${A} loves ${B} ${percent}%`;

    document.getElementById('score').textContent = ''; // UI 영역은 비워둠

    redraw();
});
// 음절별 획수 합산
function countStrokes(str) {
    return decomposeHangul(str).map(parts =>
        parts
            .flatMap(j => splitCon[j] || splitVow[j] || [j])
            .reduce((s, jamo) => s + (stroke[jamo] || 0), 0)
    );
}

// 교차 삽입
function interleave(a, b) {
    const out = [], n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
        if (i < a.length) out.push(a[i]);
        if (i < b.length) out.push(b[i]);
    }
    return out;
}

// ── 수정된 combine: 슬라이딩(pairwise adjacent) 방식 ──
function combine(scores) {
    const next = [];
    for (let i = 0; i < scores.length - 1; i++) {
        next.push((scores[i] + scores[i + 1]) % 10);
    }
    return next;
}

// 모든 단계 수집
function calcSteps(n1, n2) {
    const chars = interleave(n1, n2);
    const steps = [];
    let cur = countStrokes(chars.join(''));
    steps.push(cur);
    while (cur.length > 1) {
        cur = combine(cur);
        steps.push(cur);
    }
    return steps;
}

// p5.js viz
let vizSteps = [];
function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop(); textAlign(CENTER, CENTER); textSize(24);
}

function draw() {
    clear();
    if (!vizSteps.length) return;

    const Mx = 150, ColW = 120, Vs = 80;

    // 💜 문구 표시: 도표 왼쪽 문자와 오른쪽 숫자 사이
    textAlign(LEFT, CENTER);
    textSize(22);
    fill(100, 80, 160);
    text(currentLoveText, Mx - ColW + 90, height / 2);

    // 숫자 시각화 도표
    textAlign(CENTER, CENTER);
    textSize(24);
    vizSteps.forEach((arr, i) => {
        const x = Mx + i * ColW;
        const H = (arr.length - 1) * Vs;
        noStroke(); fill(33);
        arr.forEach((v, j) => {
            text(v, x, height / 2 - H / 2 + j * Vs);
        });

        if (i < vizSteps.length - 1) {
            stroke(120);
            const nxt = vizSteps[i + 1];
            const H2 = (nxt.length - 1) * Vs;
            nxt.forEach((_, k) => {
                const x2 = Mx + (i + 1) * ColW;
                const y2 = height / 2 - H2 / 2 + k * Vs;
                const y1a = height / 2 - H / 2 + k * Vs;
                const y1b = y1a + Vs;
                line(x, y1a, x2, y2);
                line(x, y1b, x2, y2);
            });
        }
    });

    // 왼쪽 문자 시각화
    const charX = Mx - ColW + 20;
    const totalC = (vizChars.length - 1) * Vs;
    noStroke(); fill(33);
    vizChars.forEach((ch, i) => {
        text(ch, charX, height / 2 - totalC / 2 + i * Vs);
    });
}

// 버튼 처리
document.getElementById('runBtn').addEventListener('click', () => {
    const A = document.getElementById('nameA').value.trim();
    const B = document.getElementById('nameB').value.trim();
    if (!A || !B) return;
    vizSteps = calcSteps(A, B);
    // 화면에 모든 과정을 화살표로 이어진 문자열로 표시
    const txt = vizSteps.map((arr, i) => {
        // 마지막 배열이 길이 1 또는 2이면, join('')으로 붙여주고
        return (i === vizSteps.length - 1 && arr.length > 1)
            ? arr.join('')
            : arr.join(',');
    }).join(' → ');
    document.getElementById('score').textContent = txt;
    // 캔버스 재조정 & 그리기
    const neededH = 100 + vizSteps.length * RH;
    resizeCanvas(windowWidth, neededH);
    redraw();
});

function homePage() {
    window.location.href = "index.html";
}