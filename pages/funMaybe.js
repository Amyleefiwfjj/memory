let video, faceapi, detections = [];
let mouthX = 0, mouthY = 0;
let wordStyles = [];
let words = [
    "pixel", "canvas", "render", "design", "script", "cloud", "server", "html",
    "css", "javascript", "python", "react", "vue", "svelte", "figma", "sketch",
    "github", "commit", "branch", "merge", "api", "rest", "json", "xml",
    "svg", "font", "color", "blend", "filter", "shader", "vector", "bitmap",
    "upload", "download", "stream", "socket", "router", "domain", "debug",
    "syntax", "logic", "binary", "frame", "layout", "static", "dynamic",
    "event", "handler", "mouse", "click", "touch", "key", "input", "form",
    "login", "token", "auth", "secure", "encrypt", "hash", "node", "npm",
    "build", "deploy", "docker", "linux", "kernel", "byte", "array", "loop",
    "class", "object", "method", "state", "effect", "async", "await",
    "promise", "rendering", "style", "motion", "graphic", "model", "train",
    "ai", "ml", "neuron", "signal", "vision", "layer", "depth", "noise",
    "camera", "lens", "editor", "gallery", "gradient", "poster", "pixelate",
    "contrast", "palette", "stroke", "fill", "curve", "shape"
];
let mouthOpen = false;
let mouthHeight = 0;

let animState = 0;          // 0: 대기, 1: 낙하 애니, 2: 최종 아트
let animItems = [];         // {text, x, y, targetY, speed, col, size, ang}
let container;

let fallingWords = [];
let collectedWords = [];
let score = 0;

let startTime;
let gameOver = false;

let eatSound;
// 1) MoverWord 클래스 정의 (Mover를 확장)
class MoverWord {
    constructor(text, x, y, mass, col) {
        this.text = text;
        this.mass = mass;
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.col = col;
        this.size = mass * 16; // 글자 크기 기준
    }

    applyForce(force) {
        let f = p5.Vector.div(force, this.mass);
        this.acceleration.add(f);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    display() {
        push();
        translate(this.position.x, this.position.y);
        fill(this.col);
        noStroke();
        textSize(this.size);
        textAlign(CENTER, CENTER);
        text(this.text, 0, 0);
        pop();
    }

    checkEdges() {
        let floorY = height - this.size / 2;
        if (this.position.y > floorY) {
            this.position.y = floorY;
            this.velocity.y *= -0.6; // 튕겨 오름
        }
    }
}

function preload() {
    eatSound = loadSound('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
}

function setup() {
    createCanvas(1250, 650);
    container = {
        x: width * 0.35,
        y: height * 0.6,
        w: width * 0.3,
        h: height * 0.3
    };
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    wordStyles = Array.from({ length: 20 }, () => ({
        size: random([20, 24, 28, 32, 36]),
        color: color(random(100, 255), random(100, 255), random(100, 255)),
        weight: random(["normal", "bold"])
    }));

    const options = { withLandmarks: true, withDescriptors: false };
    faceapi = ml5.faceApi(video, options, modelReady);

    startTime = millis();
}

function modelReady() {
    faceapi.detect(gotResults);
}

function gotResults(err, result) {
    if (err) return console.error(err);
    detections = result;
    faceapi.detect(gotResults);
}
function draw() {
    if (!gameOver) {
        // ===== 게임 플레이 중 =====
        background(0);

        // 거울 모드 웹캠
        push();
        translate(width, 0);
        scale(-1, 1);
        image(video, 0, 0, width, height);
        pop();

        drawMouthMirrored();
        updateWords();
        drawScore();
        drawEatenWords();

        // 30초 경과 시 gameOver 플래그
        if (millis() - startTime >= 30000) {
            gameOver = true;
        }

    } else {
        if (animState === 0) {
            setupAnim();      // 애니 준비
            animState = 1;
        }
        // 매 프레임 캔버스 초기화 → 흔적 남지 않음
        background(240);

        // 단어 낙하 & 정지
        updateAnim();

        // 모두 정지하면 애니 반복 멈춤
        if (animState === 2) {
            noLoop();
        }
    }
}

function setupAnim() {
    animItems = collectedWords.map(w => {
        let col = random([color(228, 26, 28), color(55, 126, 184), color(77, 175, 74),
        color(152, 78, 163), color(255, 127, 0)]);
        let sz = random(24, 48);
        return {
            text: w,
            x: random(container.x, container.x + container.w),
            y: -random(50, 200),
            targetY: random(container.y + 20, container.y + container.h - 20),
            speed: random(2, 6),
            col, size: sz,
            ang: random(-PI / 6, PI / 6)
        };
    });
}
function drawContainer() {
    noFill(); stroke(50); strokeWeight(4);
    rect(container.x, container.y, container.w, container.h, 16);
}

function updateAnim() {
    let done = true;
    for (let it of animItems) {
        if (it.y < it.targetY) {
            it.y += it.speed;
            done = false;
        }
        push();
        translate(it.x, it.y);
        rotate(it.ang);
        fill(it.col);
        textSize(it.size);
        textAlign(CENTER, CENTER);
        text(it.text, 0, 0);
        pop();
    }
    if (done) animState = 2; // 모두 떨어지면 최종 아트로 전환
}


function drawMouthMirrored() {
    if (detections.length > 0 && detections[0].landmarks) {
        const mouth = detections[0].landmarks.getMouth();
        const upperLip = mouth[3];
        const lowerLip = mouth[9];

        let rawX = (upperLip._x + lowerLip._x) / 2;
        let rawY = (upperLip._y + lowerLip._y) / 2;
        let mirroredX = width - rawX;

        mouthHeight = lowerLip._y - upperLip._y;
        mouthOpen = mouthHeight > 15;

        fill(mouthOpen ? color(0, 255, 0, 200) : color(255, 0, 0, 200));
        noStroke();
        ellipse(mirroredX, rawY, 20, 20);

        mouthX = mirroredX;
        mouthY = rawY;
    }
}


function drawEatenWords() {
    const listX = 1130;
    const listY = 30;

    // 배경 박스
    fill(0, 0, 0, 180);
    noStroke();
    rect(listX - 10, listY - 20, 130, 260, 10);

    fill(255);
    textSize(14);
    textAlign(LEFT);
    text("🍽 Ate:", listX, listY);

    textSize(12);
    for (let i = 0; i < min(collectedWords.length, 12); i++) {
        text(collectedWords[i], listX, listY + 20 + i * 20);
    }
}



function updateWords() {
    if (frameCount % 20 === 0 && words.length > 0 && fallingWords.length < 100) {
        const word = words.shift();
        const style = random(wordStyles);

        fallingWords.push({
            x: random(100, width - 100),
            y: 0,
            text: word,
            style: style  // 스타일 저장
        });
    }

    for (let i = fallingWords.length - 1; i >= 0; i--) {
        let w = fallingWords[i];

        // 스타일 적용
        fill(w.style.color);
        textSize(w.style.size);
        textStyle(w.style.weight);
        textAlign(CENTER);
        text(w.text, w.x, w.y);

        w.y += 3;

        if (dist(w.x, w.y, mouthX, mouthY) < 30 && mouthOpen) {
            collectedWords.push(w.text);
            fallingWords.splice(i, 1);
            score++;
            eatSound.play();
        }

    }
}

function drawScore() {
    const timeLeft = Math.ceil((30000 - (millis() - startTime)) / 1000);

    // ◼️ Time 카드
    const tX = 10, tY = 10, tW = 120, tH = 36;
    fill(0, 0, 0, 180);
    noStroke();
    rect(tX, tY, tW, tH, 8);

    fill(255, 220, 0);
    textSize(18);
    textAlign(LEFT, CENTER);
    text(`⏱ ${timeLeft}s`, tX + 12, tY + tH / 2);

    // ◼️ Score 카드
    const sX = tX + tW + 12, sY = tY, sW = 100, sH = tH;
    fill(0, 0, 0, 180);
    rect(sX, sY, sW, sH, 8);

    fill(0, 200, 255);
    textAlign(LEFT, CENTER);
    textSize(18);
    text(`⭐ ${score}`, sX + 12, sY + sH / 2);
}


function drawArtScreen() {
    background(240);            // 연한 회색 배경
    noLoop();                   // 정적 화면

    const palette = [
        color(228, 26, 28),   // red
        color(55, 126, 184),  // blue
        color(77, 175, 74),   // green
        color(152, 78, 163),  // purple
        color(255, 127, 0)    // orange
    ];

    textAlign(CENTER, CENTER);
    textFont('Helvetica');      // 시스템 폰트
    let items = collectedWords;
    for (let i = 0; i < items.length; i++) {
        let w = items[i]; let px = random(width * 0.1, width * 0.9);
        let py = random(height * 0.2, height * 0.9);
        let sz = random(24, 72);
        let col = random(palette);
        let ang = random(-PI / 3, PI / 3);

        push();
        translate(px, py);
        rotate(ang);
        fill(col);
        textSize(sz);
        text(w, 0, 0);
        pop();
    }

    push();
    textAlign(CENTER, CENTER);
    textFont('Georgia');
    textSize(48);
    fill(0);
    text('🍽 Word You Ate', width / 2, height * 0.15);
    pop();
}