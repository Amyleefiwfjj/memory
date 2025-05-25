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

function wrapText(gfx, txt, maxW) {
    const words = txt.split(' ');
    let line = '', lines = [];
    for (let w of words) {
        const test = line ? line + ' ' + w : w;
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

    // 1) 마스크 생성
    const bigSize = 200;
    const leading = bigSize * 1.1;
    pgMask.clear();
    pgMask.background(0);
    pgMask.fill(255);
    pgMask.noStroke();
    pgMask.textSize(bigSize);
    pgMask.textAlign(CENTER, CENTER);
    pgMask.textLeading(leading);
    const wrapped = wrapText(pgMask, outlineText, width * 0.9);
    pgMask.text(wrapped, width / 2, height / 2);
    pgMask.loadPixels();

    // 2) 내부 채우기
    const smallSize = 20;
    const rowStep = smallSize * 0.8;
    const colStep = smallSize * 0.6;
    textSize(smallSize);
    textAlign(LEFT, TOP);
    noStroke();
    fill(0);

    let idx = 0;
    for (let y = 0; y < height; y += rowStep) {
        let segments = [], inSeg = false, segStart = 0;
        for (let x = 0; x < width; x++) {
            if (pgMask.get(x, y)[0] > 128) {
                if (!inSeg) { inSeg = true; segStart = x; }
            } else if (inSeg) {
                segments.push([segStart, x - 1]);
                inSeg = false;
            }
        }
        if (inSeg) segments.push([segStart, width - 1]);

        for (let [x0, x1] of segments) {
            for (let x = x0; x <= x1; x += colStep) {
                const ch = fillText.charAt(idx % fillText.length);
                text(ch, x, y);
                idx++;
            }
        }
    }

    // → outline 윤곽선 그리기 부분을 모두 삭제했습니다.
}
