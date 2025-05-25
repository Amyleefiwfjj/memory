let pg;
let synced = true;

let outlineInput, fillInput;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('sketch-holder');
    textAlign(CENTER, CENTER);

    outlineInput = document.getElementById('outlineInput');
    fillInput = document.getElementById('fillInput');

    // 동기화 설정
    outlineInput.addEventListener('input', syncFill);
    fillInput.addEventListener('input', () => synced = false);

    pg = createGraphics(width, height);

    // 초기 동기화
    syncFill();

    // 저장 버튼 이벤트
    document.getElementById('save-btn')
        .addEventListener('click', () => saveCanvas('my_artwork', 'png'));
}

function syncFill() {
    if (synced && fillInput.value === '') {
        fillInput.value = outlineInput.value;
    }
}

function draw() {
    background(255);

    const outlineText = outlineInput.value;
    const fillText = fillInput.value || outlineText;

    pg.clear();
    pg.fill(0);
    pg.textSize(300);
    pg.textAlign(CENTER, CENTER);
    pg.text(outlineText, width / 2, height / 2);
    pg.loadPixels();

    const gridStep = 20;
    textSize(20);
    textAlign(LEFT, TOP);
    let idx = 0;

    for (let y = 0; y < height; y += gridStep) {
        for (let x = 0; x < width; x += gridStep) {
            const c = pg.get(x, y)[0];
            if (c < 128) {
                const ch = fillText.charAt(idx % fillText.length);
                text(ch, x, y);
                idx++;
            }
        }
    }
}
