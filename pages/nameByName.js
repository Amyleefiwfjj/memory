let pgMask, charMask;
let outlineInput, fillInput;
let synced = true;
let charMode = false;
let completeMode = false;
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
    charMask = createGraphics(width, height);

    // 모드 토글
    const toggleBtn = document.getElementById('toggle-btn');
    toggleBtn.addEventListener('click', () => {
        charMode = !charMode;
        toggleBtn.innerText = charMode
            ? '글자별 채우기 모드'
            : '그리드 채우기 모드';
    });

    // 저장
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
    const fillRaw = fillInput.value || outlineText;
    const fillText = fillRaw.replace(/\s+/g, '');
    // 1) 공통: mask 생성 (outline 텍스트만 흰색 영역)
    const bigSize = 200, leading = bigSize * 1.1;
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

    // 2) 채우기 방식 분기
    if (!charMode) {
        // ── 그리드 채우기 모드 ──
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

    } else {
        // ── 글자별 채우기 모드 ──
        const smallSize = 20;
        const rowStep = smallSize * 0.8;
        const colStep = smallSize * 0.6;
        textSize(smallSize);
        textAlign(LEFT, TOP);
        noStroke();
        fill(0);

        // multi-line → lines 배열
        const lines = wrapped.split('\n');
        let letterIndex = 0;

        // 각 행
        for (let li = 0; li < lines.length; li++) {
            const lineStr = lines[li];
            const lineW = pgMask.textWidth(lineStr);
            const xStart = width / 2 - lineW / 2;
            const y = height / 2 - (lines.length * leading) / 2 + (li + 0.5) * leading;

            // 각 글자
            let xCursor = xStart;
            for (let cj = 0; cj < lineStr.length; cj++) {
                const chOut = lineStr[cj];
                const fillChar = fillText.charAt(letterIndex % fillText.length);

                // 해당 글자 모양만 마스크
                const cw = pgMask.textWidth(chOut);
                charMask.clear();
                charMask.background(0);
                charMask.fill(255);
                charMask.noStroke();
                charMask.textSize(bigSize);
                charMask.textAlign(LEFT, CENTER);
                charMask.text(chOut, xCursor, y);
                charMask.loadPixels();

                // 마스크 내부만 채우기
                for (let yy = y - leading / 2; yy <= y + leading / 2; yy += rowStep) {
                    for (let xx = xCursor; xx <= xCursor + cw; xx += colStep) {
                        if (charMask.get(xx, yy)[0] > 128) {
                            text(fillChar, xx, yy);
                        }
                    }
                }

                letterIndex++;
                xCursor += cw;
            }
        }
    }

    // 3) 외곽선은 아예 그리지 않습니다.
}
function homePage() {
    window.location.href = "index.html";
}