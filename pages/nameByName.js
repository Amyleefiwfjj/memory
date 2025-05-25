// nameByName.js
let pgMask;
let outlineInput, fillInput;
let synced = true;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('sketch-holder');
    textAlign(CENTER, CENTER);

    outlineInput = document.getElementById('outlineInput');
    fillInput = document.getElementById('fillInput');
    outlineInput.addEventListener('input', syncFill);
    fillInput.addEventListener('input', () => synced = false);
    syncFill();

    pgMask = createGraphics(width, height);

    document.getElementById('save-btn')
        .addEventListener('click', () => saveCanvas('filled_text', 'png'));
}

function syncFill() {
    if (synced && fillInput.value === '') {
        fillInput.value = outlineInput.value;
    }
}

// 화면 폭에 맞춰 단어 단위 줄바꿈
function wrapText(gfx, txt, maxW) {
    let words = txt.split(' ');
    let line = '', lines = [];
    for (let w of words) {
        let test = line ? line + ' ' + w : w;
        if (gfx.textWidth(test) <= maxW) {
            line = test;
        } else {
            lines.push(line);
            line = w;
        }
    }
    lines.push(line);
    return lines.join('\n');
}

function draw() {
    background(255);

    const outlineText = outlineInput.value;
    const fillText = fillInput.value || outlineText;

    // 1) mask 생성: outline 텍스트를 흑백으로
    const bigSize = 200;
    pgMask.clear();
    pgMask.background(0);
    pgMask.fill(255);
    pgMask.noStroke();
    pgMask.textSize(bigSize);
    pgMask.textAlign(CENTER, CENTER);
    pgMask.textLeading(bigSize * 1.1);
    const wrapped = wrapText(pgMask, outlineText, width * 0.9);
    pgMask.text(wrapped, width / 2, height / 2);
    pgMask.loadPixels();

    // 2) 내부 채우기: 행 단위로 연속 구간 찾아 문자 배치
    const smallSize = 20;
    textSize(smallSize);
    textAlign(LEFT, TOP);
    noStroke();
    fill(0);

    const rowStep = smallSize * 0.8;  // 세로 간격
    const colStep = smallSize * 0.6;  // 가로 간격
    let idx = 0;

    for (let y = 0; y < height; y += rowStep) {
        // 한 행에서 mask 내부 구간을 모두 찾아낸다
        let segments = [];
        let inSeg = false, segStart = 0;
        for (let x = 0; x < width; x++) {
            if (pgMask.get(x, y)[0] > 128) {
                if (!inSeg) { inSeg = true; segStart = x; }
            } else {
                if (inSeg) { segments.push([segStart, x - 1]); inSeg = false; }
            }
        }
        if (inSeg) segments.push([segStart, width - 1]);

        // 각 구간마다 일정 간격으로 문자 배치
        for (let [x0, x1] of segments) {
            for (let x = x0; x <= x1; x += colStep) {
                const ch = fillText.charAt(idx % fillText.length);
                text(ch, x, y);
                idx++;
            }
        }
    }

    // 3) outline 윤곽선 그리기
    noFill();
    stroke(0);
    strokeWeight(2);
    textSize(bigSize);
    textAlign(CENTER, CENTER);
    textLeading(bigSize * 1.1);
    text(wrapped, width / 2, height / 2);
}
