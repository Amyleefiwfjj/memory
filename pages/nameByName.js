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

// outline → fill 동기화
function syncFill() {
    if (synced && fillInput.value === '') {
        fillInput.value = outlineInput.value;
    }
}

// 폭(maxW)에 맞춰 자동 줄바꿈
function wrapText(gfx, txt, maxW) {
    const words = txt.split(' ');
    let line = '', result = [];
    for (let w of words) {
        const test = line ? line + ' ' + w : w;
        if (gfx.textWidth(test) <= maxW) {
            line = test;
        } else {
            if (line) result.push(line);
            line = w;
        }
    }
    if (line) result.push(line);
    return result.join('\n');
}

function draw() {
    background(255);

    const outlineText = outlineInput.value;
    const fillText = fillInput.value || outlineText;

    // 1) mask용 off-screen 그래픽에 outline 다중행 텍스트 그리기
    const fs = 200;              // 폰트 크기
    const leading = fs * 1.1;    // 행간
    pgMask.clear();
    pgMask.background(0);
    pgMask.fill(255);
    pgMask.noStroke();
    pgMask.textSize(fs);
    pgMask.textAlign(CENTER, CENTER);
    pgMask.textLeading(leading);

    // 캔버스 폭의 90%를 maxW로 잡고 자동 줄바꿈
    const wrapped = wrapText(pgMask, outlineText, width * 0.9);
    pgMask.text(wrapped, width / 2, height / 2);
    pgMask.loadPixels();

    // 2) mask 안에만 fill 글자 배치 (grid)
    const grid = 25;
    textSize(20);
    textAlign(LEFT, TOP);
    noStroke();
    fill(0);

    let idx = 0;
    for (let y = 0; y < height; y += grid) {
        for (let x = 0; x < width; x += grid) {
            // mask 픽셀(0~255), 255(글자 영역)일 때만
            if (pgMask.get(x, y)[0] > 128) {
                const ch = fillText.charAt(idx % fillText.length);
                text(ch, x, y);
                idx++;
            }
        }
    }

    // 3) 윤곽선으로 outline 다시 그리기
    noFill();
    stroke(0);
    strokeWeight(2);
    textSize(fs);
    textAlign(CENTER, CENTER);
    textLeading(leading);
    text(wrapped, width / 2, height / 2);
}
