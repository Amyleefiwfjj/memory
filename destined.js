// ── 획수 테이블 ──
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
    const MY = 80, RH = 60, HS = 100;
    vizSteps.forEach((arr, i) => {
        const y = MY + i * RH;
        const totalW = (arr.length - 1) * HS;
        noStroke(); fill(0);
        arr.forEach((v, j) => {
            const x = width / 2 - totalW / 2 + j * HS;
            text(v, x, y);
        });
        // 선 연결
        if (i < vizSteps.length - 1) {
            stroke(0);
            const nxt = vizSteps[i + 1];
            const nw = (nxt.length - 1) * HS;
            arr.forEach((_, j) => {
                const x1 = width / 2 - totalW / 2 + j * HS, y1 = y + 20;
                const x2 = width / 2 - nw / 2 + j * HS, y2 = y + RH - 20;
                line(x1, y1, x2, y2);
            });
        }
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