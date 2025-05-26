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
            .reduce((sum, jamo) => sum + (stroke[jamo] || 0), 0)
    );
}

// 두 배열 교차 삽입
function interleave(a, b) {
    const out = [], n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
        if (i < a.length) out.push(a[i]);
        if (i < b.length) out.push(b[i]);
    }
    return out;
}

// mod10 연산으로 한 단계 줄이기
function combine(scores) {
    const next = [];
    for (let i = 0; i < scores.length; i += 2) {
        const a = scores[i], b = scores[i + 1] || 0;
        next.push((a + b) % 10);
    }
    return next;
}

// 최종 운세 계산 + 단계별 배열 반환
function calcSteps(name1, name2) {
    const chars = interleave(name1, name2);
    const steps = [];
    let current = countStrokes(chars.join(''));
    steps.push(current);
    while (current.length > 2) {
        current = combine(current);
        steps.push(current);
    }
    return steps;
}

// p5.js 전역 변수
let vizSteps = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();
    textAlign(CENTER, CENTER);
    textSize(24);
    strokeWeight(2);
}

function draw() {
    clear();
    if (!vizSteps.length) return;

    const marginY = 120;
    const rowH = 80;
    const hSpacing = 80;

    for (let i = 0; i < vizSteps.length; i++) {
        const arr = vizSteps[i];
        const y = marginY + i * rowH;
        const totalW = (arr.length - 1) * hSpacing;

        // 숫자 그리기
        noStroke();
        fill(0);
        for (let j = 0; j < arr.length; j++) {
            const x = width / 2 - totalW / 2 + j * hSpacing;
            text(arr[j], x, y);
        }

        // 연결선 그리기
        if (i < vizSteps.length - 1) {
            stroke(0);
            const nextArr = vizSteps[i + 1];
            const nextW = (nextArr.length - 1) * hSpacing;
            for (let j = 0; j < arr.length; j++) {
                const x1 = width / 2 - totalW / 2 + j * hSpacing;
                const y1 = y + 20;
                const x2 = width / 2 - nextW / 2 + Math.floor(j / 2) * hSpacing;
                const y2 = y + rowH - 20;
                line(x1, y1, x2, y2);
            }
        }
    }
}

// 버튼 클릭 처리
document.getElementById('runBtn').addEventListener('click', () => {
    const A = document.getElementById('nameA').value.trim();
    const B = document.getElementById('nameB').value.trim();
    if (!A || !B) return;
    vizSteps = calcSteps(A, B);
    // 최종 두 자리 점수 텍스트
    const last = vizSteps[vizSteps.length - 1];
    document.getElementById('score').textContent = last.join('');
    redraw();
});