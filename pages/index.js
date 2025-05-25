/*
 * p5.js 스케치 — 칠판 위에 분필로 그리기
 *  ‒ 마우스를 누른 상태에서 드래그하면 그려집니다.
 *  ‒ Shift 키를 누르면 지우개(초록색 브러시)로 동작합니다.
 */

let brushSize = 12;          // 분필 굵기
let chalkColor;              // 기본 분필 색상 (흰색)
let eraseColor;              // 지우개 색상  (칠판 배경과 동일)

function setup() {
    const c = createCanvas(windowWidth, windowHeight);
    c.position(0, 0);
    c.style('z-index', '1');   // 컨테이너 뒤, 노이즈 앞
    chalkColor = color(255, 255, 255, 200);
    eraseColor = color('#2b3e2b');   // body 배경색과 맞춰 주세요
    noStroke();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

/* 분필 효과: 브러시 경로를 따라 랜덤한 점들을 찍어 질감을 만듭니다. */
function drawChalkLine(x1, y1, x2, y2, col) {
    const d = dist(x1, y1, x2, y2);
    const steps = ceil(d / 2);
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const x = lerp(x1, x2, t) + random(-1.5, 1.5);
        const y = lerp(y1, y2, t) + random(-1.5, 1.5);
        fill(col);
        ellipse(x, y, random(brushSize * 0.7, brushSize));
    }
}

/* 드로잉 로직 */
function mouseDragged() {
    // 컨테이너 위에서는 그리지 않도록 예외 처리
    const under = document.elementFromPoint(mouseX, mouseY);
    if (under && under.closest('.container')) return;

    const col = keyIsDown(SHIFT) ? eraseColor : chalkColor;
    drawChalkLine(pmouseX, pmouseY, mouseX, mouseY, col);
}

function namePage() {
    window.location.href = "nameByName.html";
}

function destinPage() {
    window.location.href = "destined.html";
}
function funPage() {
    window.location.href = "funMaybe.html";
}
/* 첫 클릭 시 안내 문구 제거 */
window.addEventListener(
    'mousedown',
    () => {
        const hint = document.querySelector('.floating-text');
        if (hint) hint.style.display = 'none';
    },
    { once: true }     // 한 번만 실행
);
